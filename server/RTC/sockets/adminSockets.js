module.exports = (io, socket) => {
  const session = socket.request.session;

  if (session && session.user && session.user.role === 'admin') {
    console.log('admin logged in successfully');
  }
};
