import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL;
let socket: Socket;

export const connectChatSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });
  }
  return socket;
};

export const joinInventoryRoom = (inventoryId: string, userId: string) => {
  socket.emit('joinInventory', {inventoryId, userId});
};

export const leaveInventoryRoom = (inventoryId: string, userId: string) => {
  socket.emit('leaveInventory', {inventoryId, userId});
};

export const sendMessage = (inventoryId: string, text: string, userId: any) => {
  socket.emit('sendMessage', { inventoryId, text, userId });
};
