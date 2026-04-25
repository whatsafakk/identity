'use strict';

// ── CONSTANTS ────────────────────────────────────────────

const STORAGE_KEY = 'fashion-identity-communication-tool';
const HISTORY_MAX = 50;

const CORE_CATEGORIES = ['Form', 'Silhouette', 'Farbe', 'Material', 'Detail', 'Sprache', 'Gender', 'Kontext', 'Symbolik'];

const EFFECT_GROUPS = [
  { name: 'Energie / Bewegung', color: '#E6C84F', effects: ['dynamisch', 'ruhig', 'energisch', 'passiv', 'lebendig', 'statisch', 'nervös', 'fließend', 'laut', 'spannend', 'beweglich', 'aktiv', 'direkt', 'präsent'] },
  { name: 'Stärke / Macht', color: '#B74A3A', effects: ['dominant', 'schwach', 'autoritär', 'kontrolliert', 'kontrollverlust', 'kraftvoll', 'fragil', 'stabil', 'aggressiv', 'bedrohlich', 'stark', 'macht', 'kontrolle', 'disziplin', 'restriktiv'] },
  { name: 'Emotionalität', color: '#D889A0', effects: ['emotional', 'distanziert', 'warm', 'kalt', 'leidenschaftlich', 'neutral', 'sensibel', 'hart', 'weich', 'freundlich', 'harmonisch', 'intuitiv', 'ausgeglichen', 'gemütlich'] },
  { name: 'Sozial', color: '#6FAF8E', effects: ['zugänglich', 'unnahbar', 'offen', 'verschlossen', 'einladend', 'abweisend', 'vertrauenswürdig', 'ehrlich', 'authentisch', 'zugehörigkeit', 'identität', 'abgrenzung'] },
  { name: 'Ästhetik', color: '#8D7CC3', effects: ['elegant', 'roh', 'minimalistisch', 'komplex', 'verspielt', 'reduziert', 'dekorativ', 'schlicht', 'klar', 'rein', 'subtil', 'rhythmisch', 'klassisch', 'konstruiert', 'körperbetont', 'feminin'] },
  { name: 'Identität / Haltung', color: '#5F8FBF', effects: ['rebellisch', 'angepasst', 'individuell', 'konform', 'progressiv', 'traditionell', 'experimentell', 'konservativ', 'konzeptionell', 'disruptiv', 'intellektuell', 'subkulturell', 'modern', 'avantgarde', 'lässig', 'nonchalant', 'kreativ'] },
  { name: 'Körper / Sexualität', color: '#C77952', effects: ['sexy', 'zurückhaltend', 'provokativ', 'unschuldig', 'verletzlich', 'dominant-sexuell', 'sexualisiert', 'durchlässig', 'extrem'] },
  { name: 'Status / Wert', color: '#B99A45', effects: ['luxuriös', 'einfach', 'hochwertig', 'billig', 'elitär', 'alltäglich', 'prestigereich', 'status', 'kommerziell', 'exklusiv', 'professionell', 'seriös'] },
  { name: 'Natur / Technik', color: '#6E9F9A', effects: ['natürlich', 'künstlich', 'technisch', 'organisch', 'futuristisch', 'archaisch', 'funktional', 'sportlich', 'praktisch', 'robust', 'leistungsorientiert', 'struktur', 'fortschritt', 'vision', 'utilitaristisch', 'amerikanisch', 'alltag'] }
];

