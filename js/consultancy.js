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
const matcherGrid = document.getElementById('matcherGrid');

function showMatchStep(n) {
  matchSteps.forEach(s => {
    const isActive = Number(s.dataset.step) === n;
    s.classList.toggle('active', isActive);
    s.style.display = isActive ? 'block' : 'none';
  });
  // On Step 3, expand the questions panel to full width and hide the image
  if (matcherGrid) {
    matcherGrid.classList.toggle('is-result', n === 3);
  }
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

/* Recommendation engine — returns 2-3 cards based on industry + need.
   Tweak the rules below to fit how DDM triages incoming requests. */

// Catalogue of all available engagements
// link: '#' is a placeholder — replace with services/<slug>.html when service pages are built
const ENGAGEMENTS = {
  ai_integration: {
    title: 'AI integration in clinical workflows',
    desc:  'End-to-end implementation of AI in clinical practice — needs assessment, vendor evaluation, pilot validation, clinician training and post-deployment monitoring.',
    link:  '#'
  },
  expert_session: {
    title: 'Expert consultation session',
    desc:  'A lightweight, high-level advisory session with our clinicians, data scientists and digital medicine experts — ideal for strategic questions and independent academic opinion.',
    link:  '#'
  },
  education: {
    title: 'Education & briefings',
    desc:  'Bespoke briefings and workshops with our faculty on the rapidly-evolving landscape of AI and digital health, tailored to your team and use cases.',
    link:  '#'
  },
  convene: {
    title: 'Convene & connect',
    desc:  'Targeted introductions to clinicians and researchers across the University of Bern and Inselspital, designed to seed collaboration around your priorities.',
    link:  '#'
  },
  research: {
    title: 'Research partnership scoping',
    desc:  'A structured scoping conversation to identify joint research opportunities — from collaborative grant applications to co-developed clinical studies.',
    link:  '#'
  },
  regulatory: {
    title: 'Clinical, regulatory & ethical advisory',
    desc:  'Independent guidance navigating clinical evidence requirements, regulatory pathways (CE / FDA) and ethical considerations specific to digital health products.',
    link:  '#'
  },
  startup_diagnostic: {
    title: 'Start-up diagnostic',
    desc:  'A focused early-stage assessment for digital health start-ups — product/market fit, clinical validation roadmap, and engagement priorities with our faculty.',
    link:  '#'
  }
};

// Rule table: pick top 3 engagements per (industry, need) combination
function recommendCards(ind, need) {
  const cards = [];

  // Primary recommendation, always based on the need
  if (need === 'accelerate') cards.push('ai_integration', 'regulatory', 'expert_session');
  else if (need === 'navigate') cards.push('regulatory', 'ai_integration', 'expert_session');
  else if (need === 'educate')   cards.push('education', 'expert_session', 'convene');
  else if (need === 'connect')   cards.push('convene', 'research', 'expert_session');
  else if (need === 'generate')  cards.push('research', 'convene', 'expert_session');
  else cards.push('expert_session', 'education', 'convene');

  // Industry-specific overrides
  if (ind === 'startup') {
    // Insert start-up diagnostic at the front, drop the last
    if (!cards.includes('startup_diagnostic')) {
      cards.unshift('startup_diagnostic');
      cards.pop();
    }
  }
  if (ind === 'public') {
    // Public bodies often want regulatory/research-heavy support
    if (!cards.includes('regulatory') && !cards.includes('research')) {
      cards[2] = 'research';
    }
  }

  // De-dup and cap at 3
  return [...new Set(cards)].slice(0, 3).map(key => ENGAGEMENTS[key]);
}

function computeMatchResult() {
  const need = matchState.need?.value;
  const ind  = matchState.industry?.value;

  // Update the summary line at the top
  document.getElementById('resultIndustry').textContent = matchState.industry.label;
  document.getElementById('resultNeed').textContent     = matchState.need.label;

  // Build the cards
  const cards = recommendCards(ind, need);
  const grid  = document.getElementById('resultGrid');
  grid.innerHTML = cards.map(c => `
    <article class="match-result-card">
      <h3>${c.title}</h3>
      <p>${c.desc}</p>
      <a href="${c.link}" class="match-result-link">Read more &rsaquo;</a>
    </article>
  `).join('');
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
    window.location.href = `mailto:info.ddm@unibe.ch?subject=${subject}&body=${body}`;
  });
}
