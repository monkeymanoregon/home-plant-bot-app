import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <title>Home Plant Bot - AI Plant Care Assistant</title>
        
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#059669" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Plant Bot" />
        <meta name="application-name" content="Home Plant Bot" />
        
        {/* Description */}
        <meta name="description" content="AI-powered plant care assistant. Get instant help with your houseplants, upload photos for diagnosis, and access expert care tips." />
        <meta name="keywords" content="plants, houseplants, plant care, AI, chatbot, gardening" />
        
        {/* Social Media */}
        <meta property="og:title" content="Home Plant Bot - AI Plant Care Assistant" />
        <meta property="og:description" content="AI-powered plant care assistant for your houseplants" />
        <meta property="og:type" content="website" />
        
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>🌱</text></svg>" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/static/manifest.json" />
        
        {/* CSS */}
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="/static/app.css" rel="stylesheet" />
        
        {/* Service Worker Registration */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/static/sw.js')
                  .then(registration => console.log('SW registered'))
                  .catch(error => console.log('SW registration failed'));
              });
            }
          `
        }} />
      </head>
      <body class="font-sans antialiased">
        {children}
        
        {/* JavaScript */}
        <script src="/static/app.js"></script>
      </body>
    </html>
  )
})
