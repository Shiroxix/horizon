const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const app = express();

app.use(express.static('public'));
app.use(express.json());

const BRAWL_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6ImFjYzQxOGU2LWM1MzAtNDFmMC04ZjcxLWEwM2Q5OGI3Mzc5YyIsImlhdCI6MTc2NjExOTQwNywic3ViIjoiZGV2ZWxvcGVyLzE5ODI2ODBkLTJhZDQtYWFmYi0yNmUwLTAzNTFkMjkzY2MwMiIsInNjb3BlcyI6WyJicmF3bHN0YXJzIl0sImxpbWl0cyI6W3sidGllciI6ImRldmVsb3Blci9zaWx2ZXIiLCJ0eXBlIjoidGhyb3R0bGluZyJ9LHsiY2lkcnMiOlsiNzQuMjIwLjQ4LjI0MiJdLCJ0eXBlIjoiY2xpZW50In1dfQ.eLxQne7wExXTWjwbs5tFo7jBmLEB4BSs6oKTK55jmKHIOg2VSd2-YydI0rKWGHVv8NjHT3MqmwdRHuhMFaZrbg"; // Mantenha sua chave ativa
const CLUB_TAG = "%23JJY0QU0P"; 
const METAS_FILE = './metas.json';

if (!fs.existsSync(METAS_FILE)) fs.writeFileSync(METAS_FILE, JSON.stringify({}));

// Rota de IP para você configurar a Supercell
app.get('/api/meu-ip', async (req, res) => {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    res.json({ ip: data.ip });
});

// Lista do Clube + Metas
app.get('/api/stats', async (req, res) => {
    try {
        const response = await fetch(`https://api.brawlstars.com/v1/clubs/${CLUB_TAG}`, {
            headers: { 'Authorization': `Bearer ${BRAWL_API_KEY}` }
        });
        if (!response.ok) return res.status(403).json({ error: "Erro de IP/Chave" });
        const clubData = await response.json();
        const metas = JSON.parse(fs.readFileSync(METAS_FILE));
        res.json({ club: clubData, metas });
    } catch (e) { res.status(500).json({ error: "Erro interno" }); }
});

// Detalhes profundos de UM jogador
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
app.listen(PORT, () => console.log("Horizon Pro Hub Online"));
