/* ============================================
   FAREWELL 2026 — JavaScript
   ============================================ */

// ===== ENTER MEMORIES =====
function enterMemories() {
  const landing = document.getElementById('landing');
  const main = document.getElementById('mainContent');

  landing.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  landing.style.opacity = '0';
  landing.style.transform = 'scale(1.03)';

  // Auto-play music on enter
  try {
    const audio = document.getElementById('bgMusic');
    const btn = document.getElementById('musicToggle');
    audio.volume = 0.25;
    audio.play().then(() => {
      musicPlaying = true;
      if (btn) { btn.textContent = '🔇 Pause'; btn.classList.add('playing'); }
    }).catch(() => {});
  } catch(e) {}

  setTimeout(() => {
    landing.style.display = 'none';
    main.classList.remove('hidden');
    main.style.opacity = '0';
    main.style.transition = 'opacity 0.8s ease';
    setTimeout(() => { main.style.opacity = '1'; }, 50);

    // Init everything
    initGallery();
    initMessages();
    initAwards();
    initTimeline();
    initProfiles();
    initQuiz();
    initScrollAnimations();
  }, 800);
}

// ===== NAVIGATION =====
function toggleNav() {
  document.getElementById('navbar').classList.toggle('nav-open');
}

document.addEventListener('click', e => {
  const nav = document.getElementById('navbar');
  if (nav && !nav.contains(e.target)) {
    nav.classList.remove('nav-open');
  }
});

// ===== MUSIC =====
let musicPlaying = false;
function toggleMusic() {
  const audio = document.getElementById('bgMusic');
  const btn = document.getElementById('musicToggle');
  if (musicPlaying) {
    audio.pause();
    btn.textContent = '🎵 Music';
    btn.classList.remove('playing');
  } else {
    audio.volume = 0.3;
    audio.play().catch(() => {});
    btn.textContent = '🔇 Pause';
    btn.classList.add('playing');
  }
  musicPlaying = !musicPlaying;
}

// ===== GALLERY DATA =====
const totalPhotos = 39;
const skippedPhotos = [6, 10, 16]; // deleted or missing photos
const galleryData = [{ img: 'group-photo.jpg', title: 'Group Photo 🎓', featured: true }];
for (let i = 1; i <= totalPhotos; i++) {
  if (skippedPhotos.includes(i)) continue;
  galleryData.push({ img: `photos/${i}.jpeg`, title: `Memory ${i}` });
}

// New WhatsApp photos
const whatsappPhotos = [
  'WhatsApp Image 2026-05-02 at 11.29.52 AM.jpeg',
  'WhatsApp Image 2026-05-02 at 11.29.52 AM (1).jpeg',
  'WhatsApp Image 2026-05-02 at 11.29.53 AM.jpeg',
  'WhatsApp Image 2026-05-02 at 11.29.53 AM (1).jpeg',
  'WhatsApp Image 2026-05-02 at 11.29.54 AM.jpeg',
  'WhatsApp Image 2026-05-02 at 11.29.54 AM (1).jpeg',
  'WhatsApp Image 2026-05-02 at 11.29.54 AM (2).jpeg',
];
whatsappPhotos.forEach((photo, idx) => {
  galleryData.push({ img: `photos/${encodeURIComponent(photo)}`, title: `Memory ${totalPhotos + idx + 1}` });
});

function initGallery() {
  renderGallery('all');
}

function filterGallery(year) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  renderGallery(year);
}

function renderGallery(year) {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  grid.innerHTML = galleryData.map((g, i) => `
    <div class="gallery-item${g.featured ? ' gallery-featured' : ''} fade-in" onclick="openLightbox('${g.img}','${g.title}')">
      <img src="${g.img}" alt="${g.title}" loading="lazy">
      <div class="gallery-caption">
        <h4>${g.title}</h4>
      </div>
    </div>
  `).join('');
  setTimeout(() => {
    grid.querySelectorAll('.fade-in').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 80);
    });
  }, 50);
}

