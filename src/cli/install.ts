#!/usr/bin/env node

/**
 * 一键安装 @xagi/vite-plugin-design-mode 插件
 * 功能：
 * 1. 在 package.json 中添加插件依赖
 * 2. 在 vite.config.ts/js/mjs 中添加 import 和插件配置
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const PLUGIN_NAME = '@xagi/vite-plugin-design-mode';
const VITE_CONFIG_FILES = ['vite.config.ts', 'vite.config.js', 'vite.config.mjs'];

/**
 * 获取当前插件的版本号
 * 从 CLI 脚本所在目录向上查找 package.json
 * 当通过 npx/pnpm dlx 运行时，会从临时目录查找
 */
function getPluginVersion(): string {
  try {
    // 获取当前文件的目录
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    // 从 dist/cli 向上查找，找到插件的 package.json
    // 当通过 npx/pnpm dlx 运行时，路径可能是：
    // /Users/xxx/.npm/_npx/xxx/node_modules/@xagi/vite-plugin-design-mode/dist/cli/install.js
    let currentDir = resolve(__dirname);
    const root = resolve('/');
    
    // 最多向上查找 5 层，避免无限循环
    let depth = 0;
    const maxDepth = 5;
    
    while (currentDir !== root && depth < maxDepth) {
      const packageJsonPath = join(currentDir, 'package.json');
      if (existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
          if (packageJson.name === PLUGIN_NAME && packageJson.version) {
            return packageJson.version;
          }
        } catch (e) {
          // 忽略解析错误，继续查找
        }
      }
      currentDir = dirname(currentDir);
      depth++;
    }
  } catch (e) {
    // 如果获取失败，使用默认值
  }
  
  // 如果找不到，返回 'latest' 作为后备
  // 用户可以通过手动运行包管理器安装命令来安装最新版本
  return 'latest';
}

/**
 * 查找项目根目录（包含 package.json 的目录）
 * 从当前目录向上查找，直到找到 package.json 或到达文件系统根目录
 */
function findProjectRoot(startDir: string = process.cwd()): string {
  let currentDir = resolve(startDir);
  const root = resolve('/');
  
  while (currentDir !== root) {
    const packageJsonPath = join(currentDir, 'package.json');
    if (existsSync(packageJsonPath)) {
      return currentDir;
    }
    currentDir = dirname(currentDir);
  }
  
  // 如果找不到，返回原始目录
  return startDir;
}

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  packageManager?: string;
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
 * 检测插件是否已安装
 */
function isPluginInstalled(packageJson: PackageJson): boolean {
  return (
    !!packageJson.dependencies?.[PLUGIN_NAME] ||
    !!packageJson.devDependencies?.[PLUGIN_NAME]
  );
}

/**
 * 在 package.json 中添加插件依赖
 */
function addPluginToPackageJson(packageJson: PackageJson, version: string): PackageJson {
  // 如果已安装，更新版本号
  const isInstalled = isPluginInstalled(packageJson);
  
  // 确保 devDependencies 存在
  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {};
  }

  // 添加或更新到 devDependencies
  packageJson.devDependencies[PLUGIN_NAME] = `^${version}`;

  return packageJson;
}

/**
 * 查找 vite.config 文件
 */
function findViteConfig(projectRoot: string): string | null {
  for (const file of VITE_CONFIG_FILES) {
    const configPath = join(projectRoot, file);
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
 * 主函数
 */
function main() {
  console.log('🚀 开始一键安装 @xagi/vite-plugin-design-mode 插件...\n');

  // 0. 查找项目根目录（支持 pnpm dlx / npx 等场景）
  const projectRoot = findProjectRoot();
  console.log(`📁 项目根目录: ${projectRoot}\n`);

  // 1. 读取 package.json
  const packageJsonPath = join(projectRoot, 'package.json');
  if (!existsSync(packageJsonPath)) {
    console.error('✗ 错误: 未找到 package.json 文件');
    console.error(`  当前目录: ${projectRoot}`);
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

  // 3. 获取插件版本号
  const pluginVersion = getPluginVersion();
  console.log(`📦 插件版本: ${pluginVersion}`);

  // 4. 检测插件是否已安装
  const isInstalled = isPluginInstalled(packageJson);
  console.log(`🔍 插件状态: ${isInstalled ? '已安装' : '未安装'}`);

  // 5. 在 package.json 中添加或更新插件依赖
  const updatedPackageJson = addPluginToPackageJson(packageJson, pluginVersion);
  const versionString = `^${pluginVersion}`;
  const currentVersion = packageJson.devDependencies?.[PLUGIN_NAME] || packageJson.dependencies?.[PLUGIN_NAME];
  
  if (!isInstalled || currentVersion !== versionString) {
    writeFileSync(
      packageJsonPath,
      JSON.stringify(updatedPackageJson, null, 2) + '\n',
      'utf-8'
    );
    if (isInstalled) {
      console.log(`✓ 已更新 package.json 中的插件版本: ${PLUGIN_NAME}@${versionString}`);
    } else {
      console.log(`✓ 已在 package.json 中添加插件依赖: ${PLUGIN_NAME}@${versionString}`);
    }
  } else {
    console.log(`ℹ️  package.json 中已包含插件依赖，版本为: ${currentVersion}`);
  }

  // 5. 查找并修改 vite.config 文件
  const viteConfigPath = findViteConfig(projectRoot);
  if (!viteConfigPath) {
    console.warn('\n⚠️  警告: 未找到 vite.config 文件');
    console.warn('  请手动在 vite.config.ts/js/mjs 中添加以下配置:');
    console.warn('  import appdevDesignMode from "@xagi/vite-plugin-design-mode";');
    console.warn('  plugins: [appdevDesignMode()]');
    console.log('\n✅ 配置完成！');
    console.log('请运行包管理器安装命令（如: pnpm install）来安装依赖。\n');
    return;
  }

  console.log(`📝 找到配置文件: ${viteConfigPath}`);

  // 6. 读取配置文件内容
  let configContent = readFileSync(viteConfigPath, 'utf-8');
  const originalContent = configContent;

  // 7. 添加 import
  configContent = addImport(configContent);

  // 8. 添加插件配置
  configContent = addPluginConfig(configContent);

  // 9. 如果内容有变化，写入文件
  if (configContent !== originalContent) {
    writeFileSync(viteConfigPath, configContent, 'utf-8');
    console.log(`✓ 已更新配置文件: ${viteConfigPath}`);
  } else {
    console.log(`ℹ️  配置文件已包含插件配置，无需更新`);
  }

  console.log('\n✅ 配置完成！');
  console.log('\n📦 下一步: 请运行包管理器安装命令来安装依赖:');
  console.log('  - pnpm install');
  console.log('  - npm install');
  console.log('  - yarn install');
  console.log('\n插件已配置为仅在开发环境生效，生产构建时不会包含相关代码。\n');
}

export { main };
