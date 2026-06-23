/**
 * validate(schema) — validates req.body against a Joi schema.
 * Returns 400 with all messages on failure.
 */
export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((d) => d.message).join(', '),
    });
  }

  req.body = value;
  next();
};

export default validate;
