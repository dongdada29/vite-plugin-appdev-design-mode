import type { Plugin } from 'vite';

export interface DesignModeOptions {
  enabled?: boolean;
  enableInProduction?: boolean;
  attributePrefix?: string;
  verbose?: boolean;
  exclude?: string[];
  include?: string[];
  enableBackup?: boolean; // 是否启用备份功能，默认为 false
  enableHistory?: boolean; // 是否启用历史记录功能，默认为 false
}

export interface SourceMappingInfo {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
  elementType: string;
  componentName?: string;
  functionName?: string;
  elementId: string;
  attributePrefix: string;
}

export interface ElementSourceRequest {
  elementId: string;
}

export interface ElementSourceResponse {
  sourceInfo: SourceMappingInfo & {
    fileContent: string;
    contextLines: string;
    targetLineContent: string;
  };
}

export interface ElementModifyRequest {
  elementId: string;
  newStyles: string;
  oldStyles?: string;
}

export interface ElementModifyResponse {
  success: boolean;
  message: string;
  sourceInfo: SourceMappingInfo;
}

// Tailwind Design Config Types
export interface TailwindDesignConfig {
  colors: Record<string, any>;
  fontSize: Record<string, any>;
  spacing: Record<string, any>;
  borderRadius: Record<string, any>;
  boxShadow: Record<string, any>;
  fontWeight: Record<string, any>;
  screens: Record<string, any>;
}

// Virtual Module Type Declaration
declare module 'virtual:tailwind-config' {
  const config: TailwindDesignConfig;
  export default config;
}

// Type declaration for module exports
declare const _default: (options?: DesignModeOptions) => Plugin;

export default _default;
