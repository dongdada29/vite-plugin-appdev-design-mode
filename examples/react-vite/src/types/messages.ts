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
