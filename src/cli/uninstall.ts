#!/usr/bin/env node

/**
 * 卸载 @xagi/vite-plugin-design-mode 插件
 * 功能：
 * 1. 从 package.json 中移除插件依赖
 * 2. 从 vite.config.ts/js/mjs 中移除 import 和插件配置
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve, dirname } from 'path';

const PLUGIN_NAME = '@xagi/vite-plugin-design-mode';
const VITE_CONFIG_FILES = ['vite.config.ts', 'vite.config.js', 'vite.config.mjs'];

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
 * 检测插件是否已安装
 */
function isPluginInstalled(packageJson: PackageJson): boolean {
  return (
    !!packageJson.dependencies?.[PLUGIN_NAME] ||
    !!packageJson.devDependencies?.[PLUGIN_NAME]
  );
}

/**
 * 从 package.json 中移除插件依赖
 */
function removePluginFromPackageJson(packageJson: PackageJson): PackageJson {
  // 如果未安装，不做任何修改
  if (!isPluginInstalled(packageJson)) {
    return packageJson;
  }

  // 从 dependencies 中移除
  if (packageJson.dependencies?.[PLUGIN_NAME]) {
    delete packageJson.dependencies[PLUGIN_NAME];
    // 如果 dependencies 为空，可以删除整个对象（可选）
    if (Object.keys(packageJson.dependencies).length === 0) {
      delete packageJson.dependencies;
    }
  }

  // 从 devDependencies 中移除
  if (packageJson.devDependencies?.[PLUGIN_NAME]) {
    delete packageJson.devDependencies[PLUGIN_NAME];
    // 如果 devDependencies 为空，可以删除整个对象（可选）
    if (Object.keys(packageJson.devDependencies).length === 0) {
      delete packageJson.devDependencies;
    }
  }

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
 * 移除 import 语句
 */
function removeImport(content: string): string {
  // 匹配各种导入格式
  const importPatterns = [
    /import\s+appdevDesignMode\s+from\s+['"]@xagi\/vite-plugin-design-mode['"];?\s*\n?/g,
    /import\s+\{\s*default\s+as\s+appdevDesignMode\s*\}\s+from\s+['"]@xagi\/vite-plugin-design-mode['"];?\s*\n?/g,
  ];
  
  let result = content;
  for (const pattern of importPatterns) {
    result = result.replace(pattern, '');
  }
  
  return result;
}

/**
 * 移除插件配置
 */
function removePluginConfig(content: string): string {
  // 移除 appdevDesignMode() 调用
  // 匹配 appdevDesignMode() 或 appdevDesignMode({...})
  const pluginCallPattern = /appdevDesignMode\s*\([^)]*\)/g;
  
  let result = content.replace(pluginCallPattern, '');
  
  // 清理可能留下的多余逗号和空白
  // 处理 , appdevDesignMode() 或 appdevDesignMode(), 的情况
  result = result.replace(/,\s*,/g, ','); // 双逗号变单逗号
  result = result.replace(/,\s*\]/g, ']'); // 数组末尾的逗号
  result = result.replace(/\[\s*,/g, '['); // 数组开头的逗号
  result = result.replace(/,\s*}/g, '}'); // 对象末尾的逗号
  
  // 处理可能的注释
  result = result.replace(/\/\/\s*appdevDesignMode.*?\n/g, '');
  result = result.replace(/\/\*\s*appdevDesignMode.*?\*\//g, '');
  
  // 如果 plugins 数组为空，移除整个 plugins 配置（包括前后的逗号）
  const emptyPluginsPattern = /,\s*plugins\s*:\s*\[\s*\]/g;
  result = result.replace(emptyPluginsPattern, '');
  const emptyPluginsPattern2 = /plugins\s*:\s*\[\s*\]\s*,?/g;
  result = result.replace(emptyPluginsPattern2, '');
  
  // 清理多余的空行（连续3个或更多空行变为2个）
  result = result.replace(/\n{3,}/g, '\n\n');
  
  // 清理行尾的多余空格
  result = result.replace(/[ \t]+$/gm, '');
  
  return result;
}

/**
 * 主函数
 */
function main() {
  console.log('🗑️  开始卸载 @xagi/vite-plugin-design-mode 插件...\n');

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

  // 2. 检测插件是否已安装
  const isInstalled = isPluginInstalled(packageJson);
  if (!isInstalled) {
    console.log('ℹ️  插件未安装，无需卸载。');
    return;
  }

  // 3. 从 package.json 中移除插件依赖
  const updatedPackageJson = removePluginFromPackageJson(packageJson);
  if (updatedPackageJson !== packageJson) {
    writeFileSync(
      packageJsonPath,
      JSON.stringify(updatedPackageJson, null, 2) + '\n',
      'utf-8'
    );
    console.log(`✓ 已从 package.json 中移除插件依赖: ${PLUGIN_NAME}`);
  }

  // 4. 查找并修改 vite.config 文件
  const viteConfigPath = findViteConfig(projectRoot);
  if (!viteConfigPath) {
    console.warn('\n⚠️  未找到 vite.config 文件，跳过配置文件清理。');
    console.log('\n✅ 卸载完成！');
    console.log('请手动运行包管理器卸载命令（如: pnpm remove @xagi/vite-plugin-design-mode）来移除依赖。\n');
    return;
  }

  console.log(`📝 找到配置文件: ${viteConfigPath}`);

  // 5. 读取配置文件内容
  let configContent = readFileSync(viteConfigPath, 'utf-8');
  const originalContent = configContent;

  // 6. 移除 import
  configContent = removeImport(configContent);

  // 7. 移除插件配置
  configContent = removePluginConfig(configContent);

  // 8. 如果内容有变化，写入文件
  if (configContent !== originalContent) {
    writeFileSync(viteConfigPath, configContent, 'utf-8');
    console.log(`✓ 已清理配置文件: ${viteConfigPath}`);
  } else {
    console.log(`ℹ️  配置文件中未找到插件相关配置，无需清理`);
  }

  console.log('\n✅ 卸载完成！');
  console.log('\n📦 下一步: 请运行包管理器卸载命令来移除依赖:');
  console.log('  - pnpm remove @xagi/vite-plugin-design-mode');
  console.log('  - npm uninstall @xagi/vite-plugin-design-mode');
  console.log('  - yarn remove @xagi/vite-plugin-design-mode');
  console.log('\n插件配置已从项目中移除。\n');
}

export { main };

