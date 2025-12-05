/** @type {import('tailwindcss').Config} */

// Tailwind 默认颜色列表
const defaultColors = [
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
];

// 自定义颜色列表
const customColors = ['primary'];

// 颜色深度
const colorShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

// 颜色相关的工具类前缀
const colorPrefixes = [
  'text',
  'bg',
  'border',
  'ring',
  'divide',
  'placeholder',
  'from',
  'via',
  'to',
  'stroke',
  'fill',
  'accent',
  'caret',
  'outline',
];

// 生成所有颜色相关的 safelist 模式
function generateColorSafelist() {
  const safelist = [];
  const allColors = [...defaultColors, ...customColors];

  // 为每个颜色前缀和颜色组合生成模式
  colorPrefixes.forEach((prefix) => {
    allColors.forEach((color) => {
      // 添加带深度的颜色类（如 text-blue-500）
      colorShades.forEach((shade) => {
        safelist.push(`${prefix}-${color}-${shade}`);
      });
      // 添加不带深度的颜色类（如 text-blue）
      safelist.push(`${prefix}-${color}`);
    });
  });

  // 添加特殊颜色类（如 text-white, text-black, bg-transparent 等）
  const specialColors = ['white', 'black', 'transparent', 'current'];
  colorPrefixes.forEach((prefix) => {
    specialColors.forEach((color) => {
      safelist.push(`${prefix}-${color}`);
    });
  });

  return safelist;
}

// Tailwind 默认 spacing 值
const spacingValues = [
  0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20,
  24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96,
  // 自定义 spacing 值
  18, 88,
  // 特殊值
  'px', 'auto', 'full', 'screen',
];

// Padding 和 Margin 相关的工具类前缀
const spacingPrefixes = {
  padding: ['p', 'px', 'py', 'pt', 'pr', 'pb', 'pl'],
  margin: ['m', 'mx', 'my', 'mt', 'mr', 'mb', 'ml'],
};

// 生成所有 padding 和 margin 相关的 safelist 模式
function generateSpacingSafelist() {
  const safelist = [];
  const allPrefixes = [...spacingPrefixes.padding, ...spacingPrefixes.margin];

  // 为每个前缀和 spacing 值组合生成模式
  allPrefixes.forEach((prefix) => {
    spacingValues.forEach((value) => {
      // 处理数字值（如 p-3, m-4, p-0.5, p-1.5）
      if (typeof value === 'number') {
        // 直接使用数字值，Tailwind 会自动处理小数格式（如 p-0.5, p-1.5）
        safelist.push(`${prefix}-${value}`);
      } else {
        // 处理特殊值（如 px, auto, full, screen）
        safelist.push(`${prefix}-${value}`);
      }
    });
  });

  return safelist;
}

// Tailwind 默认 border width 值
const borderWidthValues = [0, 1, 2, 4, 8];

// Border width 相关的工具类前缀
const borderWidthPrefixes = [
  'border',
  'border-t',
  'border-r',
  'border-b',
  'border-l',
  'border-x',
  'border-y',
];

// 生成所有 border width 相关的 safelist 模式
function generateBorderWidthSafelist() {
  const safelist = [];

  // 为每个前缀和 border width 值组合生成模式
  borderWidthPrefixes.forEach((prefix) => {
    borderWidthValues.forEach((value) => {
      // 生成 border width 类名（如 border-0, border-2, border-4, border-8）
      safelist.push(`${prefix}-${value}`);
    });
  });

  // 添加单独的 border 类（相当于 border-1）
  safelist.push('border');

  return safelist;
}

// Tailwind 默认 border style 值
const borderStyleValues = [
  'solid',
  'dashed',
  'dotted',
  'double',
  'hidden',
  'none',
];

// 生成所有 border style 相关的 safelist 模式
function generateBorderStyleSafelist() {
  const safelist = [];

  // 生成 border style 类名（如 border-solid, border-dashed, border-dotted 等）
  borderStyleValues.forEach((style) => {
    safelist.push(`border-${style}`);
  });

  return safelist;
}

// Tailwind 默认 fontWeight 值
const fontWeightValues = [
  'thin',        // 100
  'extralight',  // 200
  'light',       // 300
  'normal',      // 400
  'medium',     // 500
  'semibold',   // 600
  'bold',       // 700
  'extrabold',  // 800
  'black',      // 900
];

// 生成所有 fontWeight 相关的 safelist 模式
function generateFontWeightSafelist() {
  const safelist = [];

  // 生成 fontWeight 类名（如 font-thin, font-light, font-bold 等）
  fontWeightValues.forEach((weight) => {
    safelist.push(`font-${weight}`);
  });

  return safelist;
}

// Tailwind 默认 fontSize 键名
// 对应官方：xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, 8xl, 9xl
const fontSizeValues = [
  'xs',
  'sm',
  'base',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  '6xl',
  '7xl',
  '8xl',
  '9xl',
];

