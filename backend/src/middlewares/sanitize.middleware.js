/**
 * Strips MongoDB operators from user input: keys starting with "$" or containing "." are removed
 * from req.query / req.body / req.params, so ?type[$ne]=x or {"email": {"$gt": ""}} can never
 * turn into a query operator (NoSQL injection). "__proto__"-style keys are dropped too.
 */
const BAD_KEY = /^\$|\.|^(__proto__|constructor|prototype)$/;

const clean = (value, depth = 0) => {
  if (Array.isArray(value)) return value.map((v) => clean(v, depth + 1));
  if (value && typeof value === 'object' && !(value instanceof Date) && !Buffer.isBuffer(value)) {
    if (depth > 10) return {}; // absurdly nested input
    for (const key of Object.keys(value)) {
      if (BAD_KEY.test(key)) delete value[key];
      else value[key] = clean(value[key], depth + 1);
    }
  }
  return value;
};

export const sanitizeInput = (req, res, next) => {
  for (const part of ['query', 'body', 'params']) {
    if (req[part] && typeof req[part] === 'object') clean(req[part]);
  }
  next();
};

export default sanitizeInput;
