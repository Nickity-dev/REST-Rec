/**
 * @module controllers/authController
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

/**
 * Registra um novo usuário no sistema.
 *
 * @async
 * @param {import('express').Request} req - Requisição HTTP com nome, email e senha.
 * @param {import('express').Response} res - Resposta HTTP.
 * @returns {Promise<void>} Retorna JSON com usuário cadastrado e token.
 * @throws {Error} Em caso de falha ao registrar o usuário.
 */
async function register(req, res) {
  try {
    const { nome, email, senha, tipo = 'cliente' } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ success: false, message: 'Nome, email e senha são obrigatórios.' });
    }

    const emailNormalized = String(email).trim().toLowerCase();
    const [existingRows] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [emailNormalized]);

    if (existingRows.length > 0) {
      return res.status(409).json({ success: false, message: 'E-mail já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
      [nome.trim(), emailNormalized, senhaHash, tipo]
    );

    const user = {
      id: result.insertId,
      nome: nome.trim(),
      email: emailNormalized,
      tipo
    };

    const token = jwt.sign({ id: user.id, email: user.email, tipo: user.tipo }, JWT_SECRET, { expiresIn: '8h' });

    return res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso.',
      token,
      user
    });
  } catch (error) {
    console.error('[AUTH_REGISTER]', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao registrar usuário.' });
  }
}

/**
 * Autentica um usuário e gera um token JWT.
 *
 * @async
 * @param {import('express').Request} req - Requisição HTTP com email e senha.
 * @param {import('express').Response} res - Resposta HTTP.
 * @returns {Promise<void>} Retorna JSON com token e usuário autenticado.
 * @throws {Error} Em caso de falha de autenticação.
 */
async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios.' });
    }

    const emailNormalized = String(email).trim().toLowerCase();
    const [rows] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [emailNormalized]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }

    const user = rows[0];
    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, tipo: user.tipo }, JWT_SECRET, { expiresIn: '8h' });

    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso.',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo
      }
    });
  } catch (error) {
    console.error('[AUTH_LOGIN]', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao autenticar usuário.' });
  }
}

/**
 * Retorna os dados do usuário autenticado.
 *
 * @async
 * @param {import('express').Request} req - Requisição HTTP com usuário autenticado no req.
 * @param {import('express').Response} res - Resposta HTTP.
 * @returns {Promise<void>} Retorna os dados do usuário logado.
 */
async function me(req, res) {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        nome: req.user.nome,
        email: req.user.email,
        tipo: req.user.tipo
      }
    });
  } catch (error) {
    console.error('[AUTH_ME]', error);
    return res.status(500).json({ success: false, message: 'Erro ao buscar dados do usuário.' });
  }
}

module.exports = { register, login, me };
