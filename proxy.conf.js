/**
 * Proxy same-origin para embeber SharePoint sin X-Frame-Options.
 * Uso: iframe → /sharepoint-proxy/sites/...
 *
 * Nota: el login de Microsoft no puede ocurrir dentro del iframe.
 * Usa el botón "Conectar sesión" (ventana completa) y luego recarga el visor.
 */
module.exports = {
  '/sharepoint-proxy': {
    target: 'https://bancolombia.sharepoint.com',
    secure: true,
    changeOrigin: true,
    followRedirects: true,
    pathRewrite: {
      '^/sharepoint-proxy': ''
    },
    cookieDomainRewrite: 'localhost',
    onProxyRes(proxyRes) {
      delete proxyRes.headers['x-frame-options'];
      delete proxyRes.headers['content-security-policy'];
      delete proxyRes.headers[
        'content-security-policy-report-only'
      ];

      const location = proxyRes.headers['location'];
      if (
        typeof location === 'string' &&
        location.startsWith('https://bancolombia.sharepoint.com')
      ) {
        proxyRes.headers['location'] = location.replace(
          'https://bancolombia.sharepoint.com',
          '/sharepoint-proxy'
        );
      }
    }
  }
};
