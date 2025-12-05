/**
 * Tailwind Config Resolver
 * 用于解析和处理 Tailwind CSS 配置，提供给设计模式使用
 */

import { existsSync } from 'fs';
import { resolve } from 'path';

/**
 * 拍平嵌套的颜色对象
 * 例如: { red: { 500: '#xxx', 600: '#yyy' } } => ['red-500', 'red-600']
 */
export function flattenColors(colors: any, prefix = ''): string[] {
    return Object.keys(colors).reduce((acc: string[], key) => {
        const value = colors[key];
        const newKey = prefix ? `${prefix}-${key}` : key;

        if (typeof value === 'string') {
            acc.push(newKey);
        } else if (typeof value === 'object' && value !== null) {
            // 递归处理嵌套对象 (如 red: { 500: '#xxx' })
            acc.push(...flattenColors(value, newKey));
        }
        return acc;
    }, []);
}

/**
 * 获取 Tailwind 配置选项
 * @param theme - Tailwind theme 对象
 * @param type - 配置类型
 */
export function getTailwindOptions(
    theme: any,
    type: 'color' | 'spacing' | 'fontSize' | 'borderRadius' | 'boxShadow' | 'fontWeight'
): string[] {
    if (!theme) return [];

    switch (type) {
        case 'color': {
            if (!theme.colors) return [];
            const flatColors = flattenColors(theme.colors);
            // 过滤掉一些不常用的颜色值
            return flatColors.filter(c => !['inherit', 'current'].includes(c));
        }

        case 'spacing': {
            if (!theme.spacing) return [];
            // 按数值排序
            return Object.keys(theme.spacing).sort((a, b) => {
                const numA = parseFloat(a);
                const numB = parseFloat(b);
                if (isNaN(numA) || isNaN(numB)) return 0;
                return numA - numB;
            });
        }

        case 'fontSize': {
            if (!theme.fontSize) return [];
            return Object.keys(theme.fontSize);
        }

        case 'borderRadius': {
            if (!theme.borderRadius) return [];
            // 将 DEFAULT 转换为空字符串（对应 'rounded' class）
            return Object.keys(theme.borderRadius).map(k => k === 'DEFAULT' ? '' : k);
        }

        case 'boxShadow': {
            if (!theme.boxShadow) return [];
            // 将 DEFAULT 转换为空字符串（对应 'shadow' class）
            return Object.keys(theme.boxShadow).map(k => k === 'DEFAULT' ? '' : k);
        }

        case 'fontWeight': {
            if (!theme.fontWeight) return [];
            return Object.keys(theme.fontWeight);
        }

        default:
            return [];
    }
}

/**
 * 加载 Tailwind 配置
 * @param projectRoot - 项目根目录
 * @returns 解析后的配置或 null
 */
export async function loadTailwindConfig(projectRoot: string): Promise<any | null> {
    const configPath = resolve(projectRoot, 'tailwind.config.js');
    const tsConfigPath = resolve(projectRoot, 'tailwind.config.ts');

    try {
        // 尝试加载 .js 配置
        if (existsSync(configPath)) {
            // 动态导入配置文件
            const configModule = await import(`file://${configPath}`);
            return configModule.default || configModule;
        }

        // 尝试加载 .ts 配置
        if (existsSync(tsConfigPath)) {
            const configModule = await import(`file://${tsConfigPath}`);
            return configModule.default || configModule;
        }
    } catch (error) {
        console.warn('[tailwind-config-resolver] Failed to load Tailwind config:', error);
    }

    return null;
}

/**
 * 解析完整的 Tailwind 配置
 * 使用 Tailwind 的 resolveConfig 函数合并默认配置
 */
export async function resolveTailwindConfig(projectRoot: string): Promise<any> {
    console.log('[resolveTailwindConfig] Starting, projectRoot:', projectRoot);

    try {
        // 直接从项目的 node_modules 导入 tailwindcss/resolveConfig
        console.log('[resolveTailwindConfig] Attempting to import tailwindcss/resolveConfig...');

        const { pathToFileURL } = await import('url');
        const { join } = await import('path');

        // 构建 tailwindcss/resolveConfig 的完整路径
        const tailwindConfigPath = join(
            projectRoot,
            'node_modules',
            'tailwindcss',
            'resolveConfig.js'
        );

        console.log('[resolveTailwindConfig] Tailwind path:', tailwindConfigPath);

        // 使用 pathToFileURL 转换为 file:// URL 以支持 ESM import
        const tailwindConfigUrl = pathToFileURL(tailwindConfigPath).href;
        console.log('[resolveTailwindConfig] Importing from:', tailwindConfigUrl);

        const resolveConfigModule = await import(tailwindConfigUrl);
        const resolveConfig = resolveConfigModule.default || resolveConfigModule;

        console.log('[resolveTailwindConfig] resolveConfig loaded successfully');

        // 加载用户配置
        console.log('[resolveTailwindConfig] Loading user config...');
        const userConfig = await loadTailwindConfig(projectRoot);
        console.log('[resolveTailwindConfig] User config loaded:', userConfig ? 'yes' : 'no');

        if (userConfig) {
            console.log('[resolveTailwindConfig] User config theme.extend:', userConfig.theme?.extend);
            console.log('[resolveTailwindConfig] User config theme.extend.colors:',
                userConfig.theme?.extend?.colors ? Object.keys(userConfig.theme.extend.colors) : 'none');
        }

        // 如果没有用户配置，使用最小配置（会得到完整的默认值）
        const config = userConfig || { content: [] };

        // 解析完整配置（包含默认值）
        console.log('[resolveTailwindConfig] Calling resolveConfig...');
        const fullConfig = resolveConfig(config as any);
        console.log('[resolveTailwindConfig] Full config resolved successfully');
        console.log('[resolveTailwindConfig] Theme keys count:', fullConfig?.theme ? Object.keys(fullConfig.theme).length : 0);
        console.log('[resolveTailwindConfig] Theme colors:', fullConfig?.theme?.colors ? Object.keys(fullConfig.theme.colors) : 'none');

        return fullConfig;
    } catch (error) {
        console.error('[tailwind-config-resolver] Failed to resolve Tailwind config:', error);

        // 如果解析失败，返回空配置
        return {
            theme: {
                colors: {},
                spacing: {},
                fontSize: {},
                borderRadius: {},
                boxShadow: {},
                fontWeight: {},
                borderWidth: {},
                letterSpacing: {},
                lineHeight: {},
                opacity: {},
            }
        };
    }
}

/**
 * 生成用于前端的配置 JSON
 * 返回符合设计模式面板格式的配置
 */
export async function generateDesignModeConfig(projectRoot: string): Promise<any> {
    const { generatePanelConfig } = await import('./tailwindConfigGenerator');
    const fullConfig = await resolveTailwindConfig(projectRoot);

    if (!fullConfig.theme) {
        return {
            borderWidth: {},
            borderStyle: {},
            colors: {},
            fontSize: {},
            fontWeight: {},
            letterSpacing: {},
            lineHeight: {},
            opacity: {},
            borderRadius: {},
            boxShadow: {},
            spacing: {},
        };
    }

    // 使用面板配置生成器
    return generatePanelConfig(fullConfig.theme);
}
