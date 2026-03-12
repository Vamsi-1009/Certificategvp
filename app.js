'use strict';

/* ── Game data ── */
const GAMES = [
  { name:'AI Puzzle',        icon:'🧠', desc:'Solve intricate AI-based puzzles and logic chains under time pressure.',  tag:'Problem Solving' },
  { name:'Memory Challenge', icon:'🔮', desc:'Test pattern memory and cognitive recall with rapid-fire sequences.',      tag:'Cognitive'       },
  { name:'Tech Quiz',        icon:'💡', desc:'Answer cutting-edge questions across AI, CS, and emerging technology.',    tag:'Knowledge'       },
  { name:'Prompt Battle',    icon:'⚡', desc:'Craft the most creative and effective AI prompts to win the crowd.',       tag:'Creativity'      },
  { name:'Logic Builder',    icon:'🔧', desc:'Construct logical systems and algorithmic pipelines under pressure.',      tag:'Engineering'     },
  { name:'Code Sprint',      icon:'🖥️', desc:'Write elegant, efficient code to solve problems in the shortest time.',   tag:'Coding'          },
];

/* ── App state ── */
const APP = { game: null, photo: null, cert: null };
const CERT_BASE_URL = 'https://aikaryashala.com/gvp/stall/certificates/';

/* ── Cloud DB (Supabase) ── */
const SUPABASE_URL = window.CONFIG?.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = window.CONFIG?.SUPABASE_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = window.supabase && SUPABASE_URL !== 'YOUR_SUPABASE_URL' 
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

/* ── Storage ── */
const DB = {
  get()    { try { return JSON.parse(localStorage.getItem('aik_certs') || '[]'); } catch { return []; } },
  save(a)  { 
    try {
      localStorage.setItem('aik_certs', JSON.stringify(a)); 
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        // Storage full: remove oldest 10 records and try again
        if (a.length > 10) {
          const reduced = a.slice(10);
          localStorage.setItem('aik_certs', JSON.stringify(reduced));
          toast('Storage full. Auto-cleared oldest 10 records.', 'err');
        } else {
          toast('Storage limit reached. Please clear winners wall manually.', 'err');
        }
      }
    }
  },
  add(c)   { const a = DB.get(); a.push(c); DB.save(a); DB.sync(c); },
  clear()  { localStorage.removeItem('aik_certs'); localStorage.removeItem('aik_n'); },
  nextId() {
    const n = (parseInt(localStorage.getItem('aik_n') || '0', 10)) + 1;
    localStorage.setItem('aik_n', String(n));
    return `AIK-GVPC-25${String(n).padStart(3, '0')}`;
  },
  async sync(c) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('certificates').insert([
        { cert_id: c.certificateId, name: c.participantName, game: c.gameName, roll: c.rollNumber, phone: c.phoneNumber, dept: c.department, pos: c.position, dt: c.date, photo: c.photo }
      ]);
      if (error) console.error('Cloud sync failed:', error);
    } catch(e) { console.error('Cloud sync error:', e); }
  },
  async fetch(id) {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from('certificates').select('*').eq('cert_id', id).single();
      if (error || !data) return null;
      return { id: data.cert_id, n: data.name, g: data.game, id_raw: data.cert_id, p: data.pos, dt: data.dt, d: data.dept, photo: data.photo };
    } catch(e) { return null; }
  },
};

/* ── Helpers ── */
const fmtDate = () => new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
const val     = id => (document.getElementById(id)?.value || '').trim();
const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

/* ── Image Compression ── */
async function compressImage(base64, maxWidth = 800, maxHeight = 1000, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
      } else {
        if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
  });
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const certId = params.get('id');
  const hash   = window.location.hash;

  if (certId) {
    showLoader('Verifying Certificate...');
    const data = await DB.fetch(certId);
    hideLoader();
    if (data) return showVerifyMode(data);
    else toast('Certificate not found or invalid.', 'err');
  }

  if (hash.startsWith('#verify=')) {
    try {
      const payload = JSON.parse(decodeURIComponent(escape(atob(hash.slice(8)))));
      showVerifyMode(payload);
      return;
    } catch(e) { console.warn('Invalid verify payload', e); }
  }

  renderGames();
  countUp('m-certs', DB.get().length);
});

