// =============================================
// Modals Component
// Handles: Reschedule, Add/Edit, Mark Done, Customer Detail
// =============================================

let rescheduleTarget  = null;
let doneTarget        = null;
let editingId         = null;
let currentDetailId   = null; // tracks which customer detail modal is open

// Called from Edit Details button inside detail modal
function editFromDetail() {
  closeModal('detail-modal');
  openEditModal(currentDetailId);
}

// Called from Add Maintenance Record button inside detail modal
function addMaintenanceFromDetail() {
  closeModal('detail-modal');
  openDoneModal(currentDetailId);
}

// ---- RESCHEDULE MODAL ----

function openReschedule(id) {
  rescheduleTarget = id;
  const c = customers.find(x => x.id === id);
  document.getElementById('reschedule-name-label').textContent =
    `Customer: ${c.name} — Current due date: ${fmtDate(effectiveDue(c))}`;
  document.getElementById('reschedule-date').value = toISO(addDays(TODAY, 1));
  document.getElementById('reschedule-reason').value = '';
  openModal('reschedule-modal');
}

function confirmReschedule() {
  const date   = document.getElementById('reschedule-date').value;
  const reason = document.getElementById('reschedule-reason').value;
  if (!date) { showToast('Please select a new date.', 'error'); return; }

  const c = customers.find(x => x.id === rescheduleTarget);
  if (!c.reschedules) c.reschedules = [];
  c.reschedules.push({ date, reason });

  closeModal('reschedule-modal');
  renderAll();
  showToast(`Maintenance for ${c.name} rescheduled to ${fmtDate(date)}.`);
}

// ---- MARK DONE MODAL ----

function openDoneModal(id) {
  doneTarget = id;
  const c = customers.find(x => x.id === id);
  document.getElementById('done-name-label').textContent =
    `Customer: ${c.name} — ${c.area}`;
  document.getElementById('done-date').value      = toISO(TODAY);
  document.getElementById('done-volt-mains').value = '';
  document.getElementById('done-volt-load').value  = '';
  document.getElementById('done-notes').value      = '';
  openModal('done-modal');
}

function confirmDone() {
  const date      = document.getElementById('done-date').value;
  const voltMains = document.getElementById('done-volt-mains').value.trim();
  const voltLoad  = document.getElementById('done-volt-load').value.trim();
  const notes     = document.getElementById('done-notes').value;
  if (!date) { showToast('Please select the completion date.', 'error'); return; }

  const c = customers.find(x => x.id === doneTarget);

  if (!c.history) c.history = [];
  c.history.push({ date, voltMains, voltLoad, notes });

  c.last        = date;
  c.reschedules = [];

  const wasFromDetail = (doneTarget === currentDetailId);
  closeModal('done-modal');
  renderAll();
  showToast(`Maintenance for ${c.name} marked as done! Next due: ${fmtDate(nextMaint(date))}.`);
  // If opened from detail modal, reopen it with fresh data
  if (wasFromDetail) openDetailModal(c.id);
}

// ---- ADD CUSTOMER MODAL ----

function openAddModal() {
  editingId = null;
  document.getElementById('cust-modal-title').textContent = 'Add New Customer';
  document.getElementById('cust-save-btn').textContent    = 'Add Customer';

  document.getElementById('f-name').value        = '';
  document.getElementById('f-address').value     = '';
  document.getElementById('f-phone').value       = '';
  document.getElementById('f-area').value        = '';
  document.getElementById('f-brand').value       = '';
  document.getElementById('f-btype').value       = 'Tall Tubular';
  document.getElementById('f-ah').value          = '';
  document.getElementById('f-install').value     = toISO(TODAY);
  document.getElementById('f-last').value        = toISO(TODAY);
  document.getElementById('f-amc-from').value    = toISO(TODAY);
  document.getElementById('f-amc-to').value      = '';
  document.getElementById('f-amc-amount').value  = '';
  document.getElementById('f-payment-date').value = toISO(TODAY);
  document.getElementById('f-notes').value       = '';

  openModal('customer-modal');
}

// ---- EDIT CUSTOMER MODAL ----

function openEditModal(id) {
  editingId = id;
  const c = customers.find(x => x.id === id);

  document.getElementById('cust-modal-title').textContent = 'Edit Customer';
  document.getElementById('cust-save-btn').textContent    = 'Save Changes';

  document.getElementById('f-name').value        = c.name;
  document.getElementById('f-address').value     = c.address || '';
  document.getElementById('f-phone').value       = c.phone || '';
  document.getElementById('f-area').value        = c.area;
  document.getElementById('f-brand').value       = c.brand || '';
  document.getElementById('f-btype').value       = c.btype;
  document.getElementById('f-ah').value          = c.ah || '';
  document.getElementById('f-install').value     = c.install;
  document.getElementById('f-last').value        = c.last;
  document.getElementById('f-amc-from').value    = (c.amc && c.amc.from)    || '';
  document.getElementById('f-amc-to').value      = (c.amc && c.amc.to)      || '';
  document.getElementById('f-amc-amount').value  = (c.amc && c.amc.amount)  || '';
  document.getElementById('f-payment-date').value = c.paymentDate || '';
  document.getElementById('f-notes').value       = c.notes || '';

  openModal('customer-modal');
}

// ---- SAVE CUSTOMER (add or edit) ----

