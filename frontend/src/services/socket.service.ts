import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000/discussion';

class SocketService {
    private socket: Socket | null = null;

    connect() {
        if (this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('Connected to discussion socket');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from discussion socket');
        });

        return this.socket;
    }

    joinJob(jobId: string) {
        this.socket?.emit('joinJob', jobId);
    }

    leaveJob(jobId: string) {
        this.socket?.emit('leaveJob', jobId);
    }

    onNewMessage(callback: (message: any) => void) {
        this.socket?.on('newMessage', callback);
    }

    onMessageDeleted(callback: (messageId: string) => void) {
        this.socket?.on('messageDeleted', callback);
    }

    disconnect() {
        this.socket?.disconnect();
        this.socket = null;
    }
}

export const socketService = new SocketService();
