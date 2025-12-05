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

        // 添加源码信息属性（使用配置的前缀）
        addSourceInfoAttribute(node, sourceInfo, options);

        // 添加简化位置属性
        addPositionAttribute(node, location, options);

        // 添加元素ID属性
        addElementIdAttribute(node, sourceInfo, options);

        // 添加单独的属性以便于查询
        addIndividualAttributes(node, sourceInfo, options);

        // Check if content is static and add attribute
        if (isStaticContent(path)) {
          addStaticContentAttribute(node, path, options);
        }
      },

      JSXElement(path: NodePath) {
        const { node } = path;
        const { openingElement, children } = node;

        // 只处理有静态文本children的元素
        if (!children || children.length === 0) return;

        // 检查children是否包含JSXText（静态文本）
        const hasStaticText = children.some((child: any) => t.isJSXText(child) && child.value.trim() !== '');

        if (hasStaticText) {
          // 获取第一个非空文本节点的位置
          const textChild = children.find((child: any) => t.isJSXText(child) && child.value.trim() !== '');
          if (textChild && textChild.loc) {
            // 添加 children-source 属性，记录文本的来源位置
            const childrenSourceValue = `${fileName}:${textChild.loc.start.line}:${textChild.loc.start.column}`;
            const attributeName = `${attributePrefix}-children-source`;

            openingElement.attributes.push(
              t.jsxAttribute(
                t.jsxIdentifier(attributeName),
                t.stringLiteral(childrenSourceValue)
              )
            );
          }
        }
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

  // 移除现有的源码信息属性
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

  node.attributes.unshift(attr);
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

  node.attributes.unshift(attr);
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

  node.attributes.unshift(attr);
}

/**
 * 添加单独的属性以便于查询
 */
function addIndividualAttributes(node: t.JSXOpeningElement, sourceInfo: SourceMappingInfo, options: Required<DesignModeOptions>) {
  const { attributePrefix } = options;

  // Helper to add attribute if it doesn't exist
  const addAttr = (name: string, value: string | number | undefined) => {
    if (value === undefined) return;

    node.attributes = node.attributes.filter(a =>
      !(t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === name)
    );

    node.attributes.unshift(t.jSXAttribute(
      t.jSXIdentifier(name),
      t.stringLiteral(String(value))
    ));
  };

  // 添加所有单独的属性，便于查询和调试
  addAttr(`${attributePrefix}-file`, sourceInfo.fileName);
  addAttr(`${attributePrefix}-line`, sourceInfo.lineNumber);
  addAttr(`${attributePrefix}-column`, sourceInfo.columnNumber);
  addAttr(`${attributePrefix}-component`, sourceInfo.componentName);
  addAttr(`${attributePrefix}-function`, sourceInfo.functionName);
}

/**
 * Check if the JSX element contains only static content
 * 严格检查：只能包含纯文本节点（JSXText），不能包含任何其他元素标签或表达式容器
 */
function isStaticContent(path: NodePath): boolean {
  const { node } = path;
  const element = path.parent; // JSXElement

  if (!t.isJSXElement(element)) return false;

  // 如果没有子节点，不是静态内容（空元素）
  if (element.children.length === 0) return false;

  // 严格检查：只能包含纯文本节点（JSXText）
  // 不允许表达式容器、嵌套元素、注释等任何其他类型的节点
  return element.children.every(child => {
    // 只允许纯文本节点
    if (t.isJSXText(child)) {
      // 检查文本内容是否为空（只包含空白字符）
      // 如果文本只包含空白字符，仍然认为是有效的文本节点
      return true;
    }

    // 禁止所有其他类型的节点：
    // - JSXExpressionContainer（表达式容器，即使是字面量也不允许）
    // - JSXElement（嵌套元素）
    // - JSXFragment（Fragment）
    // - JSXSpreadChild（展开子元素）
    // - 其他任何类型的节点
    return false;
  });
}

/**
 * Add static-content attribute (使用配置的前缀)
 * 只有在元素确实只包含纯文本节点时才会添加此属性
 * 严格验证：确保元素只包含 JSXText 节点，不包含任何其他元素标签或表达式容器
 */
function addStaticContentAttribute(node: t.JSXOpeningElement, path: NodePath, options: Required<DesignModeOptions>) {
  const { attributePrefix } = options;
  const attributeName = `${attributePrefix}-static-content`;

  // 双重验证：再次检查元素是否真的只包含纯文本节点
  // 即使调用前已经检查过，这里也再次验证以确保安全
  if (!isStaticContent(path)) {
    return; // 如果不是纯静态文本，不添加属性
  }

  // Check if attribute already exists
  const hasAttr = node.attributes.some(a =>
    t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === attributeName
  );

  if (!hasAttr) {
    node.attributes.unshift(t.jSXAttribute(
      t.jSXIdentifier(attributeName),
      t.stringLiteral('true')
    ));
  }
}
