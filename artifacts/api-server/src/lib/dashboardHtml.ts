export const ADMIN_DASHBOARD_HTML = /* html */ `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Hotspot Admin</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;font-size:14px;background:#f5f5f5;color:#111}
header{background:#111;color:#fff;padding:12px 20px;display:flex;align-items:center;gap:16px}
header h1{font-size:15px;font-weight:600;letter-spacing:.05em}
.dot{width:8px;height:8px;border-radius:50%;background:#555;display:inline-block;transition:background .3s}
.dot.on{background:#22c55e}
nav{background:#fff;border-bottom:1px solid #ddd;display:flex;gap:0;padding:0 20px;overflow-x:auto}
nav button{background:none;border:none;border-bottom:2px solid transparent;padding:12px 18px;font-size:13px;font-weight:500;color:#666;cursor:pointer;white-space:nowrap;transition:.15s}
nav button:hover{color:#111}
nav button.act{color:#111;border-bottom-color:#111}
main{padding:20px;max-width:1100px}
.panel{display:none}.panel.act{display:block}
h2{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#888;margin-bottom:16px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:24px}
.card{background:#fff;border:1px solid #e5e5e5;padding:16px}
.card-label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
.card-value{font-size:24px;font-weight:300}
.toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.btn{background:#111;color:#fff;border:none;padding:8px 16px;font-size:12px;font-weight:600;letter-spacing:.04em;cursor:pointer;border-radius:4px}
.btn:hover{background:#333}
.btn.red{background:#dc2626}.btn.red:hover{background:#b91c1c}
.btn.outline{background:#fff;color:#111;border:1px solid #ccc}.btn.outline:hover{background:#f5f5f5}
.btn:disabled{opacity:.4;cursor:not-allowed}
table{width:100%;border-collapse:collapse;font-size:13px;background:#fff}
thead th{text-align:left;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#888;padding:10px 12px;border-bottom:2px solid #e5e5e5}
tbody td{padding:10px 12px;border-bottom:1px solid #f0f0f0;vertical-align:top}
tbody tr:last-child td{border-bottom:none}
tbody tr:hover td{background:#fafafa}
.badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600}
.badge.ok{background:#dcfce7;color:#166534}
.badge.err{background:#fee2e2;color:#991b1b}
.badge.pending{background:#fef3c7;color:#92400e}
.badge.timeout{background:#f3f4f6;color:#374151}
.log-wrap{background:#111;border-radius:6px;padding:16px;max-height:480px;overflow:auto;font-family:monospace;font-size:12px;line-height:1.6}
.log-line{padding:1px 0;border-bottom:1px solid #1f1f1f;word-break:break-all}
.log-line .t{color:#555;margin-right:8px;font-size:11px}
.log-line .lvl{margin-right:8px;font-weight:700;min-width:36px;display:inline-block}
.lvl.info{color:#60a5fa}.lvl.warn{color:#fbbf24}.lvl.error{color:#f87171}.lvl.debug{color:#a78bfa}
.log-line .m{color:#e5e7eb}
.log-line .d{color:#6b7280;font-size:11px}
.log-empty{color:#555;padding:20px 0;text-align:center}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.field{background:#fff;border:1px solid #e5e5e5;padding:16px}
.field label{display:block;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#888;margin-bottom:6px}
.field .desc{font-size:11px;color:#aaa;margin-bottom:8px}
.field input{width:100%;padding:8px 10px;border:1px solid #ddd;font-size:13px;font-family:inherit;border-radius:4px;outline:none}
.field input:focus{border-color:#111;box-shadow:0 0 0 3px rgba(0,0,0,.06)}
.msg{padding:10px 14px;border-radius:4px;font-size:13px;margin-top:12px;display:none}
.msg.ok{background:#dcfce7;color:#166534;display:block}
.msg.err{background:#fee2e2;color:#991b1b;display:block}
.spin::after{content:'';display:inline-block;width:12px;height:12px;border:2px solid #ccc;border-top-color:#111;border-radius:50%;animation:spin .7s linear infinite;margin-left:8px;vertical-align:middle}
@keyframes spin{to{transform:rotate(360deg)}}
.note{font-size:12px;color:#888;background:#fffbeb;border:1px solid #fde68a;padding:10px 14px;border-radius:4px;margin-bottom:16px}
@media(max-width:600px){.form-grid{grid-template-columns:1fr}.cards{grid-template-columns:1fr 1fr}}
</style>
</head>
<body>
<header>
  <span class="dot" id="dot"></span>
  <h1>HOTSPOT ADMIN</h1>
  <span style="margin-left:auto;font-size:11px;color:#888" id="hts"></span>
</header>
<nav>
  <button class="act" onclick="tab('dash',this)">Dashboard</button>
  <button onclick="tab('config',this)">Configuration</button>
  <button onclick="tab('logs',this)">Logs</button>
</nav>
<main>

<!-- ═══ DASHBOARD ═══ -->
<div id="tab-dash" class="panel act">
  <div class="toolbar">
    <h2>Statut</h2>
    <button class="btn outline" onclick="loadDash()">Actualiser</button>
  </div>
  <div class="cards" id="cards">
    <div class="card"><div class="card-label">Uptime</div><div class="card-value" id="c-uptime">—</div></div>
    <div class="card"><div class="card-label">En attente</div><div class="card-value" id="c-pending">—</div></div>
    <div class="card"><div class="card-label">Tentatives</div><div class="card-value" id="c-total">—</div></div>
    <div class="card"><div class="card-label">Heure serveur</div><div class="card-value" id="c-time" style="font-size:15px">—</div></div>
  </div>
  <div class="toolbar" style="margin-top:8px">
    <h2>Actions</h2>
    <button class="btn red" id="clear-btn" onclick="clearPending()">Purger les paiements bloqués</button>
  </div>
  <div id="clear-msg" class="msg"></div>
  <div style="margin-top:24px">
    <div class="toolbar">
      <h2>10 dernières tentatives de paiement</h2>
      <button class="btn outline" onclick="loadPayments()">Actualiser</button>
    </div>
    <div id="payments-wrap"></div>
  </div>
</div>

<!-- ═══ CONFIGURATION ═══ -->
<div id="tab-config" class="panel">
  <div class="note">⚠ Les modifications sont appliquées immédiatement mais perdues si le serveur redémarre (déploiement nouveau). Pour une persistance permanente, mettez les variables dans le tableau de bord Render.</div>
  <form id="config-form" onsubmit="saveConfig(event)">
    <div class="form-grid" id="config-grid">Chargement…</div>
    <div style="margin-top:20px;display:flex;gap:12px;align-items:center">
      <button type="submit" class="btn" id="save-btn">Enregistrer</button>
      <button type="button" class="btn outline" onclick="loadConfig()">Annuler</button>
    </div>
    <div id="config-msg" class="msg"></div>
  </form>
</div>

<!-- ═══ LOGS ═══ -->
<div id="tab-logs" class="panel">
  <div class="toolbar">
    <h2>Journal du middleware</h2>
    <div style="display:flex;gap:8px;align-items:center">
      <label style="font-size:12px;color:#888">
        <input type="checkbox" id="auto-refresh" onchange="toggleAutoRefresh(this)"> Auto (5s)
      </label>
      <select id="log-level" onchange="renderLogs()" style="font-size:12px;padding:4px 8px;border:1px solid #ddd;border-radius:4px">
        <option value="">Tous</option>
        <option value="error">Erreurs</option>
        <option value="warn">Warn+</option>
        <option value="info">Info+</option>
      </select>
      <button class="btn outline" onclick="loadLogs()">Actualiser</button>
    </div>
  </div>
  <div id="log-note" class="note" style="display:none">Les logs sont capturés uniquement en mode production (NODE_ENV=production).</div>
  <div class="log-wrap" id="log-wrap"><div class="log-empty">Chargement…</div></div>
</div>

</main>
<script>
const E = id => document.getElementById(id);
let allLogs = [];
let autoRefreshTimer = null;

// ── Tab switching ──────────────────────────────────────────────────────────
function tab(name, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('act'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('act'));
  E('tab-'+name).classList.add('act');
  btn.classList.add('act');
  if (name === 'dash')   { loadDash(); loadPayments(); }
  if (name === 'config') loadConfig();
  if (name === 'logs')   loadLogs();
}

// ── API helpers ────────────────────────────────────────────────────────────
async function api(path, opts) {
  const r = await fetch(path, opts);
  if (!r.ok) throw new Error((await r.text()) || 'HTTP ' + r.status);
  return r.json();
}
function esc(s) {
  return String(s==null?'—':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function setTs() { E('hts').textContent = new Date().toLocaleTimeString('fr-FR'); }

// ── Dashboard ──────────────────────────────────────────────────────────────
async function loadDash() {
  try {
    const d = await api('/api/admin/status');
    E('dot').className = 'dot on';
    E('c-uptime').textContent  = d.uptime ?? '—';
    E('c-pending').textContent = d.pendingPayments ?? 0;
    E('c-time').textContent    = d.serverTime ? d.serverTime.slice(11,19) : '—';
    setTs();
  } catch(e) {
    E('dot').className = 'dot';
    E('c-uptime').textContent = 'Erreur';
  }
}

async function loadPayments() {
  const wrap = E('payments-wrap');
  try {
    const rows = await api('/api/admin/payments');
    E('c-total').textContent = rows.length;
    if (!rows.length) { wrap.innerHTML = '<p style="color:#888;font-size:13px;margin-top:8px">Aucune tentative enregistrée.</p>'; return; }
    wrap.innerHTML = '<table><thead><tr><th>Heure</th><th>Téléphone</th><th>Forfait</th><th>Montant</th><th>Statut</th><th>Info</th></tr></thead><tbody>'
      + rows.map(r => {
          const badge = r.status==='success'?'ok':r.status==='timeout'?'timeout':r.status==='pending'?'pending':'err';
          const label = {success:'Succès',failed:'Échec',timeout:'Timeout',pending:'En attente',rejected:'Refusé'}[r.status]??r.status;
          return '<tr>'
            +'<td style="white-space:nowrap;color:#888;font-size:12px">'+esc(r.time?r.time.slice(11,19):'')+'</td>'
            +'<td>'+esc(r.phone)+'</td>'
            +'<td>'+esc(r.plan)+'</td>'
            +'<td>'+esc(r.amount?r.amount.toLocaleString()+' Ar':'')+'</td>'
            +'<td><span class="badge '+badge+'">'+esc(label)+'</span></td>'
            +'<td style="font-size:12px;color:#888;max-width:200px;word-break:break-all">'+esc(r.transactionId||r.message||'')+'</td>'
            +'</tr>';
        }).join('')
      + '</tbody></table>';
  } catch(e) {
    wrap.innerHTML = '<p style="color:#dc2626;font-size:13px">Erreur : '+esc(e.message)+'</p>';
  }
}

async function clearPending() {
  const btn = E('clear-btn');
  const msg = E('clear-msg');
  msg.className = 'msg';
  btn.disabled = true;
  try {
    const d = await api('/api/admin/clear-pending', { method: 'POST' });
    msg.className = 'msg ok';
    msg.textContent = d.message ?? 'Purge effectuée';
    loadDash();
  } catch(e) {
    msg.className = 'msg err';
    msg.textContent = 'Erreur : ' + e.message;
  } finally {
    btn.disabled = false;
  }
}

// ── Configuration ──────────────────────────────────────────────────────────
let configData = [];

async function loadConfig() {
  E('config-grid').innerHTML = 'Chargement…';
  try {
    configData = await api('/api/admin/config');
    renderConfig();
  } catch(e) {
    E('config-grid').innerHTML = '<p style="color:#dc2626">Erreur : '+esc(e.message)+'</p>';
  }
}

function renderConfig() {
  E('config-grid').innerHTML = configData.map(f => {
    const val = f.secret ? '' : esc(f.rawValue ?? f.default ?? '');
    const ph  = f.secret ? (f.rawValue ? '(défini — laisser vide pour ne pas changer)' : '(non défini)') : esc(f.default||'');
    return '<div class="field">'
      +'<label>'+esc(f.label)+'</label>'
      +'<div class="desc">'+esc(f.description)+'</div>'
      +'<input type="'+(f.secret?'password':'text')+'" name="'+esc(f.key)+'" value="'+val+'" placeholder="'+ph+'">'
      +'</div>';
  }).join('');
}

async function saveConfig(e) {
  e.preventDefault();
  const btn = E('save-btn');
  const msg = E('config-msg');
  msg.className = 'msg';
  btn.disabled = true; btn.textContent = 'Enregistrement…';
  try {
    const data = {};
    configData.forEach(f => {
      const el = E('config-form').elements[f.key];
      if (el) data[f.key] = el.value;
    });
    const d = await api('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    msg.className = 'msg ok';
    msg.textContent = d.message ?? 'Sauvegardé';
    loadConfig();
  } catch(err) {
    msg.className = 'msg err';
    msg.textContent = 'Erreur : ' + err.message;
  } finally {
    btn.disabled = false; btn.textContent = 'Enregistrer';
  }
}

// ── Logs ───────────────────────────────────────────────────────────────────
async function loadLogs() {
  try {
    allLogs = await api('/api/admin/logs?n=150');
    renderLogs();
  } catch(e) {
    E('log-wrap').innerHTML = '<div class="log-empty" style="color:#f87171">Erreur : '+esc(e.message)+'</div>';
  }
}

function renderLogs() {
  const filter = E('log-level').value;
  const order = { trace:10,debug:20,info:30,warn:40,error:50,fatal:60 };
  const minLevel = order[filter] ?? 0;
  const filtered = allLogs.filter(l => (order[l.level]??30) >= minLevel);

  if (!filtered.length) {
    const env = allLogs._env;
    E('log-wrap').innerHTML = '<div class="log-empty">Aucun log disponible'+(env==='development'?' (mode développement : logs non capturés)':'')+'</div>';
    E('log-note').style.display = 'none';
    return;
  }
  E('log-note').style.display = 'none';
  E('log-wrap').innerHTML = filtered.map(l => {
    const lvlClass = ['error','fatal'].includes(l.level)?'error':l.level==='warn'?'warn':l.level==='debug'?'debug':'info';
    return '<div class="log-line">'
      +'<span class="t">'+esc(l.time?l.time.slice(11,19):'')+'</span>'
      +'<span class="lvl '+lvlClass+'">'+esc(l.level.toUpperCase().slice(0,4))+'</span>'
      +'<span class="m">'+esc(l.msg)+'</span>'
      +(l.data?'<span class="d"> '+esc(l.data.slice?.(0,120))+'</span>':'')
      +'</div>';
  }).join('');
}

function toggleAutoRefresh(checkbox) {
  if (checkbox.checked) {
    autoRefreshTimer = setInterval(loadLogs, 5000);
  } else {
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
  }
}

// ── Init ───────────────────────────────────────────────────────────────────
loadDash();
loadPayments();
setTs();
setInterval(loadDash, 30000);
</script>
</body>
</html>`;
