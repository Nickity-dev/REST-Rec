const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token de autenticação ausente.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await pool.execute('SELECT id, nome, email, tipo FROM usuarios WHERE id = ?', [decoded.id]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuário não encontrado ou token inválido.' });
    }

    req.user = rows[0];
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token inválido ou expirado.' });
  }
}

module.exports = { authenticateToken };
