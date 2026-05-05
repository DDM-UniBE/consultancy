/* ═══════════════════════════════════════════════════
   DDM Consultancy Service — Page Logic

   Modules:
     1. Matchmaker  — two-question wizard with rule-based result
     2. Mobile UI   — breadcrumb + slide-up menu (from template)
     3. RTT form    — opens mailto on submit
   ═══════════════════════════════════════════════════ */


/* ─────────────────────────────────────────────
   1. MATCHMAKER
   ───────────────────────────────────────────── */

const matchState = { industry: null, need: null };

const matchSteps = document.querySelectorAll('.match-step');

function showMatchStep(n) {
  matchSteps.forEach(s => {
    const isActive = Number(s.dataset.step) === n;
    s.classList.toggle('active', isActive);
    s.style.display = isActive ? 'block' : 'none';
  });
}

document.querySelectorAll('[data-group="industry"] .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('[data-group="industry"] .chip').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    matchState.industry = { value: chip.dataset.value, label: chip.textContent.trim() };
    setTimeout(() => showMatchStep(2), 240);
  });
});

document.querySelectorAll('[data-group="need"] .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('[data-group="need"] .chip').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    matchState.need = { value: chip.dataset.value, label: chip.textContent.trim() };
    setTimeout(() => {
      computeMatchResult();
      showMatchStep(3);
    }, 240);
  });
});

const matchBack = document.getElementById('matchBack');
if (matchBack) matchBack.addEventListener('click', () => showMatchStep(1));

const matchReset = document.getElementById('matchReset');
if (matchReset) {
  matchReset.addEventListener('click', () => {
    matchState.industry = matchState.need = null;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
    showMatchStep(1);
  });
}

/* Recommendation engine — easy to extend.
   Tweak the rules below to fit how DDM triages incoming requests. */
function computeMatchResult() {
  const need = matchState.need?.value;
  const ind  = matchState.industry?.value;

  let title = 'Expert consultation session';
  let desc  = 'A lightweight, high-level advisory session with our clinicians, data scientists and digital medicine experts — ideal for product feedback, strategic questions and independent academic opinion.';
  let link  = 'mailto:consultancy@ddm.unibe.ch?subject=Expert consultation request';

  if (need === 'accelerate' || need === 'navigate') {
    title = 'AI integration in clinical workflows';
    desc  = 'Our flagship engagement: end-to-end implementation of AI in neuroradiology, including needs assessment, vendor evaluation, pilot validation, clinician training and post-deployment monitoring.';
    link  = 'mailto:consultancy@ddm.unibe.ch?subject=AI%20integration%20enquiry';
  } else if (need === 'educate') {
    title = 'Education-focused consultancy';
    desc  = 'Bespoke briefings and workshops with our faculty on the rapidly-evolving landscape of AI and digital health, tailored to your team and use cases.';
  } else if (need === 'connect') {
    title = 'Convene & connect';
    desc  = 'A targeted introduction to clinicians and researchers across the University of Bern and Inselspital, designed to seed collaboration around your priorities.';
  } else if (need === 'generate') {
    title = 'Research partnership scoping';
    desc  = 'A structured scoping conversation to identify joint research opportunities — from collaborative grant applications to co-developed clinical studies.';
  }

  if (ind === 'startup' && (need === 'accelerate' || need === 'navigate')) {
    desc += ' For early-stage start-ups, we typically begin with a focused diagnostic session before scoping the full engagement.';
  }
  if (ind === 'public') {
    desc += ' Engagements with public bodies are scoped under our academic-independence framework, ensuring all findings remain publishable.';
  }

  document.getElementById('resultIndustry').textContent = matchState.industry.label;
  document.getElementById('resultNeed').textContent     = matchState.need.label;
  document.getElementById('resultTitle').textContent    = title;
  document.getElementById('resultDesc').textContent     = desc;
  document.getElementById('resultLink').setAttribute('href', link);
}


/* ─────────────────────────────────────────────
   2. MOBILE UI — breadcrumb + slide-up menu
   (lifted from the original template app.js)
   ───────────────────────────────────────────── */

const breadcrumbToggle = document.getElementById('breadcrumbToggle');
const breadcrumbPanel  = document.getElementById('breadcrumbPanel');
if (breadcrumbToggle && breadcrumbPanel) {
  breadcrumbToggle.addEventListener('click', () => {
    const isOpen = breadcrumbPanel.classList.toggle('open');
    breadcrumbToggle.classList.toggle('open', isOpen);
    breadcrumbToggle.setAttribute('aria-expanded', isOpen);
  });
}

const mobileMenuBtn     = document.getElementById('mobileMenuBtn');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const mobileMenuClose   = document.getElementById('mobileMenuClose');

function openMobileMenu() {
  mobileMenuOverlay.classList.add('open');
  mobileMenuOverlay.setAttribute('aria-hidden', false);
  document.body.style.overflow = 'hidden';
}
function closeMobileMenu() {
  mobileMenuOverlay.classList.remove('open');
  mobileMenuOverlay.setAttribute('aria-hidden', true);
  document.body.style.overflow = '';
}
if (mobileMenuBtn)   mobileMenuBtn.addEventListener('click', openMobileMenu);
if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMobileMenu);
if (mobileMenuOverlay) {
  mobileMenuOverlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });
}


/* ─────────────────────────────────────────────
   3. RTT CONTACT FORM — open mailto on submit
   ───────────────────────────────────────────── */

const rttSubmit = document.getElementById('rttSubmit');
if (rttSubmit) {
  rttSubmit.addEventListener('click', () => {
    const industry = document.getElementById('rttIndustry').value;
    const email    = document.getElementById('rttEmail').value;
    const subject  = encodeURIComponent(`Consultancy enquiry${industry ? ' — ' + industry : ''}`);
    const body     = encodeURIComponent(
      `Hello,\n\nI'd like to talk to your experts about: ${industry || '[area]'}\n\nMy email: ${email || '[your email]'}\n\nKind regards,`
    );
    window.location.href = `mailto:consultancy@ddm.unibe.ch?subject=${subject}&body=${body}`;
  });
}
