/**
 * Tailwind Config Generator
 * 生成符合设计模式面板格式的 Tailwind 配置数据
 */

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

/**
 * 从 Tailwind theme 生成面板配置
 */
export function generatePanelConfig(theme: any): TailwindPanelConfig {
    console.log('[generatePanelConfig] Input theme:', theme);

    const config = {
        borderWidth: generateBorderWidthMap(theme.borderWidth),
        borderStyle: generateBorderStyleMap(),
        colors: generateColorMap(theme.colors),
        fontSize: generateFontSizeMap(theme.fontSize),
        fontWeight: generateFontWeightMap(theme.fontWeight),
        letterSpacing: generateLetterSpacingMap(theme.letterSpacing),
        lineHeight: generateLineHeightMap(theme.lineHeight),
        opacity: generateOpacityMap(theme.opacity),
        borderRadius: generateBorderRadiusMap(theme.borderRadius),
        boxShadow: generateBoxShadowMap(theme.boxShadow),
        spacing: generateSpacingPixelMap(theme.spacing),
    };

    console.log('[generatePanelConfig] Generated config:', config);
    console.log('[generatePanelConfig] Colors count:', Object.keys(config.colors).length);

    return config;
}

/**
 * 生成 border width 映射
 */
function generateBorderWidthMap(borderWidth: any): Record<string, number> {
    if (!borderWidth) return {};

    const map: Record<string, number> = {};

    Object.entries(borderWidth).forEach(([key, value]) => {
        const numValue = parseFloat(value as string);
        if (!isNaN(numValue)) {
            map[key] = numValue;
        }
    });

    return map;
}

/**
 * 生成 border style 映射
 */
function generateBorderStyleMap(): Record<string, string> {
    return {
        'border-none': 'None',
        'border-solid': 'Solid',
        'border-dashed': 'Dashed',
        'border-dotted': 'Dotted',
        'border-double': 'Double',
    };
}

/**
 * 生成颜色映射 (包含所有色阶)
 */
function generateColorMap(colors: any): Record<string, Record<string, string>> {
    if (!colors) return {};

    const colorMap: Record<string, Record<string, string>> = {};

    console.log('[generateColorMap] Processing colors, total keys:', Object.keys(colors).length);

    Object.entries(colors).forEach(([colorName, colorValue]) => {
        // 跳过特殊颜色值
        if (typeof colorValue === 'string') {
            console.log(`[generateColorMap] Skipping ${colorName}: string value`);
            return;
        }

        // 处理带色阶的颜色对象
        if (typeof colorValue === 'object' && colorValue !== null) {
            const shades: Record<string, string> = {};

            Object.entries(colorValue).forEach(([shade, hex]) => {
                if (typeof hex === 'string') {
                    shades[shade] = hex;
                }
            });

            if (Object.keys(shades).length > 0) {
                colorMap[colorName] = shades;
                console.log(`[generateColorMap] Added ${colorName} with ${Object.keys(shades).length} shades`);
            } else {
                console.log(`[generateColorMap] Skipping ${colorName}: no valid shades`);
            }
        }
    });

    return colorMap;
}

/**
 * 生成 font size 映射
 */
function generateFontSizeMap(fontSize: any): Record<string, string> {
    if (!fontSize) return {};

    const map: Record<string, string> = {};

    Object.keys(fontSize).forEach((key) => {
        map[`text-${key}`] = key;
    });

    return map;
}

/**
 * 生成 font weight 映射
 */
