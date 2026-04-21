// =============================================
// Today's Schedule Component
// =============================================

function renderToday() {
  const todayStr = toISO(TODAY);

  // Include overdue AND due today AND rescheduled to today
  const list = customers.filter(c => {
    const s = getStatus(c);
    if (s.diff <= 0) return true;
    if (c.reschedules && c.reschedules.length) {
      const last = c.reschedules[c.reschedules.length - 1];
      return last.date === todayStr;
    }
    return false;
  });

  // Current sort mode (default: area)
  const sortMode = (document.getElementById('today-sort') || {}).value || 'area';

  list.sort((a, b) => {
    if (sortMode === 'area') {
      const ac = normaliseArea(a.area).localeCompare(normaliseArea(b.area));
      if (ac !== 0) return ac;
    }
    return daysDiff(TODAY, effectiveDue(a)) - daysDiff(TODAY, effectiveDue(b));
  });

  const todayFull = TODAY.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  document.getElementById('today-highlight').innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
    <span><strong>${todayFull}</strong> &mdash; <strong>${list.length}</strong> maintenance visit${list.length !== 1 ? 's' : ''} scheduled.</span>
  `;

  document.getElementById('today-count-badge').innerHTML =
    list.length
      ? `<span class="badge badge-due">${list.length} Visit${list.length !== 1 ? 's' : ''}</span>`
      : `<span class="badge badge-scheduled">All Clear</span>`;

  const el = document.getElementById('today-list');

  if (!list.length) {
    el.innerHTML = `<div class="empty-state"><span class="empty-icon">🎉</span>No visits today. All clear!</div>`;
    return;
  }

  el.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Customer</th>
          <th>Phone</th>
          <th>Area</th>
          <th>Battery</th>
          <th>Status</th>
          <th>Overdue By / Due Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(c => {
          const s = getStatus(c);
          const isRescheduled = (c.reschedules || []).some(r => r.date === todayStr);
          const originalDue = nextMaint(c.last);

          let statusBadge = `<span class="badge ${s.cls}">${s.label}</span>`;
          if (isRescheduled) statusBadge += ` <span class="badge badge-rescheduled">Rescheduled</span>`;

          let dueCellContent;
          if (s.diff < 0) {
            dueCellContent = `
              <span style="color:var(--red-600);font-weight:600;">${Math.abs(s.diff)} day${Math.abs(s.diff) > 1 ? 's' : ''} overdue</span>
              <br><span style="font-size:11px;color:var(--text-hint);">Was due: ${fmtDate(originalDue)}</span>`;
          } else {
            dueCellContent = fmtDate(effectiveDue(c));
          }

          return `
            <tr class="customer-row" onclick="openDetailModal(${c.id})" style="cursor:pointer;">
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
              <td><span class="badge badge-area">${c.area}</span></td>
              <td style="font-size:12px;">${c.btype}<br><span style="color:var(--text-hint);">${c.brand}, ${c.ah}AH</span></td>
              <td>${statusBadge}</td>
              <td style="font-size:12px;">${dueCellContent}</td>
              <td onclick="event.stopPropagation()">
                <div class="action-group">
                  <button class="btn btn-success btn-sm" onclick="openDoneModal(${c.id})">Mark Done</button>
                  <button class="btn btn-sm" onclick="openReschedule(${c.id})">Reschedule</button>
                </div>
              </td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}
