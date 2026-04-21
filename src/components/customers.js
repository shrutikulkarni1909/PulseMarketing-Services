// =============================================
// Customers List Component
// =============================================

function populateAreaFilter() {
  const sel = document.getElementById('filter-area');
  if (!sel) return;
  const current = sel.value;
  const areas = [...new Set(customers.map(c => c.area))].sort();
  sel.innerHTML = '<option value="">All Areas</option>' +
    areas.map(a => `<option value="${a}" ${a === current ? 'selected' : ''}>${a}</option>`).join('');
}

function getAmcStatus(c) {
  if (!c.amc || !c.amc.to) return null;
  const diff = daysDiff(TODAY, new Date(c.amc.to));
  if (diff < 0)   return { label: 'AMC Expired',  cls: 'badge-overdue', diff };
  if (diff <= 30) return { label: 'AMC Expiring',  cls: 'badge-soon',   diff };
  return null; // no alert needed if > 30 days
}

function renderCustomers() {
  const q          = (document.getElementById('search-input')  || {}).value || '';
  const filterSt   = (document.getElementById('filter-status') || {}).value || '';
  const filterArea = (document.getElementById('filter-area')   || {}).value || '';

  const qLow = q.toLowerCase();

  let list = customers.filter(c => {
    if (qLow && ![c.name, c.area, c.phone, c.brand, c.address].some(
      v => (v || '').toLowerCase().includes(qLow)
    )) return false;

    if (filterArea && c.area !== filterArea) return false;

    if (filterSt) {
      const s = getStatus(c);
      const map = {
        'overdue':   s.diff < 0,
        'due-today': s.diff === 0,
        'due-soon':  s.diff > 0 && s.diff <= 7,
        'scheduled': s.diff > 7,
      };
      if (!map[filterSt]) return false;
    }

    return true;
  });

  list.sort((a, b) => effectiveDue(a) - effectiveDue(b));

  const el = document.getElementById('customers-list');

  if (!list.length) {
    el.innerHTML = `<div class="empty-state"><span class="empty-icon">🔍</span>No customers match your filters.</div>`;
    return;
  }

  el.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Customer</th>
          <th>Area</th>
          <th>Battery</th>
          <th>AMC Period</th>
          <th>Next Due</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(c => {
          const s   = getStatus(c);
          const due = effectiveDue(c);
          const amcSt = getAmcStatus(c);
          const isRescheduled = c.reschedules && c.reschedules.length > 0;

          const amcTo = c.amc && c.amc.to ? fmtDate(c.amc.to) : '—';
          const amcFrom = c.amc && c.amc.from ? fmtDate(c.amc.from) : '—';

          return `
            <tr class="customer-row" onclick="openDetailModal(${c.id})" style="cursor:pointer;" title="Click to view full details">
              <td>
                <div class="cust-cell">
                  <div class="avatar ${avColor(c.id)}">${initials(c.name)}</div>
                  <div class="cust-info">
                    <div class="name">${c.name}</div>
                    <div class="phone">${c.phone || '—'}</div>
                  </div>
                </div>
              </td>
              <td><span class="badge badge-area">${c.area}</span></td>
              <td style="font-size:12px;">${c.btype}<br><span style="color:var(--text-hint);">${c.brand}, ${c.ah}AH</span></td>
              <td style="font-size:12px;">
                ${amcFrom} → ${amcTo}
                ${amcSt ? `<br><span class="badge ${amcSt.cls}" style="font-size:10px;margin-top:3px;">${amcSt.label}</span>` : ''}
              </td>
              <td style="font-size:12px;font-weight:500;">
                ${fmtDate(due)}
                ${isRescheduled ? '<br><span class="badge badge-rescheduled" style="font-size:10px;margin-top:3px;">Rescheduled</span>' : ''}
              </td>
              <td><span class="badge ${s.cls}">${s.label}</span></td>
              <td onclick="event.stopPropagation()">
                <div class="action-group">
                  <button class="btn btn-success btn-sm" onclick="openDoneModal(${c.id})">Done</button>
                  <button class="btn btn-sm" onclick="openEditModal(${c.id})">Edit</button>
                  <button class="btn btn-sm" onclick="openReschedule(${c.id})">Reschedule</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteCustomer(${c.id})">Remove</button>
                </div>
              </td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

function deleteCustomer(id) {
  const c = customers.find(x => x.id === id);
  if (!confirm(`Remove ${c.name} from the system? This cannot be undone.`)) return;
  window.customers = customers.filter(x => x.id !== id);
  renderAll();
  showToast(`${c.name} has been removed.`);
}