function saveCustomer() {
  const name    = document.getElementById('f-name').value.trim();
  const area    = document.getElementById('f-area').value.trim();
  const install = document.getElementById('f-install').value;

  if (!name || !area || !install) {
    showToast('Name, area, and installation date are required.', 'error');
    return;
  }

  const amcFrom   = document.getElementById('f-amc-from').value;
  const amcTo     = document.getElementById('f-amc-to').value;
  const amcAmount = parseFloat(document.getElementById('f-amc-amount').value) || 0;

  const data = {
    name,
    address:     document.getElementById('f-address').value.trim(),
    phone:       document.getElementById('f-phone').value.trim(),
    area,
    brand:       document.getElementById('f-brand').value.trim() || 'N/A',
    btype:       document.getElementById('f-btype').value,
    ah:          parseInt(document.getElementById('f-ah').value) || 0,
    install,
    last:        document.getElementById('f-last').value || install,
    amc:         { from: amcFrom, to: amcTo, amount: amcAmount },
    paymentDate: document.getElementById('f-payment-date').value,
    notes:       document.getElementById('f-notes').value.trim(),
  };

  if (editingId !== null) {
    const wasFromDetail = (editingId === currentDetailId);
    const idx = customers.findIndex(x => x.id === editingId);
    customers[idx] = { ...customers[idx], ...data };
    closeModal('customer-modal');
    renderAll();
    showToast(`${name}'s details have been updated.`);
    // Reopen detail modal with fresh data if edit was triggered from there
    if (wasFromDetail) openDetailModal(editingId);
  } else {
    const newCust = {
      id: window.nextCustomerId++,
      ...data,
      reschedules: [],
      history: [],
    };
    customers.push(newCust);
    closeModal('customer-modal');
    renderAll();
    showToast(`${name} has been added. Next due: ${fmtDate(nextMaint(data.last))}.`);
  }
}

// ---- CUSTOMER DETAIL MODAL ----

function openDetailModal(id) {
  const c = customers.find(x => x.id === id);
  if (!c) return;
  currentDetailId = id;

  const amcDaysLeft = c.amc && c.amc.to ? daysDiff(TODAY, new Date(c.amc.to)) : null;
  let amcStatusHtml = '';
  if (amcDaysLeft !== null) {
    if (amcDaysLeft < 0) {
      amcStatusHtml = `<span class="badge badge-overdue">Expired ${Math.abs(amcDaysLeft)} day(s) ago</span>`;
    } else if (amcDaysLeft <= 30) {
      amcStatusHtml = `<span class="badge badge-soon">Expires in ${amcDaysLeft} day(s) – Renewal needed</span>`;
    } else {
      amcStatusHtml = `<span class="badge badge-scheduled">Active – ${amcDaysLeft} days left</span>`;
    }
  }

  const historyRows = (c.history && c.history.length)
    ? c.history.slice().reverse().map(h => `
        <tr>
          <td>${fmtDate(h.date)}</td>
          <td>${h.voltMains || '—'}</td>
          <td>${h.voltLoad  || '—'}</td>
          <td>${h.notes     || '—'}</td>
        </tr>`).join('')
    : `<tr><td colspan="4" style="text-align:center;color:var(--text-hint);padding:16px;">No maintenance records yet.</td></tr>`;

  document.getElementById('detail-content').innerHTML = `
    <div class="detail-header-row">
      <div class="avatar ${avColor(c.id)} avatar-lg">${initials(c.name)}</div>
      <div>
        <div class="detail-name">${c.name}</div>
        <div class="detail-meta">${c.phone || '—'} &nbsp;|&nbsp; ${c.area}</div>
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">📋 Customer Details</div>
      <div class="detail-grid">
        <div class="detail-item"><span class="detail-label">Full Address</span><span class="detail-value">${c.address || '—'}</span></div>
        <div class="detail-item"><span class="detail-label">Inverter Brand</span><span class="detail-value">${c.brand || '—'}</span></div>
        <div class="detail-item"><span class="detail-label">Battery Type</span><span class="detail-value">${c.btype}</span></div>
        <div class="detail-item"><span class="detail-label">Capacity</span><span class="detail-value">${c.ah} AH</span></div>
        <div class="detail-item"><span class="detail-label">Installation Date</span><span class="detail-value">${fmtDate(c.install)}</span></div>
        <div class="detail-item"><span class="detail-label">Last Maintenance</span><span class="detail-value">${fmtDate(c.last)}</span></div>
        <div class="detail-item"><span class="detail-label">Next Due</span><span class="detail-value">${fmtDate(effectiveDue(c))}</span></div>
        ${c.notes ? `<div class="detail-item form-full"><span class="detail-label">Notes</span><span class="detail-value">${c.notes}</span></div>` : ''}
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">🛡️ AMC Details</div>
      <div class="detail-grid">
        <div class="detail-item"><span class="detail-label">AMC From</span><span class="detail-value">${fmtDate(c.amc && c.amc.from)}</span></div>
        <div class="detail-item"><span class="detail-label">AMC To</span><span class="detail-value">${fmtDate(c.amc && c.amc.to)} ${amcStatusHtml}</span></div>
        <div class="detail-item"><span class="detail-label">Amount (₹)</span><span class="detail-value">₹${(c.amc && c.amc.amount) ? c.amc.amount.toLocaleString('en-IN') : '—'}</span></div>
        <div class="detail-item"><span class="detail-label">Payment Date</span><span class="detail-value">${fmtDate(c.paymentDate)}</span></div>
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">🔧 Maintenance History</div>
      <div class="table-scroll">
        <table class="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Voltage (Mains)</th>
              <th>Voltage (Load)</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${historyRows}
          </tbody>
        </table>
      </div>
    </div>
  `;

  openModal('detail-modal');
}

// ---- CLOSE ON OVERLAY CLICK ----
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

// ---- ESC KEY TO CLOSE ----
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});
