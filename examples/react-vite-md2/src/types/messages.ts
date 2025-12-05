// Message types for iframe ↔ parent window communication

export interface SourceInfo {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
  elementType?: string;
  componentName?: string;
  functionName?: string;
  elementId?: string;
  importPath?: string;
}

export interface ElementInfo {
  tagName: string;
  className: string;
  textContent: string;
  sourceInfo: SourceInfo;
  isStaticText: boolean;
  componentName?: string;
  componentPath?: string;
  props?: Record<string, string>;
  hierarchy?: {
    tagName: string;
    componentName?: string;
    fileName?: string;
  }[];
}

