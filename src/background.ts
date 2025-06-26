import { MessageAction } from "./types";
import { Storage } from "./utils/storage";

// Track which tabs are associated with which personas
interface PersonaTab {
  tabId: number;
  personaId: string;
  url: string;
  lastActive: number;
}

const personaTabs = new Map<number, PersonaTab>();

chrome.runtime.onInstalled.addListener(async () => {
  // Initialize default data
  const { personas } = await Storage.get(["personas"]);

  if (!personas || personas.length === 0) {
    const defaultPersona = {
      id: Storage.generateId(),
      name: "Default Assistant",
      description: "Standard Claude behavior",
      prompt: "",
      color: "#3B82F6",
      created: Date.now(),
    };

    await Storage.set({
      personas: [defaultPersona],
      activePersonaId: defaultPersona.id,
      settings: {
        openInNewTab: true,
        autoInject: true,
        showActiveIndicator: true,
        confirmSwitch: true,
        personalizedBackground: true,
      },
    });
  }
});

// Track tab updates to maintain persona associations
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('claude.ai')) {
    // Keep track of claude.ai tabs
    const existingTab = personaTabs.get(tabId);
    if (existingTab) {
      existingTab.url = tab.url;
      existingTab.lastActive = Date.now();
    }
  }
});

// Clean up closed tabs
chrome.tabs.onRemoved.addListener((tabId) => {
  personaTabs.delete(tabId);
});

chrome.runtime.onMessage.addListener(
  (request: MessageAction, sender, sendResponse) => {
    if (request.action === "SWITCH_PERSONA") {
      handlePersonaSwitch(request.personaId);
    } else if (request.action === "REGISTER_PERSONA_TAB") {
      // Register a tab as being associated with a persona
      if (sender.tab?.id && request.personaId) {
        registerPersonaTab(sender.tab.id, request.personaId, sender.tab.url || '');
      }
    } else if (request.action === "OPEN_OPTIONS") {
      chrome.runtime.openOptionsPage();
    } else if ((request as any).action === "CREATE_NEW_CONVERSATION") {
      // Handle confirmed new conversation creation
      createNewPersonaConversation((request as any).personaId);
    }
    return true;
  }
);

function registerPersonaTab(tabId: number, personaId: string, url: string) {
  personaTabs.set(tabId, {
    tabId,
    personaId,
    url,
    lastActive: Date.now(),
  });
}

async function findExistingPersonaTab(personaId: string): Promise<PersonaTab | null> {
  // Find the most recently used tab for this persona
  let bestTab: PersonaTab | null = null;
  
  for (const tab of personaTabs.values()) {
    if (tab.personaId === personaId) {
      // Verify the tab still exists
      try {
        await chrome.tabs.get(tab.tabId);
        if (!bestTab || tab.lastActive > bestTab.lastActive) {
          bestTab = tab;
        }
      } catch {
        // Tab no longer exists, remove it
        personaTabs.delete(tab.tabId);
      }
    }
  }
  
  return bestTab;
}

async function handlePersonaSwitch(personaId: string) {
  await Storage.set({ activePersonaId: personaId });

  // First, try to find an existing tab for this persona
  const existingTab = await findExistingPersonaTab(personaId);
  
  if (existingTab) {
    // Switch to existing tab - no confirmation needed
    try {
      await chrome.tabs.update(existingTab.tabId, { active: true });
      await chrome.windows.update(
        (await chrome.tabs.get(existingTab.tabId)).windowId!,
        { focused: true }
      );
      
      // Update last active time
      existingTab.lastActive = Date.now();
      return;
    } catch {
      // Tab no longer exists, remove it and create new one
      personaTabs.delete(existingTab.tabId);
    }
  }

  // No existing tab found, will create a new one
  // Show confirmation if enabled
  const { settings, personas } = await Storage.get(["settings", "personas"]);
  const persona = personas?.find((p: any) => p.id === personaId);
  
  if (settings?.confirmSwitch && persona) {
    // Send message to content script to show confirmation
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab?.id) {
      chrome.tabs.sendMessage(activeTab.id, {
        action: "CONFIRM_NEW_CONVERSATION",
        personaName: persona.name,
        personaId: personaId
      });
      return;
    }
  }

  // Create new conversation
  await createNewPersonaConversation(personaId, settings);
}

async function createNewPersonaConversation(personaId: string, settings?: any) {
  if (!settings) {
    const data = await Storage.get(["settings"]);
    settings = data.settings;
  }

  if (settings?.openInNewTab) {
    const newTab = await chrome.tabs.create({
      url: "https://claude.ai/new",
      active: true,
    });
    
    if (newTab.id) {
      registerPersonaTab(newTab.id, personaId, "https://claude.ai/new");
      // Set the tab persona in session storage when the tab loads
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === newTab.id && info.status === 'complete') {
          chrome.tabs.sendMessage(tabId, {
            action: "SET_TAB_PERSONA",
            personaId: personaId
          });
          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    }
  } else {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (activeTab?.url?.includes("claude.ai")) {
      await chrome.tabs.update(activeTab.id!, {
        url: "https://claude.ai/new",
      });
      
      if (activeTab.id) {
        registerPersonaTab(activeTab.id, personaId, "https://claude.ai/new");
        // Set the tab persona when the page loads
        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
          if (tabId === activeTab.id && info.status === 'complete') {
            chrome.tabs.sendMessage(tabId, {
              action: "SET_TAB_PERSONA",
              personaId: personaId
            });
            chrome.tabs.onUpdated.removeListener(listener);
          }
        });
      }
    } else {
      const newTab = await chrome.tabs.create({
        url: "https://claude.ai/new",
        active: true,
      });
      
      if (newTab.id) {
        registerPersonaTab(newTab.id, personaId, "https://claude.ai/new");
        // Set the tab persona when the tab loads
        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
          if (tabId === newTab.id && info.status === 'complete') {
            chrome.tabs.sendMessage(tabId, {
              action: "SET_TAB_PERSONA",
              personaId: personaId
            });
            chrome.tabs.onUpdated.removeListener(listener);
          }
        });
      }
    }
  }
}
