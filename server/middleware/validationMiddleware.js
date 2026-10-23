const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    if (err.errors) {
      return res.status(400).json({
        message: 'Validation error',
        errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    return res.status(400).json({ message: 'Invalid payload', error: err.message });
  }
};

module.exports = { validate };