const STARTER_ELEMENTS = [
  { category: 'Form', name: 'Spitz', effects: ['aggressiv', 'dynamisch', 'dominant', 'bedrohlich'] },
  { category: 'Form', name: 'Rund', effects: ['weich', 'freundlich', 'harmonisch', 'zugänglich'] },
  { category: 'Form', name: 'Kantig', effects: ['hart', 'rational', 'kontrolliert', 'stark'] },
  { category: 'Form', name: 'Organisch', effects: ['natürlich', 'lebendig', 'intuitiv', 'ruhig'] },
  { category: 'Form', name: 'Geometrisch', effects: ['konstruiert', 'technisch', 'kalt', 'strukturiert'] },
  { category: 'Silhouette', name: 'Oversized', effects: ['lässig', 'nonchalant', 'distanziert', 'modern'] },
  { category: 'Silhouette', name: 'Eng / Körpernah', effects: ['sexy', 'direkt', 'verletzlich', 'präsent'] },
  { category: 'Silhouette', name: 'Boxy', effects: ['neutral', 'reduziert', 'stabil', 'minimalistisch'] },
  { category: 'Silhouette', name: 'Tailored / Maßgeschneidert', effects: ['kontrolliert', 'präzise', 'seriös', 'elitär'] },
  { category: 'Silhouette', name: 'Layered', effects: ['komplex', 'kreativ', 'individuell', 'experimentell'] },
  { category: 'Silhouette', name: 'Asymmetrisch', effects: ['spannend', 'avantgarde', 'instabil', 'dynamisch'] },
  { category: 'Farbe', name: 'Schwarz', effects: ['dominant', 'elegant', 'distanziert', 'autoritär'] },
  { category: 'Farbe', name: 'Weiß', effects: ['rein', 'neutral', 'klar', 'distanziert'] },
  { category: 'Farbe', name: 'Grau', effects: ['neutral', 'rational', 'zurückhaltend', 'unauffällig'] },
  { category: 'Farbe', name: 'Rot', effects: ['aggressiv', 'leidenschaftlich', 'energisch', 'dominant'] },
  { category: 'Farbe', name: 'Blau', effects: ['ruhig', 'vertrauenswürdig', 'kalt', 'distanziert'] },
  { category: 'Farbe', name: 'Gelb', effects: ['dynamisch', 'optimistisch', 'laut', 'nervös'] },
  { category: 'Farbe', name: 'Grün', effects: ['natürlich', 'ruhig', 'ausgeglichen', 'organisch'] },
  { category: 'Farbe', name: 'Beige / Nude', effects: ['ruhig', 'subtil', 'elegant', 'natürlich'] },
  { category: 'Farbe', name: 'Silber', effects: ['technisch', 'futuristisch', 'kalt', 'präzise'] },
  { category: 'Farbe', name: 'Gold', effects: ['luxuriös', 'dominant', 'warm', 'prestigereich'] },
  { category: 'Material', name: 'Leder', effects: ['hart', 'dominant', 'rebellisch', 'sexualisiert'] },
  { category: 'Material', name: 'Denim', effects: ['robust', 'ehrlich', 'alltag', 'amerikanisch'] },
  { category: 'Material', name: 'Wolle', effects: ['warm', 'weich', 'gemütlich', 'traditionell'] },
  { category: 'Material', name: 'Seide', effects: ['luxuriös', 'fließend', 'sensibel', 'feminin'] },
  { category: 'Material', name: 'Baumwolle', effects: ['neutral', 'funktional', 'zugänglich', 'einfach'] },
  { category: 'Material', name: 'Mesh / Netz', effects: ['sexy', 'durchlässig', 'verletzlich', 'provokativ'] },
  { category: 'Material', name: 'Latex', effects: ['extrem', 'sexualisiert', 'dominant', 'künstlich'] },
  { category: 'Material', name: 'Nylon / Tech', effects: ['funktional', 'sportlich', 'technisch', 'modern'] },
  { category: 'Detail', name: 'Sichtbarer Reißverschluss', effects: ['technisch', 'funktional', 'roh', 'modern'] },
  { category: 'Detail', name: 'Schnallen / Buckles', effects: ['kontrolliert', 'dominant', 'restriktiv', 'utilitaristisch'] },
  { category: 'Detail', name: 'Gürtel', effects: ['strukturiert', 'kontrolliert', 'körperbetont'] },
  { category: 'Detail', name: 'Falten / Pleats', effects: ['elegant', 'rhythmisch', 'klassisch'] },
  { category: 'Detail', name: 'Fransen', effects: ['verspielt', 'beweglich', 'expressiv'] },
  { category: 'Detail', name: 'Sichtbare Nähte', effects: ['konstruiert', 'ehrlich', 'roh'] },
  { category: 'Detail', name: 'Logos / Branding', effects: ['laut', 'status', 'kommerziell', 'identitätsstiftend'] },
  { category: 'Sprache', name: 'Minimalistisch', effects: ['reduziert', 'kontrolliert', 'ruhig', 'elitär'] },
  { category: 'Sprache', name: 'Dekorativ', effects: ['verspielt', 'expressiv', 'emotional', 'komplex'] },
  { category: 'Sprache', name: 'Sportlich', effects: ['funktional', 'aktiv', 'zugänglich'] },
  { category: 'Sprache', name: 'Utility / Workwear', effects: ['praktisch', 'robust', 'ehrlich', 'funktional'] },
  { category: 'Sprache', name: 'Avantgarde', effects: ['experimentell', 'konzeptionell', 'disruptiv', 'intellektuell'] },
  { category: 'Gender', name: 'Maskulin codiert', effects: ['stark', 'dominant', 'rational', 'stabil'] },
  { category: 'Gender', name: 'Feminin codiert', effects: ['weich', 'sensibel', 'emotional', 'elegant'] },
  { category: 'Gender', name: 'Androgyn', effects: ['neutral', 'modern', 'offen', 'progressiv'] },
  { category: 'Kontext', name: 'Business', effects: ['seriös', 'kontrolliert', 'distanziert', 'professionell'] },
  { category: 'Kontext', name: 'Streetwear', effects: ['lässig', 'authentisch', 'subkulturell', 'individuell'] },
  { category: 'Kontext', name: 'Luxury', effects: ['elitär', 'hochwertig', 'exklusiv', 'dominant'] },
  { category: 'Kontext', name: 'Sport', effects: ['funktional', 'aktiv', 'leistungsorientiert'] },
  { category: 'Symbolik', name: 'Uniform', effects: ['zugehörigkeit', 'kontrolle', 'autorität'] },
  { category: 'Symbolik', name: 'Subkultur', effects: ['rebellisch', 'identität', 'abgrenzung'] },
  { category: 'Symbolik', name: 'Military', effects: ['macht', 'struktur', 'disziplin'] },
  { category: 'Symbolik', name: 'Futuristisch', effects: ['fortschritt', 'künstlich', 'vision'] }
];

// ── STATE ────────────────────────────────────────────────

const DEFAULT_STATE = {
  categories: [],
  effects: [],
  elements: [],
  selectedElementIds: [],
  uploadedImageDataUrl: null,
  activeAdminTab: 'elements',
  activeMobileStep: 0
};

let state = structuredClone(DEFAULT_STATE);
let history = [];
let historyIndex = -1;
let _skipHistory = false;

const adminFormState = {
  loadedElementId: null,
  loadedEffectId: null,
  loadedCategoryId: null
};

// ── DOM REFS ─────────────────────────────────────────────

const els = {
  adminOpen: document.getElementById('adminOpen'),
  adminClose: document.getElementById('adminClose'),
  adminModal: document.getElementById('adminModal'),
  adminTabs: document.getElementById('adminTabs'),
  adminForm: document.getElementById('adminForm'),
  adminList: document.getElementById('adminList'),
  categoryList: document.getElementById('categoryList'),
  selectionView: document.getElementById('selectionView'),
  analysisView: document.getElementById('analysisView'),
  clearSelection: document.getElementById('clearSelection'),
  randomAll: document.getElementById('randomAll'),
  randomByCategory: document.getElementById('randomByCategory'),
  imageUpload: document.getElementById('imageUpload'),
  clearImage: document.getElementById('clearImage'),
  mergeStarter: document.getElementById('mergeStarter'),
  applyGroups: document.getElementById('applyGroups'),
  exportData: document.getElementById('exportData'),
  importTrigger: document.getElementById('importTrigger'),
  importFile: document.getElementById('importFile'),
  undoBtn: document.getElementById('undoBtn'),
  redoBtn: document.getElementById('redoBtn'),
  stepper: document.getElementById('stepper'),
  mainLayout: document.getElementById('mainLayout')
};

