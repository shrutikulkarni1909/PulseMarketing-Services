// =============================================
//  App Controller
// =============================================

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  today:     "Today's Schedule",
  customers: 'Customers',
  schedule:  'Schedule',
};

let _navHistory    = ['dashboard'];
let _currentPage   = 'dashboard';

// ---- NAVIGATION ----

function navigate(page, filterHint) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  document.getElementById('page-title').textContent = PAGE_TITLES[page] || page;

  _currentPage = page;

  // Persist current page so refresh lands on the same page
  try { localStorage.setItem('pt_current_page', page); } catch(e) {}

  // Track history for back button
  const last = _navHistory[_navHistory.length - 1];
  if (last !== page) _navHistory.push(page);

  // Show back button on all pages except dashboard
  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.style.display = (page !== 'dashboard') ? 'inline-flex' : 'none';

  // Apply filter if navigating to customers with a hint
  if (filterHint !== undefined && page === 'customers') {
    const sel = document.getElementById('filter-status');
    if (sel) { sel.value = filterHint; renderCustomers(); }
  }
}

function goBack() {
  if (_navHistory.length > 1) _navHistory.pop();
  const prev = _navHistory[_navHistory.length - 1] || 'dashboard';
  // Don't push to history again when going back
  _currentPage = prev;
  try { localStorage.setItem('pt_current_page', prev); } catch(e) {}

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + prev);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === prev);
  });
  document.getElementById('page-title').textContent = PAGE_TITLES[prev] || prev;
  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.style.display = (prev !== 'dashboard') ? 'inline-flex' : 'none';
}

// ---- BIND NAV ----
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    _navHistory = ['dashboard']; // reset history on sidebar click
    navigate(item.dataset.page);
  });
});

// ---- TOPBAR DATE ----
function setTopbarDate() {
  document.getElementById('topbar-date').textContent =
    TODAY.toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
}

// ---- BOOT ----
(function init() {
  setTopbarDate();
  document.getElementById('page-title').textContent = 'Loading…';

  loadData(function() {
    document.getElementById('page-title').textContent = PAGE_TITLES['dashboard'];
    renderAll();

    // Restore last visited page after data is loaded
    try {
      const saved = localStorage.getItem('pt_current_page');
      if (saved && PAGE_TITLES[saved]) {
        navigate(saved);
      }
    } catch(e) {}

    console.log('Pulse BMS initialized. Customers:', customers.length);
  });
})();
