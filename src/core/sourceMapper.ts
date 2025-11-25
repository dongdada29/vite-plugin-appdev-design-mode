import * as babel from '@babel/standalone';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { DesignModeOptions } from '../types';

export interface SourceMappingInfo {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
  elementType: string;
  componentName?: string;
  functionName?: string;
  elementId: string;
  attributePrefix: string;
}

export interface JSXElementWithLoc extends t.JSXOpeningElement {
  loc: t.SourceLocation;
}

// PluginItem type from Babel
type PluginItem = any;
type NodePath = any;

/**
 * 创建源码映射Babel插件
 */
export function createSourceMappingPlugin(
  fileName: string,
  options: Required<DesignModeOptions>
): PluginItem {
  const { attributePrefix } = options;

  return {
    visitor: {
      JSXOpeningElement(path: NodePath) {
        const { node } = path;

        // 检查是否有位置信息
        const location = node.loc;
        if (!location) return;

        // 获取组件信息
        const componentInfo = extractComponentInfo(path);

        // 构建源码位置信息
        const sourceInfo: SourceMappingInfo = {
          fileName: fileName,
          lineNumber: location.start.line,
          columnNumber: location.start.column,
          elementType: getJSXElementName(node.name),
          componentName: componentInfo.componentName,
          functionName: componentInfo.functionName,
          elementId: generateElementId(node, fileName, location),
          attributePrefix
        };

        // 添加data-source-info属性
        addSourceInfoAttribute(node, sourceInfo, options);

        // 添加简化位置属性
        addPositionAttribute(node, location, options);

        // 添加元素ID属性
        addElementIdAttribute(node, sourceInfo, options);

        // 添加单独的属性以便于查询
        addIndividualAttributes(node, sourceInfo, options);
      }
    }
  };
}

/**
 * 提取组件信息
 */
function extractComponentInfo(path: NodePath): { componentName?: string; functionName?: string } {
  const componentInfo: { componentName?: string; functionName?: string } = {};

  // 查找最近的函数声明或类声明
  const functionParent = path.findParent((p: NodePath) =>
    t.isFunctionDeclaration(p.node) ||
    t.isArrowFunctionExpression(p.node) ||
    t.isClassDeclaration(p.node)
  );

  if (functionParent) {
    const node = functionParent.node;

    if (t.isFunctionDeclaration(node) && node.id?.name) {
      componentInfo.functionName = node.id.name;
      // React组件约定：大写开头
      if (/^[A-Z]/.test(node.id.name)) {
        componentInfo.componentName = node.id.name;
      }
    } else if (t.isArrowFunctionExpression(node)) {
      componentInfo.functionName = 'anonymous-arrow-function';
    } else if (t.isClassDeclaration(node) && node.id?.name) {
      componentInfo.functionName = node.id.name;
      componentInfo.componentName = node.id.name;
    }
  }

  // 如果没有找到函数，检查是否为变量声明
  const variableParent = path.findParent((p: NodePath) =>
    t.isVariableDeclarator(p.node)
  );

  if (variableParent && t.isVariableDeclarator(variableParent.node)) {
    const id = variableParent.node.id;
    if (t.isIdentifier(id)) {
      componentInfo.functionName = id.name;
      if (/^[A-Z]/.test(id.name)) {
        componentInfo.componentName = id.name;
      }
    }
  }

  return componentInfo;
}

/**
 * 获取JSX元素名称
 */
function getJSXElementName(name: any): string {
  if (t.isJSXIdentifier(name)) {
    return name.name;
  } else if (t.isJSXMemberExpression(name)) {
    return `${getJSXElementName(name.object)}`;
  }
  return 'unknown';
}

/**
 * 生成元素唯一标识符
 */
function generateElementId(node: t.JSXOpeningElement, fileName: string, location: t.SourceLocation): string {
  const tagName = getJSXElementName(node.name);

  // 提取关键属性
  const className = extractStringAttribute(node, 'className');
  const id = extractStringAttribute(node, 'id');

  // 构建唯一标识符
  const baseId = `${fileName}:${location.start.line}:${location.start.column}`;
  const tag = tagName.toLowerCase();
  const cls = className ? className.replace(/\s+/g, '-') : '';
  const elementId = id ? `#${id}` : '';

  return `${baseId}_${tag}${cls ? '_' + cls : ''}${elementId}`;
}

/**
 * 提取字符串属性值
 */
function extractStringAttribute(node: t.JSXOpeningElement, attributeName: string): string | null {
  const attr = node.attributes.find(a =>
    t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === attributeName
  ) as t.JSXAttribute;

  if (attr && t.isStringLiteral(attr.value)) {
    return attr.value.value;
  }

  return null;
}

/**
 * 添加源码信息属性
 */
function addSourceInfoAttribute(node: t.JSXOpeningElement, sourceInfo: SourceMappingInfo, options: Required<DesignModeOptions>) {
  const { attributePrefix } = options;

  // 移除现有的data-source-info属性
  node.attributes = node.attributes.filter(a =>
    !(t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === `${attributePrefix}-info`)
  );

  // 添加新的属性
  const attr = t.jSXAttribute(
    t.jSXIdentifier(`${attributePrefix}-info`),
    t.stringLiteral(JSON.stringify({
      fileName: sourceInfo.fileName,
      lineNumber: sourceInfo.lineNumber,
      columnNumber: sourceInfo.columnNumber,
      elementType: sourceInfo.elementType,
      componentName: sourceInfo.componentName,
      functionName: sourceInfo.functionName,
      elementId: sourceInfo.elementId
    }))
  );

  node.attributes.push(attr);
}

/**
 * 添加位置属性
 */
function addPositionAttribute(node: t.JSXOpeningElement, location: t.SourceLocation, options: Required<DesignModeOptions>) {
  const { attributePrefix } = options;

  node.attributes = node.attributes.filter(a =>
    !(t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === `${attributePrefix}-position`)
  );

  const attr = t.jSXAttribute(
    t.jSXIdentifier(`${attributePrefix}-position`),
    t.stringLiteral(`${location.start.line}:${location.start.column}`)
  );

  node.attributes.push(attr);
}

/**
 * 添加元素ID属性
 */
function addElementIdAttribute(node: t.JSXOpeningElement, sourceInfo: SourceMappingInfo, options: Required<DesignModeOptions>) {
  const { attributePrefix } = options;

  node.attributes = node.attributes.filter(a =>
    !(t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === `${attributePrefix}-element-id`)
  );

  const attr = t.jSXAttribute(
    t.jSXIdentifier(`${attributePrefix}-element-id`),
    t.stringLiteral(sourceInfo.elementId)
  );

  node.attributes.push(attr);
}

/**
 * 添加单独的属性以便于查询
 */
function addIndividualAttributes(node: t.JSXOpeningElement, sourceInfo: SourceMappingInfo, options: Required<DesignModeOptions>) {
  const { attributePrefix } = options;

  // Helper to add attribute if it doesn't exist
  const addAttr = (name: string, value: string | number) => {
    node.attributes = node.attributes.filter(a =>
      !(t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === name)
    );

    node.attributes.push(t.jSXAttribute(
      t.jSXIdentifier(name),
      t.stringLiteral(String(value))
    ));
  };

  addAttr(`${attributePrefix}-file`, sourceInfo.fileName);
  addAttr(`${attributePrefix}-line`, sourceInfo.lineNumber);
  addAttr(`${attributePrefix}-column`, sourceInfo.columnNumber);
}
