import { Persona, Settings } from "../types";
import { Storage } from "../utils/storage";

class OptionsManager {
  private personas: Persona[] = [];
  private settings: Settings = {
    openInNewTab: true,
    autoInject: true,
    showActiveIndicator: true,
    confirmSwitch: true,
    personalizedBackground: true,
  };
  private activePersonaId: string | null = null;
  private editingPersonaId: string | null = null;

  async init() {
    await this.loadData();
    this.setupEventListeners();
    this.renderPersonas();
    this.renderSettings();
  }

  private async loadData() {
    const data = await Storage.get(["personas", "settings", "activePersonaId"]);
    this.personas = data.personas || [];
    this.settings = { ...this.settings, ...data.settings };
    this.activePersonaId = data.activePersonaId || null;
  }

  private setupEventListeners() {
    document.getElementById("add-persona-btn")?.addEventListener("click", () => this.openPersonaModal());
    document.getElementById("import-btn")?.addEventListener("click", () => this.openImportModal());
    document.getElementById("export-btn")?.addEventListener("click", () => this.exportPersonas());

    document.getElementById("close-modal")?.addEventListener("click", () => this.closePersonaModal());
    document.getElementById("cancel-btn")?.addEventListener("click", () => this.closePersonaModal());
    document.getElementById("persona-form")?.addEventListener("submit", (e) => this.handlePersonaSubmit(e));

    document.getElementById("close-import-modal")?.addEventListener("click", () => this.closeImportModal());
    document.getElementById("cancel-import-btn")?.addEventListener("click", () => this.closeImportModal());
    document.getElementById("import-file")?.addEventListener("change", (e) => this.handleFileSelect(e));
    document.getElementById("confirm-import-btn")?.addEventListener("click", () => this.confirmImport());

    document.getElementById("close-delete-modal")?.addEventListener("click", () => this.closeDeleteModal());
    document.getElementById("cancel-delete-btn")?.addEventListener("click", () => this.closeDeleteModal());
    document.getElementById("confirm-delete-btn")?.addEventListener("click", () => this.confirmDelete());

    document.getElementById("persona-prompt")?.addEventListener("input", (e) => this.updateCharCount(e));

    ["open-new-tab", "auto-inject", "show-indicator", "confirm-switch", "personalized-background"].forEach(id => {
      document.getElementById(id)?.addEventListener("change", () => this.updateSettings());
    });

    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.closest(".modal") && !target.closest(".modal-content")) {
        this.closeAllModals();
      }
    });
  }

  private renderPersonas() {
    const container = document.getElementById("personas-list");
    if (!container) return;

    if (this.personas.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No personas yet</h3>
          <p>Create your first persona to get started</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.personas
      .map(persona => this.createPersonaCard(persona))
      .join("");

    this.personas.forEach(persona => {
      document.getElementById(`edit-${persona.id}`)?.addEventListener("click", () => this.editPersona(persona.id));
      document.getElementById(`delete-${persona.id}`)?.addEventListener("click", () => this.deletePersona(persona.id));
      document.getElementById(`activate-${persona.id}`)?.addEventListener("click", () => this.activatePersona(persona.id));
    });
  }

  private createPersonaCard(persona: Persona): string {
    const isActive = persona.id === this.activePersonaId;
    return `
      <div class="persona-card ${isActive ? 'active' : ''}">
        <div class="persona-color" style="background-color: ${persona.color}"></div>
        <div class="persona-info">
          <div class="persona-name">
            ${this.escapeHtml(persona.name)}
            ${isActive ? '<span class="active-badge">Active</span>' : ''}
          </div>
          <div class="persona-description">${this.escapeHtml(persona.description || 'No description')}</div>
        </div>
        <div class="persona-actions">
          ${!isActive ? `<button id="activate-${persona.id}" class="btn-primary">Activate</button>` : ''}
          <button id="edit-${persona.id}" class="btn-secondary">Edit</button>
          <button id="delete-${persona.id}" class="btn-danger">Delete</button>
        </div>
      </div>
    `;
  }

  private renderSettings() {
    (document.getElementById("open-new-tab") as HTMLInputElement).checked = this.settings.openInNewTab;
    (document.getElementById("auto-inject") as HTMLInputElement).checked = this.settings.autoInject;
    (document.getElementById("show-indicator") as HTMLInputElement).checked = this.settings.showActiveIndicator;
    (document.getElementById("confirm-switch") as HTMLInputElement).checked = this.settings.confirmSwitch;
    (document.getElementById("personalized-background") as HTMLInputElement).checked = this.settings.personalizedBackground;
  }

  private openPersonaModal(persona?: Persona) {
    this.editingPersonaId = persona?.id || null;
    const modal = document.getElementById("persona-modal");
    const title = document.getElementById("modal-title");
    const form = document.getElementById("persona-form") as HTMLFormElement;

    if (persona) {
      title!.textContent = "Edit Persona";
      (document.getElementById("persona-name") as HTMLInputElement).value = persona.name;
      (document.getElementById("persona-description") as HTMLInputElement).value = persona.description || "";
      (document.getElementById("persona-color") as HTMLInputElement).value = persona.color;
      (document.getElementById("persona-prompt") as HTMLTextAreaElement).value = persona.prompt;
    } else {
      title!.textContent = "Add Persona";
      form.reset();
      (document.getElementById("persona-color") as HTMLInputElement).value = "#3b82f6";
    }

    this.updateCharCount();
    modal?.classList.add("active");
  }

  private closePersonaModal() {
    document.getElementById("persona-modal")?.classList.remove("active");
    this.editingPersonaId = null;
  }

  private async handlePersonaSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const name = (document.getElementById("persona-name") as HTMLInputElement).value.trim();
    const description = (document.getElementById("persona-description") as HTMLInputElement).value.trim();
    const color = (document.getElementById("persona-color") as HTMLInputElement).value;
    const prompt = (document.getElementById("persona-prompt") as HTMLTextAreaElement).value.trim();

    if (!name || !prompt) {
      alert("Name and prompt are required");
      return;
    }

    if (prompt.length > 2000) {
      alert("Prompt must be less than 2000 characters");
      return;
    }

    const persona: Persona = {
      id: this.editingPersonaId || Storage.generateId(),
      name,
      description,
      color,
      prompt,
      created: this.editingPersonaId ? 
        this.personas.find(p => p.id === this.editingPersonaId)?.created || Date.now() : 
        Date.now(),
    };

    if (this.editingPersonaId) {
      const index = this.personas.findIndex(p => p.id === this.editingPersonaId);
      this.personas[index] = persona;
    } else {
      this.personas.push(persona);
    }

    await this.savePersonas();
    this.renderPersonas();
    this.closePersonaModal();
  }

  private editPersona(id: string) {
    const persona = this.personas.find(p => p.id === id);
    if (persona) {
      this.openPersonaModal(persona);
    }
  }

  private deletePersona(id: string) {
    const persona = this.personas.find(p => p.id === id);
    if (!persona) return;

    document.getElementById("delete-persona-name")!.textContent = persona.name;
    this.editingPersonaId = id;
    document.getElementById("delete-modal")?.classList.add("active");
  }

  private closeDeleteModal() {
    document.getElementById("delete-modal")?.classList.remove("active");
    this.editingPersonaId = null;
  }

  private async confirmDelete() {
    if (!this.editingPersonaId) return;

    this.personas = this.personas.filter(p => p.id !== this.editingPersonaId);
    
    if (this.activePersonaId === this.editingPersonaId) {
      this.activePersonaId = null;
      await Storage.set({ activePersonaId: null });
    }

    await this.savePersonas();
    this.renderPersonas();
    this.closeDeleteModal();
  }

  private async activatePersona(id: string) {
    this.activePersonaId = id;
    await Storage.set({ activePersonaId: id });
    this.renderPersonas();

    chrome.runtime.sendMessage({ action: "SWITCH_PERSONA", personaId: id });
  }

  private async updateSettings() {
    this.settings = {
      openInNewTab: (document.getElementById("open-new-tab") as HTMLInputElement).checked,
      autoInject: (document.getElementById("auto-inject") as HTMLInputElement).checked,
      showActiveIndicator: (document.getElementById("show-indicator") as HTMLInputElement).checked,
      confirmSwitch: (document.getElementById("confirm-switch") as HTMLInputElement).checked,
      personalizedBackground: (document.getElementById("personalized-background") as HTMLInputElement).checked,
    };

    await Storage.set({ settings: this.settings });
  }

  private openImportModal() {
    document.getElementById("import-modal")?.classList.add("active");
    (document.getElementById("import-file") as HTMLInputElement).value = "";
    document.getElementById("import-preview")!.innerHTML = "";
    (document.getElementById("confirm-import-btn") as HTMLButtonElement).disabled = true;
  }

  private closeImportModal() {
    document.getElementById("import-modal")?.classList.remove("active");
  }

  private handleFileSelect(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        this.previewImport(data);
      } catch (error) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  }

  private previewImport(data: any) {
    const preview = document.getElementById("import-preview");
    const confirmBtn = document.getElementById("confirm-import-btn") as HTMLButtonElement;

    if (!Array.isArray(data) || !data.every(item => 
      item.name && item.prompt && typeof item.name === 'string' && typeof item.prompt === 'string'
    )) {
      preview!.innerHTML = `<p style="color: #dc2626;">Invalid format. Expected array of personas with name and prompt fields.</p>`;
      confirmBtn.disabled = true;
      return;
    }

    preview!.innerHTML = `
      <p><strong>Found ${data.length} persona(s):</strong></p>
      <ul style="margin-top: 8px; padding-left: 20px;">
        ${data.map(p => `<li>${this.escapeHtml(p.name)}</li>`).join('')}
      </ul>
    `;
    confirmBtn.disabled = false;
    (confirmBtn as any).importData = data;
  }

  private async confirmImport() {
    const confirmBtn = document.getElementById("confirm-import-btn") as any;
    const importData = confirmBtn.importData;
    
    if (!importData) return;

    const newPersonas: Persona[] = importData.map((item: any) => ({
      id: Storage.generateId(),
      name: item.name,
      description: item.description || "",
      color: item.color || "#3b82f6",
      prompt: item.prompt,
      created: Date.now(),
    }));

    this.personas.push(...newPersonas);
    await this.savePersonas();
    this.renderPersonas();
    this.closeImportModal();

    alert(`Successfully imported ${newPersonas.length} persona(s)`);
  }

  private exportPersonas() {
    if (this.personas.length === 0) {
      alert("No personas to export");
      return;
    }

    const exportData = this.personas.map(({ id, created, ...persona }) => persona);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `claude-personas-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private updateCharCount(e?: Event) {
    const textarea = document.getElementById("persona-prompt") as HTMLTextAreaElement;
    const counter = document.getElementById("prompt-char-count");
    if (textarea && counter) {
      const count = textarea.value.length;
      counter.textContent = count.toString();
      counter.style.color = count > 2000 ? "#dc2626" : "#6b7280";
    }
  }

  private closeAllModals() {
    document.querySelectorAll(".modal").forEach(modal => {
      modal.classList.remove("active");
    });
    this.editingPersonaId = null;
  }

  private async savePersonas() {
    await Storage.set({ personas: this.personas });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const manager = new OptionsManager();
  manager.init();
});