// 生成所有 fontSize 相关的 safelist 模式
function generateFontSizeSafelist() {
  const safelist = [];

  // 生成 fontSize 类名（如 text-sm, text-base, text-lg, text-2xl 等）
  fontSizeValues.forEach((size) => {
    safelist.push(`text-${size}`);
  });

  return safelist;
}

// Tailwind 默认 lineHeight 键名
// 对应官方：none, tight, snug, normal, relaxed, loose, 3, 4, 5, 6, 7, 8, 9, 10
const lineHeightValues = [
  'none',
  'tight',
  'snug',
  'normal',
  'relaxed',
  'loose',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
];

// 生成所有 lineHeight 相关的 safelist 模式
function generateLineHeightSafelist() {
  const safelist = [];

  // 生成 lineHeight 类名（如 leading-none, leading-tight, leading-5 等）
  lineHeightValues.forEach((value) => {
    safelist.push(`leading-${value}`);
  });

  return safelist;
}

// Tailwind 默认 letter spacing 值
// 对应官方：tighter, tight, normal, wide, wider, widest
const letterSpacingValues = [
  'tighter',
  'tight',
  'normal',
  'wide',
  'wider',
  'widest',
];

// 生成所有 letter spacing 相关的 safelist 模式
function generateLetterSpacingSafelist() {
  const safelist = [];

  // 生成 letter spacing 类名（如 tracking-tighter, tracking-tight, tracking-wide 等）
  letterSpacingValues.forEach((value) => {
    safelist.push(`tracking-${value}`);
  });

  return safelist;
}

// Tailwind 默认 text align 值
// 对应官方：left, center, right, justify, start, end
const textAlignValues = [
  'left',
  'center',
  'right',
  'justify',
  'start',
  'end',
];

// 生成所有 text align 相关的 safelist 模式
function generateTextAlignSafelist() {
  const safelist = [];

  // 生成 text align 类名（如 text-left, text-center, text-right 等）
  textAlignValues.forEach((value) => {
    safelist.push(`text-${value}`);
  });

  return safelist;
}

// Tailwind 默认 opacity 值
// 对应官方：0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100
const opacityValues = [
  0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100,
];

// 生成所有 opacity 相关的 safelist 模式
function generateOpacitySafelist() {
  const safelist = [];

  // 生成 opacity 类名（如 opacity-0, opacity-50, opacity-100 等）
  opacityValues.forEach((value) => {
    safelist.push(`opacity-${value}`);
  });

  return safelist;
}

// Tailwind 默认 border radius 值
// 对应官方：none, sm, md, lg, xl, 2xl, 3xl, full
const borderRadiusValues = [
  'none',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  'full',
];

// Border radius 相关的工具类前缀
const borderRadiusPrefixes = [
  'rounded',
  'rounded-t',
  'rounded-r',
  'rounded-b',
  'rounded-l',
  'rounded-tl',
  'rounded-tr',
  'rounded-bl',
  'rounded-br',
];

// 生成所有 border radius 相关的 safelist 模式
function generateBorderRadiusSafelist() {
  const safelist = [];

  // 为每个前缀和 border radius 值组合生成模式
  borderRadiusPrefixes.forEach((prefix) => {
    borderRadiusValues.forEach((value) => {
      // 生成 border radius 类名（如 rounded-md, rounded-lg, rounded-tl-sm 等）
      safelist.push(`${prefix}-${value}`);
    });
  });

  return safelist;
}

// Tailwind 默认 shadow 值
// 对应官方：sm, md, lg, xl, 2xl, inner, none
const shadowValues = [
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  'inner',
  'none',
];

// 生成所有 shadow 相关的 safelist 模式
function generateShadowSafelist() {
  const safelist = [];

  // 生成 shadow 类名（如 shadow-sm, shadow-md, shadow-lg 等）
  shadowValues.forEach((value) => {
    safelist.push(`shadow-${value}`);
  });

  return safelist;
}

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // 将所有颜色、padding、margin、border width、border style、fontWeight、fontSize、lineHeight、letter spacing、text align、opacity、border radius 和 shadow 相关的类添加到 safelist，避免被 tree-shaking 移除
  safelist: [
    ...generateColorSafelist(),
    ...generateSpacingSafelist(),
    ...generateBorderWidthSafelist(),
    ...generateBorderStyleSafelist(),
    ...generateFontWeightSafelist(),
    ...generateFontSizeSafelist(),
    ...generateLineHeightSafelist(),
    ...generateLetterSpacingSafelist(),
    ...generateTextAlignSafelist(),
    ...generateOpacitySafelist(),
    ...generateBorderRadiusSafelist(),
    ...generateShadowSafelist(),
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.text-balance': {
          'text-wrap': 'balance',
        },
      };
      addUtilities(newUtilities);
    },
  ],
  darkMode: 'class',
};
