import { getAuthToken } from '../api/config';
import { io, Socket } from 'socket.io-client';

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket | null = null;
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageQueue: { type: string; data: any }[] = [];

  private constructor() {
    // Constructeur privé pour le singleton
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(): void {
    if (this.socket?.connected) return;

    const host = window.location.hostname;
    const port = import.meta.env.VITE_WS_PORT || '3001';
    
    this.socket = io(`http://${host}:${port}`, {
      auth: {
        token: getAuthToken()
      },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000
    });

    this.socket.on('connect', () => {
      console.log('Socket.IO connected');
      this.reconnectAttempts = 0;
      this.sendQueuedMessages();
    });

    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      this.handleReconnect();
    });

    this.socket.on('notification', (data) => {
      this.handleMessage('notification', data);
    });

    this.socket.on('appointmentUpdate', (data) => {
      this.handleMessage('appointmentUpdate', data);
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      console.log(`Attempting to reconnect... (${this.reconnectAttempts})`);
      this.connect();
    }, delay);
  }

  public on(type: string, handler: (data: any) => void): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)?.add(handler);
  }

  public off(type: string, handler: (data: any) => void): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.messageHandlers.delete(type);
      }
    }
  }

  private handleMessage(type: string, data: any): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${type} handler:`, error);
        }
      });
    }
  }

  public send(type: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(type, data);
    } else {
      // Ajouter le message à la file d'attente si ce n'est pas un ping
      if (type !== 'ping') {
        this.messageQueue.push({ type, data });
      }
      console.warn('Socket.IO is not connected, message queued');
    }
  }



  private sendQueuedMessages(): void {
    while (this.messageQueue.length > 0 && this.socket?.connected) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message.type, message.data);
      }
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.messageHandlers.clear();
    this.messageQueue = [];
  }
}

export default WebSocketService.getInstance();
