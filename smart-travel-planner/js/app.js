// ---------------- Shared data ----------------
const destinations = [
  { id:1, name:"Goa", category:"Beach", lat:15.2993, lon:74.1240, season:"Nov - Feb", desc:"Golden beaches, vibrant nightlife, and Portuguese heritage make Goa India's favorite coastal escape.", attractions:["Baga Beach","Fort Aguada","Dudhsagar Falls","Basilica of Bom Jesus"], img:"linear-gradient(135deg,#2f7cf6,#8fd3f4)" },
  { id:2, name:"Manali", category:"Mountain", lat:32.2432, lon:77.1892, season:"Mar - Jun", desc:"A Himalayan hill town famous for snow-capped peaks, adventure sports, and scenic valleys.", attractions:["Solang Valley","Rohtang Pass","Hadimba Temple","Old Manali"], img:"linear-gradient(135deg,#334e68,#829ab1)" },
  { id:3, name:"Jaipur", category:"Heritage", lat:26.9124, lon:75.7873, season:"Oct - Mar", desc:"The Pink City — a showcase of royal Rajasthani forts, palaces, and vibrant bazaars.", attractions:["Amber Fort","Hawa Mahal","City Palace","Jal Mahal"], img:"linear-gradient(135deg,#c2410c,#fb923c)" },
  { id:4, name:"Kerala Backwaters (Alleppey)", category:"Nature", lat:9.4981, lon:76.3388, season:"Sep - Mar", desc:"Serene backwaters, houseboats, and lush greenery define this tranquil South Indian paradise.", attractions:["Houseboat Cruise","Alleppey Beach","Kumarakom Bird Sanctuary","Vembanad Lake"], img:"linear-gradient(135deg,#065f46,#34d399)" },
  { id:5, name:"Ladakh", category:"Mountain", lat:34.1526, lon:77.5771, season:"Jun - Sep", desc:"A high-altitude desert of dramatic landscapes, Buddhist monasteries, and pristine lakes.", attractions:["Pangong Lake","Nubra Valley","Leh Palace","Magnetic Hill"], img:"linear-gradient(135deg,#7c3aed,#c4b5fd)" },
  { id:6, name:"Rishikesh", category:"Adventure", lat:30.0869, lon:78.2676, season:"Sep - Apr", desc:"The Yoga Capital of the World, offering river rafting, spiritual retreats, and Himalayan views.", attractions:["Laxman Jhula","River Rafting","Triveni Ghat","Neelkanth Mahadev Temple"], img:"linear-gradient(135deg,#0e7490,#67e8f9)" },
];

let currentUser = null;
const USERS_KEY = "stp_users";
const SESSION_KEY = "stp_session";

// ---------------- Tab navigation ----------------
document.querySelectorAll('#tabNav button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#tabNav button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ---------------- MODULE 1: AUTH ----------------
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
}
function saveUsers(u) {
  localStorage.setItem(USERS_KEY, JSON.stringify(u));
}
function showMsg(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = "msg show " + type;
}
function registerUser() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const pass = document.getElementById('regPassword').value;
  if (!name || !email || !pass) return showMsg('regMsg', "Please fill all fields.", "error");
  if (!email.includes('@')) return showMsg('regMsg', "Enter a valid email.", "error");
  if (pass.length < 6) return showMsg('regMsg', "Password must be at least 6 characters.", "error");
  const users = getUsers();
  if (users[email]) return showMsg('regMsg', "An account with this email already exists.", "error");
  users[email] = { name, email, pass };
  saveUsers(users);
  showMsg('regMsg', "Account created! You can now log in.", "success");
  document.getElementById('regName').value = '';
  document.getElementById('regEmail').value = '';
  document.getElementById('regPassword').value = '';
}
function loginUser() {
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pass = document.getElementById('loginPassword').value;
  const users = getUsers();
  if (!users[email] || users[email].pass !== pass) {
    return showMsg('loginMsg', "Invalid email or password.", "error");
  }
  currentUser = users[email];
  localStorage.setItem(SESSION_KEY, email);
  renderAuthState();
}
function logoutUser() {
  currentUser = null;
  localStorage.removeItem(SESSION_KEY);
  renderAuthState();
}
function renderAuthState() {
  if (currentUser) {
    document.getElementById('loggedOutView').classList.add('hidden');
    document.getElementById('loggedInView').classList.remove('hidden');
    document.getElementById('welcomeName').textContent = "Welcome, " + currentUser.name + "!";
    document.getElementById('welcomeEmail').textContent = currentUser.email;
    document.getElementById('avatarInitial').textContent = currentUser.name.charAt(0).toUpperCase();
  } else {
    document.getElementById('loggedOutView').classList.remove('hidden');
    document.getElementById('loggedInView').classList.add('hidden');
  }
}
(function restoreSession(){
  const email = localStorage.getItem(SESSION_KEY);
  if (email) {
    const users = getUsers();
    if (users[email]) currentUser = users[email];
  }
  renderAuthState();
})();

