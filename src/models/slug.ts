/**
 * Derive a DB-safe slug (`^[a-z0-9_]+$`) from a display name. Used by every
 * master-data record whose primary key is a slug derived from its name
 * (branches, expense categories) — the slug is an FK target, so it is generated
 * once at creation and never changed afterwards.
 *
 * Returns '' when the name has no usable characters.
 */
export function slugify(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}
