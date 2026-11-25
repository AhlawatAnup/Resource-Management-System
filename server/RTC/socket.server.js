const { io } = require('../headers.server.js');

const admin = io.of('/admin');

admin.on('connection', (socket) => {
  console.log('A New Socket is  Connected');

  socket.join('hello');
  // setInterval(() => {
  //   socket.to('hello').emit('HELLO_WORLD');
  // }, 3000);

  socket.on('disconnect', () => {
    console.log(' Socket has been Disconnected');
  });
});
