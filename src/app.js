/* ============================================================
   Els Meus Tracks — app.js
   App autònoma per visualitzar l'històric de Garmin/Suunto
   ============================================================ */
(function () {
  'use strict';

  // ---------------- Categories & colors ----------------
  const CATS = {
    swim:  { label: 'Natació',                    color: '#0ea5e9' },
    bike:  { label: 'Bici',                        color: '#ef4444' },
    foot:  { label: 'Córrer / Caminar / Hiking',   color: '#22c55e' },
    other: { label: 'Altres',                      color: '#a1a1aa' },
  };
  const CAT_ORDER = ['foot', 'bike', 'swim', 'other'];

  function categorize(sport) {
    const s = (sport || '').toString().toLowerCase();
    if (/swim|nata|nedar/.test(s)) return 'swim';
    if (/cycl|bike|bik|biking|velo|ciclis|btt|mtb|road_bik|ebike/.test(s)) return 'bike';
    if (/run|walk|hik|jog|trail|foot|sender|cam|trek|trek|mountaineer|marx/.test(s)) return 'foot';
    return 'other';
  }

  // ---------------- IndexedDB ----------------
  const DB_NAME = 'elsmeustracks', DB_VER = 1;
  let db;
  function openDB() {
    return new Promise((res, rej) => {
      const r = indexedDB.open(DB_NAME, DB_VER);
      r.onupgradeneeded = (e) => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains('activities')) d.createObjectStore('activities', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('tiles')) d.createObjectStore('tiles');
        if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta');
      };
      r.onsuccess = (e) => { db = e.target.result; res(db); };
      r.onerror = () => rej(r.error);
    });
  }
  function idbPut(store, val, key) {
    return new Promise((res, rej) => {
      const t = db.transaction(store, 'readwrite');
      const s = t.objectStore(store);
      const rq = (key !== undefined) ? s.put(val, key) : s.put(val);
      rq.onsuccess = () => res();
      t.onerror = () => rej(t.error);
    });
  }
  function idbGet(store, key) {
    return new Promise((res, rej) => {
      const t = db.transaction(store, 'readonly');
      const rq = t.objectStore(store).get(key);
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => rej(rq.error);
    });
  }
  function idbGetAll(store) {
    return new Promise((res, rej) => {
      const t = db.transaction(store, 'readonly');
      const rq = t.objectStore(store).getAll();
      rq.onsuccess = () => res(rq.result || []);
      rq.onerror = () => rej(rq.error);
    });
  }
  function idbClear(store) {
    return new Promise((res, rej) => {
      const t = db.transaction(store, 'readwrite');
      const rq = t.objectStore(store).clear();
      rq.onsuccess = () => res();
      rq.onerror = () => rej(rq.error);
    });
  }
  function idbCount(store) {
    return new Promise((res, rej) => {
      const t = db.transaction(store, 'readonly');
      const rq = t.objectStore(store).count();
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => rej(rq.error);
    });
  }

  // ---------------- Helpers ----------------
  const yieldUI = () => new Promise((r) => setTimeout(r, 0));
  function round5(p) { return [Math.round(p[0] * 1e5) / 1e5, Math.round(p[1] * 1e5) / 1e5]; }

  function haversineTotal(points) {
    let d = 0;
    const R = 6371;
    for (let i = 1; i < points.length; i++) {
      const [la1, lo1] = points[i - 1], [la2, lo2] = points[i];
      const dLa = (la2 - la1) * Math.PI / 180;
      const dLo = (lo2 - lo1) * Math.PI / 180;
      const a = Math.sin(dLa / 2) ** 2 +
        Math.cos(la1 * Math.PI / 180) * Math.cos(la2 * Math.PI / 180) * Math.sin(dLo / 2) ** 2;
      d += 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
    }
    return d;
  }

  function downsample(points, max) {
    if (points.length <= max) return points;
    const step = points.length / max;
    const out = [];
    for (let i = 0; i < points.length; i += step) out.push(points[Math.floor(i)]);
    out.push(points[points.length - 1]);
    return out;
  }

  function activityId(time, cat, pts) {
    const t = time ? new Date(time).getTime() : 0;
    const tmin = Math.round(t / 60000);
    const fp = pts[0] || [0, 0];
    return cat + '_' + tmin + '_' + fp[0].toFixed(3) + '_' + fp[1].toFixed(3);
  }

  function fmtDate(iso) {
    if (!iso) return 'Data desconeguda';
    const d = new Date(iso);
    if (isNaN(d)) return 'Data desconeguda';
    return d.toLocaleDateString('ca-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function activityName(time, type) {
    const ty = (type || '').toString();
    return fmtDate(time) + (ty ? ' · ' + ty : '');
  }

  // ---------------- Parsers ----------------
  function parseGPX(text) {
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) return [];
    const out = [];
    let metaType = '';
    const mt = doc.querySelector('metadata > type');
    if (mt) metaType = mt.textContent;
    const trks = doc.getElementsByTagName('trk');
    for (const trk of trks) {
      const pts = [];
      let time = null;
      const trkpts = trk.getElementsByTagName('trkpt');
      for (const p of trkpts) {
        const lat = parseFloat(p.getAttribute('lat'));
        const lon = parseFloat(p.getAttribute('lon'));
        if (isFinite(lat) && isFinite(lon) && !(lat === 0 && lon === 0)) {
          pts.push([lat, lon]);
          if (!time) { const t = p.getElementsByTagName('time')[0]; if (t) time = t.textContent; }
        }
      }
      let type = '';
      const tEl = trk.getElementsByTagName('type')[0];
      if (tEl) type = tEl.textContent;
      if (!type) type = metaType;
      out.push({ type, points: pts, time });
    }
    return out;
  }

  function parseTCX(text) {
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) return [];
    const out = [];
    const acts = doc.getElementsByTagName('Activity');
    for (const a of acts) {
      const sport = a.getAttribute('Sport') || '';
      const pts = [];
      let time = null;
      const tps = a.getElementsByTagName('Trackpoint');
      for (const tp of tps) {
        const pos = tp.getElementsByTagName('Position')[0];
        if (pos) {
          const laEl = pos.getElementsByTagName('LatitudeDegrees')[0];
          const loEl = pos.getElementsByTagName('LongitudeDegrees')[0];
          if (laEl && loEl) {
            const la = parseFloat(laEl.textContent), lo = parseFloat(loEl.textContent);
            if (isFinite(la) && isFinite(lo)) {
              pts.push([la, lo]);
              if (!time) { const t = tp.getElementsByTagName('Time')[0]; if (t) time = t.textContent; }
            }
          }
        }
      }
      out.push({ type: sport, points: pts, time });
    }
    return out;
  }

  function parseFIT(buffer) {
    return new Promise((resolve) => {
      try {
        const FitParser = window.FitParser;
        const fp = new FitParser({ force: true, mode: 'list', lengthUnit: 'km', speedUnit: 'km/h' });
        fp.parse(buffer, (err, data) => {
          if (err || !data) { resolve([]); return; }
          const pts = [];
          const recs = data.records || [];
          for (const r of recs) {
            const la = r.position_lat, lo = r.position_long;
            if (typeof la === 'number' && typeof lo === 'number' && isFinite(la) && isFinite(lo) && !(la === 0 && lo === 0)) {
              pts.push([la, lo]);
            }
          }
          let sport = '';
          let time = null;
          if (data.sessions && data.sessions[0]) {
            sport = data.sessions[0].sport || '';
            const sub = data.sessions[0].sub_sport;
            if (sub && /generic/i.test(sport)) sport = sub;
            time = data.sessions[0].start_time;
          } else if (data.sports && data.sports[0]) {
            sport = data.sports[0].sport || '';
          }
          if (!time && data.activity && data.activity.timestamp) time = data.activity.timestamp;
          resolve([{ type: sport, points: pts, time }]);
        });
      } catch (e) { resolve([]); }
    });
  }

  // ---------------- Import ----------------
  async function collectEntry(name, u8, out, depth) {
    if (depth > 6) return;
    const lower = name.toLowerCase();
    if (lower.endsWith('.zip')) {
      try {
        const files = window.fflate.unzipSync(u8);
        for (const fn in files) await collectEntry(fn, files[fn], out, depth + 1);
      } catch (e) { console.warn('zip fail', name, e); }
      return;
    }
    if (lower.endsWith('.gz')) {
      try {
        const d = window.fflate.gunzipSync(u8);
        await collectEntry(lower.slice(0, -3), d, out, depth + 1);
      } catch (e) { console.warn('gz fail', name, e); }
      return;
    }
    if (lower.endsWith('.gpx') || lower.endsWith('.tcx') || lower.endsWith('.fit')) {
      // copy to a standalone buffer so FIT parser gets a clean ArrayBuffer
      const copy = u8.slice();
      out.push({ name, u8: copy });
    }
  }

  let importing = false;
  async function handleFiles(fileList) {
    if (importing) return;
    importing = true;
    const files = [...fileList];
    if (!files.length) { importing = false; return; }
    setProgress(true, 'Llegint fitxers…', 0);
    const entries = [];
    try {
      for (const f of files) {
        const buf = new Uint8Array(await f.arrayBuffer());
        await collectEntry(f.name, buf, entries, 0);
      }
    } catch (e) { console.warn(e); }

    if (!entries.length) {
      setProgress(false);
      importing = false;
      toast('No he trobat cap fitxer .gpx, .tcx o .fit (ni dins de zips).');
      return;
    }

    let added = 0, noGps = 0, failed = 0;
    const seen = new Set();
    for (let i = 0; i < entries.length; i++) {
      const { name, u8 } = entries[i];
      const lower = name.toLowerCase();
      let parsed = [];
      try {
        if (lower.endsWith('.gpx')) parsed = parseGPX(new TextDecoder().decode(u8));
        else if (lower.endsWith('.tcx')) parsed = parseTCX(new TextDecoder().decode(u8));
        else if (lower.endsWith('.fit')) parsed = await parseFIT(u8.buffer);
      } catch (e) { failed++; }

      for (const pr of parsed) {
        if (!pr.points || pr.points.length < 2) { noGps++; continue; }
        const cat = categorize(pr.type);
        const id = activityId(pr.time, cat, pr.points);
        if (seen.has(id)) continue;
        seen.add(id);
        const dist = haversineTotal(pr.points);
        const rec = {
          id,
          type: pr.type || '',
          cat,
          time: pr.time ? new Date(pr.time).toISOString() : null,
          start: round5(pr.points[0]),
          dist: Math.round(dist * 100) / 100,
          n: pr.points.length,
          pts: downsample(pr.points, 800).map(round5),
        };
        try { await idbPut('activities', rec); added++; } catch (e) { failed++; }
      }
      if (i % 8 === 0) {
        setProgress(true, 'Processant activitats…', Math.round((i + 1) / entries.length * 100));
        await yieldUI();
      }
    }

    await idbPut('meta', new Date().toISOString(), 'lastImport');
    setProgress(false);
    importing = false;
    toast(`${added} activitats amb GPS afegides` + (noGps ? ` · ${noGps} sense GPS ignorades` : ''));
    await loadAndRender(true);
  }

  // ---------------- Map ----------------
  let map, glLayers, filterState;
  let allActivities = [];
  let polyLines = [], dotMarkers = [], curWeight = 3.5;

  function weightForZoom(z) {
    if (z <= 4) return 5.5;
    if (z <= 6) return 5;
    if (z <= 8) return 4.5;
    if (z <= 11) return 3.5;
    return 3;
  }
  function dotRadiusForZoom(z) {
    if (z <= 4) return 5;
    if (z <= 6) return 4.5;
    if (z <= 9) return 4;
    if (z <= 12) return 3;
    return 2.5;
  }

  function initMap() {
    map = L.map('map', { zoomControl: true, worldCopyJump: true, preferCanvas: true }).setView([41.6, 1.9], 6);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);
    glLayers = { swim: L.layerGroup(), bike: L.layerGroup(), foot: L.layerGroup(), other: L.layerGroup() };
    filterState = { swim: true, bike: true, foot: true, other: true };
    for (const c of CAT_ORDER) glLayers[c].addTo(map);
    L.control.scale({ imperial: false }).addTo(map);
    // adapt line thickness & dot size to zoom so tracks stay visible when zoomed out
    map.on('zoomend', () => {
      const z = map.getZoom();
      curWeight = weightForZoom(z);
      const r = dotRadiusForZoom(z);
      for (const pl of polyLines) pl.setStyle({ weight: curWeight });
      for (const d of dotMarkers) d.setRadius(r);
    });
  }

  function popupHtml(a) {
    const km = a.dist != null ? a.dist.toFixed(1) + ' km' : '';
    return `<div class="pop">
      <span class="dot" style="background:${CATS[a.cat].color}"></span>
      <b>${CATS[a.cat].label}</b><br>
      ${fmtDate(a.time)}<br>
      ${a.type ? '<span class="muted">' + escapeHtml(a.type) + '</span> · ' : ''}${km}
    </div>`;
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  function renderActivities(activities, fit) {
    for (const c of CAT_ORDER) glLayers[c].clearLayers();
    polyLines = []; dotMarkers = [];
    curWeight = weightForZoom(map.getZoom());
    const r = dotRadiusForZoom(map.getZoom());
    const gb = L.latLngBounds([]);
    for (const a of activities) {
      if (!a.pts || a.pts.length < 2) continue;
      const color = CATS[a.cat].color;
      const pl = L.polyline(a.pts, { color, weight: curWeight, opacity: 0.9, lineJoin: 'round', lineCap: 'round' });
      pl.bindPopup(popupHtml(a));
      pl.on('mouseover', function () { this.setStyle({ weight: curWeight + 2, opacity: 1 }); });
      pl.on('mouseout', function () { this.setStyle({ weight: curWeight, opacity: 0.9 }); });
      glLayers[a.cat].addLayer(pl);
      polyLines.push(pl);
      // start dot: keeps the activity visible even when the route is tiny on screen
      const dot = L.circleMarker(a.pts[0], { radius: r, color: '#0b1220', weight: 1, fillColor: color, fillOpacity: 0.95 });
      dot.bindPopup(popupHtml(a));
      glLayers[a.cat].addLayer(dot);
      dotMarkers.push(dot);
      gb.extend(pl.getBounds());
    }
    if (fit && gb.isValid()) map.fitBounds(gb, { padding: [30, 30] });
    updateStats(activities);
  }

  function applyFilter() {
    for (const c of CAT_ORDER) {
      if (filterState[c]) { if (!map.hasLayer(glLayers[c])) glLayers[c].addTo(map); }
      else { if (map.hasLayer(glLayers[c])) map.removeLayer(glLayers[c]); }
    }
  }

  // ---------------- Stats & UI ----------------
  function updateStats(activities) {
    const counts = { swim: 0, bike: 0, foot: 0, other: 0 };
    let km = 0;
    for (const a of activities) { counts[a.cat] = (counts[a.cat] || 0) + 1; km += (a.dist || 0); }
    document.getElementById('statTotal').textContent = activities.length;
    document.getElementById('statKm').textContent = Math.round(km).toLocaleString('ca-ES');
    for (const c of CAT_ORDER) {
      const el = document.getElementById('cnt-' + c);
      if (el) el.textContent = counts[c] || 0;
    }
  }

  async function loadAndRender(fit) {
    allActivities = await idbGetAll('activities');
    allActivities.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    renderActivities(allActivities, fit);
    applyFilter();
    document.getElementById('emptyState').style.display = allActivities.length ? 'none' : 'flex';
    const lastImport = await idbGet('meta', 'lastImport');
    const li = document.getElementById('lastImport');
    if (li) li.textContent = lastImport ? 'Última importació: ' + fmtDate(lastImport) : '';
  }

  // progress + toast
  function setProgress(show, label, pct) {
    const el = document.getElementById('progress');
    if (!el) return;
    el.style.display = show ? 'block' : 'none';
    if (show) {
      document.getElementById('progressLabel').textContent = label || '';
      document.getElementById('progressBar').style.width = (pct || 0) + '%';
    }
  }
  let toastTimer;
  function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 4200);
  }

  // ---------------- Wire up ----------------
  function wire() {
    const fileInput = document.getElementById('fileInput');
    document.getElementById('btnImport').addEventListener('click', () => fileInput.click());
    document.getElementById('btnImportEmpty').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => { handleFiles(e.target.files); fileInput.value = ''; });

    // filters
    for (const c of CAT_ORDER) {
      const cb = document.getElementById('flt-' + c);
      if (cb) cb.addEventListener('change', () => { filterState[c] = cb.checked; applyFilter(); });
    }

    document.getElementById('btnClear').addEventListener('click', async () => {
      if (!confirm('Segur que vols esborrar totes les activitats importades?')) return;
      await idbClear('activities');
      await idbClear('meta');
      await loadAndRender(false);
      toast('Activitats esborrades.');
    });

    // panel toggle
    const panel = document.getElementById('panel');
    document.getElementById('btnPanel').addEventListener('click', () => panel.classList.toggle('open'));
    document.getElementById('btnClosePanel').addEventListener('click', () => panel.classList.remove('open'));

    // drag & drop
    const drop = document.getElementById('dropzone');
    ['dragenter', 'dragover'].forEach((ev) => document.body.addEventListener(ev, (e) => {
      e.preventDefault(); drop.classList.add('show');
    }));
    ['dragleave', 'drop'].forEach((ev) => document.body.addEventListener(ev, (e) => {
      e.preventDefault();
      if (ev === 'drop' && e.dataTransfer && e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
      drop.classList.remove('show');
    }));

    // online/offline indicator
    const updateOnline = () => {
      const el = document.getElementById('netStatus');
      if (navigator.onLine) { el.textContent = 'En línia'; el.className = 'net on'; }
      else { el.textContent = 'Sense connexió'; el.className = 'net off'; }
    };
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    updateOnline();
  }

  // ---------------- Boot ----------------
  async function boot() {
    try {
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
      await openDB();
      initMap();
      wire();
      await loadAndRender(true);
    } catch (e) {
      console.error(e);
      alert('Hi ha hagut un error engegant l\'app: ' + e.message);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
