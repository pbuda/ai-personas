export interface Persona {
  id: string;
  name: string;
  description: string;
  prompt: string;
  color: string;
  created: number;
}

export interface Settings {
  openInNewTab: boolean;
  autoInject: boolean;
  showActiveIndicator: boolean;
  confirmSwitch: boolean;
  personalizedBackground: boolean;
}

export interface StorageData {
  personas: Persona[];
  activePersonaId: string | null;
  settings: Settings;
}

export type MessageAction =
  | { action: "SWITCH_PERSONA"; personaId: string }
  | { action: "OPEN_POPUP" }
  | { action: "GET_ACTIVE_PERSONA" }
  | { action: "REGISTER_PERSONA_TAB"; personaId: string }
  | { action: "OPEN_OPTIONS" };
