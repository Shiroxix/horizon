const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const app = express();

app.use(express.static('public'));
app.use(express.json());

// SUA NOVA CHAVE DE API INSERIDA ABAIXO
const BRAWL_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjBkYjg2OWMwLTI5ZTUtNDc1OC1hYmVhLTI5MDlkODk0MDdiOCIsImlhdCI6MTc2NjAwNzA1OCwic3ViIjoiZGV2ZWxvcGVyLzE5ODI2ODBkLTJhZDQtYWFmYi0yNmUwLTAzNTFkMjkzY2MwMiIsInNjb3BlcyI6WyJicmF3bHN0YXJzIl0sImxpbWl0cyI6W3sidGllciI6ImRldmVsb3Blci9zaWx2ZXIiLCJ0eXBlIjoidGhyb3R0bGluZyJ9LHsiY2lkcnMiOlsiNzQuMjIwLjQ4LjI0MiJdLCJ0eXBlIjoiY2xpZW50In1dfQ.vEGhvoXjoaKlzmlGd6a7ZPIBU4jTIuN2mE96tfGpbnM91XDULxXbxUYC7Jubtce9ZzoW72l1nyie07rDMLlRxg";
const CLUB_TAG = "%23JJY0QU0P"; 
const METAS_FILE = './metas.json';

if (!fs.existsSync(METAS_FILE)) fs.writeFileSync(METAS_FILE, JSON.stringify({}));

// Rota para conferir o IP caso pare de funcionar
app.get('/api/meu-ip', async (req, res) => {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    res.json({ ip: data.ip });
});

// Busca do Clube
app.get('/api/stats', async (req, res) => {
    try {
        const response = await fetch(`https://api.brawlstars.com/v1/clubs/${CLUB_TAG}`, {
            headers: { 'Authorization': `Bearer ${BRAWL_API_KEY}` }
        });
        if (!response.ok) return res.status(403).json({ error: "Erro de Autenticação/IP" });
        const clubData = await response.json();
        const metas = JSON.parse(fs.readFileSync(METAS_FILE));
        res.json({ club: clubData, metas });
    } catch (e) { res.status(500).json({ error: "Erro no servidor" }); }
});

// Busca detalhada de UM jogador (para o Pop-up)
app.get('/api/player/:tag', async (req, res) => {
    try {
        const tag = req.params.tag.replace('#', '');
        const response = await fetch(`https://api.brawlstars.com/v1/players/%23${tag}`, {
            headers: { 'Authorization': `Bearer ${BRAWL_API_KEY}` }
        });
        const data = await response.json();
        res.json(data);
    } catch (e) { res.status(500).json({ error: "Erro ao buscar detalhes" }); }
});

app.post('/api/save-meta', (req, res) => {
    const { tag, meta } = req.body;
    let metas = JSON.parse(fs.readFileSync(METAS_FILE));
    metas[tag] = parseInt(meta);
    fs.writeFileSync(METAS_FILE, JSON.stringify(metas));
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Horizon Hub rodando na porta ${PORT}`));
