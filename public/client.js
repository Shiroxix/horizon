let currentTag = "";

async function carregarClube() {
    const statusText = document.getElementById('clubName');
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        
        if (data.error) {
            statusText.style.color = "#ff4655";
            statusText.innerHTML = `⚠️ ERRO: ${data.detalhes || data.error} (Status: ${data.status})`;
            return;
        }

        const club = data.club;
        const metas = data.metas || {};
        const members = club.members.sort((a, b) => b.trophies - a.trophies);

        statusText.style.color = "#64748b";
        statusText.innerText = `${club.name} • ${members.length}/30 MEMBROS`;
        
        // Stats do Topo
        document.getElementById('globalStats').innerHTML = `
            <div class="stat-box"><small>Troféus Totais</small><div>${club.trophies.toLocaleString()}</div></div>
            <div class="stat-box"><small>Requisito</small><div>${club.requiredTrophies.toLocaleString()}</div></div>
            <div class="stat-box"><small>Status</small><div>${club.type.toUpperCase()}</div></div>
        `;

        const list = document.getElementById('memberList');
        list.innerHTML = '';

        members.forEach(m => {
            const meta = metas[m.tag] || 30000;
            const porc = Math.min((m.trophies / meta) * 100, 100).toFixed(0);
            const roleClass = `role-${m.role}`;

            list.innerHTML += `
                <div class="p-card ${roleClass}" onclick="verDetalhes('${m.tag}', ${meta})">
                    <div class="p-info">
                        <span>${m.tag}</span>
                        <h3>${m.name}</h3>
                    </div>
                    <div class="p-trophies">🏆 ${m.trophies.toLocaleString()}</div>
                    <div class="progress-container">
                        <div class="progress-labels">
                            <span>META: ${meta.toLocaleString()}</span>
                            <span>${porc}%</span>
                        </div>
                        <div class="progress-bg">
                            <div class="progress-bar" style="width: ${porc}%"></div>
                        </div>
                    </div>
                </div>`;
        });
    } catch (e) { 
        statusText.innerText = "❌ ERRO DE CONEXÃO COM O SERVIDOR";
        console.error(e); 
    }
}

async function verDetalhes(tag, metaAtual) {
    currentTag = tag;
    document.getElementById('playerModal').style.display = 'flex';
    document.getElementById('det-name').innerText = "Carregando...";
    document.getElementById('inputMeta').value = metaAtual;

    try {
        const res = await fetch(`/api/player/${tag.replace('#', '')}`);
        const p = await res.json();

        document.getElementById('det-name').innerText = p.name;
        document.getElementById('det-tag').innerText = p.tag;
        document.getElementById('det-high').innerText = (p.highestTrophies || 0).toLocaleString();
        document.getElementById('det-3v3').innerText = (p['3vs3Victories'] || 0).toLocaleString();
        document.getElementById('det-solo').innerText = (p.soloVictories || 0).toLocaleString();
        document.getElementById('det-level').innerText = p.expLevel || 0;
    } catch (e) { console.log(e); }
}

function closeModal() { document.getElementById('playerModal').style.display = 'none'; }

async function salvarMeta() {
    const novaMeta = document.getElementById('inputMeta').value;
    await fetch('/api/save-meta', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ tag: currentTag, meta: novaMeta })
    });
    closeModal();
    carregarClube();
}

carregarClube();
