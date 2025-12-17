const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const app = express();

app.use(express.static('public'));
app.use(express.json());

const BRAWL_API_KEY = "SUA_CHAVE_AQUI"; // Lembre-se de atualizar sempre que mudar o IP
const CLUB_TAG = "%23JJY0QU0P"; 
const METAS_FILE = './metas.json';

if (!fs.existsSync(METAS_FILE)) fs.writeFileSync(METAS_FILE, JSON.stringify({}));

// NOVIDADE: Rota para descobrir o IP do servidor na nuvem
app.get('/api/meu-ip', async (req, res) => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        res.json({ 
            aviso: "Copie o IP abaixo e cole na sua chave da Supercell",
            ip_do_servidor: data.ip 
        });
    } catch (e) { res.status(500).json({ error: "Erro ao buscar IP" }); }
});

app.get('/api/stats', async (req, res) => {
    try {
        const response = await fetch(`https://api.brawlstars.com/v1/clubs/${CLUB_TAG}`, {
            headers: { 'Authorization': `Bearer ${BRAWL_API_KEY}` }
        });
        if (!response.ok) {
            const errData = await response.json();
            return res.status(response.status).json({ error: "Erro na API Supercell", detalhes: errData });
        }
        const clubData = await response.json();
        const metasGlobais = JSON.parse(fs.readFileSync(METAS_FILE));
        res.json({ club: clubData, metas: metasGlobais });
    } catch (error) { res.status(500).json({ error: "Erro no servidor" }); }
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

app.post('/api/save-meta', (req, res) => {
    const { tag, meta } = req.body;
    let metas = JSON.parse(fs.readFileSync(METAS_FILE));
    metas[tag] = parseInt(meta);
    fs.writeFileSync(METAS_FILE, JSON.stringify(metas));
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
