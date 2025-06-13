// === dashboard.js ===

// CLOCK
function updateClock() {
  const now = new Date();
  document.querySelector('.clock-hour').textContent = String(now.getHours() % 12 || 12).padStart(2, '0');
  document.querySelector('.clock-min').textContent = String(now.getMinutes()).padStart(2, '0');
  document.querySelector('.clock-ampm').textContent = now.getHours() >= 12 ? 'PM' : 'AM';
  
  const weekdays = document.querySelectorAll('.clock-weekdays div');
  weekdays.forEach((d, i) => d.classList.toggle('active', i === now.getDay()));
}
setInterval(updateClock, 1000);
updateClock();

// COUNTDOWN TIMER
let countdownInterval;
document.getElementById('startCountdownBtn').addEventListener('click', () => {
  const start = document.getElementById('startTime').value;
  const end = document.getElementById('endTime').value;
  if (!start || !end) return;

  const startTime = new Date();
  const [startHour, startMin] = start.split(':').map(Number);
  startTime.setHours(startHour, startMin, 0, 0);

  const endTime = new Date();
  const [endHour, endMin] = end.split(':').map(Number);
  endTime.setHours(endHour, endMin, 0, 0);

  const totalDuration = endTime - startTime;
  if (totalDuration <= 0) return;

  countdownInterval = setInterval(() => {
    const now = new Date();
    const remaining = endTime - now;
    const pct = Math.max(0, (1 - remaining / totalDuration) * 100);
    document.getElementById('progress-bar').style.width = `${pct}%`;

    const seconds = Math.max(0, Math.floor(remaining / 1000));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    document.getElementById('countdown-label').textContent = formatTime(h, m, s);
    
    if (remaining <= 0) clearInterval(countdownInterval);
  }, 1000);
});

document.getElementById('resetCountdownBtn').addEventListener('click', () => {
  clearInterval(countdownInterval);
  document.getElementById('progress-bar').style.width = '0%';
  document.getElementById('countdown-label').textContent = '00:00:00';
});

// QUICK LINKS
const links = getFromLocalStorage('quickLinks', []);
const linkList = document.getElementById('linkList');
function renderLinks() {
  linkList.innerHTML = '';
  links.forEach((link, i) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = link.url;
    a.textContent = link.name;
    a.target = '_blank';
    li.appendChild(a);
    linkList.appendChild(li);
  });
}
document.getElementById('addLinkBtn').addEventListener('click', () => {
  const name = document.getElementById('linkNameInput').value;
  const url = document.getElementById('linkUrlInput').value;
  if (!name || !url) return;
  links.push({ name, url });
  saveToLocalStorage('quickLinks', links);
  renderLinks();
});
renderLinks();

// Other widgets (e.g., goals, projects, habits, todos) can follow the same model
// Placeholder: Can be added as needed and match the same pattern of load → render → save
