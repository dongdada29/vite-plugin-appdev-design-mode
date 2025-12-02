#!/usr/bin/env node

/**
 * 一键安装 @xagi/vite-plugin-design-mode 插件
 * 功能：
 * 1. 检测插件是否已安装，如果已安装则升级到最新版本
 * 2. 自动检测并修改 vite.config.ts/js/mjs
 * 3. 添加必要的 import 和插件配置
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';

const PLUGIN_NAME = '@xagi/vite-plugin-design-mode';
const VITE_CONFIG_FILES = ['vite.config.ts', 'vite.config.js', 'vite.config.mjs'];

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/**
 * 检测项目是否使用 Vite
 */
function hasVite(packageJson: PackageJson): boolean {
  return (
    !!packageJson.dependencies?.vite ||
    !!packageJson.devDependencies?.vite
  );
}

/**
 * 检测项目是否使用 React
 */
function hasReact(packageJson: PackageJson): boolean {
  return (
    !!packageJson.dependencies?.react ||
    !!packageJson.devDependencies?.react
  );
}

/**
 * 检测项目使用的包管理器
 */
function detectPackageManager(): 'npm' | 'pnpm' | 'yarn' {
  if (existsSync(join(process.cwd(), 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  if (existsSync(join(process.cwd(), 'yarn.lock'))) {
    return 'yarn';
  }
  return 'npm';
}

/**
 * 检测插件是否已安装
 */
function isPluginInstalled(packageJson: PackageJson): boolean {
  return (
    !!packageJson.dependencies?.[PLUGIN_NAME] ||
    !!packageJson.devDependencies?.[PLUGIN_NAME]
  );
}

/**
 * 查找 vite.config 文件
 */
function findViteConfig(): string | null {
  for (const file of VITE_CONFIG_FILES) {
    const configPath = join(process.cwd(), file);
    if (existsSync(configPath)) {
      return configPath;
    }
  }
  return null;
}

/**
 * 检测 vite.config 中是否已导入插件
 */
function hasImport(content: string): boolean {
  // 匹配各种导入格式
  const importPatterns = [
    /import\s+appdevDesignMode\s+from\s+['"]@xagi\/vite-plugin-design-mode['"]/,
    /import\s+appdevDesignMode\s+from\s+['"]@xagi\/vite-plugin-design-mode['"]/,
    /import\s+\{\s*default\s+as\s+appdevDesignMode\s*\}\s+from\s+['"]@xagi\/vite-plugin-design-mode['"]/,
  ];
  return importPatterns.some(pattern => pattern.test(content));
}

/**
 * 检测 vite.config 中是否已配置插件
 */
function hasPluginConfig(content: string): boolean {
  // 匹配 appdevDesignMode 在 plugins 数组中的使用
  const pluginPatterns = [
    /appdevDesignMode\s*\(/,
    /appdevDesignMode\s*\(\s*\{/,
  ];
  return pluginPatterns.some(pattern => pattern.test(content));
}

/**
 * 添加 import 语句
 */
function addImport(content: string): string {
  if (hasImport(content)) {
    return content;
  }

  // 查找最后一个 import 语句的位置
  const importRegex = /^import\s+.*?from\s+['"].*?['"];?$/gm;
  const imports = content.match(importRegex);
  
  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertIndex = lastImportIndex + lastImport.length;
    
    // 确定使用单引号还是双引号
    const useSingleQuote = lastImport.includes("'");
    const quote = useSingleQuote ? "'" : '"';
    
    const newImport = `\nimport appdevDesignMode from ${quote}@xagi/vite-plugin-design-mode${quote};`;
    return content.slice(0, insertIndex) + newImport + content.slice(insertIndex);
  }
  
  // 如果没有找到 import，在文件开头添加
  const useSingleQuote = content.includes("'");
  const quote = useSingleQuote ? "'" : '"';
  return `import appdevDesignMode from ${quote}@xagi/vite-plugin-design-mode${quote};\n${content}`;
}

/**
 * 添加插件配置到 plugins 数组
 */
function addPluginConfig(content: string): string {
  if (hasPluginConfig(content)) {
    // 如果已配置，尝试更新为无参数形式
    return content.replace(
      /appdevDesignMode\s*\([^)]*\)/g,
      'appdevDesignMode()'
    );
  }

  // 查找 plugins 数组
  // 使用更精确的匹配，找到 plugins 数组的结束位置
  // 匹配 plugins: [ ... ]，需要处理嵌套的数组和对象
  const pluginsArrayRegex = /plugins\s*:\s*\[/;
  const match = content.match(pluginsArrayRegex);
  
  if (match) {
    const startIndex = match.index! + match[0].length;
    
    // 找到对应的结束括号 ]
    // 需要处理嵌套的数组和对象，以及字符串
    let depth = 1;
    let i = startIndex;
    let inString = false;
    let stringChar = '';
    let inTemplateString = false;
    
    while (i < content.length && depth > 0) {
      const char = content[i];
      const prevChar = i > 0 ? content[i - 1] : '';
      const nextChar = i < content.length - 1 ? content[i + 1] : '';
      
      // 处理字符串（单引号、双引号）
      if ((char === '"' || char === "'") && prevChar !== '\\') {
        if (!inString && !inTemplateString) {
          inString = true;
          stringChar = char;
        } else if (inString && char === stringChar) {
          inString = false;
          stringChar = '';
        }
      }
      
      // 处理模板字符串
      if (char === '`' && prevChar !== '\\') {
        inTemplateString = !inTemplateString;
      }
      
      // 处理括号（只在非字符串状态下）
      if (!inString && !inTemplateString) {
        if (char === '[') {
          depth++;
        } else if (char === ']') {
          depth--;
          if (depth === 0) {
            // 找到了结束位置
            const beforeClosing = content.substring(startIndex, i);
            const afterClosing = content.substring(i);
            
            // 检查 beforeClosing 中是否有内容（去除空白和注释）
            // 移除行注释和块注释
            const cleanedBefore = beforeClosing
              .replace(/\/\/.*$/gm, '') // 移除行注释
              .replace(/\/\*[\s\S]*?\*\//g, '') // 移除块注释
              .trim();
            
            const hasOtherPlugins = cleanedBefore.length > 0;
            
            // 确定缩进（查找 plugins 行的缩进）
            const beforePlugins = content.substring(0, match.index!);
            const lastNewlineIndex = beforePlugins.lastIndexOf('\n');
            const pluginsLine = beforePlugins.substring(lastNewlineIndex + 1);
            const indent = pluginsLine.match(/^(\s*)/)?.[1] || '  ';
            
            // 构建新的插件配置
            let newContent;
            if (hasOtherPlugins) {
              // 找到最后一个非空白字符的位置
              let lastNonWhitespace = beforeClosing.length - 1;
              while (lastNonWhitespace >= 0 && /\s/.test(beforeClosing[lastNonWhitespace])) {
                lastNonWhitespace--;
              }
              
              // 检查最后一个字符是否是逗号
              const lastChar = lastNonWhitespace >= 0 ? beforeClosing[lastNonWhitespace] : '';
              const needsComma = lastChar !== ',';
              
              // 构建插入内容
              const insertText = (needsComma ? ',' : '') + '\n' + indent + '    appdevDesignMode()';
              
              newContent = content.substring(0, startIndex + lastNonWhitespace + 1) + 
                          insertText + 
                          '\n' + indent + afterClosing;
            } else {
              // 数组为空，直接添加
              newContent = content.substring(0, startIndex) + 
                          '\n' + indent + '    appdevDesignMode()\n' + indent + afterClosing;
            }
            
            return newContent;
          }
        }
      }
      
      i++;
    }
  }
  
  // 如果没有找到 plugins 数组，查找 defineConfig
  const defineConfigRegex = /defineConfig\s*\(\s*\{([\s\S]*?)\}\s*\)/;
  const configMatch = content.match(defineConfigRegex);
  
  if (configMatch) {
    const configContent = configMatch[1];
    const configObject = configMatch[0];
    
    // 在配置对象中添加 plugins
    const pluginsConfig = `\n  plugins: [\n    appdevDesignMode()\n  ],`;
    const newConfigObject = configObject.replace(
      /\}\s*\)$/,
      `${pluginsConfig}\n}`
    );
    
    return content.replace(defineConfigRegex, newConfigObject);
  }
  
  // 如果都找不到，在文件末尾添加（作为最后的手段）
  return `${content}\n\n// 添加 appdevDesignMode 插件\nplugins: [appdevDesignMode()],`;
}

/**
 * 安装或升级插件
 */
function installOrUpgradePlugin(packageManager: 'npm' | 'pnpm' | 'yarn', isInstalled: boolean): void {
  const commands = {
    npm: isInstalled 
      ? `npm install ${PLUGIN_NAME}@latest --save-dev`
      : `npm install ${PLUGIN_NAME} --save-dev`,
    pnpm: isInstalled
      ? `pnpm add ${PLUGIN_NAME}@latest -D`
      : `pnpm add ${PLUGIN_NAME} -D`,
    yarn: isInstalled
      ? `yarn add ${PLUGIN_NAME}@latest -D`
      : `yarn add ${PLUGIN_NAME} -D`,
  };

  console.log(`\n${isInstalled ? '升级' : '安装'}插件 ${PLUGIN_NAME}...`);
  console.log(`执行命令: ${commands[packageManager]}\n`);
  
  try {
    execSync(commands[packageManager], { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log(`\n✓ 插件 ${isInstalled ? '升级' : '安装'}成功！\n`);
  } catch (error) {
    console.error(`\n✗ 插件 ${isInstalled ? '升级' : '安装'}失败:`, error);
    process.exit(1);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始一键安装 @xagi/vite-plugin-design-mode 插件...\n');

  // 1. 读取 package.json
  const packageJsonPath = join(process.cwd(), 'package.json');
  if (!existsSync(packageJsonPath)) {
    console.error('✗ 错误: 未找到 package.json 文件');
    console.error('  请确保在项目根目录下运行此命令。');
    process.exit(1);
  }

  const packageJson: PackageJson = JSON.parse(
    readFileSync(packageJsonPath, 'utf-8')
  );

  // 2. 检测项目类型
  const hasViteDep = hasVite(packageJson);
  const hasReactDep = hasReact(packageJson);
  
  if (!hasViteDep) {
    console.error('✗ 错误: 未检测到 Vite');
    console.error('  此插件仅支持 Vite 项目。');
    console.error('  请确保项目已安装 Vite: npm install vite --save-dev');
    process.exit(1);
  }
  
  if (!hasReactDep) {
    console.error('✗ 错误: 未检测到 React');
    console.error('  此插件仅支持 React 项目。');
    console.error('  请确保项目已安装 React: npm install react react-dom');
    process.exit(1);
  }
  
  console.log('✓ 检测到 Vite + React 项目');

  // 3. 检测包管理器
  const packageManager = detectPackageManager();
  console.log(`📦 检测到包管理器: ${packageManager}`);

  // 4. 检测插件是否已安装
  const isInstalled = isPluginInstalled(packageJson);
  console.log(`🔍 插件状态: ${isInstalled ? '已安装' : '未安装'}`);

  // 5. 安装或升级插件
  installOrUpgradePlugin(packageManager, isInstalled);

  // 6. 查找并修改 vite.config 文件
  const viteConfigPath = findViteConfig();
  if (!viteConfigPath) {
    console.warn('⚠️  警告: 未找到 vite.config 文件');
    console.warn('  请手动在 vite.config.ts/js/mjs 中添加以下配置:');
    console.warn('  import appdevDesignMode from "@xagi/vite-plugin-design-mode";');
    console.warn('  plugins: [appdevDesignMode()]');
    return;
  }

  console.log(`📝 找到配置文件: ${viteConfigPath}`);

  // 7. 读取配置文件内容
  let configContent = readFileSync(viteConfigPath, 'utf-8');
  const originalContent = configContent;

  // 8. 添加 import
  configContent = addImport(configContent);

  // 9. 添加插件配置
  configContent = addPluginConfig(configContent);

  // 10. 如果内容有变化，写入文件
  if (configContent !== originalContent) {
    writeFileSync(viteConfigPath, configContent, 'utf-8');
    console.log(`✓ 已更新配置文件: ${viteConfigPath}`);
  } else {
    console.log(`ℹ️  配置文件已包含插件配置，无需更新`);
  }

  console.log('\n✅ 安装完成！');
  console.log('\n现在你可以在 vite.config 中使用 appdevDesignMode() 了。');
  console.log('插件已配置为仅在开发环境生效，生产构建时不会包含相关代码。\n');
}

export { main };

