export const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function safeUrl(value) {
  try { const u = new URL(String(value)); return ['https:', 'http:', 'mailto:'].includes(u.protocol) ? u.href : ''; } catch { return ''; }
}
export function safeMedia(value) {
  const str = String(value || '');
  if (/^data:image\/(png|jpeg|webp|gif);base64,[a-z\d+/=]+$/i.test(str)) return str;
  if (/^\/(?!\/)[\w/.-]+\.(webp|png|jpg|jpeg|svg|mp4)$/i.test(str)) return str;
  if (/^project-[\w-]+\.(webp|png)$/.test(str)) return `/assets/images/${str.replace('.png', '.webp')}`;
  const url = safeUrl(str); return /^https?:/.test(url) ? url : '';
}
