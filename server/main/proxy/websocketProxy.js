const httpProxy = require('http-proxy');

const wsProxyServer = httpProxy.createProxyServer({});

wsProxyServer.on('error', (err, req, socket) => {
  console.error('[WS Direct Error]', err.message);
  if (socket?.writable) socket.destroy();
});

function attachWebSocketProxy(sessionMiddleware, server) {
  server.on('upgrade', (req, socket, head) => {
    socket.on('error', (err) => {
      console.error('[Socket Error]', err.message);
    });

    sessionMiddleware(req, {}, () => {
      const target = req.session?.proxyTarget;
      console.log('[WS Upgrade]', req.url, '→', target);

      if (!target) {
        socket.destroy();
        return;
      }

      wsProxyServer.ws(req, socket, head, {
        target,
        headers: {
          cookie: req.headers.cookie || '',
          origin: target,
          host: new URL(target).host,
        },
      });
    });
  });
}

module.exports = attachWebSocketProxy;
