const express = require('express');
const http = require('http');
const https = require('https');
const cors = require('cors');

const app = express();
app.use(cors());

app.use((req, res) => {
    const targetUrl = req.url.slice(1);
    if (!targetUrl.startsWith('http')) return res.status(400).send('URL inválida');

    const connectToRadio = (url) => {
        console.log(`📡 Conectando a: ${url}`);
        const client = url.startsWith('https') ? https : http;

        const request = client.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Icy-MetaData': '0' }
        }, (proxyRes) => {
            // Manejo de redirecciones
            if ([301, 302, 307, 308].includes(proxyRes.statusCode)) {
                return connectToRadio(proxyRes.headers.location);
            }

            // Solo enviamos cabeceras la primera vez
            if (!res.headersSent) {
                res.setHeader('Content-Type', 'audio/mpeg');
                res.setHeader('Connection', 'keep-alive');
                res.writeHead(200);
            }

            // Al recibir datos, los pasamos al cliente
            proxyRes.on('data', (chunk) => res.write(chunk));

            proxyRes.on('end', () => {
                console.warn('⚠️ La radio cerró. Reintentando en 1s...');
                setTimeout(() => connectToRadio(url), 1000);
            });

        });

        request.on('error', (err) => {
            console.error('❌ Error de red:', err.message);
            setTimeout(() => connectToRadio(url), 2000);
        });
    };

    connectToRadio(targetUrl);
    
    // Si el usuario cierra la radio en la web, matamos la conexión
    req.on('close', () => {
        console.log('🛑 Cliente desconectado.');
    });
});

app.listen(3000, '0.0.0.0', () => console.log(`🚀 Proxy Resiliente en puerto 3000`));