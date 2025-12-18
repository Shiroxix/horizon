let currentTag = "";

async function updateData() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if (data.error) { document.getElementById('clubStatus').innerText = "⚠️ ERRO DE IP NA API"; return; }

        const club = data.club;
        const metas = data.metas;
        const members = club.members.sort((a,b) => b.trophies - a.trophies);

        document.getElementById('clubStatus').innerText = `${club.name} • ${members.length}/30 MEMBROS`;
        document.getElementById('globalStats').innerHTML = `
            <div class="stat-box"><small>TOTAL DE TROFÉUS</small><div>${club.trophies.toLocaleString()}</div></div>
            <div class="stat-box"><small>REQUISITO</small><div>${club.requiredTrophies.toLocaleString()}</div></div>
        `;

        const list = document.getElementById('memberList');
        list.innerHTML = '';
        members.forEach(m => {
            const meta = metas[m.tag] || 30000;
            const porc = Math.min((m.trophies / meta) * 100, 100).toFixed(0);
            list.innerHTML += `
                <div class="p-card role-${m.role}" onclick="openDetails('${m.tag}', ${meta})">
                    <div style="font-size: 0.7rem; color: #64748b;">${m.tag}</div>
                    <h3 style="font-weight: 900;">${m.name}</h3>
                    <div style="font-size: 1.2rem; margin: 10px 0;">🏆 ${m.trophies.toLocaleString()}</div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.6rem; margin-bottom: 5px;">
                        <span>META: ${meta.toLocaleString()}</span>
                        <span>${porc}%</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${porc}%"></div></div>
                </div>`;
        });
    } catch (e) { console.error(e); }
}

async function openDetails(tag, meta) {
    currentTag = tag;
    document.getElementById('playerModal').style.display = 'flex';
    document.getElementById('m-name').innerText = "Carregando...";
    document.getElementById('inputMeta').value = meta;

    const res = await fetch(`/api/player/${tag.replace('#', '')}`);
    const p = await res.json();

    document.getElementById('m-name').innerText = p.name;
    document.getElementById('m-tag').innerText = p.tag;
    document.getElementById('m-high').innerText = p.highestTrophies.toLocaleString();
    document.getElementById('m-3v3').innerText = p['3vs3Victories'].toLocaleString();
    document.getElementById('m-solo').innerText = p.soloVictories.toLocaleString();
    
    const delta = p.delta24h || 0;
    const dEl = document.getElementById('m-24h');
    dEl.innerText = (delta >= 0 ? "+" : "") + delta;
    dEl.style.color = delta > 0 ? "#00ff85" : (delta < 0 ? "#ff4655" : "#fff");
    dEl.style.background = delta > 0 ? "rgba(0,255,133,0.1)" : "rgba(255,255,255,0.05)";
}

function closeModal() { document.getElementById('playerModal').style.display = 'none'; }

async function salvarMeta() {
    const val = document.getElementById('inputMeta').value;
    await fetch('/api/save-meta', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ tag: currentTag, meta: val })
    });
    closeModal();
    updateData();
}

updateData();
setInterval(updateData, 60000);
