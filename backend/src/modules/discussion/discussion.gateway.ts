import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
    },
    namespace: 'discussion',
})
export class DiscussionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinJob')
    handleJoinJob(client: Socket, jobId: string) {
        client.join(`job_${jobId}`);
        console.log(`User ${client.id} joined room: job_${jobId}`);
    }

    @SubscribeMessage('leaveJob')
    handleLeaveJob(client: Socket, jobId: string) {
        client.leave(`job_${jobId}`);
        console.log(`User ${client.id} left room: job_${jobId}`);
    }

    broadcastMessage(jobId: string, message: any) {
        if (!this.server) {
            console.error('WebSocket server not initialized yet');
            return;
        }
        this.server.to(`job_${jobId}`).emit('newMessage', message);
    }

    broadcastDelete(jobId: string, messageId: string) {
        if (!this.server) {
            console.error('WebSocket server not initialized yet');
            return;
        }
        this.server.to(`job_${jobId}`).emit('messageDeleted', messageId);
    }
}
