import { describe, it, expect } from 'vitest';
import appdevDesignModePlugin from '../src/index';

describe('vite-plugin-appdev-design-mode', () => {
  it('should create a plugin instance', () => {
    const plugin = appdevDesignModePlugin();
    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('vite-plugin-appdev-design-mode');
  });

  it('should accept custom options', () => {
    const plugin = appdevDesignModePlugin({
      enabled: false,
      verbose: true,
      attributePrefix: 'data-test'
    });
    
    expect(plugin).toBeDefined();
  });

  it('should use default options', () => {
    const plugin = appdevDesignModePlugin();
    expect(plugin).toBeDefined();
    
    // The plugin should have the expected methods
    expect(typeof plugin.config).toBe('function');
    expect(typeof plugin.configureServer).toBe('function');
    expect(typeof plugin.transform).toBe('function');
  });
});
