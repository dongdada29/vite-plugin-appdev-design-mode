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

        // 判断当前文件是否是组件定义文件（components/ui/ 或 components/common/）
        const isComponentDefinitionFile =
          fileName.includes('/components/ui/') ||
          fileName.includes('/components/common/') ||
          fileName.includes('\\components\\ui\\') ||
          fileName.includes('\\components\\common\\');

        // 判断当前元素是否是组件引用（大写开头的 JSX 元素通常是组件）
        const elementName = getJSXElementName(node.name);
        const isComponentReference = /^[A-Z]/.test(elementName);

        // 构建源码位置信息
        const sourceInfo: SourceMappingInfo = {
          fileName: fileName,
          lineNumber: location.start.line,
          columnNumber: location.start.column,
          elementType: elementName,
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

        // 添加文件类型标识：区分组件定义文件和使用组件的页面文件
        addFileTypeAttribute(node, isComponentDefinitionFile, isComponentReference, options);

        // Check if content is static and add attribute
        // 重要：
        // 1. 在组件定义文件中，即使内容是静态的，也不应该添加 static-content 属性
        //    因为编辑应该发生在使用组件的页面文件中，而不是组件定义文件中
        // 2. 对于组件引用（component-usage），也不应该添加 static-content 属性
        //    因为组件的实际渲染元素在运行时才确定，无法准确判断内容是否静态
        //    例如 <CardTitle>功能特色</CardTitle>，虽然 "功能特色" 是静态文本，
        //    但 CardTitle 渲染为 <div>，这个 div 会有 children-source="usage"
        //    应该在组件定义中标记，而不是使用位置
        if (isStaticContent(path)) {
          // 只有在非组件定义文件且非组件引用时才添加 static-content 属性
          // 这样可以确保编辑操作只发生在真正的静态内容上（如普通HTML标签的文本）
          if (!isComponentDefinitionFile && !isComponentReference) {
            addStaticContentAttribute(node, path, options);
          }
        }

        // 特殊处理：如果当前元素在组件定义文件中，且接收 children 作为 props
        // 我们需要标记这个元素，表示它的内容来自使用位置
        // 这样在运行时可以找到正确的源码位置
        if (isComponentDefinitionFile && receivesChildrenAsProps(path)) {
          addChildrenSourceAttribute(node, path, options);
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
  const addAttr = (name: string, value: string | number | undefined) => {
    if (value === undefined) return;

    node.attributes = node.attributes.filter(a =>
      !(t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === name)
    );

    node.attributes.push(t.jSXAttribute(
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
    node.attributes.push(t.jSXAttribute(
      t.jSXIdentifier(attributeName),
      t.stringLiteral('true')
    ));
  }
}

/**
 * 添加文件类型属性，用于区分组件定义文件和使用组件的页面文件
 * @param node JSX 元素节点
 * @param isComponentDefinitionFile 是否是组件定义文件
 * @param isComponentReference 是否是组件引用（大写开头的元素）
 * @param options 配置选项
 */
function addFileTypeAttribute(
  node: t.JSXOpeningElement,
  isComponentDefinitionFile: boolean,
  isComponentReference: boolean,
  options: Required<DesignModeOptions>
) {
  const { attributePrefix } = options;
  const attributeName = `${attributePrefix}-file-type`;

  // 移除现有属性
  node.attributes = node.attributes.filter(a =>
    !(t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === attributeName)
  );

  // 确定文件类型
  let fileType: string;
  if (isComponentDefinitionFile) {
    fileType = 'component-definition'; // 组件定义文件
  } else if (isComponentReference) {
    fileType = 'component-usage'; // 页面文件中使用组件
  } else {
    fileType = 'page-content'; // 页面文件中的原生元素
  }

  node.attributes.push(t.jSXAttribute(
    t.jSXIdentifier(attributeName),
    t.stringLiteral(fileType)
  ));
}

/**
 * 检查元素是否接收 children 作为 props
 * 这通常意味着元素的内容来自组件使用位置，而不是组件定义位置
 * 
 * 改进：对于组件定义文件中的元素，如果它的父函数接收 props（包括通过 ...props 传递），
 * 且元素使用了 {...props} 展开，则认为它可能接收 children
 */
function receivesChildrenAsProps(path: NodePath): boolean {
  const { node } = path;
  const element = path.parent; // JSXElement

  if (!t.isJSXElement(element)) return false;

  // 检查父函数是否接收 props 参数
  const functionParent = path.findParent((p: NodePath) =>
    t.isFunctionDeclaration(p.node) ||
    t.isArrowFunctionExpression(p.node) ||
    t.isVariableDeclarator(p.node)
  );

  if (!functionParent) return false;

  // 检查函数参数
  let hasPropsParam = false;
  let hasChildrenParam = false;

  if (t.isFunctionDeclaration(functionParent.node)) {
    functionParent.node.params.forEach((param: any) => {
      if (t.isIdentifier(param)) {
        if (param.name === 'children') {
          hasChildrenParam = true;
        }
        if (param.name === 'props') {
          hasPropsParam = true;
        }
      }
      if (t.isObjectPattern(param)) {
        // 检查对象解构中是否有 children
        const hasChildrenInPattern = param.properties.some((prop: any) => {
          if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
            return prop.key.name === 'children';
          }
          return false;
        });
        if (hasChildrenInPattern) {
          hasChildrenParam = true;
        }
        // 如果有对象解构参数，通常意味着接收 props
        hasPropsParam = true;
      }
    });
  } else if (t.isArrowFunctionExpression(functionParent.node)) {
    functionParent.node.params.forEach((param: any) => {
      if (t.isIdentifier(param)) {
        if (param.name === 'children') {
          hasChildrenParam = true;
        }
        if (param.name === 'props') {
          hasPropsParam = true;
        }
      }
      if (t.isObjectPattern(param)) {
        const hasChildrenInPattern = param.properties.some((prop: any) => {
          if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
            return prop.key.name === 'children';
          }
          return false;
        });
        if (hasChildrenInPattern) {
          hasChildrenParam = true;
        }
        hasPropsParam = true;
      }
    });
  } else if (t.isVariableDeclarator(functionParent.node)) {
    const init = functionParent.node.init;
    if (t.isArrowFunctionExpression(init) || t.isFunctionExpression(init)) {
      init.params.forEach((param: any) => {
        if (t.isIdentifier(param)) {
          if (param.name === 'children') {
            hasChildrenParam = true;
          }
          if (param.name === 'props') {
            hasPropsParam = true;
          }
        }
        if (t.isObjectPattern(param)) {
          const hasChildrenInPattern = param.properties.some((prop: any) => {
            if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
              return prop.key.name === 'children';
            }
            return false;
          });
          if (hasChildrenInPattern) {
            hasChildrenParam = true;
          }
          hasPropsParam = true;
        }
      });
    }
  }

  // 如果函数明确接收 children 参数
  if (hasChildrenParam) {
    // 检查当前元素是否使用了 children（通过 {children} 或 {props.children}）
    if (t.isJSXElement(element)) {
      const hasChildrenExpression = element.children.some((child: any) => {
        if (t.isJSXExpressionContainer(child)) {
          const expression = child.expression;
          if (t.isIdentifier(expression)) {
            return expression.name === 'children';
          }
          if (t.isMemberExpression(expression)) {
            return t.isIdentifier(expression.object) &&
              expression.object.name === 'props' &&
              t.isIdentifier(expression.property) &&
              expression.property.name === 'children';
          }
        }
        return false;
      });
      if (hasChildrenExpression) {
        return true;
      }
    }
  }

  // 如果函数接收 props 参数（通过对象解构或直接 props），
  // 且当前元素使用了 {...props} 展开，则认为它可能接收 children
  if (hasPropsParam) {
    // 检查当前元素是否使用了 {...props} 展开
    const hasPropsSpread = node.attributes.some((attr: any) => {
      if (t.isJSXSpreadAttribute(attr)) {
        const argument = attr.argument;
        if (t.isIdentifier(argument)) {
          // {...props} 或 {...rest}
          return argument.name === 'props' || argument.name === 'rest' || argument.name.endsWith('Props');
        }
        if (t.isMemberExpression(argument)) {
          // {...someObject.props}
          return true;
        }
      }
      return false;
    });

    if (hasPropsSpread) {
      // 如果元素使用了 {...props}，且元素本身没有显式的 children，
      // 那么 children 可能是通过 props 传递的
      // 在这种情况下，我们认为这个元素接收 children 作为 props
      return true;
    }
  }

  return false;
}

/**
 * 添加 children-source 属性，标记元素的内容来自使用位置
 * 这样在运行时可以找到正确的源码位置
 */
function addChildrenSourceAttribute(node: t.JSXOpeningElement, path: NodePath, options: Required<DesignModeOptions>) {
  const { attributePrefix } = options;
  const attributeName = `${attributePrefix}-children-source`;

  // 检查属性是否已存在
  const hasAttr = node.attributes.some(a =>
    t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === attributeName
  );

  if (!hasAttr) {
    // 添加属性，值为 'usage' 表示内容来自使用位置
    node.attributes.push(t.jSXAttribute(
      t.jSXIdentifier(attributeName),
      t.stringLiteral('usage')
    ));
  }
}
