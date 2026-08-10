export const securityHeaders = [
    {
        key: 'X-DNS-Prefetch-Control',
        value: 'on',
    },
    {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
    },
    {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
    },
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
    },
    {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin',
    },
    {
        key: 'X-Permitted-Cross-Domain-Policies',
        value: 'none',
    },
];

export const getCspHeader = (nonce: string) => {
    const isDev = process.env.NODE_ENV === 'development';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || (apiUrl ? apiUrl.replace(/^http/, 'ws') : '');

    // Allow unsafe-inline in both dev and production.
    // Next.js generates inline scripts that don't receive nonces automatically,
    // causing CSP violations in production. This is the recommended workaround.
    const scriptSrc = isDev
        ? `'self' 'unsafe-inline' 'unsafe-eval'`
        : `'self' 'unsafe-inline' 'unsafe-eval'`;

    const csp = `
    default-src 'self';
    script-src ${scriptSrc} https://web-button.metamap.com https://*.metamap.com https://static.sumsub.com https://websdk.sumsub.com https://*.sumsub.com https://static.cloudflareinsights.com;
    style-src 'self' 'unsafe-inline' https://*.metamap.com https://websdk.sumsub.com https://*.sumsub.com;
    img-src 'self' blob: data: https://images.unsplash.com https://i.pravatar.cc https://lh3.googleusercontent.com https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org https://unpkg.com http://0.0.0.0:8000 https://0.0.0.0:8000 http://localhost:8000 https://localhost:8000 http://127.0.0.1:8000 https://127.0.0.1:8000 https://dge.dgetechs.com https://dgetechs.com https://*.metamap.com https://*.sumsub.com ${apiUrl};
    font-src 'self' https://*.metamap.com https://*.sumsub.com;
    connect-src 'self' ws://localhost:8000 wss://localhost:8000 http://localhost:8000 https://localhost:8000 http://0.0.0.0:8000 https://0.0.0.0:8000 ws://0.0.0.0:8000 wss://0.0.0.0:8000 http://127.0.0.1:8000 https://127.0.0.1:8000 ws://127.0.0.1:8000 wss://127.0.0.1:8000 https://*.agora.io wss://*.agora.io https://*.edge.agora.io wss://*.edge.agora.io https://*.sd-rtn.com wss://*.sd-rtn.com https://*.edge.sd-rtn.com wss://*.edge.sd-rtn.com https://dge.dgetechs.com wss://dge.dgetechs.com https://dgetechs.com wss://dgetechs.com https://*.metamap.com wss://*.metamap.com https://api.sumsub.com https://*.sumsub.com ${apiUrl} ${wsUrl} wss://dge-tech-web-cjhe4jg72a-ew.a.run.app https://dge-tech-web-cjhe4jg72a-ew.a.run.app;
    media-src 'self' blob:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-src 'self' https://*.metamap.com https://*.sumsub.com https://websdk.sumsub.com https://api.sumsub.com;
    child-src 'self' blob: https://*.sumsub.com https://api.sumsub.com;
    worker-src 'self' blob: https://*.sumsub.com;
    frame-ancestors 'none';
    ${isDev ? '' : 'block-all-mixed-content;'}
  `;



    return {
        key: 'Content-Security-Policy',
        value: csp.replace(/\s{2,}/g, ' ').trim(),
    };
};
