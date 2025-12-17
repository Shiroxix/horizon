let dadosIniciais = JSON.parse(localStorage.getItem('dados_iniciais')) || {};
let currentPlayerTag = "";

async function atualizarClube() {
    try {
        const res = await fetch(`/api/stats?t=${Date.now()}`);
        const data = await res.json();
        const container = document.getElementById('listaPlayers');
        if (!data.club || !data.club.members) return;

        const membros = data.club.members.sort((a, b) => b.trophies - a.trophies);
        const metasServidor = data.metas || {}; 
        container.innerHTML = '';

        membros.forEach(m => {
            if (!dadosIniciais[m.tag]) { 
                dadosIniciais[m.tag] = m.trophies; 
                localStorage.setItem('dados_iniciais', JSON.stringify(dadosIniciais)); 
            }
            const delta = m.trophies - dadosIniciais[m.tag];
            const meta = metasServidor[m.tag] || 30000;
            const porc = Math.min(((m.trophies / meta) * 100), 100).toFixed(1);
            const falta = Math.max(meta - m.trophies, 0);

            container.innerHTML += `
                <div class="player-card">
                    <div class="card-header">
                        <div class="name-area"><span class="name">${m.name}</span><span class="tag-small">${m.tag}</span></div>
                        <div class="actions">
                            <button class="btn-icon" onclick="openModal('${m.tag}', '${m.name}', ${meta})">⚙️</button>
                            <button class="btn-icon" style="color:#10b981" onclick="sendZap('${m.name}', ${m.trophies}, ${delta}, ${meta})">📱</button>
                        </div>
                    </div>
                    <div class="stats-minimal">
                        <div class="stat-item"><span class="stat-label">Atual</span><span class="stat-val">${m.trophies.toLocaleString()}</span></div>
                        <div class="stat-item" style="text-align:right"><span class="stat-label">Sessão</span><span class="stat-val" style="color:${delta >= 0 ? '#10b981' : '#f43f5e'}">${delta > 0 ? '+' : ''}${delta}</span></div>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width:${porc}%"></div></div>
                    <div class="meta-info"><span>${porc}% concluído</span><span style="color:#3b82f6">Falta ${falta.toLocaleString()}</span></div>
                </div>`;
        });
    } catch (e) { console.error("Erro ao carregar clube", e); }
}

async function pesquisarJogador() {
    let tagInput = document.getElementById('playerTagInput').value.trim().toUpperCase().replace('#', '');
    const resDiv = document.getElementById('playerResult');
    if (!tagInput) return;
    resDiv.innerHTML = "<div class='player-card' style='text-align:center'>Buscando dados na Supercell...</div>";
    
    try {
        const res = await fetch(`/api/player/${tagInput}`);
        const data = await res.json();
        
        if (data.error || !data.player || !data.player.name) {
            resDiv.innerHTML = "<div class='player-card' style='text-align:center; color:#f43f5e'><b>TAG NÃO ENCONTRADA</b><br><small>Verifique se digitou corretamente.</small></div>";
            return;
        }

        const p = data.player;
        const meta = data.metas[p.tag] || 30000;
        const porc = Math.min(((p.trophies / meta) * 100), 100).toFixed(1);
        const falta = Math.max(meta - p.trophies, 0);

        resDiv.innerHTML = `
            <div class="player-card" style="border-left: 5px solid #3b82f6">
                <div class="card-header">
                    <div class="name-area"><span class="name">${p.name}</span><span class="tag-small">${p.tag}</span></div>
                    <button class="btn-icon" onclick="openModal('${p.tag}', '${p.name}', ${meta})">⚙️</button>
                </div>
                <div class="stats-minimal">
                    <div class="stat-item"><span class="stat-label">Troféus</span><span class="stat-val">${p.trophies.toLocaleString()}</span></div>
                    <div class="stat-item"><span class="stat-label">Recorde</span><span class="stat-val">${p.highestTrophies.toLocaleString()}</span></div>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width:${porc}%"></div></div>
                <div class="meta-info"><span>${porc}% da meta</span><span style="color:#3b82f6">Faltam ${falta.toLocaleString()}</span></div>
                <div style="margin-top:10px; padding-top:10px; border-top:1px solid var(--border); display:flex; justify-content:space-between; opacity:0.7">
                    <span class="stat-label">Nível: ${p.expLevel}</span>
                    <span class="stat-label">Vitórias 3v3: ${p['3vs3Victories']}</span>
                </div>
            </div>`;
    } catch (e) { resDiv.innerHTML = "Erro de conexão."; }
}

function openModal(tag, name, meta) {
    currentPlayerTag = tag;
    document.getElementById('modalPlayerName').innerText = name;
    document.getElementById('newMetaInput').value = meta;
    document.getElementById('metaModal').style.display = 'flex';
}
function closeModal() { document.getElementById('metaModal').style.display = 'none'; }
async function saveMeta() {
    const val = document.getElementById('newMetaInput').value;
    await fetch('/api/save-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: currentPlayerTag, meta: val })
    });
    closeModal();
    atualizarClube();
}
function sendZap(n, a, d, m) {
    const txt = encodeURIComponent(`📊 *HORIZON*\n👤 *${n}*\n🏆 Atual: ${a}\n📈 Ganho: ${d}\n🎯 Meta: ${m}`);
    window.open(`https://api.whatsapp.com/send?text=${txt}`, '_blank');
}

setInterval(atualizarClube, 30000);
atualizarClube();