// ── UTILS ────────────────────────────────────────────────

function createId(prefix) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }
function slugify(value) { return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || createId('id'); }
function normalize(value) { return String(value || '').trim().toLowerCase(); }
function escapeHtml(value) { return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;'); }

let toastTimer = null;
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; document.body.appendChild(toast); }
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

// ── HISTORY (UNDO / REDO) ────────────────────────────────

function snapshotForHistory() {
  const snap = JSON.parse(JSON.stringify({
    categories: state.categories,
    effects: state.effects,
    elements: state.elements,
    selectedElementIds: state.selectedElementIds
  }));
  return snap;
}

function pushHistory() {
  if (_skipHistory) return;
  const snap = snapshotForHistory();
  if (historyIndex < history.length - 1) history = history.slice(0, historyIndex + 1);
  history.push(snap);
  if (history.length > HISTORY_MAX) history.shift();
  historyIndex = history.length - 1;
  updateUndoRedoBtns();
}

function undo() {
  if (historyIndex <= 0) return;
  historyIndex -= 1;
  restoreSnapshot(history[historyIndex]);
  showToast('↩ Undo');
}

function redo() {
  if (historyIndex >= history.length - 1) return;
  historyIndex += 1;
  restoreSnapshot(history[historyIndex]);
  showToast('↪ Redo');
}

function restoreSnapshot(snap) {
  _skipHistory = true;
  state.categories = snap.categories;
  state.effects = snap.effects;
  state.elements = snap.elements;
  state.selectedElementIds = snap.selectedElementIds;
  saveState();
  renderApp();
  _skipHistory = false;
  updateUndoRedoBtns();
}

function updateUndoRedoBtns() {
  els.undoBtn.disabled = historyIndex <= 0;
  els.redoBtn.disabled = historyIndex >= history.length - 1;
}

// ── PERSISTENCE ──────────────────────────────────────────

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    state = structuredClone(DEFAULT_STATE);
    mergeStarterData(false);
    pushHistory();
    return;
  }
  try {
    const parsed = JSON.parse(saved);
    state = { ...structuredClone(DEFAULT_STATE), ...parsed };
    state.categories = Array.isArray(state.categories) ? state.categories : [];
    state.effects = Array.isArray(state.effects) ? state.effects : [];
    state.elements = Array.isArray(state.elements) ? state.elements : [];
    state.selectedElementIds = Array.isArray(state.selectedElementIds) ? state.selectedElementIds : [];
    ensureCoreCategories();
    applyEffectGroups(false);
    cleanInvalidSelections();
    saveState();
    pushHistory();
  } catch (error) {
    console.error(error);
    state = structuredClone(DEFAULT_STATE);
    mergeStarterData(false);
    pushHistory();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('localStorage full, image not persisted', e);
    const stateWithoutImage = { ...state, uploadedImageDataUrl: null };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithoutImage));
  }
}

// ── EXPORT / IMPORT ──────────────────────────────────────

function exportData() {
  const exportState = {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories: state.categories,
    effects: state.effects,
    elements: state.elements,
    selectedElementIds: state.selectedElementIds
  };
  const blob = new Blob([JSON.stringify(exportState, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mik-tool-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Export gespeichert');
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed.categories || !parsed.effects || !parsed.elements) throw new Error('Invalid format');
      if (!confirm('Import überschreibt aktuelle Daten (ohne Bild). Fortfahren?')) return;
      state.categories = Array.isArray(parsed.categories) ? parsed.categories : state.categories;
      state.effects = Array.isArray(parsed.effects) ? parsed.effects : state.effects;
      state.elements = Array.isArray(parsed.elements) ? parsed.elements : state.elements;
      state.selectedElementIds = Array.isArray(parsed.selectedElementIds) ? parsed.selectedElementIds : [];
      ensureCoreCategories();
      sortEffectsByGroup();
      cleanInvalidSelections();
      saveState();
      pushHistory();
      renderApp();
      showToast('Import erfolgreich');
    } catch (error) {
      alert('Import fehlgeschlagen: Ungültiges Format.');
    }
  };
  reader.readAsText(file);
  els.importFile.value = '';
}

// ── DATA HELPERS ─────────────────────────────────────────

function ensureCoreCategories() {
  CORE_CATEGORIES.forEach(name => {
    const id = slugify(name);
    let existing = state.categories.find(c => normalize(c.id) === id || normalize(c.name) === normalize(name));
    if (!existing) state.categories.push({ id, name, type: 'core' });
    else { existing.id = id; existing.name = name; existing.type = 'core'; }
  });
}

function getEffectGroupForName(effectName) {
  const id = slugify(effectName);
  return EFFECT_GROUPS.find(g => g.effects.some(n => slugify(n) === id)) || null;
}

function applyEffectGroups(showAlert = true) {
  let updated = 0;
  state.effects.forEach(effect => {
    const group = getEffectGroupForName(effect.name);
    if (!group) return;
    const prev = effect.color + effect.group;
    effect.id = slugify(effect.name);
    effect.color = group.color;
    effect.group = group.name;
    if (prev !== effect.color + effect.group) updated++;
  });
  sortEffectsByGroup();
  saveState();
  renderApp();
  if (showAlert) showToast(`Gruppen-Farben angewendet (${updated} aktualisiert)`);
}

