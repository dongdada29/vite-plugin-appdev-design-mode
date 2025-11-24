import * as t from '@babel/types';

/**
 * 检查是否为React组件名称
 */
export function isReactComponentName(name: string): boolean {
  return /^[A-Z]/.test(name);
}

/**
 * 获取JSX元素的基础名称
 */
export function getJSXElementBaseName(name: any): string {
  if (t.isJSXIdentifier(name)) {
    return name.name;
  } else if (t.isJSXMemberExpression(name)) {
    return name.property.name;
  }
  return 'unknown';
}

/**
 * 检查JSX属性是否为字符串字面量
 */
export function isStringLiteralAttribute(
  attr: t.JSXAttribute,
  name: string
): attr is t.JSXAttribute & { value: t.StringLiteral } {
  return (
    t.isJSXIdentifier(attr.name) &&
    attr.name.name === name &&
    t.isStringLiteral(attr.value)
  );
}

/**
 * 提取字符串属性值
 */
export function extractStringAttributeValue(
  node: t.JSXOpeningElement,
  attributeName: string
): string | null {
  const attr = node.attributes.find(a => 
    t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === attributeName
  ) as t.JSXAttribute;
  
  if (attr && t.isStringLiteral(attr.value)) {
    return attr.value.value;
  }
  
  return null;
}

/**
 * 创建源码位置字符串
 */
export function createSourcePositionString(
  fileName: string,
  lineNumber: number,
  columnNumber: number
): string {
  return `${fileName}:${lineNumber}:${columnNumber}`;
}

/**
 * 解析源码位置字符串
 */
export function parseSourcePositionString(position: string): {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
} | null {
  const parts = position.split(':');
  if (parts.length !== 3) return null;
  
  const [fileName, lineNumberStr, columnNumberStr] = parts;
  const lineNumber = parseInt(lineNumberStr);
  const columnNumber = parseInt(columnNumberStr);
  
  if (isNaN(lineNumber) || isNaN(columnNumber)) return null;
  
  return {
    fileName,
    lineNumber,
    columnNumber
  };
}
