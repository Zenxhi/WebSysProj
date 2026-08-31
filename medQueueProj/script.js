/* Navigation State Handler */
function goTo(name) {
  document.querySelectorAll('.screen').forEach(function(s) {
    s.classList.remove('active');
  });
  document.getElementById('screen-' + name).classList.add('active');
  window.scrollTo(0, 0);
  renderAllSteppers();
}

/* Footer Dynamic Date */
var todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
['2', '3', '4', '5', '6', '7'].forEach(function(n) {
  var el = document.getElementById('footer-' + n);
  if (el) {
    el.textContent = 'MediQ Clinic — General Medicine — ' + todayStr;
  }
});

/* Dynamic Stepper Rendering (3 Steps for Regular, 4 Steps for Priority) */
function currentIsRegular() {
  return !!(selectedClass && selectedClass.priority === false);
}

function renderStepper(mountEl) {
  var key = mountEl.dataset.step;
  var regular = currentIsRegular();
  var labels = regular ? ['Service', 'Type', 'Ticket / Status'] : ['Service', 'Type', 'Verify', 'Ticket / Status'];
  var order = regular ? ['service', 'type', 'ticket'] : ['service', 'type', 'verify', 'ticket'];
  var idx = order.indexOf(key);
  if (idx === -1) { idx = order.length - 1; }

  var dotsHtml = '';
  for (var i = 0; i < order.length; i++) {
    var cls = 'step';
    if (i < idx) cls += ' done';
    else if (i === idx) cls += ' active';
    dotsHtml += '<div class="' + cls + '">' + (i < idx ? '✓' : (i + 1)) + '</div>';
    if (i < order.length - 1) {
      dotsHtml += '<div class="step-line' + (i < idx ? ' done' : '') + '"></div>';
    }
  }
  var labelsHtml = '<div class="step-labels">' + labels.map(function(l) { return '<span>' + l + '</span>'; }).join('') + '</div>';

  mountEl.innerHTML = '<div class="stepper">' + dotsHtml + '</div>' + labelsHtml;
}

function renderAllSteppers() {
  document.querySelectorAll('.stepper-mount').forEach(renderStepper);
}

/* Home & Queue Status Lists */
var homeQueue = [
  { n: '02' }, { n: '03' }, { n: '04' }, { n: '05' }, { n: '06' }, { n: '07' }, { n: '08' }
];
var homeQueueEl = document.getElementById('home-queue-list');
if (homeQueueEl) {
  homeQueueEl.innerHTML = homeQueue.map(function(t) {
    return '<div class="ticket-row"><span>' + t.n + '</span><span class="pill pill-waiting">Waiting</span></div>';
  }).join('');
}

var statusQueue = [{ n: '02' }, { n: '03' }, { n: '04' }, { n: '05' }, { n: '06' }, { n: '07' }];
var statusQueueEl = document.getElementById('status-queue-list');
if (statusQueueEl) {
  statusQueueEl.innerHTML = statusQueue.map(function(t) {
    return '<div class="ticket-row"><span>' + t.n + '</span><span class="pill pill-waiting">Waiting</span></div>';
  }).join('');
}

/* Screen 2: Service Selection */
var services = [
  { id: 'cardiology', name: 'Cardiology', meta: '~8 min', icon: '♥' },
  { id: 'neurology', name: 'Neurology', meta: '~22 min', icon: '⚡' },
  { id: 'dermatology', name: 'Dermatology', meta: '~15 min', icon: '✦' },
  { id: 'pediatrics', name: 'Pediatrics', meta: '~10 min', icon: '☺' },
  { id: 'orthopedics', name: 'Orthopedics', meta: '~30 min', icon: '✚' },
  { id: 'general', name: 'General Medicine', meta: '~18 min', icon: '⚕' }
];
var selectedService = null;
var grid = document.getElementById('service-grid');
if (grid) {
  grid.innerHTML = services.map(function(s) {
    return '<div class="option-card" data-id="' + s.id + '" onclick="selectService(\'' + s.id + '\')">' +
      '<div class="icon">' + s.icon + '</div>' +
      '<div class="name">' + s.name + '</div>' +
      '<div class="meta">' + s.meta + '</div></div>';
  }).join('');
}