function mergeStarterData(showAlert = true) {
  let addedC = 0, addedE = 0, addedEl = 0;
  if (!Array.isArray(state.categories)) state.categories = [];
  if (!Array.isArray(state.effects)) state.effects = [];
  if (!Array.isArray(state.elements)) state.elements = [];
  if (!Array.isArray(state.selectedElementIds)) state.selectedElementIds = [];

  CORE_CATEGORIES.forEach(name => {
    const id = slugify(name);
    let existing = state.categories.find(c => normalize(c.id) === id || normalize(c.name) === normalize(name));
    if (!existing) { state.categories.push({ id, name, type: 'core' }); addedC++; }
    else { existing.id = id; existing.name = name; existing.type = 'core'; }
  });

  EFFECT_GROUPS.forEach(group => {
    group.effects.forEach(name => {
      const id = slugify(name);
      let existing = state.effects.find(e => normalize(e.id) === id || normalize(e.name) === normalize(name));
      if (!existing) { state.effects.push({ id, name, color: group.color, group: group.name }); addedE++; }
      else { existing.id = id; existing.name = name; existing.color = group.color; existing.group = group.name; }
    });
  });

  STARTER_ELEMENTS.forEach(item => {
    const categoryId = slugify(item.category);
    const effectIds = item.effects.map(n => slugify(n));
    let existing = state.elements.find(el => normalize(el.name) === normalize(item.name) && normalize(el.categoryId) === categoryId);
    if (!existing) { state.elements.push({ id: createId('element'), name: item.name, categoryId, effectIds }); addedEl++; }
    else { existing.effectIds = [...new Set([...(existing.effectIds || []), ...effectIds])]; }
  });

  sortEffectsByGroup();
  cleanInvalidSelections();
  saveState();
  pushHistory();
  renderApp();
  if (showAlert) showToast(`Merge: +${addedC} Kat., +${addedE} Eff., +${addedEl} Elem.`);
}

function sortEffectsByGroup() {
  const groupOrder = new Map(EFFECT_GROUPS.map((g, i) => [g.name, i]));
  const effectOrder = new Map();
  EFFECT_GROUPS.forEach(g => g.effects.forEach((n, i) => effectOrder.set(slugify(n), i)));
  state.effects.sort((a, b) => {
    const gA = groupOrder.has(a.group) ? groupOrder.get(a.group) : 999;
    const gB = groupOrder.has(b.group) ? groupOrder.get(b.group) : 999;
    if (gA !== gB) return gA - gB;
    const eA = effectOrder.has(a.id) ? effectOrder.get(a.id) : 999;
    const eB = effectOrder.has(b.id) ? effectOrder.get(b.id) : 999;
    if (eA !== eB) return eA - eB;
    return a.name.localeCompare(b.name, 'de');
  });
}

function cleanInvalidSelections() {
  const ids = new Set(state.elements.map(e => e.id));
  state.selectedElementIds = state.selectedElementIds.filter(id => ids.has(id));
}

function getCategoryName(categoryId) { return state.categories.find(c => c.id === categoryId)?.name || 'Uncategorized'; }
function getEffectName(effectId) { return state.effects.find(e => e.id === effectId)?.name || effectId; }

function groupEffects(effects) {
  const grouped = new Map();
  effects.forEach(e => {
    const g = e.group || 'Eigene Effekte';
    if (!grouped.has(g)) grouped.set(g, []);
    grouped.get(g).push(e);
  });
  return grouped;
}

// ── ANALYSIS ─────────────────────────────────────────────

function analyzeSelection() {
  const selectedElements = state.selectedElementIds.map(id => state.elements.find(e => e.id === id)).filter(Boolean);
  const effectMap = new Map();
  selectedElements.forEach(el => {
    (el.effectIds || []).forEach(effectId => {
      const effect = state.effects.find(e => e.id === effectId);
      if (!effect) return;
      if (!effectMap.has(effectId)) effectMap.set(effectId, { effectId, name: effect.name, color: effect.color, group: effect.group || 'Andere', count: 0, sources: [] });
      const entry = effectMap.get(effectId);
      entry.count++;
      if (!entry.sources.includes(el.name)) entry.sources.push(el.name);
    });
  });
  return [...effectMap.values()].sort((a, b) => b.count !== a.count ? b.count - a.count : a.name.localeCompare(b.name, 'de'));
}

function analyzeByGroup(analysis) {
  const groupMap = new Map();
  analysis.forEach(item => {
    const g = item.group;
    if (!groupMap.has(g)) groupMap.set(g, { name: g, count: 0, color: item.color });
    groupMap.get(g).count += item.count;
  });
  return [...groupMap.values()].sort((a, b) => b.count - a.count);
}

// ── RENDER: MAIN ─────────────────────────────────────────

function renderApp() {
  renderElementSelection();
  renderSelection();
  renderAnalysis();
  renderAdmin();
  renderMobileStepper();
}

function renderMobileStepper() {
  const panels = els.mainLayout.querySelectorAll('[data-panel]');
  const isMobile = window.innerWidth <= 768;
  panels.forEach(panel => {
    if (isMobile) {
      const panelIndex = parseInt(panel.dataset.panel, 10);
      panel.classList.toggle('is-active', panelIndex === state.activeMobileStep);
    } else {
      panel.classList.remove('is-active');
    }
  });
  els.stepper.querySelectorAll('[data-step]').forEach(btn => {
    btn.classList.toggle('is-active', parseInt(btn.dataset.step, 10) === state.activeMobileStep);
  });
}

// ── RENDER: ELEMENT SELECTION ────────────────────────────

function renderElementSelection() {
  if (!state.elements.length) {
    els.categoryList.innerHTML = '<div class="empty-state">No elements yet. Add elements in Admin.</div>';
    return;
  }
  const selectedSet = new Set(state.selectedElementIds);
  els.categoryList.innerHTML = state.categories.map(cat => {
    const elements = state.elements.filter(e => e.categoryId === cat.id).sort((a, b) => a.name.localeCompare(b.name, 'de'));
    const selectedCount = elements.filter(e => selectedSet.has(e.id)).length;
    return `
      <details class="category" ${selectedCount > 0 ? 'open' : ''}>
        <summary>
          <span class="category-title"><span class="chevron">›</span><span class="category-name">${escapeHtml(cat.name)}</span></span>
          <span class="count-pill">${elements.length}</span>
        </summary>
        <div class="element-list">
          ${elements.length
            ? elements.map(el => {
                const isSel = selectedSet.has(el.id);
                return `<div class="element-row ${isSel ? 'is-selected' : ''}" data-toggle-element="${el.id}" role="button" tabindex="0">
                  <span class="fake-checkbox">${isSel ? '✓' : ''}</span>
                  <span class="element-name">${escapeHtml(el.name)}</span>
                </div>`;
              }).join('')
            : '<div class="element-row"><span></span><span class="element-name" style="color:var(--muted)">No elements</span></div>'
          }
        </div>
      </details>`;
  }).join('');
}

