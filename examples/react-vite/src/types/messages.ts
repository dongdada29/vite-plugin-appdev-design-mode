// Message types for iframe ↔ parent window communication

export interface SourceInfo {
    fileName: string;
    lineNumber: number;
    columnNumber: number;
}

export interface ElementInfo {
    tagName: string;
    className: string;
    textContent: string;
    sourceInfo: SourceInfo;
    isStaticText: boolean;
}

// Tailwind Config Types
export interface TailwindPanelConfig {
    borderWidth: Record<string, number>;
    borderStyle: Record<string, string>;
    colors: Record<string, Record<string, string>>;
    fontSize: Record<string, string>;
    fontWeight: Record<string, string>;
    letterSpacing: Record<string, string>;
    lineHeight: Record<string, string>;
    opacity: Record<string, number>;
    borderRadius: Record<string, string>;
    boxShadow: Record<string, string>;
    spacing: Record<string, number>;
}