function selectService(id) {
  selectedService = services.find(function(s) { return s.id === id; });
  document.querySelectorAll('#service-grid .option-card').forEach(function(c) {
    c.classList.toggle('selected', c.dataset.id === id);
  });
  document.getElementById('service-continue').disabled = false;
}

/* Screen 3: Classification */
var classifications = [
  { id: 'senior', name: 'Senior Citizen', priority: true },
  { id: 'pwd', name: 'Person with Disability (PWD)', priority: true },
  { id: 'pregnant', name: 'Pregnant Women', priority: true },
  { id: 'regular', name: 'Regular Patient', priority: false }
];
var selectedClass = null;
var classListEl = document.getElementById('classification-list');
if (classListEl) {
  classListEl.innerHTML = classifications.map(function(c) {
    return '<div class="radio-card" data-id="' + c.id + '" onclick="selectClass(\'' + c.id + '\')">' +
      '<div><div class="name">' + c.name + '</div>' +
      '<span class="pill ' + (c.priority ? 'pill-priority">Priority Lane' : 'pill-waiting">Regular Lane') + '</span></div>' +
      '<div class="radio-dot"></div></div>';
  }).join('');
}

function selectClass(id) {
  selectedClass = classifications.find(function(c) { return c.id === id; });
  document.querySelectorAll('#classification-list .radio-card').forEach(function(c) {
    c.classList.toggle('selected', c.dataset.id === id);
  });
  document.getElementById('classification-continue').disabled = false;
  renderAllSteppers();
}

/* Conditional Flow Navigation */
function classificationContinue() {
  if (selectedClass && selectedClass.priority === false) {
    goTo('review');
  } else {
    goTo('verify');
  }
}

function goBackFromReview() {
  if (currentIsRegular()) { goTo('classification'); }
  else { goTo('verify'); }
}

/* Screen 4: Priority Verification Simulation */
function simulateScan() {
  var status = document.getElementById('scan-status');
  status.textContent = 'Scanning…';
  setTimeout(function() {
    status.textContent = 'Verified ✓';
    setTimeout(function() { goTo('review'); }, 500);
  }, 900);
}

/* Screen 5: Review Ticket Data Binding */
function populateTicket() {
  var svc = selectedService ? selectedService.name : 'General Medicine';
  var type = selectedClass ? selectedClass.name : 'Regular Patient';
  document.getElementById('ticket-service').textContent = svc;
  document.getElementById('ticket-dept').textContent = svc;
  document.getElementById('ticket-type').textContent = type;
  var now = new Date();
  document.getElementById('ticket-date').textContent = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  document.getElementById('ticket-time').textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

var origGoTo = goTo;
goTo = function(name) {
  origGoTo(name);
  if (name === 'review') { populateTicket(); }
};

/* Screen 7: Doctors Grid */
var doctors = [
  { name: 'Mr. Cardo Dalisay', spec: 'Pediatrician' },
  { name: 'Dr. Arna Osei', spec: 'Cardiologist' },
  { name: 'Dr. Linh Nguyen', spec: 'Neurologist' },
  { name: 'Dr. Carlos Reyes', spec: 'Dermatologist' },
  { name: 'Dr. Tanya Fisher', spec: 'Orthopedic Surgeon' },
  { name: 'Dr. Hassan Al-Farsi', spec: 'Radiologist' },
  { name: 'Dr. Ingrid Svensson', spec: 'Psychiatrist' }
];

function initials(n) {
  return n.replace('Mr. ', '').replace('Dr. ', '').split(' ').map(function(w) { return w[0]; }).join('').slice(0, 2);
}

var doctorGridEl = document.getElementById('doctor-grid');
if (doctorGridEl) {
  doctorGridEl.innerHTML = doctors.map(function(d) {
    return '<div class="doctor-card">' +
      '<div class="avatar">' + initials(d.name) + '</div>' +
      '<div class="name">' + d.name + '</div>' +
      '<div class="spec">' + d.spec + '</div>' +
      '<span class="pill pill-ondone">On Duty</span></div>';
  }).join('');
}

/* Initial Stepper Pass */
renderAllSteppers();