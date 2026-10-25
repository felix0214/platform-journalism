'use strict';
(() => {
  const $ = (s) => document.querySelector(s);
  const menu = $('.menu-toggle');
  const nav = $('#primary-nav');
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav?.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      menu.setAttribute('aria-expanded', 'false');
      menu.focus();
    }
  });
  const about = $('#about-dialog');
  document.querySelectorAll('[data-open-about]').forEach(b => b.addEventListener('click', () => about.showModal()));
  $('[data-close-about]')?.addEventListener('click', () => about.close());
  about?.addEventListener('click', e => { if (e.target === about) { const r = about.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) about.close(); } });
  document.querySelectorAll('[data-print]').forEach(b => b.addEventListener('click', () => window.print()));
  const sectionLinks = [...document.querySelectorAll('.aside-sticky nav a, .tool-tabs a')];
  const sections = sectionLinks.map(link => ({ link, target: document.querySelector(link.getAttribute('href')) })).filter(item => item.target);
  let sectionFrame = false;
  function updateSection() {
    sectionFrame = false;
    if (!sections.length) return;
    let active = sections[0];
    for (const item of sections) {
      if (item.target.getBoundingClientRect().top <= 160) active = item;
    }
    for (const item of sections) {
      if (item === active) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    }
  }
  if (sections.length) {
    addEventListener('scroll', () => {
      if (!sectionFrame) { sectionFrame = true; requestAnimationFrame(updateSection); }
    }, { passive: true });
    addEventListener('resize', updateSection);
    updateSection();
  }
  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 4500);
  }
  const form = $('#eligibility-form');
  const result = $('#eligibility-result');
  let currentResult = null;
  form?.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form).entries());
    currentResult = PlatformGuide.getPathway(values);
    $('#result-title').textContent = currentResult.title;
    $('#result-summary').textContent = currentResult.summary;
    $('#result-steps').replaceChildren(...currentResult.steps.map(text => {
      const li = document.createElement('li'); li.textContent = text; return li;
    }));
    $('#copy-fallback').hidden = true;
    result.hidden = false;
    result.dataset.pathway = currentResult.id;
    result.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
  });
  function clearResult() {
    result.hidden = true;
    currentResult = null;
    $('#copy-fallback').hidden = true;
  }
  form?.addEventListener('reset', clearResult);
  form?.addEventListener('change', clearResult);
  $('#copy-result')?.addEventListener('click', async () => {
    if (!currentResult) return;
    const content = ['PLATFORM — Your next step', currentResult.title, currentResult.summary, ...currentResult.steps.map((t, i) => `${i + 1}. ${t}`), 'Guide only. Confirm eligibility with your institution and Transport for NSW.', 'Information checked 19 October 2026.', 'https://transportnsw.info/tickets-fares/eligibility-concessions/tertiary-tafe-students'].join('\n\n');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(content);
      toast('Checklist copied. Keep it for your next enquiry.');
    } catch {
      const fallback = $('#copy-fallback');
      fallback.value = content;
      fallback.hidden = false;
      fallback.focus(); fallback.select();
      toast('Select and copy the checklist in the text box.');
    }
  });
  const range = $('#weeks');
  const money = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });
  function updateCaps() {
    const totals = PlatformGuide.compareCaps(Number(range.value));
    const phrase = `${totals.weeks} ${totals.weeks === 1 ? 'week' : 'weeks'}`;
    $('#weeks-output').textContent = phrase;
    range.setAttribute('aria-valuetext', phrase);
    $('#adult-total').textContent = money.format(totals.adult);
    $('#concession-total').textContent = money.format(totals.concession);
    $('#gap-total').textContent = money.format(totals.difference);
    $('#gap-caption').textContent = `Difference across ${totals.weeks} capped ${totals.weeks === 1 ? 'week' : 'weeks'}`;
  }
  if (range) { range.addEventListener('input', updateCaps); updateCaps(); }
})();
