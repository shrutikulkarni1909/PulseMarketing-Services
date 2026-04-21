// =============================================
// Area Planner Component
// Groups customers by area who are due within
// the selected window (3 / 7 / 14 days) so
// visits can be batched efficiently.
// =============================================

let batchTarget = null; // { area, customerIds }

function renderAreaPlanner() {
  const windowDays = parseInt(document.getElementById('planner-window').value || 7);
  const minGroup   = parseInt(document.getElementById('planner-min').value || 2);

  // Collect customers due within the window (including overdue)
  const inWindow = customers.filter(c => {
    const diff = daysDiff(TODAY, effectiveDue(c));
    return diff <= windowDays; // includes negatives (overdue)
  });

  // Group by normalised area
  const groups = groupByArea(inWindow)
    .filter(g => g.customers.length >= minGroup);

  const el = document.getElementById('area-planner-list');

  if (!groups.length) {
    el.innerHTML = `
      <div class="no-groups-state">
        <div class="icon">📍</div>
        <div class="title">No groupable areas found</div>
        <div class="desc">
          There are fewer than ${minGroup} customers due within ${windowDays} days in the same area.
          Try widening the window or lowering the minimum group size.
        </div>
      </div>`;
    return;
  }

  el.innerHTML = groups.map(g => renderAreaGroup(g, windowDays)).join('');
}

function renderAreaGroup(g, windowDays) {
  const { area, customers: list } = g;
  const sorted = [...list].sort((a, b) => effectiveDue(a) - effectiveDue(b));
  const earliest = effectiveDue(sorted[0]);
  const latest   = effectiveDue(sorted[sorted.length - 1]);
  const spread   = daysDiff(earliest, latest); // how many days apart are they?
  const efficiencyLabel = spread <= 3 ? 'High Efficiency' : 'Good Grouping';
  const efficiencyCls   = spread <= 3 ? '' : 'medium';

  const overdue = sorted.filter(c => getStatus(c).diff < 0).length;

  return `
    <div class="area-group">
      <div class="area-group-header">
        <div class="area-group-left">
          <div class="area-pin">
            <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
          </div>
          <div>
            <div class="area-group-name">${area}</div>
            <div class="area-group-meta">
              ${sorted.length} customer${sorted.length > 1 ? 's' : ''} &mdash;
              Due: ${fmtDate(earliest)}${spread > 0 ? ' to ' + fmtDate(latest) : ''}
              ${overdue ? `&mdash; <span style="color:var(--red-600);font-weight:600;">${overdue} overdue</span>` : ''}
            </div>
          </div>
        </div>
        <div class="area-group-actions">
          <span class="efficiency-pill ${efficiencyCls}">
            ${spread <= 3 ? '⚡' : '✓'} ${efficiencyLabel}
          </span>
          <button class="btn btn-primary btn-sm" onclick="openBatchModal('${area.replace(/'/g,"\\'")}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Batch Schedule
          </button>
        </div>
      </div>
      <div class="area-group-body">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Battery</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${sorted.map(c => {
              const s   = getStatus(c);
              const due = effectiveDue(c);
              return `
                <tr>
                  <td>
                    <div class="cust-cell">
                      <div class="avatar ${avColor(c.id)}">${initials(c.name)}</div>
                      <div class="cust-info">
                        <div class="name">${c.name}</div>
                        <div class="phone">${c.address || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td style="font-size:12px;">${c.phone || '—'}</td>
                  <td style="font-size:12px;">${c.btype}, ${c.ah}AH</td>
                  <td style="font-size:12px;font-weight:500;">${fmtDate(due)}</td>
                  <td><span class="badge ${s.cls}">${s.label}${s.diff < 0 ? ' (' + Math.abs(s.diff) + 'd)' : ''}</span></td>
                  <td>
                    <div class="action-group">
                      <button class="btn btn-success btn-sm" onclick="openDoneModal(${c.id})">Done</button>
                      <button class="btn btn-sm" onclick="openReschedule(${c.id})">Reschedule</button>
                    </div>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ---- Batch Reschedule Modal ----

function openBatchModal(area) {
  const norm = normaliseArea(area);
  const windowDays = parseInt(document.getElementById('planner-window').value || 7);

  // Get candidates: same area, due within window (incl. overdue)
  const candidates = customers.filter(c => {
    const diff = daysDiff(TODAY, effectiveDue(c));
    return normaliseArea(c.area) === norm && diff <= windowDays;
  }).sort((a, b) => effectiveDue(a) - effectiveDue(b));

  batchTarget = { area, customerIds: candidates.map(c => c.id) };

  document.getElementById('batch-area-name').textContent = area;
  document.getElementById('batch-date').value = toISO(TODAY);

  // Build checkbox list
  document.getElementById('batch-customer-list').innerHTML = candidates.map(c => {
    const s   = getStatus(c);
    const due = effectiveDue(c);
    return `
      <div class="batch-row">
        <input type="checkbox" id="bc-${c.id}" value="${c.id}" checked>
        <div class="batch-customer-info">
          <div class="batch-customer-name">${c.name}</div>
          <div class="batch-customer-due">Due: ${fmtDate(due)} &mdash; <span class="badge ${s.cls}" style="font-size:10px;">${s.label}</span></div>
        </div>
        <div>${c.phone || ''}</div>
      </div>`;
  }).join('');

  openModal('batch-reschedule-modal');
}

function confirmBatchReschedule() {
  const date = document.getElementById('batch-date').value;
  if (!date) { showToast('Please select a visit date.', 'error'); return; }

  // Gather checked IDs
  const checked = [];
  (batchTarget.customerIds || []).forEach(id => {
    const cb = document.getElementById('bc-' + id);
    if (cb && cb.checked) checked.push(id);
  });

  if (!checked.length) {
    showToast('Select at least one customer.', 'error');
    return;
  }

  checked.forEach(id => {
    const c = customers.find(x => x.id === id);
    if (!c) return;
    if (!c.reschedules) c.reschedules = [];
    // Remove any existing reschedule for the same cycle before adding new one
    c.reschedules = c.reschedules.filter(r => {
      const orig = nextMaint(c.last);
      const rd   = new Date(r.date); rd.setHours(0,0,0,0);
      return Math.abs(daysDiff(orig, rd)) > 30; // keep if for a different cycle
    });
    c.reschedules.push({ date, reason: 'Batch area schedule' });
  });

  closeModal('batch-reschedule-modal');
  renderAll();
  showToast(`${checked.length} customer${checked.length > 1 ? 's' : ''} in ${batchTarget.area} scheduled for ${fmtDate(date)}.`);
}
