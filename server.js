const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const app = express();

app.use(express.static('public'));
app.use(express.json());

// CHAVE DE API QUE VOCÊ ENVIOU
const BRAWL_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6ImY3YmNlNzczLTY2NTUtNDljYy05YWFlLTgyMjEwYzViZGJmMSIsImlhdCI6MTc2NjAwMzcwNCwic3ViIjoiZGV2ZWxvcGVyLzE5ODI2ODBkLTJhZDQtYWFmYi0yNmUwLTAzNTFkMjkzY2MwMiIsInNjb3BlcyI6WyJicmF3bHN0YXJzIl0sImxpbWl0cyI6W3sidGllciI6ImRldmVsb3Blci9zaWx2ZXIiLCJ0eXBlIjoidGhyb3R0bGluZyJ9LHsiY2lkcnMiOlsiMTM4LjE4Ni4xMDkuODkiXSwidHlwZSI6ImNsaWVudCJ9XX0.dQzaYBMBFNNhO2eYv8RBR3lLFdzRGzOawbyiXUJfCQAVQ2FoTc-nTEiUk1q9nehMBIucgGmTOk3zgDBwFw-kig";
const CLUB_TAG = "%23JJY0QU0P"; 
const METAS_FILE = './metas.json';

// Cria o arquivo de metas se não existir
if (!fs.existsSync(METAS_FILE)) fs.writeFileSync(METAS_FILE, JSON.stringify({}));

app.get('/api/stats', async (req, res) => {
    try {
        const response = await fetch(`https://api.brawlstars.com/v1/clubs/${CLUB_TAG}`, {
            headers: { 'Authorization': `Bearer ${BRAWL_API_KEY}` }
        });
        if (!response.ok) return res.status(response.status).json({ error: "Erro na API Supercell" });
        const clubData = await response.json();
        const metasGlobais = JSON.parse(fs.readFileSync(METAS_FILE));
        res.json({ club: clubData, metas: metasGlobais });
    } catch (error) { res.status(500).json({ error: "Erro no servidor" }); }
});

app.post('/api/save-meta', (req, res) => {
    const { tag, meta } = req.body;
    let metas = JSON.parse(fs.readFileSync(METAS_FILE));
    metas[tag] = parseInt(meta);
    fs.writeFileSync(METAS_FILE, JSON.stringify(metas));
    res.json({ success: true });
});

app.get('/api/player/:tag', async (req, res) => {
    try {
        let tag = req.params.tag.trim().toUpperCase().replace('#', '');
        const response = await fetch(`https://api.brawlstars.com/v1/players/%23${tag}`, {
            headers: { 'Authorization': `Bearer ${BRAWL_API_KEY}` }
        });
        if (!response.ok) return res.status(404).json({ error: "Jogador não encontrado" });
        const playerData = await response.json();
        const metasGlobais = JSON.parse(fs.readFileSync(METAS_FILE));
        res.json({ player: playerData, metas: metasGlobais });
    } catch (error) { res.status(500).json({ error: "Erro na busca" }); }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Horizon Hub rodando em http://localhost:${PORT}`));