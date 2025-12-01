import * as fs from 'fs';
import * as path from 'path';

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate update request
 */
export async function validateUpdateRequest(
  update: any,
  rootDir: string
): Promise<ValidationResult> {
  const errors: string[] = [];

  // Check required fields
  if (!update.filePath) errors.push('Missing filePath');
  if (update.line === undefined) errors.push('Missing line');
  if (update.column === undefined) errors.push('Missing column');
  if (update.newValue === undefined) errors.push('Missing newValue');
  if (!update.type) errors.push('Missing type');

  // Check file path
  if (update.filePath) {
    const fullPath = path.resolve(rootDir, update.filePath);
    try {
      await fs.promises.access(fullPath, fs.constants.F_OK);
    } catch {
      errors.push(`File not found: ${update.filePath}`);
    }
  }

  // Check update type
  if (update.type && !['style', 'content', 'attribute'].includes(update.type)) {
    errors.push(`Invalid update type: ${update.type}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format validation errors into user-friendly message
 */
export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  return `Multiple errors:\n${errors.map((e, i) => `  ${i + 1}. ${e}`).join('\n')}`;
}
