import { showToast } from '@/constants/showToast';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';

class WebSocketService {
  private socket: Socket | null = null;
  private connected = false;
  private currentSocketId: string | null = null;

  connect() {
    console.log('Tentando conectar WebSocket...');
    if (this.socket) {
      return;
    }

    this.socket = io('http://192.168.1.8:3000', {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket conectado');
      this.connected = true;
      this.currentSocketId = this.socket?.id || null; //Armazenar socket ID
      console.log('Socket ID:', this.currentSocketId);
      this.authenticate();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket desconectado:', reason);
      this.connected = false;
    });

    this.socket.on('notification', (data: any) => {
      console.log('Nova notificação:', data);
      showToast('info', data.title, data.message);
    });

    this.socket.on('authenticated', (data: any) => {
      console.log('Resultado da autenticação:', data);
    });

    this.socket.on('error', (error: any) => {
      console.error('Erro no websocket1:', error);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Erro no websocket2:', error);
    });
  }

  private async authenticate() {
    try {
      console.log('Autenticando WebSocket...');
      const token = await AuthService.safeGetItem('access_token');
      console.log('Token encontrado:', !!token);

      if (token && this.socket) {
        this.socket.emit('authenticate', { token });
        console.log('Enviado evento authenticate');
      }
    } catch (error) {
      console.error('Erro na autenticação WebSocket:', error);
    }
  }

  disconnect() {
    console.log('Desconectando WebSocket...');
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getSocketId(): string | null {
    return this.currentSocketId;
  }
}

export default new WebSocketService();
