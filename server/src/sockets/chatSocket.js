import { createInventoryMessage } from "../controllers/inventoryMessageController.js";

export default function chatSocket(io, socket) {
  console.log("User connected:", socket.id);

  socket.on('message', (msg) => {
    console.log('Message:', msg);
    io.emit('message', msg);
  });

  socket.on("joinInventory", ({ inventoryId, userId }) => {
    socket.join(inventoryId);
    console.log(`User ${userId} joined room ${inventoryId}`);
    socket.to(inventoryId).emit('userJoined', { userId });
  });

  socket.on('sendMessage', async ({ inventoryId, userId, text }) => {
    const newMessage = await createInventoryMessage({ inventoryId, userId, text });
    console.log(newMessage)
    io.to(inventoryId).emit('newMessage', newMessage);
  });

  socket.on("leaveInventory", ({ inventoryId, userId }) => {
    socket.leave(inventoryId);
    console.log(`User ${userId} left room ${inventoryId}`);
    socket.to(inventoryId).emit('userLeft', { userId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
}
