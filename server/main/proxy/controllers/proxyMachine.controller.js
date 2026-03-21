const path = require("path");
const { createProxyMiddleware ,fixRequestBody } = require("http-proxy-middleware");
const { getMachineByMigid } = require('../db/proxy.service'); // adjust path

// const {server} =require('../../main.server')

const setSession = async (req, res) => {
    try {
        console.log("request received for setSession")
        const { migid } = req.body;
        if (!migid) return res.status(400).json({ message: 'migid is required' });

        const machine = await getMachineByMigid(migid);
        if (!machine) return res.status(404).json({ message: 'Machine not found' });

        req.session.migid = migid;
        req.session.proxyTarget = `http://${machine.ip}:${machine.port}`;
        req.session.ip = machine.ip;
        req.session.port = machine.port;

        req.session.save((err) => {
            if (err) return res.status(500).json({ message: 'Failed to save session' });
            res.json({ message: 'Session set successfully' });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


// const proxyMiddleware = createProxyMiddleware({
// 	changeOrigin: true,
// 	ws: true,
// 	router: function (req) {
// 		return req.session?.proxyTarget;
// 	},
// });

// CHATGPT
// const proxyMiddleware = createProxyMiddleware({
//   changeOrigin: true,
//   ws: true,

//   router: function (req) {
//     return req.session?.proxyTarget;
//   },

//   onProxyReq: (proxyReq, req, res) => {
//     if (req.headers.cookie) {
//       proxyReq.setHeader('cookie', req.headers.cookie);
//     }
//   },

//   onProxyRes: (proxyRes, req, res) => {
//     const cookies = proxyRes.headers['set-cookie'];
//     if (cookies) {
//       proxyRes.headers['set-cookie'] = cookies.map(cookie =>
//         cookie
//           .replace(/; secure/gi, '') // optional if HTTP
//           .replace(/; SameSite=None/gi, '')
//       );
//     }
//   },

//   xfwd: true, // VERY IMPORTANT
// });

// CLAUSDE

const proxyMiddleware = createProxyMiddleware({
    target: 'http://localhost:8888',
  changeOrigin: true,
  ws: false,
  router: (req) => req.session?.proxyTarget,

  on: {
    proxyReq: (proxyReq, req) => {
      const target = req.session?.proxyTarget;
    //   console.log(target)
      if (!target) return;

      const { host } = new URL(target);

      // Tell Jupyter the real host it's running on
      proxyReq.setHeader('Host', host);
      proxyReq.setHeader('Origin', target);
      proxyReq.setHeader('Referer', `${target}/login`);

      // Fix body forwarding if body-parser ran before proxy
      fixRequestBody(proxyReq, req);
    },

    proxyRes: (proxyRes, req, res) => {
      const cookies = proxyRes.headers['set-cookie'];
      if (cookies) {
        proxyRes.headers['set-cookie'] = cookies.map(c =>
          // Remove domain lock and normalize path
          c.replace(/Domain=[^;]*;?\s*/gi, '')
           .replace(/Path=\/[^;]*/gi, 'Path=/')
           .replace(/SameSite=\w+/gi, 'SameSite=Lax')
        );
      }
    },

  error: (err, req, res) => {
  console.error('[Jupyter Proxy Error]', err);

  // res is a Socket when error comes from WebSocket upgrade
  if (res && typeof res.status === 'function') {
    // Normal HTTP response
    if (!res.headersSent) {
      res.status(502).json({ error: 'Jupyter unreachable', detail: err.message });
    }
  } else if (res && typeof res.end === 'function') {
    // WebSocket socket — just close it cleanly
    res.end();
  }
},
  },

  cookieDomainRewrite: { '*': '' }, // strip all cookie domains
});


module.exports = {
    setSession,
    proxyMiddleware,
};