// ---------------- MODULE 2: DESTINATIONS ----------------
function renderDestinations() {
  const q = document.getElementById('destSearch').value.toLowerCase();
  const list = destinations.filter(d =>
    d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
  );
  const container = document.getElementById('destList');
  if (list.length === 0) {
    container.innerHTML = '<p class="subtext">No results found. Try a different keyword.</p>';
    return;
  }
  container.innerHTML = list.map(d => `
    <div class="dest-card" onclick="openDestDetail(${d.id})">
      <div class="dest-img" style="background:${d.img}"></div>
      <div class="dest-body">
        <h4>${d.name}</h4>
        <p>Best time: ${d.season}</p>
        <span class="tag">${d.category}</span>
      </div>
    </div>
  `).join('');
}
function openDestDetail(id) {
  const d = destinations.find(x => x.id === id);
  document.getElementById('destList').parentElement.querySelector('#destSearch').blur();
  document.querySelector('#destinations .card').classList.add('hidden');
  const card = document.getElementById('destDetailCard');
  card.classList.remove('hidden');
  document.getElementById('destDetailBody').innerHTML = `
    <div class="detail-hero" style="background:${d.img}"></div>
    <h2 style="margin:0 0 4px;">${d.name}</h2>
    <div class="pill-row">
      <span class="pill">${d.category}</span>
      <span class="pill">Best time: ${d.season}</span>
    </div>
    <p>${d.desc}</p>
    <h4>Top Attractions</h4>
    <ul>${d.attractions.map(a => `<li>${a}</li>`).join('')}</ul>
    <button class="btn" onclick="planForDestination('${d.name}')">Plan Budget for ${d.name}</button>
  `;
}
function closeDestDetail() {
  document.getElementById('destDetailCard').classList.add('hidden');
  document.querySelector('#destinations .card').classList.remove('hidden');
}
function planForDestination(name) {
  document.querySelector('[data-tab="budget"]').click();
}
renderDestinations();

// ---------------- MODULE 3: BUDGET ----------------
function updateBudget() {
  const total = parseFloat(document.getElementById('totalBudget').value) || 0;
  const hotel = parseFloat(document.getElementById('expHotel').value) || 0;
  const transport = parseFloat(document.getElementById('expTransport').value) || 0;
  const food = parseFloat(document.getElementById('expFood').value) || 0;
  const activities = parseFloat(document.getElementById('expActivities').value) || 0;
  const spend = hotel + transport + food + activities;

  document.getElementById('spendLabel').textContent = '₹' + spend.toLocaleString();
  document.getElementById('budgetLabel').textContent = '₹' + total.toLocaleString();

  const pct = total > 0 ? Math.min((spend/total)*100, 100) : 0;
  const fill = document.getElementById('budgetFill');
  fill.style.width = pct + '%';
  fill.className = 'budget-fill' + (spend > total && total > 0 ? ' over' : '');

  const statusEl = document.getElementById('budgetStatus');
  if (total === 0) {
    statusEl.className = 'msg show';
    statusEl.textContent = 'Enter a total budget to see your spending status.';
  } else if (spend > total) {
    statusEl.className = 'msg show error';
    statusEl.textContent = `⚠ You are over budget by ₹${(spend-total).toLocaleString()}.`;
  } else {
    statusEl.className = 'msg show success';
    statusEl.textContent = `You have ₹${(total-spend).toLocaleString()} remaining in your budget.`;
  }

  const rows = [
    ['Accommodation', hotel],
    ['Transportation', transport],
    ['Food', food],
    ['Activities & Sightseeing', activities],
  ];
  document.getElementById('budgetTableBody').innerHTML = rows.map(([cat, amt]) => `
    <tr><td>${cat}</td><td>₹${amt.toLocaleString()}</td><td>${total>0 ? ((amt/total)*100).toFixed(1) : 0}%</td></tr>
  `).join('');
}
updateBudget();

// ---------------- MODULE 4: MAP & WEATHER ----------------
const mwSelect = document.getElementById('mwDestSelect');
mwSelect.innerHTML = destinations.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

function loadMapWeather() {
  const d = destinations.find(x => x.id == mwSelect.value) || destinations[0];
  const delta = 0.15;
  const bbox = `${d.lon-delta}%2C${d.lat-delta}%2C${d.lon+delta}%2C${d.lat+delta}`;
  document.getElementById('mapFrame').src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${d.lat}%2C${d.lon}`;

  document.getElementById('weatherLoading').classList.remove('hidden');
  document.getElementById('weatherContent').classList.add('hidden');
  document.getElementById('weatherError').classList.remove('show');

  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${d.lat}&longitude=${d.lon}&current=temperature_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,weather_code&timezone=auto&forecast_days=5`)
    .then(r => r.json())
    .then(data => {
      document.getElementById('weatherLoading').classList.add('hidden');
      document.getElementById('weatherContent').classList.remove('hidden');
      const wCodeMap = {0:"Clear sky",1:"Mainly clear",2:"Partly cloudy",3:"Overcast",45:"Fog",51:"Light drizzle",61:"Light rain",63:"Rain",65:"Heavy rain",71:"Snow",80:"Rain showers",95:"Thunderstorm"};
      document.getElementById('wTemp').textContent = Math.round(data.current.temperature_2m) + '°C';
      document.getElementById('wCondition').textContent = wCodeMap[data.current.weather_code] || 'N/A';
      document.getElementById('wWind').textContent = 'Wind: ' + data.current.wind_speed_10m + ' km/h';

      const days = data.daily.time.map((t,i) => ({
        day: new Date(t).toLocaleDateString('en-US', {weekday:'short'}),
        temp: Math.round(data.daily.temperature_2m_max[i])
      }));
      document.getElementById('wForecast').innerHTML = days.map(x => `
        <div class="wd"><div class="d">${x.day}</div><div class="t">${x.temp}°C</div></div>
      `).join('');
    })
    .catch(() => {
      document.getElementById('weatherLoading').classList.add('hidden');
      const err = document.getElementById('weatherError');
      err.classList.add('show');
      err.textContent = "Could not load live weather data right now. (Requires internet access.)";
    });
}
loadMapWeather();