// ── RENDER: SELECTION VIEW ───────────────────────────────

function renderSelection() {
  const selected = state.selectedElementIds.map(id => state.elements.find(e => e.id === id)).filter(Boolean);

  const imageBlock = state.uploadedImageDataUrl ? `
    <div class="analysis-card" style="margin-bottom:14px;padding:10px;">
      <img src="${state.uploadedImageDataUrl}" alt="Referenzbild" style="width:100%;max-height:360px;object-fit:contain;border-radius:14px;display:block;background:var(--surface-soft);border:1px solid var(--line);">
    </div>` : '';

  if (!selected.length) {
    els.selectionView.innerHTML = `${imageBlock}<div class="empty-state">Keine Elemente ausgewählt.</div>`;
    return;
  }

  els.selectionView.innerHTML = `
    ${imageBlock}
    <div class="chips">${selected.map(el => `<div class="chip" data-remove-selection="${el.id}" role="button" tabindex="0"><span>${escapeHtml(el.name)}</span><span class="remove">×</span></div>`).join('')}</div>
  `;
}

// ── RENDER: ANALYSIS ─────────────────────────────────────

function renderAnalysis() {
  const analysis = analyzeSelection();
  if (!analysis.length) {
    els.analysisView.innerHTML = `
      <div class="dominant-card">
        <div class="dominant-label">Dominante Wirkung</div>
        <div class="dominant-value">–</div>
        <div class="dominant-meta">Wähle Elemente mit verknüpften Wirkungen aus.</div>
      </div>`;
    return;
  }

  const maxCount = Math.max(...analysis.map(i => i.count));
  const dominant = analysis.filter(i => i.count === maxCount);
  const groupData = analyzeByGroup(analysis);

  els.analysisView.innerHTML = `
    <div class="dominant-card">
      <div class="dominant-label">Dominante Wirkung</div>
      <div class="dominant-value">${escapeHtml(dominant.map(i => i.name).join(', '))}</div>
      <div class="dominant-meta">${dominant.length > 1 ? dominant.length + ' Wirkungen dominant' : 'Eine Wirkung dominant'} (Count: ${maxCount})</div>
    </div>
    <div class="analysis-card">
      <h3>Wirkungsgruppen – Radar</h3>
      ${renderRadarChart(groupData)}
    </div>
    <div class="analysis-card">
      <h3>Wirkungen – Übersicht</h3>
      ${renderAnalysisTable(analysis)}
    </div>
    <div class="analysis-card">
      <h3>Wirkungsverteilung</h3>
      ${renderPieChart(analysis)}
    </div>`;
}

function renderAnalysisTable(analysis) {
  return `<table>
    <thead><tr><th>Wirkung</th><th>Count</th><th>Quellen</th></tr></thead>
    <tbody>${analysis.map(item => `<tr>
      <td><span class="effect-cell"><span class="dot" style="background:${escapeHtml(item.color)}"></span><span>${escapeHtml(item.name)}</span></span></td>
      <td><strong>${item.count}</strong></td>
      <td class="sources">${escapeHtml(item.sources.join(', '))}</td>
    </tr>`).join('')}</tbody>
  </table>`;
}

function renderPieChart(analysis) {
  const total = analysis.reduce((s, i) => s + i.count, 0);
  let startAngle = -90;
  const paths = analysis.map(item => {
    const angle = (item.count / total) * 360;
    const endAngle = startAngle + angle;
    const path = describeArc(110, 110, 86, startAngle, endAngle);
    startAngle = endAngle;
    return `<path d="${path}" fill="${escapeHtml(item.color)}"></path>`;
  }).join('');
  const legend = analysis.map(item => `
    <div class="legend-row">
      <span class="dot" style="background:${escapeHtml(item.color)}"></span>
      <span>${escapeHtml(item.name)}</span>
      <strong>${item.count}</strong>
    </div>`).join('');
  return `<div class="chart-wrap">
    <svg class="pie" viewBox="0 0 220 220" role="img">${paths}<circle cx="110" cy="110" r="44" fill="var(--surface)"></circle></svg>
    <div class="legend">${legend}</div>
  </div>`;
}

function renderRadarChart(groupData) {
  if (groupData.length < 3) {
    return `<div class="empty-state" style="min-height:120px;">Mindestens 3 Gruppen für Radar-Chart benötigt.</div>`;
  }

  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 96;
  const maxCount = Math.max(...groupData.map(g => g.count));
  const n = groupData.length;

  function point(index, radius) {
    const angle = (Math.PI * 2 * index / n) - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  }

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1].map(t => {
    const pts = Array.from({ length: n }, (_, i) => point(i, maxR * t));
    return `<polygon points="${pts.map(p => `${p.x},${p.y}`).join(' ')}" fill="none" stroke="var(--line)" stroke-width="1"/>`;
  }).join('');

  // Spokes
  const spokes = Array.from({ length: n }, (_, i) => {
    const p = point(i, maxR);
    return `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="var(--line)" stroke-width="1"/>`;
  }).join('');

  // Data polygon
  const dataPoints = groupData.map((g, i) => point(i, maxCount > 0 ? (g.count / maxCount) * maxR : 0));
  const polyPoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ');
  const dataPolygon = `<polygon points="${polyPoints}" fill="rgba(95,143,191,0.25)" stroke="#5F8FBF" stroke-width="2"/>`;
  const dataDots = dataPoints.map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${escapeHtml(groupData[i].color)}" stroke="var(--surface)" stroke-width="1.5"/>`).join('');

  // Labels
  const labels = groupData.map((g, i) => {
    const p = point(i, maxR + 20);
    const anchor = p.x < cx - 4 ? 'end' : p.x > cx + 4 ? 'start' : 'middle';
    const shortName = g.name.split(' / ')[0];
    return `<text x="${p.x}" y="${p.y}" text-anchor="${anchor}" dominant-baseline="middle" font-size="9" fill="var(--text-soft)" font-family="inherit">${escapeHtml(shortName)}</text>`;
  }).join('');

  return `<div class="radar-wrap">
    <svg class="radar-svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      ${rings}${spokes}${dataPolygon}${dataDots}${labels}
    </svg>
    <div class="radar-legend">
      ${groupData.map(g => `<div class="radar-legend-item"><span class="dot" style="background:${escapeHtml(g.color)}"></span><span>${escapeHtml(g.name)}: ${g.count}</span></div>`).join('')}
    </div>
  </div>`;
}

