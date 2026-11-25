import { io } from 'socket.io-client';

// Connect to your backend server
const socket = io('/admin', {
  withCredentials: true, // 👈 Critical for sending your session cookies
});

socket.on('connect', () => {
  console.log('Connected to socket server successfully! ID:', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('Socket connection error:', err);
});

socket.on('HELLO_WORLD', () => {
  console.log('hello world is there ');
});
