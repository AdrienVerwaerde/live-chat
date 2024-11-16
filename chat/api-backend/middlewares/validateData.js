const userValidationSchema = require('./validations/userValidation');

function validateRequest(req, res, next) {
  const {error} = userValidationSchema.validate(req.body)

  if (error)
    return res.status(400).json({error: error.details[0].message })

  next();
}

module.exports = validateRequest