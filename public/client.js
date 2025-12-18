let currentTag = "";

async function init() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        
        if(data.error) {
            document.getElementById('clubInfo').innerHTML = "⚠️ Erro de Conexão. Verifique o IP na Supercell.";
            return;
        }

        renderDashboard(data);
    } catch (e) { console.error(e); }
}

function renderDashboard(data) {
    const club = data.club;
    const metas = data.metas;
    const members = club.members.sort((a,b) => b.trophies - a.trophies);

    // Header Stats
    document.getElementById('clubInfo').innerText = `${club.name} | ${club.tag} | ${members.length}/30 Membros`;
    
    document.getElementById('globalStats').innerHTML = `
        <div class="mini-stat"><span>Troféus Totais</span><b>${club.trophies.toLocaleString()}</b></div>
        <div class="mini-stat"><span>Média por Membro</span><b>${Math.floor(club.trophies/members.length).toLocaleString()}</b></div>
        <div class="mini-stat"><span>Tipo</span><b>${club.type === 'open' ? 'Aberto' : 'Privado'}</b></div>
    `;

    const list = document.getElementById('memberList');
    list.innerHTML = '';

    members.forEach(m => {
        const roleClass = m.role === 'president' ? 'role-P' : (m.role === 'vicePresident' ? 'role-VP' : '');
        const roleName = m.role.replace('vicePresident', 'Vice-Pres.').replace('president', 'Presidente').replace('member', 'Membro').replace('senior', 'Veterano');
        const meta = metas[m.tag] || 30000;
        const porc = Math.min((m.trophies / meta) * 100, 100).toFixed(0);

        list.innerHTML += `
            <div class="player-card ${roleClass}" onclick="openPlayer('${m.tag}', ${meta})">
                <div class="card-top">
                    <div>
                        <div class="p-name">${m.name}</div>
                        <div class="p-tag">${m.tag}</div>
                        <div class="p-role">${roleName}</div>
                    </div>
                    <div class="trophy-count">${m.trophies.toLocaleString()}</div>
                </div>
                <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 5px; display: flex; justify-content: space-between;">
                    <span>Meta: ${meta.toLocaleString()}</span>
                    <span>${porc}%</span>
                </div>
                <div style="background: rgba(255,255,255,0.1); height: 6px; border-radius: 10px; overflow: hidden;">
                    <div style="width: ${porc}%; background: var(--primary); height: 100%; box-shadow: 0 0 10px var(--primary);"></div>
                </div>
            </div>
        `;
    });
}

async function openPlayer(tag, metaAtual) {
    currentTag = tag;
    const modal = document.getElementById('playerModal');
    modal.style.display = 'flex';
    
    document.getElementById('inputMeta').value = metaAtual;
    document.getElementById('m-name').innerText = "Carregando...";

    try {
        const res = await fetch(`/api/player/${tag.replace('#', '')}`);
        const p = await res.json();

        document.getElementById('m-name').innerText = p.name;
        document.getElementById('m-tag').innerText = p.tag;
        document.getElementById('m-trophies').innerText = p.trophies.toLocaleString();
        document.getElementById('m-highest').innerText = p.highestTrophies.toLocaleString();
        document.getElementById('m-3v3').innerText = p['3vs3Victories'].toLocaleString();
        document.getElementById('m-solo').innerText = p.soloVictories.toLocaleString();
        document.getElementById('m-level').innerText = p.expLevel;
    } catch (e) { console.error(e); }
}

function closeModal() { document.getElementById('playerModal').style.display = 'none'; }

async function salvarMeta() {
    const metaVal = document.getElementById('inputMeta').value;
    await fetch('/api/save-meta', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ tag: currentTag, meta: metaVal })
    });
    closeModal();
    init();
}

window.onclick = function(event) {
    const modal = document.getElementById('playerModal');
    if (event.target == modal) closeModal();
}

init();
