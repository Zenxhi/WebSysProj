/* ==========================================
   ADMIN PORTAL LOGIC, IN-MEMORY STATE & ACTIONS
   ========================================== */

function handleLogin(e) {
  e.preventDefault();
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('admin-portal-app').classList.remove('hidden');
  renderAllData();
}

function switchAdminTab(tabKey) {
  document.querySelectorAll('.tab-content').forEach(panel => panel.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  const activePanel = document.getElementById('tab-admin-' + tabKey);
  if (activePanel) activePanel.classList.add('active');

  const activeBtn = document.querySelector(`.nav-btn[data-tab="${tabKey}"]`);
  if (activeBtn) activeBtn.classList.add('active');
}

function toggleAdminSidebar() {
  document.getElementById('admin-sidebar').classList.toggle('collapsed');
}

/* IN-MEMORY DATA ARRAYS */
let doctorData = [
  { id: 'DA', name: 'Dr. Ama Osei', specialty: 'Cardiology', room: 'Room 101', shift: 'AM Shift', status: 'Active' },
  { id: 'DL', name: 'Dr. Linh Nguyen', specialty: 'Dermatology', room: 'Room 102', shift: 'AM Shift', status: 'Active' },
  { id: 'DC', name: 'Dr. Carlos Reyes', specialty: 'General Medicine', room: 'Room 103', shift: 'PM Shift', status: 'Inactive' },
  { id: 'DF', name: 'Dr. Fatima Malik', specialty: 'Neurology', room: 'Room 104', shift: 'AM Shift', status: 'Active' }
];

let staffData = [
  { id: 'AS', name: 'Ana Santos', role: 'Help Desk Operator', email: 'ana@mediq.ph', status: 'Active' },
  { id: 'BR', name: 'Ben Reyes', role: 'Help Desk Operator', email: 'ben@mediq.ph', status: 'Active' }
];

let auditLogs = [
  { time: '2026-09-06 08:14', ticket: 'P-001', category: 'Senior', ref: 'SC-219842', staff: 'Ana Santos', status: 'Verified' },
  { time: '2026-09-06 08:31', ticket: 'P-002', category: 'PWD', ref: 'PWD-88431', staff: 'Ben Reyes', status: 'Verified' }
];

let activeModalType = null;

/* RENDER FUNCTIONS WITH ACTIONS & EMPTY STATES */
function renderDoctors(list = doctorData) {
  const tbody = document.getElementById('doctor-table-rows');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--txt-sub); font-weight: 600;">No doctors found matching your search.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(doc => `
    <tr>
      <td><strong>${doc.name}</strong></td>
      <td>${doc.specialty}</td>
      <td>${doc.room}</td>
      <td>${doc.shift}</td>
      <td><span class="status-pill ${doc.status.toLowerCase()}">${doc.status}</span></td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn-icon-action" title="Toggle Active Status" onclick="toggleDoctorStatus('${doc.id}')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
          </button>
          <button class="btn-icon-action" title="Delete Doctor" onclick="deleteDoctor('${doc.id}')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderStaff(list = staffData) {
  const tbody = document.getElementById('staff-table-rows');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 24px; color: var(--txt-sub); font-weight: 600;">No staff members found matching your search.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(s => `
    <tr>
      <td><strong>${s.name}</strong></td>
      <td>${s.role}</td>
      <td>${s.email}</td>
      <td><span class="status-pill ${s.status.toLowerCase()}">${s.status}</span></td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn-icon-action" title="Toggle Active Status" onclick="toggleStaffStatus('${s.id}')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
          </button>
          <button class="btn-icon-action" title="Delete Staff" onclick="deleteStaff('${s.id}')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderAuditLogs(list = auditLogs) {
  const tbody = document.getElementById('audit-table-rows');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--txt-sub); font-weight: 600;">No audit records found matching your search.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(log => `
    <tr>
      <td>${log.time}</td>
      <td><strong>${log.ticket}</strong></td>
      <td>${log.category}</td>
      <td>${log.ref}</td>
      <td>${log.staff}</td>
      <td><span class="status-pill verified">${log.status}</span></td>
    </tr>
  `).join('');
}

function renderHeatmap() {
  const container = document.getElementById('heatmap-rows');
  if (!container) return;
  const days = [
    { day: 'Mon', opacity: '0.6' },
    { day: 'Tue', opacity: '0.85' },
    { day: 'Wed', opacity: '0.4' },
    { day: 'Thu', opacity: '0.95' },
    { day: 'Fri', opacity: '0.7' }
  ];
  container.innerHTML = days.map(d => `
    <div style="display:flex; gap:12px; margin-top:8px; align-items:center;">
      <span style="width:32px; font-size:12px; font-weight:800; color:#64748B;">${d.day}</span>
      <div style="flex:1; height:24px; background:#2563EB; opacity:${d.opacity}; border-radius:6px;"></div>
    </div>
  `).join('');
}

function renderAllData() {
  renderDoctors();
  renderStaff();
  renderAuditLogs();
  renderHeatmap();
}

/* ACTION HANDLERS (TOGGLE STATUS & DELETE) */
function toggleDoctorStatus(docId) {
  doctorData = doctorData.map(doc => {
    if (doc.id === docId) {
      return { ...doc, status: doc.status === 'Active' ? 'Inactive' : 'Active' };
    }
    return doc;
  });
  const query = document.getElementById('global-search-input')?.value || '';
  handleGlobalSearch(query);
}

function deleteDoctor(docId) {
  if (confirm('Are you sure you want to remove this doctor record?')) {
    doctorData = doctorData.filter(doc => doc.id !== docId);
    const query = document.getElementById('global-search-input')?.value || '';
    handleGlobalSearch(query);
  }
}

function toggleStaffStatus(staffId) {
  staffData = staffData.map(s => {
    if (s.id === staffId) {
      return { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' };
    }
    return s;
  });
  const query = document.getElementById('global-search-input')?.value || '';
  handleGlobalSearch(query);
}

function deleteStaff(staffId) {
  if (confirm('Are you sure you want to remove this staff member?')) {
    staffData = staffData.filter(s => s.id !== staffId);
    const query = document.getElementById('global-search-input')?.value || '';
    handleGlobalSearch(query);
  }
}

/* REAL-TIME SEARCH FILTER ENGINE WITH AUTO-TAB SWITCHING */
function handleGlobalSearch(query) {
  const q = query.toLowerCase().trim();

  // 1. Filter Doctors
  const filteredDocs = doctorData.filter(d => 
    d.name.toLowerCase().includes(q) || 
    d.specialty.toLowerCase().includes(q) || 
    d.room.toLowerCase().includes(q) ||
    d.shift.toLowerCase().includes(q) ||
    d.status.toLowerCase().includes(q)
  );
  renderDoctors(filteredDocs);

  // 2. Filter Staff
  const filteredStaff = staffData.filter(s => 
    s.name.toLowerCase().includes(q) || 
    s.role.toLowerCase().includes(q) || 
    s.email.toLowerCase().includes(q) ||
    s.status.toLowerCase().includes(q)
  );
  renderStaff(filteredStaff);

  // 3. Filter Audit Logs
  const filteredAudit = auditLogs.filter(a => 
    a.ticket.toLowerCase().includes(q) ||
    a.category.toLowerCase().includes(q) ||
    a.ref.toLowerCase().includes(q) ||
    a.staff.toLowerCase().includes(q) ||
    a.status.toLowerCase().includes(q)
  );
  renderAuditLogs(filteredAudit);

  // 4. Auto-switch to Doctors tab if searching from a non-table tab
  if (q.length > 0) {
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab && (activeTab.id === 'tab-admin-dashboard' || activeTab.id === 'tab-admin-analytics' || activeTab.id === 'tab-admin-config')) {
      switchAdminTab('doctors');
    }
  }
}

/* MODAL CONTROLLERS */
function openDoctorModal() {
  activeModalType = 'doctor';
  document.getElementById('modal-title').innerText = 'Add New Doctor';
  document.getElementById('modal-fields').innerHTML = `
    <div class="form-group">
      <label>Doctor Name</label>
      <input type="text" id="input-doc-name" placeholder="Dr. Jane Doe" required>
    </div>
    <div class="form-group">
      <label>Specialty</label>
      <input type="text" id="input-doc-spec" placeholder="Cardiology" required>
    </div>
    <div class="form-group">
      <label>Room</label>
      <input type="text" id="input-doc-room" placeholder="Room 105" required>
    </div>
    <div class="form-group">
      <label>Shift</label>
      <input type="text" id="input-doc-shift" placeholder="AM Shift" required>
    </div>
  `;
  showModal();
}

function openStaffModal() {
  activeModalType = 'staff';
  document.getElementById('modal-title').innerText = 'Add New Staff Member';
  document.getElementById('modal-fields').innerHTML = `
    <div class="form-group">
      <label>Staff Name</label>
      <input type="text" id="input-staff-name" placeholder="John Smith" required>
    </div>
    <div class="form-group">
      <label>Role</label>
      <input type="text" id="input-staff-role" placeholder="Help Desk Operator" required>
    </div>
    <div class="form-group">
      <label>Email Address</label>
      <input type="email" id="input-staff-email" placeholder="john@mediq.ph" required>
    </div>
  `;
  showModal();
}

function showModal() {
  document.getElementById('add-modal-backdrop').classList.add('open');
  document.getElementById('add-modal').classList.add('open');
}

function closeModal() {
  document.getElementById('add-modal-backdrop').classList.remove('open');
  document.getElementById('add-modal').classList.remove('open');
}

function handleModalSubmit(e) {
  e.preventDefault();
  
  if (activeModalType === 'doctor') {
    const newDoc = {
      id: 'D' + (doctorData.length + 1),
      name: document.getElementById('input-doc-name').value,
      specialty: document.getElementById('input-doc-spec').value,
      room: document.getElementById('input-doc-room').value,
      shift: document.getElementById('input-doc-shift').value,
      status: 'Active'
    };
    doctorData.push(newDoc);
    
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) searchInput.value = '';
    renderDoctors(doctorData);
  } else if (activeModalType === 'staff') {
    const newStaff = {
      id: 'S' + (staffData.length + 1),
      name: document.getElementById('input-staff-name').value,
      role: document.getElementById('input-staff-role').value,
      email: document.getElementById('input-staff-email').value,
      status: 'Active'
    };
    staffData.push(newStaff);
    
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) searchInput.value = '';
    renderStaff(staffData);
  }
  
  closeModal();
}

/* SPOTIFY ADMIN PROFILE DRAWER CONTROLLER */
function openAdminProfileDrawer() {
  document.getElementById('admin-profile-backdrop').classList.add('open');
  document.getElementById('admin-profile-drawer').classList.add('open');
}

function closeAdminProfileDrawer() {
  document.getElementById('admin-profile-backdrop').classList.remove('open');
  document.getElementById('admin-profile-drawer').classList.remove('open');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAdminProfileDrawer();
    closeModal();
  }
});

/* PARALLAX EFFECT SCOPED STRICTLY TO THE LEFT PANEL */
document.addEventListener('DOMContentLoaded', () => {
  const leftPanel = document.querySelector('.login-left-panel');
  if (leftPanel) {
    leftPanel.addEventListener('mousemove', (e) => {
      const rect = leftPanel.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      const mouseY = (e.clientY - rect.top) / rect.height - 0.5;

      const icons = leftPanel.querySelectorAll('.floating-icon');
      icons.forEach((icon, index) => {
        const factor = (index + 1) * 8;
        icon.style.transform = `translate3d(${mouseX * factor}px, ${mouseY * factor}px, 0)`;
      });
    });
  }
});