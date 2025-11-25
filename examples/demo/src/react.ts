// React重新导出，确保在所有情况下都能正确导入
export { useState, useEffect, useCallback, useMemo, useRef, useReducer } from 'react';
export { createContext, useContext } from 'react';
export { createElement, Fragment } from 'react';
export type { ReactNode, ReactElement, ComponentType } from 'react';

// React主对象重新导出（兼容旧版本）
import * as ReactModule from 'react';
export default ReactModule;
export const React = ReactModule;
