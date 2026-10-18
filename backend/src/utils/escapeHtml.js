const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Text typed by users (names, listing titles…) made safe to put inside HTML emails. */
export const escapeHtml = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ENTITIES[c]);

export default escapeHtml;