/* ── Verify mode: render certificate from QR scan data ── */
function showVerifyMode(d) {
  // Hide app shell, show a standalone certificate page
  document.querySelector('.nav').style.display = 'none';
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');

  // Look up photo from localStorage if available
  const stored = DB.get().find(c => c.certificateId === d.id);
  const photo  = stored?.photo || null;

  const verifyEl = document.createElement('div');
  verifyEl.id = 'verify-page';
  verifyEl.style.cssText = 'min-height:100vh;background:#0B0D14;display:flex;flex-direction:column;align-items:center;padding:32px 16px 48px;';

  verifyEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
      <svg viewBox="0 0 40 40" width="32" height="32"><polygon points="20,2 38,11 38,29 20,38 2,29 2,11" fill="none" stroke="#C9A84C" stroke-width="2"/><polygon points="20,10 30,15 30,25 20,30 10,25 10,15" fill="#C9A84C" opacity=".4"/></svg>
      <div>
        <div style="font-size:.9rem;font-weight:800;letter-spacing:.1em;color:#fff;">AIKARYASHALA</div>
        <div style="font-size:.65rem;color:#7A7F96;letter-spacing:.08em;">Certificate Verification</div>
      </div>
      <div style="margin-left:auto;display:flex;align-items:center;gap:6px;background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.25);padding:5px 12px;border-radius:50px;">
        <span style="width:7px;height:7px;border-radius:50%;background:#4ade80;display:inline-block;"></span>
        <span style="font-size:.72rem;color:#4ade80;font-weight:700;">VERIFIED</span>
      </div>
    </div>

    <div id="verify-cert" style="
      position:relative; width:920px; max-width:100%;
      background:#F8F3E8; color:#1C1408; border-radius:4px; overflow:hidden;
      box-shadow:0 48px 100px rgba(0,0,0,.7),0 0 0 1px rgba(201,168,76,.3);
      font-family:'Syne',sans-serif;
      transition: transform .3s ease; transform-origin: top center;
    ">
      <!-- Corner brackets -->
      <div style="position:absolute;top:10px;left:10px;width:40px;height:40px;border-top:2px solid #C9A84C;border-left:2px solid #C9A84C;z-index:20;"></div>
      <div style="position:absolute;top:10px;right:10px;width:40px;height:40px;border-top:2px solid #C9A84C;border-right:2px solid #C9A84C;z-index:20;"></div>
      <div style="position:absolute;bottom:10px;left:10px;width:40px;height:40px;border-bottom:2px solid #C9A84C;border-left:2px solid #C9A84C;z-index:20;"></div>
      <div style="position:absolute;bottom:10px;right:10px;width:40px;height:40px;border-bottom:2px solid #C9A84C;border-right:2px solid #C9A84C;z-index:20;"></div>
      <!-- Inner frame -->
      <div style="position:absolute;inset:10px;border:.5px solid rgba(201,168,76,.22);pointer-events:none;z-index:19;"></div>
      <!-- Watermark -->
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-28deg);font-family:'Playfair Display',serif;font-size:7rem;font-weight:900;color:rgba(201,168,76,.04);letter-spacing:.18em;white-space:nowrap;pointer-events:none;z-index:1;user-select:none;">AIKARYASHALA</div>

      <!-- Header -->
      <div style="position:relative;z-index:5;display:flex;align-items:center;justify-content:space-between;padding:20px 36px 18px;background:linear-gradient(135deg,#07080D 0%,#10131C 40%,#1a1f30 100%);border-bottom:3px solid #C9A84C;">
        <div style="display:flex;align-items:center;gap:16px;">
          <svg viewBox="0 0 40 40" width="38" height="38"><polygon points="20,2 38,11 38,29 20,38 2,29 2,11" fill="none" stroke="#C9A84C" stroke-width="2"/><polygon points="20,10 30,15 30,25 20,30 10,25 10,15" fill="#C9A84C" opacity=".4"/></svg>
          <div>
            <div style="font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:900;color:#C9A84C;letter-spacing:.1em;">AIKARYASHALA</div>
            <div style="font-size:.7rem;color:rgba(255,255,255,.45);letter-spacing:.05em;margin-top:3px;">Innovation &amp; AI Learning Platform</div>
            <div style="font-size:.65rem;color:rgba(255,255,255,.3);margin-top:2px;">GVPC Engineering College, Visakhapatnam</div>
          </div>
        </div>
        <div style="text-align:center;border:1.5px solid rgba(201,168,76,.35);border-radius:8px;padding:8px 16px;background:rgba(201,168,76,.06);">
          <div style="font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:700;color:#C9A84C;line-height:1;">2026</div>
          <div style="font-size:.6rem;color:rgba(255,255,255,.35);letter-spacing:.1em;margin-top:2px;">Event</div>
        </div>
      </div>

      <!-- Title band -->
      <div style="position:relative;z-index:5;display:flex;align-items:center;gap:16px;padding:10px 36px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.08),rgba(201,168,76,.14),rgba(201,168,76,.08),transparent);">
        <div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.35),transparent);"></div>
        <div style="font-size:.7rem;letter-spacing:.26em;text-transform:uppercase;color:#8B6914;font-weight:700;white-space:nowrap;">CERTIFICATE &nbsp;OF&nbsp; ACHIEVEMENT</div>
        <div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.35),transparent);"></div>
      </div>

      <!-- Body -->
      <div style="position:relative;z-index:5;display:flex;gap:28px;padding:24px 36px 20px;background:linear-gradient(155deg,#fffef9 0%,#faf4e2 50%,#f3e9cc 100%);align-items:center;">
        <!-- Left col -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:12px;flex-shrink:0;width:150px;">
          <div style="width:145px;height:172px;border:3px solid #C9A84C;border-radius:5px;overflow:hidden;background:#e8dfc8;box-shadow:0 6px 22px rgba(201,168,76,.2);display:flex;align-items:center;justify-content:center;">
            ${photo
              ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;display:block;" alt=""/>`
              : `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.5" opacity=".5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
            }
          </div>
          <div style="background:#07080D;color:#E8C462;font-family:'JetBrains Mono',monospace;font-size:.6rem;letter-spacing:.08em;padding:4px 9px;border-radius:3px;border:1px solid rgba(201,168,76,.25);white-space:nowrap;">${d.id}</div>
        </div>
        <!-- Right col -->
        <div style="flex:1;display:flex;flex-direction:column;gap:9px;align-items:center;text-align:center;">
          <p style="font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:#7a6030;font-weight:600;">This is to proudly certify that</p>
          <h2 style="font-family:'Playfair Display',serif;font-size:2.1rem;font-weight:900;line-height:1.06;color:#0F0A02;border-bottom:2px solid rgba(201,168,76,.3);padding-bottom:8px;width:100%">${d.n}</h2>

          <div style="font-size:.8rem;color:#42331a;line-height:1.76;background:rgba(201,168,76,0.04);padding:10px 20px;border-radius:8px;width:100%;">
            <p>has successfully participated and demonstrated exceptional performance in the</p>
            <div style="display:inline-block;margin:4px 0;padding:4px 16px;border-radius:4px;background:linear-gradient(135deg,#C9A84C,#A07010);color:#fff;font-weight:700;font-size:.88rem;letter-spacing:.04em;">${d.g}</div>
            <p>event, conducted as part of the</p>
            <p><strong>AIKARYASHALA Innovation &amp; AI Challenge</strong></p>
            <p>at <strong>${d.d || 'GVPC Engineering College, Visakhapatnam'}</strong></p>
          </div>
          <div style="display:inline-flex;align-self:center;">
            <div style="display:flex;align-items:center;padding:6px 18px;border-radius:50px;background:linear-gradient(135deg,#07080D,#10131C);border:1px solid rgba(201,168,76,.35);font-size:.78rem;font-weight:700;color:#E8C462;letter-spacing:.07em;">${d.p}</div>
          </div>
          <div style="display:flex;align-items:center;justify-content:center;gap:0;margin-top:4px;width:100%;">
            <div style="display:flex;flex-direction:column;gap:2px;align-items:center;">
              <span style="font-size:.62rem;text-transform:uppercase;letter-spacing:.1em;color:#9a7a40;">DATE OF ISSUE</span>
              <span style="font-size:.8rem;font-weight:600;color:#1C1408;">${d.dt}</span>
            </div>
            <div style="width:1px;height:36px;background:rgba(201,168,76,.2);margin:0 20px;"></div>
            <div style="display:flex;flex-direction:column;gap:2px;">
              <span style="font-size:.62rem;text-transform:uppercase;letter-spacing:.1em;color:#9a7a40;">CERTIFICATE ID</span>
              <span style="font-size:.75rem;font-weight:600;color:#1C1408;font-family:'JetBrains Mono',monospace;letter-spacing:.04em;">${d.id}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="position:relative;z-index:5;display:flex;align-items:flex-end;justify-content:space-between;padding:14px 36px 26px;background:linear-gradient(to bottom,#f8f0d8,#edddb0);border-top:1px solid rgba(201,168,76,.2);">
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          <div style="font-family:'Playfair Display',serif;font-style:italic;font-size:1rem;color:rgba(50,35,10,.5);margin-bottom:2px;">Coordinator</div>
          <div style="width:130px;border-top:1.5px solid #9a7a40;margin-bottom:5px;"></div>
          <div style="font-size:.65rem;color:#7a6030;letter-spacing:.09em;text-transform:uppercase;">Event Coordinator</div>
          <div style="font-family:'Playfair Display',serif;font-size:.82rem;color:#1C1408;font-weight:700;">AIKARYASHALA</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:5px;">
          <div id="verify-qr"></div>
          <span style="font-size:.58rem;color:#9a7e40;letter-spacing:.1em;text-transform:uppercase;">Scan to Verify</span>
        </div>
      </div>
    </div>

    <button onclick="window.location.href=window.location.href.split('#')[0]"
      style="margin-top:24px;display:flex;align-items:center;gap:8px;padding:12px 24px;border-radius:50px;background:linear-gradient(135deg,#C9A84C,#8B6914);color:#07080D;font-family:'Syne',sans-serif;font-weight:700;font-size:.85rem;border:none;cursor:pointer;box-shadow:0 6px 22px rgba(201,168,76,.3);">
      ← Back to Certificate System
    </button>
  `;

  document.body.appendChild(verifyEl);

  // Responsive scaling for verify certificate
  const updateVerifyScale = () => {
    const cert = document.getElementById('verify-cert');
    if (!cert) return;
    if (window.innerWidth < 960) {
      const scale = (window.innerWidth - 32) / 920;
      cert.style.transform = `translateX(-50%) scale(${scale})`;
      cert.style.marginTop = '0';
      // Adjust container height to avoid clipping or excessive space
      // Base height is ~650px, but it fluctuates with text. offsetHeight is best.
      verifyEl.style.height = `${cert.offsetHeight * scale + 120}px`;
    } else {
      cert.style.transform = 'none';
      cert.style.left = 'auto'; // Reset if needed
      cert.style.transform = 'none';
      verifyEl.style.height = 'auto';
    }
  };

  window.addEventListener('resize', updateVerifyScale);
  updateVerifyScale();

  // Draw QR on the verify page (same payload, so scanning again shows same page)
  setTimeout(() => {
    drawQR('verify-qr', window.location.href, 72);
    // Recalculate height after QR is drawn as it might change offsetHeight
    setTimeout(updateVerifyScale, 50);
  }, 100);
}

