const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const app = express();

app.use(express.static('public'));
app.use(express.json());

// CONFIGURAÇÕES
const BRAWL_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6ImQ0ZTFlY2UzLTQ5ODctNGYyZi1hNWRkLTM0YzM4MmZlNGMxOSIsImlhdCI6MTc2NjA5MTM0MCwic3ViIjoiZGV2ZWxvcGVyLzE5ODI2ODBkLTJhZDQtYWFmYi0yNmUwLTAzNTFkMjkzY2MwMiIsInNjb3BlcyI6WyJicmF3bHN0YXJzIl0sImxpbWl0cyI6W3sidGllciI6ImRldmVsb3Blci9zaWx2ZXIiLCJ0eXBlIjoidGhyb3R0bGluZyJ9LHsiY2lkcnMiOlsiNzQuMjIwLjQ4LjI0MiJdLCJ0eXBlIjoiY2xpZW50In1dfQ.ZigmeaTF0mDMgT7rpWuey9XG_5oETr4E-NJwFBw6SC0MXGyNqSPKAOCuRV9eGyRM5hoi0zGK2QhwNmSEcuVRkQ"; // Substitua pela sua chave atualizada
const CLUB_TAG = "%23JJY0QU0P"; 
const METAS_FILE = './metas.json';
const HISTORY_FILE = './historico.json';

// Inicializa arquivos de banco de dados simples
if (!fs.existsSync(METAS_FILE)) fs.writeFileSync(METAS_FILE, JSON.stringify({}));
if (!fs.existsSync(HISTORY_FILE)) fs.writeFileSync(HISTORY_FILE, JSON.stringify({}));

// Função para gravar snapshot de troféus para o cálculo de 24h
function registrarSnapshot(members) {
    let historico = JSON.parse(fs.readFileSync(HISTORY_FILE));
    const agora = Date.now();
    members.forEach(m => {
        if (!historico[m.tag]) historico[m.tag] = [];
        historico[m.tag].push([agora, m.trophies]);
        // Mantém apenas histórico das últimas 30 horas
        const limite = agora - (30 * 60 * 60 * 1000);
        historico[m.tag] = historico[m.tag].filter(reg => reg[0] > limite);
    });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(historico));
}

// Rota: Stats do Clube
app.get('/api/stats', async (req, res) => {
    try {
        const response = await fetch(`https://api.brawlstars.com/v1/clubs/${CLUB_TAG}`, {
            headers: { 'Authorization': `Bearer ${BRAWL_API_KEY}` }
        });
        const data = await response.json();
        if (!response.ok) return res.status(403).json({ error: "Erro na API", detalhes: data.reason });

        registrarSnapshot(data.members);
        const metas = JSON.parse(fs.readFileSync(METAS_FILE));
        res.json({ club: data, metas });
    } catch (e) { res.status(500).json({ error: "Erro interno" }); }
});

// Rota: Detalhes do Jogador + Cálculo 24h
app.get('/api/player/:tag', async (req, res) => {
    try {
        const tag = req.params.tag.replace('#', '');
        const response = await fetch(`https://api.brawlstars.com/v1/players/%23${tag}`, {
            headers: { 'Authorization': `Bearer ${BRAWL_API_KEY}` }
        });
        const p = await response.json();

        // Cálculo Delta 24h
        let historico = JSON.parse(fs.readFileSync(HISTORY_FILE));
        let delta24h = 0;
        if (historico[p.tag] && historico[p.tag].length > 1) {
            const alvo = Date.now() - (24 * 60 * 60 * 1000);
            const registroAntigo = historico[p.tag].reduce((prev, curr) => 
                Math.abs(curr[0] - alvo) < Math.abs(prev[0] - alvo) ? curr : prev);
            delta24h = p.trophies - registroAntigo[1];
        }

        res.json({ ...p, delta24h });
    } catch (e) { res.status(500).json({ error: "Erro ao buscar jogador" }); }
});

app.post('/api/save-meta', (req, res) => {
    const { tag, meta } = req.body;
    let metas = JSON.parse(fs.readFileSync(METAS_FILE));
    metas[tag] = parseInt(meta);
    fs.writeFileSync(METAS_FILE, JSON.stringify(metas));
    res.json({ success: true });
});

app.get('/api/meu-ip', async (req, res) => {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    res.json({ ip: data.ip });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Horizon Hub rodando na porta ${PORT}`));
