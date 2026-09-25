const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      message: 'Validation failed contract check',
      errors: error.errors || error.message,
    });
  }
};

module.exports = validate;
