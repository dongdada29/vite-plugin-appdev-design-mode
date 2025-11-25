export type MessageType =
  | 'SELECTION_CHANGED'
  | 'UPDATE_STYLE'
  | 'UPDATE_CONTENT'
  | 'HOVER_ELEMENT';

export interface BridgeMessage {
  type: MessageType;
  payload: any;
}

export class Bridge {
  private isIframe: boolean;
  private listeners: Record<string, Function[]> = {};

  constructor() {
    this.isIframe = window.self !== window.top;
    window.addEventListener('message', this.handleMessage);
  }

  private handleMessage = (event: MessageEvent) => {
    const { type, payload } = event.data || {};
    if (type && this.listeners[type]) {
      this.listeners[type].forEach(fn => fn(payload));
    }
  };

  public send(type: MessageType, payload: any) {
    const message: BridgeMessage = { type, payload };
    if (this.isIframe) {
      window.parent.postMessage(message, '*');
    } else {
      // If we are the host, we might send to iframe?
      // But currently we assume we are the client inside iframe sending to host,
      // OR host sending to client.
      // If this class is used in Host, it needs to know target iframe.
      // For now, let's assume this is primarily for the Client (App).
      console.warn('[DesignMode] Bridge.send called but not in iframe');
    }
  }

  public on(type: MessageType, callback: Function) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
    return () => {
      this.listeners[type] = this.listeners[type].filter(fn => fn !== callback);
    };
  }

  public destroy() {
    window.removeEventListener('message', this.handleMessage);
    this.listeners = {};
  }
}

export const bridge = new Bridge();