function generateFontWeightMap(fontWeight: any): Record<string, string> {
    if (!fontWeight) return {};

    const weightNameMap: Record<string, string> = {
        '100': 'Thin',
        '200': 'Extra Light',
        '300': 'Light',
        '400': 'Regular',
        '500': 'Medium',
        '600': 'Semi Bold',
        '700': 'Bold',
        '800': 'Extra Bold',
        '900': 'Black',
        thin: 'Thin',
        extralight: 'Extra Light',
        light: 'Light',
        normal: 'Regular',
        medium: 'Medium',
        semibold: 'Semi Bold',
        bold: 'Bold',
        extrabold: 'Extra Bold',
        black: 'Black',
    };

    const map: Record<string, string> = {};

    Object.keys(fontWeight).forEach((key) => {
        const displayName = weightNameMap[key] || key;
        map[`font-${key}`] = displayName;
    });

    return map;
}

/**
 * 生成 letter spacing 映射
 */
function generateLetterSpacingMap(letterSpacing: any): Record<string, string> {
    if (!letterSpacing) return {};

    const map: Record<string, string> = {};

    Object.entries(letterSpacing).forEach(([key, value]) => {
        map[`tracking-${key}`] = value as string;
    });

    return map;
}

/**
 * 生成 line height 映射
 */
function generateLineHeightMap(lineHeight: any): Record<string, string> {
    if (!lineHeight) return {};

    const map: Record<string, string> = {};

    Object.entries(lineHeight).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number') {
            map[`leading-${key}`] = String(value);
        }
    });

    return map;
}

/**
 * 生成 opacity 映射
 */
function generateOpacityMap(opacity: any): Record<string, number> {
    if (!opacity) return {};

    const map: Record<string, number> = {};

    Object.entries(opacity).forEach(([key, value]) => {
        const numValue = parseFloat(value as string) * 100;
        if (!isNaN(numValue)) {
            map[`opacity-${key}`] = numValue;
        }
    });

    return map;
}

/**
 * 生成 border radius 映射
 */
function generateBorderRadiusMap(borderRadius: any): Record<string, string> {
    if (!borderRadius) return {};

    const radiusNameMap: Record<string, string> = {
        none: 'None',
        sm: 'Small',
        DEFAULT: 'Small',
        md: 'Medium',
        lg: 'Large',
        xl: 'Extra Large',
        '2xl': 'Double Extra Large',
        '3xl': 'Triple Extra Large',
        full: 'Full',
    };

    const map: Record<string, string> = {};

    Object.keys(borderRadius).forEach((key) => {
        const displayName = radiusNameMap[key] || key;
        const className = key === 'DEFAULT' ? 'rounded' : `rounded-${key}`;
        map[className] = displayName;
    });

    return map;
}

/**
 * 生成 box shadow 映射
 */
function generateBoxShadowMap(boxShadow: any): Record<string, string> {
    if (!boxShadow) return {};

    const shadowNameMap: Record<string, string> = {
        none: 'None',
        sm: 'Small',
        DEFAULT: 'Normal',
        md: 'Medium',
        lg: 'Large',
        xl: 'Extra Large',
        '2xl': 'Extra Large',
        inner: 'Inner',
    };

    const map: Record<string, string> = {};

    Object.keys(boxShadow).forEach((key) => {
        const displayName = shadowNameMap[key] || key;
        const className = key === 'DEFAULT' ? 'shadow' : `shadow-${key}`;
        map[className] = displayName;
    });

    return map;
}

/**
 * 生成 spacing 像素映射
 */
function generateSpacingPixelMap(spacing: any): Record<string, number> {
    if (!spacing) return {};

    const map: Record<string, number> = {};

    Object.entries(spacing).forEach(([key, value]) => {
        const strValue = String(value);

        // 处理 px 值
        if (key === 'px') {
            map[key] = 1;
            return;
        }

        // 处理 rem 值
        if (strValue.endsWith('rem')) {
            const remValue = parseFloat(strValue);
            if (!isNaN(remValue)) {
                // 1rem = 16px
                map[key] = Math.round(remValue * 16);
            }
            return;
        }

        // 处理纯数字
        const numValue = parseFloat(strValue);
        if (!isNaN(numValue)) {
            map[key] = numValue;
        }
    });

    return map;
}
