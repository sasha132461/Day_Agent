export interface SourceAIPrompts {
  general: string;
  priority_low: string;
  priority_medium: string;
  priority_high: string;
}

export interface AIPromptsPayload {
  gmail: SourceAIPrompts;
  telegram: SourceAIPrompts;
}
