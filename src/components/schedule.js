// =============================================
// Schedule Component
// =============================================

function renderSchedule() {
  const sortMode = (document.getElementById('schedule-sort') || {}).value || 'date';
  let sorted = [...customers];

  if (sortMode === 'area') {
    sorted.sort((a, b) => {
      const ac = normaliseArea(a.area).localeCompare(normaliseArea(b.area));
      if (ac !== 0) return ac;
      return effectiveDue(a) - effectiveDue(b);
    });
  } else {
    sorted.sort((a, b) => effectiveDue(a) - effectiveDue(b));
  }

  const el = document.getElementById('schedule-list');

  if (!sorted.length) {
    el.innerHTML = `<div class="empty-state"><span class="empty-icon">📅</span>No customers in the system.</div>`;
    return;
  }

  // Group by month (date mode) or by area (area mode)
  const groups = {};
  sorted.forEach(c => {
    let key;
    if (sortMode === 'area') {
      key = c.area;
    } else {
      const due = effectiveDue(c);
      key = due.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  });

  el.innerHTML = Object.entries(groups).map(([groupLabel, list]) => `
    <div style="margin-bottom:18px;">
      <div style="font-size:11px;font-weight:600;color:var(--text-hint);text-transform:uppercase;letter-spacing:0.06em;padding:0 4px;margin-bottom:8px;">${groupLabel}</div>
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Area</th>
            <th>Battery</th>
            <th>Next Due</th>
            <th>Days Away</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(c => {
            const s   = getStatus(c);
            const due = effectiveDue(c);
            const daysLabel = s.diff === 0
              ? '<strong>Today</strong>'
              : s.diff < 0
                ? `<span style="color:var(--red-600);font-weight:600;">${Math.abs(s.diff)}d overdue</span>`
                : `In ${s.diff} day${s.diff !== 1 ? 's' : ''}`;
            const isRescheduled = c.reschedules && c.reschedules.length > 0;

            return `
              <tr class="customer-row" onclick="openDetailModal(${c.id})" style="cursor:pointer;">
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
                <td style="font-size:12px;">${c.btype}, ${c.ah}AH</td>
                <td style="font-size:12px;font-weight:500;">
                  ${fmtDate(due)}
                  ${isRescheduled ? ' <span class="badge badge-rescheduled" style="font-size:10px;">Rescheduled</span>' : ''}
                </td>
                <td style="font-size:12px;">${daysLabel}</td>
                <td><span class="badge ${s.cls}">${s.label}</span></td>
                <td onclick="event.stopPropagation()">
                  <div class="action-group">
                    <button class="btn btn-success btn-sm" onclick="openDoneModal(${c.id})">Done</button>
                    <button class="btn btn-sm" onclick="openReschedule(${c.id})">Reschedule</button>
                  </div>
                </td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`
  ).join('');
}