// ── ARC MATH ──────────────────────────────────────────────

function polarToCartesian(cx, cy, r, deg) {
  const rad = (deg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(x, y, r, start, end) {
  if (end - start >= 359.99) {
    const p1 = polarToCartesian(x, y, r, start);
    const p2 = polarToCartesian(x, y, r, start + 180);
    return `M ${x} ${y} L ${p1.x} ${p1.y} A ${r} ${r} 0 1 1 ${p2.x} ${p2.y} A ${r} ${r} 0 1 1 ${p1.x} ${p1.y} Z`;
  }
  const s = polarToCartesian(x, y, r, end);
  const e = polarToCartesian(x, y, r, start);
  const large = end - start <= 180 ? '0' : '1';
  return `M ${x} ${y} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y} Z`;
}

// ── RENDER: ADMIN ─────────────────────────────────────────

function renderAdmin() {
  renderAdminTabs();
  if (state.activeAdminTab === 'elements') renderElementsAdmin();
  if (state.activeAdminTab === 'effects') renderEffectsAdmin();
  if (state.activeAdminTab === 'categories') renderCategoriesAdmin();
}

function renderAdminTabs() {
  els.adminTabs.querySelectorAll('[data-tab]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.tab === state.activeAdminTab));
}

function renderGroupedEffectCheckboxes(loadedElement) {
  sortEffectsByGroup();
  const grouped = groupEffects(state.effects);
  return [...grouped.entries()].map(([gName, effects]) =>
    `<div class="group-title">${escapeHtml(gName)}</div>` +
    effects.map(e => `<label class="check-item"><input type="checkbox" name="effectIds" value="${e.id}" ${loadedElement?.effectIds?.includes(e.id) ? 'checked' : ''}><span class="dot" style="background:${escapeHtml(e.color)}"></span><span>${escapeHtml(e.name)}</span></label>`).join('')
  ).join('');
}

function renderElementsAdmin() {
  const loaded = state.elements.find(e => e.id === adminFormState.loadedElementId) || null;
  els.adminForm.innerHTML = `<form class="form-grid" id="elementForm">
    <div class="field"><label for="elementName">Element Name</label><input id="elementName" name="name" value="${escapeHtml(loaded?.name || '')}" placeholder="z. B. Rot" required></div>
    <div class="field"><label for="elementCategory">Category</label><select id="elementCategory" name="categoryId">${state.categories.map(c => `<option value="${c.id}" ${loaded?.categoryId === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}</select></div>
    <div class="field"><label>Effects verknüpfen</label><div class="checkbox-list">${state.effects.length ? renderGroupedEffectCheckboxes(loaded) : '<div class="small-note">No effects yet.</div>'}</div></div>
    <div class="form-actions"><button class="primary" type="submit">Save Element</button><button class="danger" type="button" id="deleteElement" ${loaded ? '' : 'disabled'}>Delete</button><button type="button" id="newElement">New</button></div>
  </form>`;
  els.adminList.innerHTML = `<div class="admin-list">${state.elements.length
    ? state.elements.map(el => `<div class="list-item ${loaded?.id === el.id ? 'is-active' : ''}" data-load-element="${el.id}"><div class="list-title">${escapeHtml(el.name)}</div><div class="list-meta">${escapeHtml(getCategoryName(el.categoryId))} · ${(el.effectIds || []).map(getEffectName).map(escapeHtml).join(', ') || 'No effects'}</div></div>`).join('')
    : '<div class="empty-state">No elements yet.</div>'}</div>`;
}

function renderEffectsAdmin() {
  const loaded = state.effects.find(e => e.id === adminFormState.loadedEffectId) || null;
  sortEffectsByGroup();
  els.adminForm.innerHTML = `<form class="form-grid" id="effectForm">
    <div class="field"><label for="effectName">Effect Name</label><input id="effectName" name="name" value="${escapeHtml(loaded?.name || '')}" placeholder="z. B. Dynamik" required></div>
    <div class="field"><label for="effectColor">Color</label><input id="effectColor" name="color" type="color" value="${escapeHtml(loaded?.color || '#8f8a82')}"></div>
    <div class="form-actions"><button class="primary" type="submit">Save Effect</button><button class="danger" type="button" id="deleteEffect" ${loaded ? '' : 'disabled'}>Delete</button><button type="button" id="newEffect">New</button></div>
  </form>`;
  if (!state.effects.length) { els.adminList.innerHTML = '<div class="empty-state">No effects yet.</div>'; return; }
  const grouped = groupEffects(state.effects);
  els.adminList.innerHTML = `<div class="admin-list">${[...grouped.entries()].map(([gName, effects]) =>
    `<div class="group-title">${escapeHtml(gName)}</div>` +
    effects.map(e => `<div class="list-item ${loaded?.id === e.id ? 'is-active' : ''}" data-load-effect="${e.id}"><div class="list-title"><span class="dot" style="background:${escapeHtml(e.color)}"></span> ${escapeHtml(e.name)}</div><div class="list-meta">${escapeHtml(e.color)}${e.group ? ' · ' + escapeHtml(e.group) : ''}</div></div>`).join('')
  ).join('')}</div>`;
}

function renderCategoriesAdmin() {
  const loaded = state.categories.find(c => c.id === adminFormState.loadedCategoryId) || null;
  const isCustom = loaded?.type === 'custom';
  const hasElements = loaded ? state.elements.some(e => e.categoryId === loaded.id) : false;
  els.adminForm.innerHTML = `<form class="form-grid" id="categoryForm">
    <div class="field"><label for="categoryName">Category Name</label><input id="categoryName" name="name" value="${escapeHtml(loaded?.name || '')}" placeholder="z. B. Subkultur" ${loaded?.type === 'core' ? 'disabled' : ''} required></div>
    ${loaded?.type === 'core' ? '<div class="small-note">Core-Kategorien können nicht bearbeitet oder gelöscht werden.</div>' : ''}
    <div class="form-actions"><button class="primary" type="submit" ${loaded?.type === 'core' ? 'disabled' : ''}>Save Category</button><button class="danger" type="button" id="deleteCategory" ${isCustom && !hasElements ? '' : 'disabled'}>Delete</button><button type="button" id="newCategory">New</button></div>
  </form>`;
  els.adminList.innerHTML = `<div class="admin-list">${state.categories.map(c => `<div class="list-item ${loaded?.id === c.id ? 'is-active' : ''}" data-load-category="${c.id}"><div class="list-title">${escapeHtml(c.name)}</div><div class="list-meta"><span class="badge">${c.type}</span> · ${state.elements.filter(e => e.categoryId === c.id).length} Elemente</div></div>`).join('')}</div>`;
}

// ── INTERACTIONS ─────────────────────────────────────────

function openAdmin() { els.adminModal.classList.add('is-open'); renderAdmin(); }
function closeAdmin() { els.adminModal.classList.remove('is-open'); }

function toggleElement(elementId) {
  pushHistory();
  const idx = state.selectedElementIds.indexOf(elementId);
  if (idx >= 0) state.selectedElementIds.splice(idx, 1); else state.selectedElementIds.push(elementId);
  saveState(); renderApp();
}

function removeSelection(elementId) {
  pushHistory();
  state.selectedElementIds = state.selectedElementIds.filter(id => id !== elementId);
  saveState(); renderApp();
}

function clearSelection() {
  pushHistory();
  state.selectedElementIds = [];
  saveState(); renderApp();
}

function shuffleArray(arr) { return arr.map(v => ({ v, s: Math.random() })).sort((a, b) => a.s - b.s).map(({ v }) => v); }

function randomAll() {
  pushHistory();
  const shuffled = shuffleArray([...state.elements]);
  state.selectedElementIds = shuffled.slice(0, Math.min(5, shuffled.length)).map(e => e.id);
  saveState(); renderApp();
}

function randomByCategory() {
  pushHistory();
  const selected = [];
  state.categories.forEach(cat => {
    const elements = state.elements.filter(e => e.categoryId === cat.id);
    if (!elements.length) return;
    const amount = elements.length === 1 ? 1 : Math.floor(Math.random() * 2) + 1;
    selected.push(...shuffleArray(elements).slice(0, amount).map(e => e.id));
  });
  state.selectedElementIds = selected;
  saveState(); renderApp();
}

function saveElement(event) {
  event.preventDefault();
  const form = new FormData(event.target.closest('#elementForm'));
  const name = String(form.get('name') || '').trim();
  const categoryId = String(form.get('categoryId') || '').trim();
  const effectIds = form.getAll('effectIds').map(String);
  if (!name || !categoryId) return showToast('Bitte Name und Kategorie ausfüllen.');
  pushHistory();
  if (adminFormState.loadedElementId) {
    const existing = state.elements.find(e => e.id === adminFormState.loadedElementId);
    if (existing) { existing.name = name; existing.categoryId = categoryId; existing.effectIds = effectIds; }
  } else {
    const id = createId('element');
    state.elements.push({ id, name, categoryId, effectIds });
    adminFormState.loadedElementId = id;
  }
  saveState(); renderApp(); showToast('Element gespeichert');
}

function deleteElement() {
  const id = adminFormState.loadedElementId;
  const el = state.elements.find(e => e.id === id);
  if (!id || !el || !confirm(`Delete element "${el.name}"?`)) return;
  pushHistory();
  state.elements = state.elements.filter(e => e.id !== id);
  state.selectedElementIds = state.selectedElementIds.filter(i => i !== id);
  adminFormState.loadedElementId = null;
  saveState(); renderApp(); showToast('Element gelöscht');
}

function saveEffect(event) {
  event.preventDefault();
  const form = new FormData(event.target.closest('#effectForm'));
  const name = String(form.get('name') || '').trim();
  const color = String(form.get('color') || '').trim();
  if (!name || !/^#[0-9a-fA-F]{6}$/.test(color)) return showToast('Bitte gültigen Namen und Farbe eingeben.');
  const group = getEffectGroupForName(name);
  pushHistory();
  if (adminFormState.loadedEffectId) {
    const existing = state.effects.find(e => e.id === adminFormState.loadedEffectId);
    if (existing) { existing.name = name; existing.id = slugify(name); existing.color = group ? group.color : color; existing.group = group ? group.name : existing.group; }
  } else {
    const id = slugify(name);
    state.effects.push({ id, name, color: group ? group.color : color, group: group ? group.name : undefined });
    adminFormState.loadedEffectId = id;
  }
  sortEffectsByGroup(); saveState(); renderApp(); showToast('Effect gespeichert');
}

function deleteEffect() {
  const id = adminFormState.loadedEffectId;
  const ef = state.effects.find(e => e.id === id);
  if (!id || !ef || !confirm(`Delete effect "${ef.name}"?`)) return;
  pushHistory();
  state.effects = state.effects.filter(e => e.id !== id);
  state.elements.forEach(el => { el.effectIds = (el.effectIds || []).filter(eid => eid !== id); });
  adminFormState.loadedEffectId = null;
  saveState(); renderApp(); showToast('Effect gelöscht');
}

function saveCategory(event) {
  event.preventDefault();
  const form = new FormData(event.target.closest('#categoryForm'));
  const name = String(form.get('name') || '').trim();
  if (!name) return showToast('Bitte Kategorie-Namen eingeben.');
  pushHistory();
  if (adminFormState.loadedCategoryId) {
    const existing = state.categories.find(c => c.id === adminFormState.loadedCategoryId);
    if (existing && existing.type === 'custom') existing.name = name;
  } else {
    const id = createId('category');
    state.categories.push({ id, name, type: 'custom' });
    adminFormState.loadedCategoryId = id;
  }
  saveState(); renderApp(); showToast('Kategorie gespeichert');
}

function deleteCategory() {
  const id = adminFormState.loadedCategoryId;
  const cat = state.categories.find(c => c.id === id);
  if (!id || !cat || cat.type !== 'custom' || state.elements.some(e => e.categoryId === id) || !confirm(`Delete category "${cat.name}"?`)) return;
  pushHistory();
  state.categories = state.categories.filter(c => c.id !== id);
  adminFormState.loadedCategoryId = null;
  saveState(); renderApp(); showToast('Kategorie gelöscht');
}

// ── IMAGE ─────────────────────────────────────────────────

function handleImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const maxSize = 1200;
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      state.uploadedImageDataUrl = canvas.toDataURL('image/jpeg', 0.82);
      saveState(); renderApp();
    };
    img.onerror = () => showToast('Bild konnte nicht geladen werden.');
    img.src = reader.result;
  };
  reader.onerror = () => showToast('Datei konnte nicht gelesen werden.');
  reader.readAsDataURL(file);
  event.target.value = '';
}

function clearUploadedImage() { state.uploadedImageDataUrl = null; saveState(); renderApp(); }

// ── EVENT BINDING ─────────────────────────────────────────

function bindEvents() {
  els.adminOpen.addEventListener('click', openAdmin);
  els.adminClose.addEventListener('click', closeAdmin);
  els.imageUpload.addEventListener('change', handleImageUpload);
  els.clearImage.addEventListener('click', clearUploadedImage);
  els.mergeStarter.addEventListener('click', () => mergeStarterData(true));
  els.applyGroups.addEventListener('click', () => applyEffectGroups(true));
  els.clearSelection.addEventListener('click', clearSelection);
  els.randomAll.addEventListener('click', randomAll);
  els.randomByCategory.addEventListener('click', randomByCategory);
  els.exportData.addEventListener('click', exportData);
  els.importTrigger.addEventListener('click', () => els.importFile.click());
  els.importFile.addEventListener('change', e => importData(e.target.files?.[0]));
  els.undoBtn.addEventListener('click', undo);
  els.redoBtn.addEventListener('click', redo);

  // Mobile stepper
  els.stepper.addEventListener('click', event => {
    const btn = event.target.closest('[data-step]');
    if (!btn) return;
    state.activeMobileStep = parseInt(btn.dataset.step, 10);
    saveState();
    renderMobileStepper();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && els.adminModal.classList.contains('is-open')) { closeAdmin(); return; }
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const ctrl = isMac ? event.metaKey : event.ctrlKey;
    if (ctrl && event.key === 'z' && !event.shiftKey) { event.preventDefault(); undo(); return; }
    if (ctrl && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) { event.preventDefault(); redo(); return; }
  });

  // Element rows — keyboard support (Enter / Space)
  els.categoryList.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      const row = event.target.closest('[data-toggle-element]');
      if (row) { event.preventDefault(); toggleElement(row.dataset.toggleElement); }
    }
  });

  els.categoryList.addEventListener('click', event => {
    const row = event.target.closest('[data-toggle-element]');
    if (row) toggleElement(row.dataset.toggleElement);
  });

  els.selectionView.addEventListener('click', event => {
    const chip = event.target.closest('[data-remove-selection]');
    if (chip) removeSelection(chip.dataset.removeSelection);
  });

  els.adminTabs.addEventListener('click', event => {
    const tab = event.target.closest('[data-tab]');
    if (!tab) return;
    state.activeAdminTab = tab.dataset.tab;
    saveState(); renderAdmin();
  });

  els.adminForm.addEventListener('submit', event => {
    const form = event.target.closest('form'); if (!form) return;
    if (form.id === 'elementForm') saveElement(event);
    if (form.id === 'effectForm') saveEffect(event);
    if (form.id === 'categoryForm') saveCategory(event);
  });

  els.adminForm.addEventListener('click', event => {
    if (event.target.matches('#deleteElement')) deleteElement();
    if (event.target.matches('#deleteEffect')) deleteEffect();
    if (event.target.matches('#deleteCategory')) deleteCategory();
    if (event.target.matches('#newElement')) { adminFormState.loadedElementId = null; renderAdmin(); }
    if (event.target.matches('#newEffect')) { adminFormState.loadedEffectId = null; renderAdmin(); }
    if (event.target.matches('#newCategory')) { adminFormState.loadedCategoryId = null; renderAdmin(); }
  });

  els.adminList.addEventListener('click', event => {
    const el = event.target.closest('[data-load-element]');
    const ef = event.target.closest('[data-load-effect]');
    const cat = event.target.closest('[data-load-category]');
    if (el) { adminFormState.loadedElementId = el.dataset.loadElement; renderAdmin(); }
    if (ef) { adminFormState.loadedEffectId = ef.dataset.loadEffect; renderAdmin(); }
    if (cat) { adminFormState.loadedCategoryId = cat.dataset.loadCategory; renderAdmin(); }
  });

  // Resize: re-evaluate stepper visibility
  window.addEventListener('resize', () => renderMobileStepper());
}

// ── SERVICE WORKER ────────────────────────────────────────

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW registration failed:', err));
  });
}

// ── INIT ──────────────────────────────────────────────────

loadState();
bindEvents();
renderApp();