// ===== LIGHTBOX =====
function openLightbox(src, title) {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <span class="lightbox-close" onclick="this.parentElement.remove()">✕</span>
    <img src="${src}" alt="${title}">
  `;
  lb.addEventListener('click', e => { if(e.target === lb) lb.remove(); });
  document.body.appendChild(lb);
}

// ===== VIDEO MODAL =====
function playVideo(btn, videoId) {
  const modal = document.getElementById('videoModal');
  const frame = document.getElementById('videoFrame');
  frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  modal.classList.remove('hidden');
}

function closeVideoModal() {
  const modal = document.getElementById('videoModal');
  const frame = document.getElementById('videoFrame');
  frame.src = '';
  modal.classList.add('hidden');
}

// ===== MESSAGES (Supabase powered) =====

function makeSticky(m, key){
  const d=document.createElement('div');
  d.className=`sticky-note ${m.color}`;
  d.style.setProperty('--rot', m.rotation || m.rot || m.r || '0deg');
  if(key) d.dataset.key = key;
  d.innerHTML=`<button class="remove-msg-btn" onclick="deleteMessage(this.parentElement)" title="Delete message">×</button><p>${m.text}</p><div class="sticky-author">— ${m.name}</div>`;
  return d;
}

async function deleteMessage(el){
  const key = el.dataset.key;
  if(key && typeof sb !== 'undefined' && sb){
    try{
      await sb.from('messages').delete().eq('id', key);
      console.log('🗑️ Message deleted from Supabase');
    }catch(e){ console.error('Delete error:', e); }
  }
  el.remove();
}

function renderMessages(msgs){
  var b=document.getElementById('stickyBoard');
  if(!b) return;
  b.innerHTML='';
  msgs.forEach(function(m){ b.appendChild(makeSticky(m, m.id || m.key)); });
}

async function initMessages(){
  if(typeof sb === 'undefined' || !sb){
    console.error('❌ Supabase not initialized in script.js!');
    return;
  }
  console.log('🔄 Loading messages from Supabase...');
  try{
    var { data, error } = await sb
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if(error){
      console.error('❌ Supabase read error:', error.message);
      return;
    }
    console.log('✅ Messages loaded from Supabase:', data ? data.length : 0);
    if(data && data.length > 0){
      renderMessages(data);
    }

    // Real-time subscription
    sb.channel('messages-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, function(payload){
        loadAllMessages();
      })
      .subscribe();

  }catch(e){ console.error('❌ Supabase error:', e); }
}

async function loadAllMessages(){
  if(typeof sb === 'undefined' || !sb) return;
  var { data, error } = await sb
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });
  if(!error && data){
    renderMessages(data);
  }
}

async function postMessage(){
  var name=document.getElementById('msgName').value.trim()||'Anonymous 💌';
  var text=document.getElementById('msgText').value.trim();
  var color=document.getElementById('msgColor').value;
  if(!text){showToast('Please write something ✏️');return;}
  var rots=['-2deg','-1.2deg','0deg','1deg','2deg'];
  var r=rots[Math.floor(Math.random()*rots.length)];

  // Optimistic UI
  var tempMsg={name:name,text:text,color:color,rotation:r,id:'temp_'+Date.now()};
  var b=document.getElementById('stickyBoard');
  if(b) b.prepend(makeSticky(tempMsg, tempMsg.id));

  // Save to Supabase
  if(typeof sb !== 'undefined' && sb){
    try{
      var { data, error } = await sb
        .from('messages')
        .insert([{ name: name, text: text, color: color, rotation: r }])
        .select();
      
      if(error){
        console.error('❌ Supabase insert error:', error.message);
        showToast('Error posting message ❌');
        return;
      }
    }catch(e){ console.error('❌ Post error:', e); }
  }
  
  document.getElementById('msgName').value='';
  document.getElementById('msgText').value='';
  showToast('Message posted! 💌');
}

// ===== AWARDS =====
const awards = [
  { emoji:'😴', badge:'Certified Legend', title:'Best Bunk Master', name:'Rohit Joshi', desc:'Attended exactly enough lectures to pass. A tactical genius who turned absence into an art form.' },
  { emoji:'⏰', badge:'Iconic', title:'Always Late Legend', name:'Priya Nair', desc:'Never on time, but always worth the wait. Could be late for her own farewell — and still make an entrance.' },
  { emoji:'📸', badge:'Social Icon', title:'Instagram Reel Machine', name:'Aryan Kapoor', desc:'Turned every assignment, seminar, and canteen trip into viral content. 40k followers and counting.' },
  { emoji:'🍔', badge:'Canteen Royalty', title:'Canteen King', name:'Vikram Rao', desc:'Has a frequent-flyer card at every food stall on campus. The canteen staff knows his order by heart.' },
  { emoji:'🧪', badge:'Nerd of the Year', title:'Walking Wikipedia', name:'Aishwarya Gupta', desc:'The person everyone texted at 11 PM before exams. Responded instantly, with sources and diagrams.' },
  { emoji:'🕺', badge:'Life of the Party', title:'Dancefloor CEO', name:'Nikhil Sharma', desc:'Broke out a dance routine at every college event. Even at the principal\'s convocation.' },
  { emoji:'💤', badge:'Dreamster', title:'Lecture Sleeper Pro', name:'Siddharth Patil', desc:'Mastered the art of eyes-closed learning. Claims it\'s "auditory processing". We believe him.' },
  { emoji:'🤝', badge:'Problem Solver', title:'Group Project Savior', name:'Meera Iyer', desc:'Single-handedly completed 80% of every group project while smiling. The real MVP of every batch.' },
];

function initAwards() {
  const el = document.getElementById('awardsGrid');
  if (!el) return;
  el.innerHTML = awards.map(a => `
    <div class="award-card fade-in">
      <span class="award-emoji">${a.emoji}</span>
      <div class="award-badge">${a.badge}</div>
      <div class="award-title">${a.title}</div>
      <div class="award-name">${a.name}</div>
      <p class="award-desc">${a.desc}</p>
    </div>
  `).join('');
}

// ===== TIMELINE =====
const timelineEvents = [
  { date:'First Year', title:'Suruvat ani Confusion', desc:'College madhla pahila divas… nave chehre, nave friends, ani thoda sa darr.<br>Lectures peksha canteen jast interesting vataycha.<br>Attendance kami ani excitement jast.<br>“Kay chalalay he?” ha prashna rojach asaycha.<br>Pan hya saglyat kahi special loka bhetle… je nantar “friends” nahi tar “family” zale.', emoji:'🌅' },
  { date:'Second Year', title:'Adjust honyacha phase', desc:'Ata thoda college life samjhayla lagla.<br>Backlogs chi kalji pan suru zali 😅<br>Assignments last moment la complete karne hi kala develop zali.<br>Group banle, hangouts vadle, ani memories silently build hot hotya.<br>“College life mast aahe” he finally realise zala.', emoji:'⚙️' },
  { date:'Third Year', title:'Reality check', desc:'Internships, projects, submissions… sagla serious zala.<br>Future cha thought yen lagla.<br>Placement, skills, resume — sagla ekach veles.<br>Pan hya tension madhe pan aplya gang sobatli masti kadhi kami zali nahi.<br>Hech moments actually best hote.', emoji:'💼' },
  { date:'Fourth Year', title:'Shevat ani Suruvat donhi', desc:'Last year… ani suddenly sagla fast forward jhala.<br>Last lectures, last submissions, last bench masti…<br>“Kal paryant je normal hota, te aaj memories zali.”<br>Farewell cha divas — hasi pan hoti, ani dolyat paani pan.<br>Ata sagle vegveglya path var nighnar…<br>Pan ek goshta fixed aahe —<br>Aplya friendship la kadhi end nahi. ❤️', emoji:'🎓' }
];

function initTimeline() {
  const el = document.getElementById('timelineContainer');
  if (!el) return;
  el.innerHTML = timelineEvents.map((e, i) => `
    <div class="timeline-item">
      <div class="tl-content">
        <div class="tl-date">${e.date}</div>
        <h4>${e.title}</h4>
        <p>${e.desc}</p>
      </div>
      <div class="tl-emoji">${e.emoji}</div>
    </div>
  `).join('');
}

// ===== PROFILES =====
const profiles = [
  { nick:'The Architect', name:'Aditya Kulkarni', img:'https://randomuser.me/api/portraits/men/32.jpg', bio:'Coded his first app at 16. Never lets anyone forget it.', future:'🚀 Off to IIT Bombay for M.Tech' },
  { nick:'La Bella', name:'Sanya Mehta', img:'https://randomuser.me/api/portraits/women/44.jpg', bio:'Could explain any concept with one whiteboard and one marker.', future:'💼 Joining Google, Bangalore' },
  { nick:'The Philosopher', name:'Aryan Desai', img:'https://randomuser.me/api/portraits/men/55.jpg', bio:'Asked "but why?" in every lecture. Actually helpful, actually annoying.', future:'🎓 PhD at BITS Pilani' },
  { nick:'Queen Bee', name:'Pooja Rao', img:'https://randomuser.me/api/portraits/women/66.jpg', bio:'Led every cultural event. Could make a college fest out of a power outage.', future:'🎨 UX Design at Adobe' },
  { nick:'The Hustler', name:'Kabir Shah', img:'https://randomuser.me/api/portraits/men/77.jpg', bio:'Had 3 internships, 2 startups and 0 chill. We admire and fear him equally.', future:'🏢 Co-founding a startup' },
  { nick:'Night Owl', name:'Deepa Nair', img:'https://randomuser.me/api/portraits/women/22.jpg', bio:'Her best code was always written after midnight. A creature of the dark and git commits.', future:'☁️ Cloud Engineer at Amazon' },
  { nick:'The Comedian', name:'Sameer Joshi', img:'https://randomuser.me/api/portraits/men/11.jpg', bio:'Turned every tough moment into a joke. We laughed our way through semesters.', future:'🎤 Pursuing stand-up comedy' },
  { nick:'Miss Perfect', name:'Anjali Singh', img:'https://randomuser.me/api/portraits/women/33.jpg', bio:'Color-coded notes, 9.4 CGPA, and somehow also the kindest person in the batch.', future:'📊 Data Scientist at Infosys' },
];

function initProfiles() {
  const el = document.getElementById('profilesGrid');
  if (!el) return;
  el.innerHTML = profiles.map(p => `
    <div class="profile-card fade-in">
      <img class="profile-photo" src="${p.img}" alt="${p.nick}" loading="lazy">
      <div class="profile-info">
        <div class="profile-nick">"${p.nick}"</div>
        <div class="profile-name">${p.name}</div>
        <p class="profile-bio">${p.bio}</p>
        <div class="profile-future">${p.future}</div>
      </div>
    </div>
  `).join('');
}

// ===== QUIZ =====
const quizQuestions = [
  { q:'Which year did TechFest first have a robotics competition?', opts:['2022','2023','2024','2025'], ans:1 },
  { q:'The canteen samosa costs how much in 2026?', opts:['₹5','₹10','₹15','₹20'], ans:2 },
  { q:'Which classroom had the broken AC all four years?', opts:['Room 201','Room 305','Room 112','Room 404'], ans:2 },
  { q:'What was the batch\'s favorite exam-night snack spot?', opts:['Gupta\'s Dhaba','Metro Cafe','Night Canteen','Star Bakery'], ans:3 },
  { q:'Who organized the legendary farewell committee?', opts:['Sanya Mehta','Pooja Rao','Anjali Singh','Deepa Nair'], ans:1 },
];

let currentQ = 0, score = 0, answered = false;

function initQuiz() {
  renderQuestion();
}

function renderQuestion() {
  const container = document.getElementById('quizContent');
  if (!container) return;
  if (currentQ >= quizQuestions.length) {
    container.innerHTML = `
      <div class="quiz-result">
        <div class="big-score">${score}/${quizQuestions.length}</div>
        <p>${getScoreMsg()}</p>
        <button class="cta-btn" onclick="restartQuiz()">Play Again 🔄</button>
      </div>
    `;
    return;
  }
  const q = quizQuestions[currentQ];
  const pct = (currentQ / quizQuestions.length) * 100;
  container.innerHTML = `
    <div class="quiz-progress">
      <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
    </div>
    <div class="quiz-question">${q.q}</div>
    <div class="quiz-options">
      ${q.opts.map((o, i) => `<button class="quiz-opt" onclick="selectAnswer(${i})">${o}</button>`).join('')}
    </div>
    <div class="quiz-score">Question ${currentQ + 1} of ${quizQuestions.length} · Score: ${score}</div>
  `;
  answered = false;
}

function selectAnswer(idx) {
  if (answered) return;
  answered = true;
  const q = quizQuestions[currentQ];
  const opts = document.querySelectorAll('.quiz-opt');
  opts[q.ans].classList.add('correct');
  if (idx !== q.ans) opts[idx].classList.add('wrong');
  else score++;
  setTimeout(() => { currentQ++; renderQuestion(); }, 1200);
}

function getScoreMsg() {
  const pct = score / quizQuestions.length;
  if (pct >= 0.8) return "Batch historian! You lived every moment 🏆";
  if (pct >= 0.5) return "Not bad! You were paying attention 😄";
  return "You were bunking too much 😂 But we love you anyway!";
}

function restartQuiz() { currentQ = 0; score = 0; renderQuestion(); }

// ===== CONFETTI =====
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const pieces = [];
  const colors = ['#c9a84c','#f0d080','#fff','#ff8fa3','#69db8f','#64b5f6','#b086ff'];

  for (let i = 0; i < 200; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 10 + 4,
      h: Math.random() * 6 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 6,
      vy: Math.random() * 3 + 2,
      vx: (Math.random() - 0.5) * 3,
      opacity: 1
    });
  }

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x + p.w/2, p.y + p.h/2);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotV;
      if (p.y > canvas.height) p.opacity -= 0.02;
    });
    if (frame++ < 180) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
  showToast('🎊 Congratulations, Class of 2026!');
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in, .timeline-item').forEach(el => {
    observer.observe(el);
  });

  // Timeline staggered
  const tlObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 120);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.timeline-item').forEach(el => tlObserver.observe(el));
}

// Re-observe after dynamic renders
function reObserve() {
  document.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    observer.observe(el);
  });
}

// ===== TOAST =====
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== SECTION SCROLL OBSERVER (for nav highlight) =====
document.addEventListener('DOMContentLoaded', () => {
  // Ending section fade-in observer
  const endingObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        document.getElementById('endingContent').style.animation = 'cardReveal 1.2s ease both';
      }
    });
  }, { threshold: 0.3 });

  const endingSection = document.getElementById('ending');
  if (endingSection) endingObs.observe(endingSection);
});

// Periodic re-observation for dynamic content
setInterval(reObserve, 2000);
