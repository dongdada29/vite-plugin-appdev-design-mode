#!/usr/bin/env node

/**
 * CLI 入口文件
 * 处理命令行参数并调用相应的功能
 */

import { main as installMain } from './install.js';
import { main as uninstallMain } from './uninstall.js';

const command = process.argv[2];

switch (command) {
  case 'install':
    installMain();
    break;
  case 'uninstall':
    uninstallMain();
    break;
  case undefined:
  case '--help':
  case '-h':
    console.log(`
@xagi/vite-plugin-design-mode CLI

用法:
  npx @xagi/vite-plugin-design-mode <command>
  pnpm dlx @xagi/vite-plugin-design-mode <command>

命令:
  install     在 package.json 和 vite.config 中添加插件配置
  uninstall   从 package.json 和 vite.config 中移除插件配置

说明:
  - 这些命令只会在配置文件中添加/移除插件配置，不会执行包管理器命令
  - 配置完成后，请手动运行包管理器命令来安装/卸载依赖

示例:
  # 安装
  pnpm dlx @xagi/vite-plugin-design-mode install
  npx @xagi/vite-plugin-design-mode install
  
  # 卸载
  pnpm dlx @xagi/vite-plugin-design-mode uninstall
  npx @xagi/vite-plugin-design-mode uninstall

更多信息请访问: https://www.npmjs.com/package/@xagi/vite-plugin-design-mode
`);
    break;
  default:
    console.error(`✗ 未知命令: ${command}`);
    console.error('使用 --help 查看可用命令');
    process.exit(1);
}
