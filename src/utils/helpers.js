// =============================================
// Utility Helpers
// =============================================

const TODAY = (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();

// ---- DATE HELPERS ----

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d); dt.setHours(0,0,0,0);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function toISO(d) {
  const dt = new Date(d); dt.setHours(0,0,0,0);
  return dt.toISOString().slice(0, 10);
}

function addDays(d, n) {
  const r = new Date(d); r.setDate(r.getDate() + n); r.setHours(0,0,0,0); return r;
}

function daysDiff(from, to) {
  const a = new Date(from); a.setHours(0,0,0,0);
  const b = new Date(to);   b.setHours(0,0,0,0);
  return Math.round((b - a) / 86400000);
}

function nextMaint(last) {
  const d = new Date(last);
  d.setMonth(d.getMonth() + 3);
  d.setHours(0,0,0,0);
  return d;
}

function effectiveDue(customer) {
  if (customer.reschedules && customer.reschedules.length) {
    const lastR = customer.reschedules[customer.reschedules.length - 1];
    const rd = new Date(lastR.date); rd.setHours(0,0,0,0);
    return rd;
  }
  return nextMaint(customer.last);
}

function getStatus(customer) {
  const due  = effectiveDue(customer);
  const diff = daysDiff(TODAY, due);
  if (diff < 0)    return { label: 'Overdue',   cls: 'badge-overdue',   diff };
  if (diff === 0)  return { label: 'Due Today',  cls: 'badge-due',       diff };
  if (diff <= 7)   return { label: 'Due Soon',   cls: 'badge-soon',      diff };
  return                  { label: 'Scheduled',  cls: 'badge-scheduled', diff };
}

function initials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function avColor(id)        { return 'av-' + (id % 6); }
function normaliseArea(area){ return (area || '').trim().toLowerCase(); }

function groupByArea(list) {
  const map = {};
  list.forEach(c => {
    const key = normaliseArea(c.area);
    if (!map[key]) map[key] = { area: c.area, customers: [] };
    map[key].customers.push(c);
  });
  return Object.values(map).sort((a, b) => b.customers.length - a.customers.length);
}

// ---- TOAST ----

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.borderLeftColor = type === 'error' ? 'var(--red-600)' : 'var(--green-600)';
  t.style.display = 'block';
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => { t.style.display = 'none'; }, 3200);
}

// ---- SAVE INDICATOR ----

function setSaveStatus(state) {
  // state: 'saving' | 'saved' | 'error'
  const el = document.getElementById('save-status');
  if (!el) return;
  if (state === 'saving') {
    el.textContent = '⏳ Saving…';
    el.style.color = 'var(--text-hint)';
  } else if (state === 'saved') {
    el.textContent = '✓ Saved';
    el.style.color = 'var(--green-600)';
    clearTimeout(window._saveStatusTimer);
    window._saveStatusTimer = setTimeout(() => { el.textContent = ''; }, 2500);
  } else if (state === 'error') {
    el.textContent = '⚠ Save failed';
    el.style.color = 'var(--red-600)';
  }
}

// ---- MODAL ----

function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function openModal(id)  { document.getElementById(id).classList.add('open'); }

// ---- SERVER PERSISTENCE ----

let _saveTimer = null;

function saveData() {
  clearTimeout(_saveTimer);
  setSaveStatus('saving');
  _saveTimer = setTimeout(() => {
    const payload = {
      customers:      window.customers,
      nextCustomerId: window.nextCustomerId,
    };
    fetch('/api/data', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
    .then(r => {
      if (!r.ok) throw new Error('Server returned ' + r.status);
      setSaveStatus('saved');
    })
    .catch(err => {
      console.error('Save error:', err);
      setSaveStatus('error');
      showToast('⚠️ Could not save — check your connection.', 'error');
    });
  }, 400);
}

function loadData(callback) {
  fetch('/api/data')
    .then(r => {
      if (!r.ok) throw new Error('no data');
      return r.json();
    })
    .then(data => {
      if (data && Array.isArray(data.customers)) {
        window.customers      = data.customers;
        window.nextCustomerId = data.nextCustomerId || (data.customers.length + 1);
        console.log('Loaded', window.customers.length, 'customers from server.');
      }
      if (callback) callback();
    })
    .catch(err => {
      console.log('No server data yet, using defaults.', err.message);
      if (callback) callback();
    });
}

// ---- RENDER ALL ----

function renderAll() {
  saveData();
  renderStats();
  renderDashToday();
  renderDashWeek();
  renderToday();
  renderCustomers();
  renderSchedule();
  populateAreaFilter();
}