/* ── Navigation ── */
function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) { el.classList.add('active'); window.scrollTo({ top:0, behavior:'smooth' }); }
  if (page === 'landing') countUp('m-certs', DB.get().length);
  if (page === 'winners') renderWall();
}

/* ── Count-up ── */
function countUp(id, target) {
  const el = document.getElementById(id); if (!el) return;
  let cur = 0;
  const step = Math.max(1, Math.ceil(target / 28));
  const t = setInterval(() => { cur = Math.min(cur + step, target); el.textContent = cur; if (cur >= target) clearInterval(t); }, 30);
}

/* ── Render games ── */
function renderGames() {
  const grid = document.getElementById('games-grid'); if (!grid) return;
  grid.innerHTML = GAMES.map(g => `
    <div class="game-card" onclick="selectGame('${g.name.replace(/'/g,"\\'")}')">
      <div class="gc-top">
        <span class="gc-icon">${g.icon}</span>
        <span class="gc-arrow"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
      </div>
      <div class="gc-name">${g.name}</div>
      <div class="gc-desc">${g.desc}</div>
      <span class="gc-tag">${g.tag}</span>
    </div>`).join('');
}

/* ── Select game ── */
function selectGame(name) {
  APP.game = name; APP.photo = null;
  ['inp-name','inp-roll','inp-phone','inp-dept'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const pos = document.getElementById('inp-pos'); if (pos) pos.selectedIndex = 0;
  const img = document.getElementById('photo-img'), ph = document.getElementById('photo-empty-state'), drop = document.getElementById('photo-drop');
  if (img)  { img.src = ''; img.style.display = 'none'; }
  if (ph)   ph.style.display = 'flex';
  if (drop) drop.classList.remove('has-photo');
  const chip = document.getElementById('selected-game-chip'); if (chip) chip.textContent = name;
  goTo('register');
}

/* ── Photo handler ── */
async function handlePhoto(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = async ev => {
    // Compress image before storing
    APP.photo = await compressImage(ev.target.result);
    
    const img = document.getElementById('photo-img'), ph = document.getElementById('photo-empty-state'), drop = document.getElementById('photo-drop');
    if (img)  { img.src = APP.photo; img.style.display = 'block'; }
    if (ph)   ph.style.display = 'none';
    if (drop) drop.classList.add('has-photo');
  };
  reader.readAsDataURL(file); e.target.value = '';
}

/* ── Generate certificate ── */
function generateCertificate() {
  const name = val('inp-name'), roll = val('inp-roll'), phone = val('inp-phone'), dept = val('inp-dept');
  const pos  = document.getElementById('inp-pos')?.value || 'Participant';
  if (!name) return toast('Please enter participant name.', 'err');
  if (!roll) return toast('Please enter roll number.', 'err');
  const id = DB.nextId(), date = fmtDate();
  setText('c-name', name);
  setText('c-game', APP.game || 'Event'); setText('c-date', date);
  setText('c-cert-id', id); setText('c-id', id); setText('cert-id-nav', id);
  const posEl = document.getElementById('c-position'); if (posEl) posEl.textContent = pos;
  const deptEl = document.getElementById('c-dept-line');
  if (deptEl) deptEl.innerHTML = dept ? `at <strong>${dept}</strong>` : `at <strong>GVPC Engineering College, Visakhapatnam</strong>`;
  const cPhoto = document.getElementById('c-photo'), cPh = document.getElementById('c-photo-ph');
  if (APP.photo) {
    if (cPhoto) { cPhoto.src = APP.photo; cPhoto.style.display = 'block'; }
    if (cPh)    cPh.style.display = 'none';
  } else {
    if (cPhoto) cPhoto.style.display = 'none';
    if (cPh)    cPh.style.display = 'flex';
  }
  const record = { id:Date.now()+'', participantName:name, rollNumber:roll, phoneNumber:phone, department:dept, gameName:APP.game, photo:APP.photo||null, certificateId:id, position:pos, date };
  DB.add(record); APP.cert = record;

  function buildAndDrawQR() {
    const photoHTML = CertificateTemplate.getPhotoHTML();
    const certHTML = CertificateTemplate.getBaseHTML({
        id, name, 
        game: APP.game || 'Event', 
        position: pos, 
        date_str: date, 
        dept_display: dept || 'GVPC Engineering College, Visakhapatnam', 
        photoHTML
    });

    const certUrl = `${CERT_BASE_URL}${id}`;
    const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(certHTML);
    // User requested QR with unique ID URL
    drawQR('cert-qr-canvas', certUrl, 80);
  }

  buildAndDrawQR();
  goTo('certificate'); 
  toast('Certificate generated successfully!', 'ok');
}

/* ── WhatsApp Sharing ── */
function shareWhatsApp() {
  if (!APP.cert) return toast('No certificate found to share.', 'err');
  const { participantName, gameName, certificateId, phoneNumber } = APP.cert;
  const certUrl = `${CERT_BASE_URL}${certificateId}`;
  const message = `Congratulations *${participantName}*! Your AIKARYASHALA Certificate for *${gameName}* is ready. View/Verify here: ${certUrl}`;
  
  // Use provided phone number if available, otherwise just open WA
  const waUrl = phoneNumber 
    ? `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;
    
  window.open(waUrl, '_blank');
}

/* ── QR renderer ── */
function drawQR(containerId, text, size) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  try {
    new QRCode(container, {
      text:         text,
      width:        size,
      height:       size,
      colorDark:    '#07080D',
      colorLight:   '#ffffff',
      correctLevel: QRCode.CorrectLevel.M,
    });
    setTimeout(() => {
      const c = container.querySelector('canvas');
      const i = container.querySelector('img');
      if (c) c.style.cssText = 'display:block;border-radius:4px;';
      if (i) i.style.display = 'none'; // Hide the img version to avoid duplication
    }, 60);
  } catch(e) {
    console.error('QR generation failed:', e);
  }
}

/* ── Download PDF ── */
async function downloadPDF() {
  if (!window.html2canvas||!window.jspdf) return toast('Libraries loading, try again shortly.','err');
  showLoader('Generating PDF…');
  try {
    const canvas = await html2canvas(document.getElementById('certificate-el'),{scale:2,useCORS:true,allowTaint:true,backgroundColor:'#F8F3E8',logging:false});
    const {jsPDF}=window.jspdf, w=canvas.width/2, h=canvas.height/2;
    const pdf=new jsPDF({orientation:'landscape',unit:'px',format:[w,h]});
    pdf.addImage(canvas.toDataURL('image/jpeg',.96),'JPEG',0,0,w,h);
    pdf.save(`AIK-Cert-${APP.cert?.certificateId||'download'}.pdf`);
    toast('PDF downloaded!','ok');
  } catch(e) { console.error(e); toast('PDF failed — try Save as Image.','err'); }
  hideLoader();
}

/* ── Download Image ── */
async function downloadImage() {
  if (!window.html2canvas) return toast('Library loading, try again shortly.','err');
  showLoader('Saving image…');
  try {
    const canvas = await html2canvas(document.getElementById('certificate-el'),{scale:2,useCORS:true,allowTaint:true,backgroundColor:'#F8F3E8',logging:false});
    const a=document.createElement('a');
    a.download=`AIK-Cert-${APP.cert?.certificateId||'certificate'}.jpg`;
    a.href=canvas.toDataURL('image/jpeg',.96); a.click();
    toast('Image saved!','ok');
  } catch(e) { console.error(e); toast('Save failed.','err'); }
  hideLoader();
}

/* ── Winners wall ── */
function renderWall(filter='') {
  const all=DB.get(), grid=document.getElementById('wall-grid'), empty=document.getElementById('wall-empty'), countEl=document.getElementById('wall-count');
  const q=filter.toLowerCase();
  const filtered=q?all.filter(c=>c.participantName.toLowerCase().includes(q)||c.gameName.toLowerCase().includes(q)||(c.rollNumber||'').toLowerCase().includes(q)):all;
  if (countEl) countEl.textContent=`${filtered.length} record${filtered.length!==1?'s':''}`;
  if (filtered.length===0) { grid.innerHTML=''; empty.style.display='flex'; return; }
  empty.style.display='none';
  grid.innerHTML=[...filtered].reverse().map(c=>`
    <div class="winner-card">
      <div class="wc-photo">${c.photo?`<img src="${c.photo}" alt="${c.participantName}"/>`:'👤'}</div>
      <div class="wc-body">
        <div class="wc-name">${c.participantName}</div>
        <div class="wc-game">${c.gameName}</div>
        <div class="wc-roll">${c.rollNumber} &nbsp;·&nbsp; ${c.date}</div>
        <span class="wc-pos">${c.position||'Participant'}</span>
      </div>
    </div>`).join('');
}

function filterWall() { renderWall((document.getElementById('wall-search')?.value||'').trim()); }

function clearAll() {
  if (!confirm('Delete all certificate records? This cannot be undone.')) return;
  DB.clear(); renderWall(); toast('All records cleared.','ok');
}

/* ── Toast ── */
let _tt=null;
function toast(msg,type='') {
  const el=document.getElementById('toast');
  el.textContent=msg; el.className=`toast ${type} show`;
  clearTimeout(_tt); _tt=setTimeout(()=>el.classList.remove('show'),3200);
}

/* ── Loader ── */
function showLoader(msg='Please wait…') { document.getElementById('loader-text').textContent=msg; document.getElementById('loader').style.display='flex'; }
function hideLoader() { document.getElementById('loader').style.display='none'; }
