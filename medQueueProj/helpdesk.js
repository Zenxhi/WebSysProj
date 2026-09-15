/* ==========================================
   HELPDESK INTERFACE LOGIC & STATE ENGINE
   ========================================== */

function handleLogin(e) {
  e.preventDefault();
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('helpdesk-app').classList.remove('hidden');
  renderAllData();
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  const selectedPanel = document.getElementById('tab-' + tabId);
  if (selectedPanel) selectedPanel.classList.add('active');

  const selectedNav = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
  if (selectedNav) selectedNav.classList.add('active');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

/* REAL-TIME CLOCK */
function updateClock() {
  const now = new Date();
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const timestampElem = document.getElementById('current-timestamp');
  if (timestampElem) {
    timestampElem.textContent = now.toLocaleDateString('en-US', options).replace(',', ' —');
  }
}
setInterval(updateClock, 1000);
updateClock();

/* IN-MEMORY DATA ARRAYS */
let doctorsList = [
  { id: 'DA', name: 'Dr. Ama Osei', spec: 'Cardiology', room: 'Room 101', status: 'available' },
  { id: 'DL', name: 'Dr. Linh Nguyen', spec: 'Dermatology', room: 'Room 102', status: 'available' },
  { id: 'DC', name: 'Dr. Carlos Reyes', spec: 'General Medicine', room: 'Room 103', status: 'off' },
  { id: 'DF', name: 'Dr. Fatima Malik', spec: 'Neurology', room: 'Room 104', status: 'break' },
  { id: 'DH', name: 'Dr. Hassan Al-Farsi', spec: 'Radiology', room: 'Room 106', status: 'available' },
  { id: 'DT', name: 'Dr. Tanya Fisher', spec: 'Orthopedics', room: 'Room 105', status: 'break' }
];

let queueList = [
  { ticket: 'A-016', category: 'Regular', waitTime: '0m', status: 'Serving', style: 'serving' },
  { ticket: 'P-005', category: 'Pregnant', waitTime: '2m', status: 'On Hold', style: 'hold' },
  { ticket: 'A-015', category: 'Regular', waitTime: '33m', status: 'On Hold', style: 'hold' }
];

let currentRegularCounter = 16;
let currentPriorityCounter = 5;
let selectedCategory = "Senior";

/* CALL DURATION TIMER STATE */
let timerSeconds = 3;
let timerInterval = null;

function startTimer() {
  stopTimer();
  timerSeconds = 0;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timerSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerDisplay() {
  const timerElem = document.getElementById('call-timer');
  if (!timerElem) return;
  const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const secs = String(timerSeconds % 60).padStart(2, '0');
  timerElem.textContent = `${mins}:${secs}`;
}

/* RENDER FUNCTIONS */
function renderRoster(list = doctorsList) {
  const grid = document.getElementById('roster-grid');
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 24px; color: var(--text-sub); font-weight: 600;">No doctors found matching your search.</div>`;
    return;
  }

  grid.innerHTML = list.map(doc => {
    let statusLabel = 'Available';
    if (doc.status === 'break') statusLabel = 'On Break';
    if (doc.status === 'off') statusLabel = 'Off Duty';

    return `
      <div class="doctor-card">
        <div class="doc-card-top">
          <div class="avatar-circle">${doc.id}</div>
          <div>
            <div class="doc-name">${doc.name}</div>
            <div class="room-num">${doc.spec} • ${doc.room}</div>
          </div>
        </div>
        <button class="status-dot-btn ${doc.status}" onclick="cycleDocStatus('${doc.id}')">
          ● ${statusLabel}
        </button>
      </div>
    `;
  }).join('');
}

function renderQueueTable(list = queueList) {
  const tbody = document.getElementById('queue-table-rows');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 24px; color: var(--text-sub); font-weight: 600;">No queue items found matching your search.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(q => `
    <tr>
      <td><strong>${q.ticket}</strong></td>
      <td><span class="${q.category === 'Regular' ? 'text-blue' : 'text-orange'}">${q.category}</span></td>
      <td>${q.waitTime}</td>
      <td><span class="status-dot-inline ${q.style}">${q.status}</span></td>
    </tr>
  `).join('');
}

function updateDashboardMetrics() {
  const waitingCount = queueList.filter(q => q.status === 'On Hold' || q.status === 'Waiting').length;
  const servingCount = queueList.filter(q => q.status === 'Serving').length;
  
  const waitingElem = document.getElementById('stat-waiting');
  const servingElem = document.getElementById('stat-serving');
  const doctorsElem = document.getElementById('stat-doctors');

  if (waitingElem) waitingElem.textContent = waitingCount;
  if (servingElem) servingElem.textContent = servingCount;
  if (doctorsElem) doctorsElem.textContent = doctorsList.filter(d => d.status === 'available').length;
}

function renderAllData() {
  renderRoster();
  renderQueueTable();
  updateDashboardMetrics();
}

/* SEARCH ENGINE WITH AUTO-TAB NAVIGATION */
function handleGlobalSearch(query) {
  const q = query.toLowerCase().trim();

  const filteredDocs = doctorsList.filter(d => 
    d.name.toLowerCase().includes(q) || 
    d.spec.toLowerCase().includes(q) || 
    d.room.toLowerCase().includes(q) ||
    d.status.toLowerCase().includes(q)
  );
  renderRoster(filteredDocs);

  const filteredQueue = queueList.filter(item => 
    item.ticket.toLowerCase().includes(q) || 
    item.category.toLowerCase().includes(q) || 
    item.status.toLowerCase().includes(q)
  );
  renderQueueTable(filteredQueue);

  if (q.length > 0) {
    const activePanel = document.querySelector('.tab-panel.active');
    if (activePanel && activePanel.id === 'tab-dashboard') {
      switchTab('roster');
    }
  }
}

/* ROSTER STATUS CYCLER */
function cycleDocStatus(docId) {
  const doc = doctorsList.find(d => d.id === docId);
  if (!doc) return;
  if (doc.status === 'available') doc.status = 'break';
  else if (doc.status === 'break') doc.status = 'off';
  else doc.status = 'available';
  
  handleGlobalSearch(document.getElementById('global-search-input')?.value || '');
  updateDashboardMetrics();
}

/* TICKET ISSUANCE & VERIFICATION */
function issueRegularTicket() {
  currentRegularCounter++;
  const nextNum = `A-0${currentRegularCounter}`;
  const elem = document.getElementById('next-regular-num');
  if (elem) elem.textContent = `A-0${currentRegularCounter + 1}`;
  
  queueList.push({ ticket: nextNum, category: 'Regular', waitTime: 'Just now', status: 'On Hold', style: 'hold' });
  renderAllData();
  alert(`Regular Ticket ${nextNum} Issued!`);
}

function selectPriorityCat(btn, category) {
  document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedCategory = category;
}

function simulateDocScan() {
  const text = document.getElementById('scanner-text');
  if (text) text.textContent = `✓ ${selectedCategory} ID Document Verified`;
}

function issuePriorityTicket() {
  currentPriorityCounter++;
  const nextNum = `P-00${currentPriorityCounter}`;
  queueList.unshift({ ticket: nextNum, category: selectedCategory, waitTime: 'Just now', status: 'On Hold', style: 'hold' });
  renderAllData();
  alert(`Priority Ticket ${nextNum} (${selectedCategory}) Verified & Issued!`);
}

/* QUEUE DESK CALLER ACTIONS */
function callNextPatient() {
  const waitingIndex = queueList.findIndex(q => q.status === 'On Hold' || q.status === 'Waiting');
  let activeTicket = '';

  if (waitingIndex !== -1) {
    queueList[waitingIndex].status = 'Serving';
    queueList[waitingIndex].style = 'serving';
    activeTicket = queueList[waitingIndex].ticket;
  } else {
    currentRegularCounter++;
    activeTicket = `A-0${currentRegularCounter}`;
    queueList.unshift({ ticket: activeTicket, category: 'Regular', waitTime: 'Just now', status: 'Serving', style: 'serving' });
  }

  const currentServing = document.getElementById('current-serving-num');
  const tvServing = document.getElementById('tv-serving-num');
  
  if (currentServing) currentServing.textContent = activeTicket;
  if (tvServing) tvServing.textContent = activeTicket;

  startTimer();
  renderAllData();
}

function updateQueueStatus(status) {
  const servingTicket = queueList.find(q => q.status === 'Serving');

  if (status === 'Recalled') {
    if (servingTicket) {
      alert(`📢 Audio Announcement: Recalling Ticket ${servingTicket.ticket} to Help Desk Counter!`);
    } else {
      alert('No active ticket currently being served.');
    }
    return;
  }

  if (servingTicket) {
    servingTicket.status = status;
    if (status === 'Completed') servingTicket.style = 'completed';
    else if (status === 'On Hold') servingTicket.style = 'hold';
    else if (status === 'Skipped') servingTicket.style = 'off';

    stopTimer();
    renderAllData();
  } else {
    alert('No active ticket to update.');
  }
}

/* DISPLAY TV ANNOUNCEMENTS */
function publishAnnouncement() {
  const input = document.getElementById('announcement-input');
  const tvText = document.getElementById('tv-announcement-text');
  if (input && tvText) tvText.textContent = input.value;
}

function clearTicker() {
  const input = document.getElementById('announcement-input');
  const tvText = document.getElementById('tv-announcement-text');
  if (input) input.value = '';
  if (tvText) tvText.textContent = '';
}

/* PROFILE DRAWER CONTROLLERS */
function openProfileDrawer() {
  document.getElementById('helpdesk-profile-backdrop').classList.add('open');
  document.getElementById('helpdesk-profile-drawer').classList.add('open');
}

function closeProfileDrawer() {
  document.getElementById('helpdesk-profile-backdrop').classList.remove('open');
  document.getElementById('helpdesk-profile-drawer').classList.remove('open');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeProfileDrawer();
  if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    callNextPatient();
  }
});

/* PARALLAX EFFECT ON LOGIN LEFT PANEL */
document.addEventListener('DOMContentLoaded', () => {
  renderAllData();

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