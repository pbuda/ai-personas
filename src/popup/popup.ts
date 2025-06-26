import { Persona } from "../types";
import { Storage } from "../utils/storage";

class PopupManager {
  async initialize() {
    const { personas, activePersonaId } = await Storage.get([
      "personas",
      "activePersonaId",
    ]);
    this.renderPersonas(personas || [], activePersonaId || null);
    this.attachEventListeners();
  }

  private renderPersonas(personas: Persona[], activeId: string | null) {
    const container = document.getElementById("persona-list")!;
    container.innerHTML = "";

    personas.forEach((persona) => {
      const item = document.createElement("div");
      item.className = `persona-item ${
        persona.id === activeId ? "active" : ""
      }`;
      item.dataset.personaId = persona.id;

      item.innerHTML = `
        <div class="persona-color" style="background: ${persona.color}"></div>
        <div class="persona-info">
          <div class="persona-name">${this.escapeHtml(persona.name)}</div>
          <div class="persona-desc">${this.escapeHtml(
            persona.description
          )}</div>
        </div>
      `;

      item.addEventListener("click", () => this.switchPersona(persona.id));
      container.appendChild(item);
    });
  }

  private async switchPersona(personaId: string) {
    const { activePersonaId, settings } = await Storage.get([
      "activePersonaId",
      "settings",
    ]);

    if (personaId === activePersonaId) return;

    if (settings?.confirmSwitch) {
      if (!confirm("Switch persona? This will start a new chat.")) return;
    }

    chrome.runtime.sendMessage({
      action: "SWITCH_PERSONA",
      personaId,
    });

    window.close();
  }

  private attachEventListeners() {
    document.getElementById("manage-btn")?.addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new PopupManager().initialize();
});
