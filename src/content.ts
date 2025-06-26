import { Persona, Settings } from "./types";
import { Storage } from "./utils/storage";

class PersonaInjector {
  private observer: MutationObserver | null = null;
  private isInjected = false;
  private activePersona: Persona | null = null;
  private allPersonas: Persona[] = [];
  private settings: Settings = {
    openInNewTab: true,
    autoInject: true,
    showActiveIndicator: true,
    confirmSwitch: true,
  };

  async initialize() {
    await this.loadData();
    
    // Register this tab with the background script if it has an active persona
    if (this.activePersona) {
      chrome.runtime.sendMessage({
        action: "REGISTER_PERSONA_TAB",
        personaId: this.activePersona.id
      });
    }
    
    if (!this.settings.showActiveIndicator) return;

    this.watchForChatInput();
    this.addPersonaSwitcher();
  }

  private async loadData() {
    const data = await Storage.get(["personas", "activePersonaId", "settings"]);
    this.allPersonas = data.personas || [];
    this.activePersona = this.allPersonas.find(p => p.id === data.activePersonaId) || null;
    this.settings = { ...this.settings, ...data.settings };
  }

  private watchForChatInput() {
    if (!this.settings.autoInject || !this.activePersona) return;

    const inputSelectors = [
      'div[contenteditable="true"]',
      '[class*="ProseMirror"]',
      "[data-placeholder]",
    ];

    this.observer = new MutationObserver(() => {
      if (this.isInjected || !this.isNewConversation()) return;

      const input = this.findInput(inputSelectors);
      if (input && !input.textContent?.trim()) {
        this.injectPersona(input);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private findInput(selectors: string[]): HTMLElement | null {
    for (const selector of selectors) {
      const element = document.querySelector<HTMLElement>(selector);
      if (element) return element;
    }
    return null;
  }

  private isNewConversation(): boolean {
    return (
      window.location.pathname === "/new" ||
      window.location.pathname === "/" ||
      !document.querySelector('[class*="conversation"]')
    );
  }

  private injectPersona(input: HTMLElement) {
    if (!this.activePersona?.prompt) return;

    input.textContent = this.activePersona.prompt;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    this.isInjected = true;

    // Register this tab as being associated with the persona
    chrome.runtime.sendMessage({
      action: "REGISTER_PERSONA_TAB",
      personaId: this.activePersona.id
    });

    // Disconnect observer after injection
    this.observer?.disconnect();
  }

  private addPersonaSwitcher() {
    // Always show switcher for easy access to add personas
    const existing = document.getElementById("persona-switcher");
    if (existing) existing.remove();

    const switcher = document.createElement("div");
    switcher.id = "persona-switcher";
    switcher.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      font-size: 14px;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      backdrop-filter: blur(8px);
      transition: all 0.3s ease;
      min-width: 200px;
      max-width: 300px;
    `;

    switcher.innerHTML = this.createSwitcherHTML();
    this.attachSwitcherEvents(switcher);
    document.body.appendChild(switcher);
  }

  private createSwitcherHTML(): string {
    const activePersona = this.activePersona;
    const hasPersonas = this.allPersonas.length > 0;

    return `
      <div style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-weight: 600; color: #374151;">🎭 Personas</span>
          <button id="persona-manage-btn" style="
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 12px;
            cursor: pointer;
            color: #6b7280;
          ">Manage</button>
        </div>
        ${!hasPersonas ? `
          <div style="color: #6b7280; font-size: 12px;">No personas configured</div>
        ` : `
          <div style="color: #6b7280; font-size: 12px;">
            Active: ${activePersona ? activePersona.name : 'None'}
          </div>
        `}
      </div>
      
      ${hasPersonas ? `
        <div style="max-height: 200px; overflow-y: auto;">
          ${this.allPersonas.map(persona => `
            <div class="persona-tab" data-persona-id="${persona.id}" style="
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 12px;
              cursor: pointer;
              border-bottom: 1px solid #f3f4f6;
              transition: background-color 0.2s;
              ${persona.id === activePersona?.id ? 'background: #eff6ff; border-left: 3px solid #2563eb;' : ''}
            ">
              <div style="
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: ${persona.color};
                flex-shrink: 0;
              "></div>
              <div style="flex: 1;">
                <div style="font-weight: ${persona.id === activePersona?.id ? '600' : '500'}; color: #374151;">
                  ${this.escapeHtml(persona.name)}
                </div>
                ${persona.description ? `
                  <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">
                    ${this.escapeHtml(persona.description)}
                  </div>
                ` : ''}
              </div>
              ${persona.id === activePersona?.id ? `
                <div style="color: #10b981; font-size: 12px;">●</div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <div style="padding: 8px 12px; border-top: 1px solid #e5e7eb;">
        <button id="persona-add-btn" style="
          width: 100%;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        ">+ Add Persona</button>
      </div>
    `;
  }

  private attachSwitcherEvents(switcher: HTMLElement) {
    // Manage button
    switcher.querySelector('#persona-manage-btn')?.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });

    // Add persona button
    switcher.querySelector('#persona-add-btn')?.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });

    // Persona tabs
    switcher.querySelectorAll('.persona-tab').forEach(tab => {
      tab.addEventListener('click', async (e) => {
        const personaId = (e.currentTarget as HTMLElement).dataset.personaId;
        if (personaId && personaId !== this.activePersona?.id) {
          await this.switchPersona(personaId);
        }
      });

      // Hover effects
      tab.addEventListener('mouseenter', () => {
        if (!(tab as HTMLElement).dataset.personaId || 
            (tab as HTMLElement).dataset.personaId === this.activePersona?.id) return;
        (tab as HTMLElement).style.backgroundColor = '#f9fafb';
      });

      tab.addEventListener('mouseleave', () => {
        if (!(tab as HTMLElement).dataset.personaId || 
            (tab as HTMLElement).dataset.personaId === this.activePersona?.id) return;
        (tab as HTMLElement).style.backgroundColor = '';
      });
    });

    // Hover effects for buttons
    const addBtn = switcher.querySelector('#persona-add-btn') as HTMLElement;
    addBtn?.addEventListener('mouseenter', () => {
      addBtn.style.backgroundColor = '#1d4ed8';
    });
    addBtn?.addEventListener('mouseleave', () => {
      addBtn.style.backgroundColor = '#2563eb';
    });
  }

  private async switchPersona(personaId: string) {
    const persona = this.allPersonas.find(p => p.id === personaId);
    if (!persona) return;

    // Show confirmation if enabled
    if (this.settings.confirmSwitch) {
      const confirmed = confirm(`Switch to "${persona.name}" persona?\n\nThis will switch to an existing conversation or start a new one.`);
      if (!confirmed) return;
    }

    // Let the background script handle the switching logic
    chrome.runtime.sendMessage({
      action: "SWITCH_PERSONA",
      personaId: personaId
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  cleanup() {
    this.observer?.disconnect();
    document.getElementById("persona-switcher")?.remove();
  }
}

// Initialize on page load
const injector = new PersonaInjector();
injector.initialize();

// Handle navigation changes (SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    injector.cleanup();
    injector.initialize();
  }
}).observe(document, { subtree: true, childList: true });
