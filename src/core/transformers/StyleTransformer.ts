/**
 * StyleTransformer
 * Handles intelligent replacement of styles, content, and attributes in source code
 */

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Smart style replacement
 * Intelligently replaces style/className values in source code
 */
export async function smartReplaceStyle(line: string, options: any): Promise<string> {
  // Use AST parsing or regex matching for complex style replacement logic
  if (options.originalValue && line.includes(options.originalValue)) {
    return line.replace(
      new RegExp(escapeRegExp(options.originalValue), 'g'),
      options.newValue
    );
  }

  // If no original value, use column info for more precise replacement
  const parts = line.split('=');
  if (parts.length >= 2) {
    const attributeName = parts[0].trim();
    const newAttributeValue = options.newValue;

    if (attributeName === 'className') {
      return `${attributeName}={${newAttributeValue}}`;
    }
  }

  return options.newValue;
}

/**
 * Smart content replacement
 * Intelligently replaces text content in JSX elements
 */
export async function smartReplaceContent(line: string, options: any): Promise<string> {
  // For React JSX content, use more precise replacement
  if (options.originalValue && line.includes(options.originalValue)) {
    return line.replace(
      new RegExp(escapeRegExp(options.originalValue), 'g'),
      options.newValue
    );
  }

  // If within tag content, try to replace the content portion
  const contentMatch = line.match(/>([^<]*)</);
  if (contentMatch && contentMatch[1] === options.originalValue) {
    return line.replace(contentMatch[0], `>${options.newValue}<`);
  }

  return options.newValue;
}

/**
 * Smart attribute replacement
 * Intelligently replaces attribute values
 */
export async function smartReplaceAttribute(line: string, options: any): Promise<string> {
  // Implement attribute replacement logic
  return line.replace(
    new RegExp(`${options.attributeName}="[^"]*"`),
    `${options.attributeName}="${options.newValue}"`
  );
}

/**
 * Smart replace in source
 * Main entry point for intelligent source code replacement
 */
export async function smartReplaceInSource(
  content: string,
  options: {
    lineNumber: number;
    columnNumber: number;
    newValue: string;
    originalValue?: string;
    type: 'style' | 'content' | 'attribute';
  }
): Promise<string> {
  const lines = content.split('\n');
  const targetLine = Math.max(0, options.lineNumber - 1);

  if (targetLine >= lines.length) {
    throw new Error(`Line ${options.lineNumber} exceeds file length`);
  }

  const line = lines[targetLine];
  let newLine = line;

  try {
    switch (options.type) {
      case 'style':
        newLine = await smartReplaceStyle(line, options);
        break;
      case 'content':
        newLine = await smartReplaceContent(line, options);
        break;
      case 'attribute':
        newLine = await smartReplaceAttribute(line, options);
        break;
    }

    lines[targetLine] = newLine;
    return lines.join('\n');
  } catch (error) {
    console.error('[StyleTransformer] Replacement failed:', error);
    throw error;
  }
}
