import { query } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join task chat room
    socket.on('join_task', (taskId) => {
      socket.join(`task_${taskId}`);
      console.log(`User ${socket.id} joined task ${taskId}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
      const { taskId, senderId, content } = data;
      
      try {
        const messageId = uuidv4();
        await query(
          'INSERT INTO messages (id, task_id, sender_id, content) VALUES ($1, $2, $3, $4)',
          [messageId, taskId, senderId, content]
        );

        // Broadcast to task room
        io.to(`task_${taskId}`).emit('message_received', {
          id: messageId,
          taskId,
          senderId,
          content,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Task status update
    socket.on('task_status_updated', (data) => {
      io.emit('task_update', data);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

export default initializeSocket;
