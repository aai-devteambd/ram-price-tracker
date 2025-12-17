const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('🔧 Setting up proxy middleware...');
  
  const proxyMiddleware = createProxyMiddleware({
    target: 'https://n8n.srv1013270.hstgr.cloud',
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      '^/api': '/webhook',
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log('📡 Proxying:', req.method, req.url, '→ https://n8n.srv1013270.hstgr.cloud' + proxyReq.path);
      
      // Log headers
      console.log('📤 Request headers:', proxyReq.getHeaders());
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log('📡 Proxy response:', proxyRes.statusCode, 'for', req.url);
      console.log('📥 Response headers:', proxyRes.headers);
    },
    onError: (err, req, res) => {
      console.error('❌ Proxy error for', req.url, ':', err.message);
      res.status(500).send('Proxy error: ' + err.message);
    },
  });
  
  app.use('/api', proxyMiddleware);
  
  console.log('✅ Proxy middleware configured: /api/* → https://n8n.srv1013270.hstgr.cloud/webhook/*');
};
