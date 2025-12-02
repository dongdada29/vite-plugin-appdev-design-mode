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

命令:
  install     一键安装/升级插件并自动配置 vite.config
  uninstall  卸载插件并清理配置文件

示例:
  npx @xagi/vite-plugin-design-mode install
  npx @xagi/vite-plugin-design-mode uninstall

更多信息请访问: https://www.npmjs.com/package/@xagi/vite-plugin-design-mode
`);
    break;
  default:
    console.error(`✗ 未知命令: ${command}`);
    console.error('使用 --help 查看可用命令');
    process.exit(1);
}

