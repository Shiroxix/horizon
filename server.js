const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const app = express();

app.use(express.static('public'));
app.use(express.json());

const BRAWL_API_KEY = "SUA_CHAVE_AQUI"; // Mantenha sua chave ativa
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
