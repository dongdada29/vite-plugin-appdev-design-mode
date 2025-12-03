#!/usr/bin/env node

/**
 * 卸载 @xagi/vite-plugin-design-mode 插件
 * 功能：
 * 1. 从 package.json 中移除插件依赖
 * 2. 从 vite.config.ts/js/mjs 中移除 import 和插件配置
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const PLUGIN_NAME = '@xagi/vite-plugin-design-mode';
const VITE_CONFIG_FILES = ['vite.config.ts', 'vite.config.js', 'vite.config.mjs'];

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  packageManager?: string;
}

/**
 * 检测项目使用的包管理器
 * 优先级：
 * 1. package.json 中的 packageManager 字段（npm 7+ / pnpm 7+ / yarn 2+）
 * 2. 环境变量（PNPM_HOME, YARN_* 等）
 * 3. 检查 lock 文件
 * 4. 检查哪个包管理器命令可用
 * 5. 默认使用 npm
 */
function detectPackageManager(): 'npm' | 'pnpm' | 'yarn' {
  const packageJsonPath = join(process.cwd(), 'package.json');
  
  // 1. 检查 package.json 中的 packageManager 字段（最高优先级）
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson: PackageJson = JSON.parse(
        readFileSync(packageJsonPath, 'utf-8')
      );
      if (packageJson.packageManager) {
        const pm = packageJson.packageManager.split('@')[0];
        if (pm === 'pnpm' || pm === 'yarn' || pm === 'npm') {
          return pm as 'npm' | 'pnpm' | 'yarn';
        }
      }
    } catch (e) {
      // 忽略解析错误，继续其他检测方法
    }
  }
  
  // 2. 检查环境变量（检测当前运行环境）
  // 如果通过 pnpm dlx 运行，会有相关环境变量
  if (process.env.PNPM_HOME || process.env.pnpm_execpath || process.env.npm_config_user_agent?.includes('pnpm')) {
    return 'pnpm';
  }
  if (process.env.YARN_VERSION || process.env.npm_config_user_agent?.includes('yarn')) {
    return 'yarn';
  }
  
  // 3. 检查 lock 文件
  if (existsSync(join(process.cwd(), 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  if (existsSync(join(process.cwd(), 'yarn.lock'))) {
    return 'yarn';
  }
  if (existsSync(join(process.cwd(), 'package-lock.json'))) {
    return 'npm';
  }
  
  // 4. 尝试检测哪个包管理器命令可用
  try {
    execSync('pnpm --version', { stdio: 'ignore', cwd: process.cwd() });
    return 'pnpm';
  } catch (e) {
    // pnpm 不可用，继续检查
  }
  
  try {
    execSync('yarn --version', { stdio: 'ignore', cwd: process.cwd() });
    return 'yarn';
  } catch (e) {
    // yarn 不可用，继续检查
  }
  
  // 5. 默认使用 pnpm
  return 'pnpm';
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
 * 卸载插件
 */
function uninstallPlugin(packageManager: 'npm' | 'pnpm' | 'yarn'): void {
  const commands = {
    npm: `npm uninstall ${PLUGIN_NAME}`,
    pnpm: `pnpm remove ${PLUGIN_NAME}`,
    yarn: `yarn remove ${PLUGIN_NAME}`,
  };

  console.log(`\n卸载插件 ${PLUGIN_NAME}...`);
  console.log(`执行命令: ${commands[packageManager]}\n`);
  
  try {
    execSync(commands[packageManager], { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log(`\n✓ 插件卸载成功！\n`);
  } catch (error) {
    console.error(`\n✗ 插件卸载失败:`, error);
    process.exit(1);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🗑️  开始卸载 @xagi/vite-plugin-design-mode 插件...\n');

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

  // 2. 检测插件是否已安装
  const isInstalled = isPluginInstalled(packageJson);
  if (!isInstalled) {
    console.log('ℹ️  插件未安装，无需卸载。');
    return;
  }

  // 3. 检测包管理器
  const packageManager = detectPackageManager();
  console.log(`📦 检测到包管理器: ${packageManager}`);

  // 4. 卸载插件依赖
  uninstallPlugin(packageManager);

  // 5. 查找并修改 vite.config 文件
  const viteConfigPath = findViteConfig();
  if (!viteConfigPath) {
    console.warn('⚠️  未找到 vite.config 文件，跳过配置文件清理。');
    console.log('\n✅ 卸载完成！');
    return;
  }

  console.log(`📝 找到配置文件: ${viteConfigPath}`);

  // 6. 读取配置文件内容
  let configContent = readFileSync(viteConfigPath, 'utf-8');
  const originalContent = configContent;

  // 7. 移除 import
  configContent = removeImport(configContent);

  // 8. 移除插件配置
  configContent = removePluginConfig(configContent);

  // 9. 如果内容有变化，写入文件
  if (configContent !== originalContent) {
    writeFileSync(viteConfigPath, configContent, 'utf-8');
    console.log(`✓ 已清理配置文件: ${viteConfigPath}`);
  } else {
    console.log(`ℹ️  配置文件中未找到插件相关配置，无需清理`);
  }

  console.log('\n✅ 卸载完成！');
  console.log('插件及其配置已从项目中移除。\n');
}

export { main };

