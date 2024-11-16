const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({message: 'No token found'})
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.role = decoded.role;
    next()
  } catch (error) {
    res.status(401).json({message: 'Invalid Token'})
  }
}

module.exports = authToken;