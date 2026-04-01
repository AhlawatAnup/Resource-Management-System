const path = require("path");
const mongoose = require('mongoose');
const { createProxyMiddleware ,fixRequestBody } = require("http-proxy-middleware");
const { getMachineByMigid, getActiveAllotment } = require('../db/proxy.service');
const { isResourceRequestVerified } = require('../db/proxy.service');

// const {server} =require('../../main.server')

const setSession = async (req, res) => {
    try {
        console.log("request received for setSession")
        const { migid, requestId } = req.body;

        if (!migid || !requestId) {
            return res.status(400).json({ message: 'migid and requestId are required' });
        }

        const isVerified = await isResourceRequestVerified(requestId);
        if (!isVerified) {
          return res.status(403).json({ message: 'Resource request is not verified' });
        }

        const machine = await getMachineByMigid(migid);
        if (!machine) {
            return res.status(404).json({ message: 'Machine not found' });
        }

        req.session.migid = migid;
        req.session.requestId = requestId;
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


const getTokenByMigid = async (req, res) => {
  try {
    const migid = req.headers['x-mig-id']; 
    const requestId = req.headers['x-request-id'];
    
    if (!migid) {
      return res.status(400).json({ error: "X-Mig-ID header is required" });
    }

    if (!requestId) {
      return res.status(400).json({ error: "X-Request-ID header is required" });
    }

    const resourceObjectId = mongoose.Types.ObjectId.isValid(requestId)
      ? new mongoose.Types.ObjectId(requestId)
      : null;

    if (!resourceObjectId) {
      return res.status(400).json({ error: "Invalid request id" });
    }

    // 0. Check if request is verified
    const isVerified = await isResourceRequestVerified(requestId);
    if (!isVerified) {
      return res.status(403).json({ error: "Resource request is not verified" });
    }

    // 1. Allotment check (via service)
    const activeAllotment = await getActiveAllotment(resourceObjectId);

    if (!activeAllotment) {
      return res.status(403).json({ 
        error: "No active allotment found for this request at the current time."
      });
    }

    // 2. Machine fetch (via service)
    const { user, ip } = await getMachineByMigid(migid);

    if (!user || !ip) {
      return res.status(404).json({ 
        error: "User or IP details missing for machine" 
      });
    }

    // 3. External API call (keep in controller or move later if needed)
    const url = `http://${ip}:${process.env.TOKEN_SERVER_PORT}/token/${encodeURIComponent(user)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        user: user,
        "x-api-key": process.env.X_API_KEY
      },
    });

    if (!response.ok) {
      throw new Error(`External API failed with status: ${response.status}`);
    }

    const data = await response.json();
    return res.json(data);

  } catch (err) {
    console.error("Token fetch error:", err);

    if (err.message.includes("Machine not found")) {
      return res.status(404).json({ error: err.message });
    }

    return res.status(500).json({ error: "Internal server error" });
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
  getTokenByMigid,
};
