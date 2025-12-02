#!/bin/bash

# CLI 功能测试脚本
# 用于快速测试安装和卸载功能

set -e

echo "🚀 开始测试 CLI 功能..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 构建项目
echo -e "${BLUE}📦 步骤 1: 构建项目...${NC}"
npm run build
echo -e "${GREEN}✓ 构建完成${NC}"
echo ""

# 2. 进入测试项目
TEST_DIR="examples/demo"
if [ ! -d "$TEST_DIR" ]; then
    echo -e "${YELLOW}⚠️  测试目录不存在: $TEST_DIR${NC}"
    exit 1
fi

cd "$TEST_DIR"
echo -e "${BLUE}📁 进入测试目录: $TEST_DIR${NC}"
echo ""

# 3. 备份文件
echo -e "${BLUE}💾 步骤 2: 备份配置文件...${NC}"
if [ -f "vite.config.ts" ]; then
    cp vite.config.ts vite.config.ts.backup
    echo -e "${GREEN}✓ 已备份 vite.config.ts${NC}"
fi
if [ -f "package.json" ]; then
    cp package.json package.json.backup
    echo -e "${GREEN}✓ 已备份 package.json${NC}"
fi
echo ""

# 4. 测试安装
echo -e "${BLUE}📥 步骤 3: 测试安装功能...${NC}"
echo "执行: node ../../dist/cli/index.js install"
echo ""
node ../../dist/cli/index.js install
echo ""
echo -e "${GREEN}✓ 安装测试完成${NC}"
echo ""

# 等待用户确认
read -p "按 Enter 继续测试卸载功能..."
echo ""

# 5. 测试卸载
echo -e "${BLUE}📤 步骤 4: 测试卸载功能...${NC}"
echo "执行: node ../../dist/cli/index.js uninstall"
echo ""
node ../../dist/cli/index.js uninstall
echo ""
echo -e "${GREEN}✓ 卸载测试完成${NC}"
echo ""

# 6. 询问是否恢复备份
read -p "是否恢复备份文件? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🔄 恢复备份文件...${NC}"
    if [ -f "vite.config.ts.backup" ]; then
        mv vite.config.ts.backup vite.config.ts
        echo -e "${GREEN}✓ 已恢复 vite.config.ts${NC}"
    fi
    if [ -f "package.json.backup" ]; then
        mv package.json.backup package.json
        echo -e "${GREEN}✓ 已恢复 package.json${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✅ 所有测试完成！${NC}"

