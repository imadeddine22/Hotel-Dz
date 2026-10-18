import crypto from 'crypto';
import mongoose from 'mongoose';
import { translateFields, translationEnabled } from './translate.js';

/**
 * Adds automatic translation to a listing schema. After every save, if the translatable
 * fields changed, they are translated in the background (the save itself is never slowed
 * down) and stored in `translations: { ar: {...}, en: {...}, fr: {...} }`.
 */
export function autoTranslate(schema, fields) {
  schema.add({
    translations: { type: mongoose.Schema.Types.Mixed, default: {} },
    sourceLang: { type: String, default: '' },
    translationHash: { type: String, default: '', select: true },
  });

  schema.post('save', function (doc) {
    if (!translationEnabled()) return;
    const source = pickFields(doc, fields);
    const hash = hashOf(source);
    if (hash === doc.translationHash) return;
    // a listing the owner just saved goes ahead of the startup backfill
    enqueue(doc.constructor, doc._id, source, hash, { priority: true });
  });
}

const pickFields = (doc, fields) =>
  Object.fromEntries(fields.map((f) => [f, Array.isArray(doc[f]) ? [...doc[f]] : doc[f] || '']));
const hashOf = (obj) => crypto.createHash('sha1').update(JSON.stringify(obj)).digest('hex');

// One worker, sequential: keeps us well under the free provider's rate limits
const queue = [];
let running = false;

function enqueue(Model, id, source, hash, { priority = false } = {}) {
  // a newer edit of the same document replaces a pending job
  const i = queue.findIndex((j) => j.Model === Model && String(j.id) === String(id));
  if (i !== -1) queue.splice(i, 1);
  const job = { Model, id, source, hash };
  if (priority) queue.unshift(job);
  else queue.push(job);
  if (!running) run();
}

async function run() {
  running = true;
  while (queue.length) {
    const job = queue.shift();
    try {
      const { sourceLang, translations } = await translateFields(job.source);
      if (Object.keys(translations).length) {
        // updateOne doesn't trigger post('save'), so this can't loop
        await job.Model.updateOne(
          { _id: job.id },
          { $set: { translations, sourceLang, translationHash: job.hash } }
        );
      }
    } catch (err) {
      console.warn(`[translate] ${job.Model.modelName} ${job.id}: ${err.message}`);
    }
  }
  running = false;
}

/**
 * Translate documents saved before this feature existed (or while the quota was exhausted).
 * Runs in the background at startup; `limit` keeps one run within the daily free quota.
 */
export async function backfillTranslations(models, limit = 150) {
  if (!translationEnabled()) return;
  let n = 0;
  for (const { Model, fields } of models) {
    const docs = await Model.find({ $or: [{ translationHash: { $in: ['', null] } }, { translationHash: { $exists: false } }] })
      .select(fields.join(' '))
      .limit(limit - n)
      .lean();
    for (const d of docs) {
      const source = pickFields(d, fields);
      enqueue(Model, d._id, source, hashOf(source));
      n++;
    }
    if (n >= limit) break;
  }
  if (n) console.log(`🌐 Translating ${n} existing listing(s) in the background`);
}
