// ============================================================================
//  track.js — thu thập hành vi (ẩn danh) → Firestore + GA4, cập nhật widget public.
//  Guard bằng ENABLED: chưa dán config thì không làm gì (site vẫn chạy).
// ============================================================================
import { firebaseConfig, ENABLED } from './firebase-config.js';

if (ENABLED) {
  const V = '10.12.2';
  const [{ initializeApp }, fs, an] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-analytics.js`),
  ]);
  const app = initializeApp(firebaseConfig);
  const db = fs.getFirestore(app);
  let ga = null;
  try { if (firebaseConfig.measurementId && !firebaseConfig.measurementId.startsWith('G-PASTE')) ga = an.getAnalytics(app); } catch (e) {}

  const { collection, addDoc, doc, setDoc, getDoc, increment, serverTimestamp } = fs;

  // --- context ẩn danh ---
  const lang = location.pathname.includes('/en/') ? 'en' : 'vi';
  let sid = '';
  try { sid = sessionStorage.getItem('pf_sid') || (Math.random().toString(36).slice(2) + Date.now().toString(36)); sessionStorage.setItem('pf_sid', sid); } catch (e) { sid = 'anon'; }
  const device = matchMedia('(max-width:760px)').matches ? 'mobile' : 'desktop';

  // --- ghi 1 event ---
  function track(type, detail = {}) {
    try {
      addDoc(collection(db, 'events'), {
        type, detail, sid, lang, path: location.pathname, ts: serverTimestamp(),
      }).catch(() => {});
      if (ga) an.logEvent(ga, type, { ...detail, lang });
    } catch (e) {}
  }

  // --- counter public (read-all, increment-only) ---
  const counterRef = doc(db, 'public_stats', 'counters');
  function bump(field) {
    try { setDoc(counterRef, { [field]: increment(1), updated: serverTimestamp() }, { merge: true }).catch(() => {}); } catch (e) {}
  }

  // --- page view (mỗi phiên đếm 1 lượt xem cho widget) ---
  const firstThisSession = !sessionStorage.getItem('pf_seen');
  try { sessionStorage.setItem('pf_seen', '1'); } catch (e) {}
  track('page_view', {
    referrer: document.referrer || 'direct',
    device, screen: `${screen.width}x${screen.height}`,
    ua: navigator.userAgent.slice(0, 120),
  });
  if (firstThisSession) bump('views');

  // --- cập nhật widget "lượt xem / tương tác" ---
  async function paintWidget() {
    const el = document.getElementById('pf-stats');
    if (!el) return;
    try {
      const s = await getDoc(counterRef);
      const d = s.exists() ? s.data() : {};
      const v = d.views || 0, i = d.interactions || 0;
      el.textContent = `${v.toLocaleString()} lượt xem · ${i.toLocaleString()} tương tác`;
      el.removeAttribute('hidden');
    } catch (e) {}
  }
  paintWidget();

  // --- click: phân loại theo href/nội dung (không cần gắn data-* mọi nơi) ---
  let interacted = false;
  addEventListener('click', (e) => {
    const a = e.target.closest('a, button');
    if (!a) return;
    const href = (a.getAttribute('href') || '').toLowerCase();
    const text = (a.textContent || '').trim().slice(0, 40);
    let kind = 'click';
    if (a.download || href.endsWith('.pdf')) kind = 'cv_download';
    else if (href.includes('onrender.com')) kind = 'live_demo';
    else if (href.includes('github.com')) kind = 'github';
    else if (href.startsWith('mailto:')) kind = 'email';
    else if (href.startsWith('tel:')) kind = 'phone';
    else if (href.includes('linkedin')) kind = 'linkedin';
    else if (href === 'en/' || href === '../' || href.endsWith('/en/')) kind = 'lang_switch';
    else if (a.id === 'themeToggle') kind = 'theme_toggle';
    else if (a.closest('.proj')) { kind = 'project_click'; }
    // tên dự án nếu bấm trong card
    const proj = a.closest('.proj')?.querySelector('h3')?.textContent?.trim()?.slice(0, 40);
    track(kind, { text, href: href.slice(0, 80), project: proj || null });
    if (!interacted && kind !== 'click') { interacted = true; bump('interactions'); }
  }, { capture: true });

  // --- section nào được xem (IntersectionObserver) ---
  const seen = new Set();
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((en) => {
        if (!en.isIntersecting) return;
        const id = en.target.id || en.target.querySelector('h2')?.textContent?.trim()?.slice(0, 30) || 'section';
        if (seen.has(id)) return; seen.add(id);
        track('section_view', { section: id });
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('section').forEach((s) => io.observe(s));
  }

  // --- độ sâu cuộn (mốc 25/50/75/100) + thời gian ở trang ---
  const t0 = Date.now();
  let maxDepth = 0; const marks = new Set();
  addEventListener('scroll', () => {
    const d = Math.round(((scrollY + innerHeight) / document.body.scrollHeight) * 100);
    maxDepth = Math.max(maxDepth, d);
    [25, 50, 75, 100].forEach((m) => { if (d >= m && !marks.has(m)) { marks.add(m); track('scroll_depth', { depth: m }); } });
  }, { passive: true });

  let sent = false;
  function sendDwell() {
    if (sent) return; sent = true;
    track('engagement', { seconds: Math.round((Date.now() - t0) / 1000), max_scroll: maxDepth, sections: seen.size });
  }
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') sendDwell(); });
  addEventListener('pagehide', sendDwell);
}
