/**
 * Emit real-time notification to a user's Socket.io room.
 * Set from index.js after io is created to avoid circular dependency.
 */
let _io = null;

export function setIo(io) {
  _io = io;
}

export function emitToUser(userId, payload = {}) {
  if (!_io || !userId) return;
  const id = typeof userId === 'object' && userId?.toString ? userId.toString() : String(userId);
  _io.to(`user_${id}`).emit('new_notification', payload);
}
