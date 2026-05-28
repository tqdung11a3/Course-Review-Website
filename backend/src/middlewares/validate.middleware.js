const { validationResult } = require("express-validator");

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array({ onlyFirstError: true })[0];
    return res.status(400).json({
      success: false,
      message: first.msg || "Validation failed",
      data: { errors: errors.array() },
    });
  }
  next();
}

module.exports = { validateRequest };
