// =============================================
// Stats Component
// =============================================

function renderStats() {
  let total = customers.length;
  let due = 0, overdue = 0, soon = 0;

  customers.forEach(c => {
    const s = getStatus(c);
    if (s.diff < 0)       overdue++;
    else if (s.diff === 0) due++;
    else if (s.diff <= 7)  soon++;
  });

  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card blue clickable-card" onclick="navigate('customers','')">
      <div class="stat-label">Total Customers</div>
      <div class="stat-value blue">${total}</div>
      <div class="stat-footer">Click to view all</div>
    </div>
    <div class="stat-card amber clickable-card" onclick="navigate('customers','due-today')">
      <div class="stat-label">Due Today</div>
      <div class="stat-value amber">${due}</div>
      <div class="stat-footer">Click to view list</div>
    </div>
    <div class="stat-card red clickable-card" onclick="navigate('customers','overdue')">
      <div class="stat-label">Overdue</div>
      <div class="stat-value red">${overdue}</div>
      <div class="stat-footer">Click to view list</div>
    </div>
    <div class="stat-card green clickable-card" onclick="navigate('customers','due-soon')">
      <div class="stat-label">Due This Week</div>
      <div class="stat-value green">${soon}</div>
      <div class="stat-footer">Click to view list</div>
    </div>
  `;
}

// ---- Mini table used on dashboard ----
function miniTable(list, emptyMsg) {
  if (!list.length) {
    return `<div class="empty-state"><span class="empty-icon">✓</span>${emptyMsg || 'Nothing to show'}</div>`;
  }
  return `
    <table>
      <thead>
        <tr>
          <th>Customer</th>
          <th>Area</th>
          <th>Due Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(c => {
          const due = effectiveDue(c);
          const s   = getStatus(c);
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
              <td style="font-size:12px;font-weight:500;">${fmtDate(due)}</td>
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
    </table>`;
}

function renderDashToday() {
  const list = customers.filter(c => getStatus(c).diff === 0);
  document.getElementById('dash-today-list').innerHTML =
    miniTable(list, 'No maintenance due today — all clear!');
}

function renderDashWeek() {
  const list = customers
    .filter(c => { const s = getStatus(c); return s.diff > 0 && s.diff <= 7; })
    .sort((a, b) => effectiveDue(a) - effectiveDue(b));
  document.getElementById('dash-week-list').innerHTML =
    miniTable(list, 'No maintenance scheduled for the rest of this week.');
}
