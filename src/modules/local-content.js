import { site } from '../data/site.js';
import { safeMedia, safeUrl } from './safety.js';

export const CONTENT_KEY = 'kiratveerStudioContentV5';
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const owns = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const strings = value => value.filter(item => typeof item === 'string').map(item => item.trim()).filter(Boolean);

function normalizeProject(saved, original) {
  const project = original ? { ...original } : {
    id: saved.id,
    title: '',
    category: '',
    shortCategory: '',
    description: '',
    summary: '',
    status: '',
    image: '',
    imageNote: '',
    gallery: [],
    url: '',
    services: [],
    stack: [],
    engineering: [],
    role: '',
    theme: 'archive',
    featured: false,
  };

  for (const field of ['title', 'category', 'description', 'status', 'monogram']) {
    if (typeof saved[field] === 'string') project[field] = saved[field].trim();
  }
  if (typeof saved.category === 'string') project.shortCategory = project.category;
  if (typeof saved.description === 'string') project.summary = project.description;
  if (typeof saved.url === 'string') project.url = safeUrl(saved.url);
  if (typeof saved.image === 'string') {
    project.image = safeMedia(saved.image);
    if (project.image !== original?.image) project.imageNote = '';
  }
  if (Array.isArray(saved.tags)) {
    project.tags = strings(saved.tags);
    project.services = [...project.tags];
  }
  if (typeof saved.color === 'string' && /^#[\da-f]{6}$/i.test(saved.color)) project.color = saved.color;

  // Imported records may edit content, but cannot invent generated case-study routes.
  project.slug = original?.slug || '';
  project.hasCaseStudy = Boolean(original?.slug);
  return project;
}

function normalizeReferences(references) {
  return references.filter(isRecord).filter(item => typeof item.name === 'string').map(item => ({
    name: item.name.trim(),
    type: typeof item.type === 'string' ? item.type.trim() : '',
    note: typeof item.note === 'string' ? item.note.trim() : '',
    url: typeof item.url === 'string' ? safeUrl(item.url) : '',
    image: typeof item.image === 'string' ? safeMedia(item.image) : '',
    color: typeof item.color === 'string' && /^#[\da-f]{6}$/i.test(item.color) ? item.color : '#171717',
  }));
}

export function normalizeLocalContent(defaultProjects, saved, defaults = {}) {
  const projects = Array.isArray(defaultProjects) ? defaultProjects : [];
  const fallback = {
    projects,
    references: normalizeReferences(Array.isArray(defaults.references) ? defaults.references : []),
    offer: typeof defaults.offer === 'string' ? defaults.offer : site.offer,
    isCustomized: false,
  };
  if (!isRecord(saved)) return fallback;

  const hasProjects = owns(saved, 'projects') && Array.isArray(saved.projects);
  const hasReferences = owns(saved, 'references') && Array.isArray(saved.references);
  const hasOffer = owns(saved, 'offer') && typeof saved.offer === 'string';
  if (!hasProjects && !hasReferences && !hasOffer) return fallback;

  let localProjects = projects;
  if (hasProjects) {
    const byId = new Map(projects.map(project => [project.id, project]));
    const seen = new Set();
    localProjects = saved.projects.filter(item => {
      if (!isRecord(item) || typeof item.id !== 'string' || !/^[a-z\d][a-z\d_-]*$/i.test(item.id) || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    }).map(item => normalizeProject(item, byId.get(item.id)));

    // Version 5 predates QORTRA. Version 6 treats all deletions as intentional.
    const version = typeof saved.version === 'number' && Number.isFinite(saved.version) ? saved.version : 5;
    const qortra = byId.get('qortra');
    if (version < 6 && qortra && !seen.has('qortra')) localProjects.unshift({ ...qortra, hasCaseStudy: Boolean(qortra.slug) });
  }

  return {
    projects: localProjects,
    references: hasReferences ? normalizeReferences(saved.references) : fallback.references,
    offer: hasOffer ? saved.offer.trim() : fallback.offer,
    isCustomized: true,
  };
}

export function loadLocalContent(defaultProjects) {
  let saved = null;
  let defaults = {};
  try {
    defaults = globalThis.window?.KS_DEFAULTS || {};
    saved = JSON.parse(globalThis.localStorage?.getItem(CONTENT_KEY) || 'null');
  } catch {
    // Invalid imports and unavailable browser storage leave published content intact.
  }
  return normalizeLocalContent(defaultProjects, saved, defaults);
}
