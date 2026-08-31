/**
 * @module controllers/commentController
 */

const { pool } = require('../config/db');

/**
 * Lista comentários de um chamado.
 *
 * @async
 * @param {import('express').Request} req - Requisição HTTP com id do ticket.
 * @param {import('express').Response} res - Resposta HTTP.
 * @returns {Promise<void>} Retorna comentários do chamado.
 */
async function listComments(req, res) {
  try {
    const ticketId = Number(req.params.ticketId);
    const [rows] = await pool.execute(
      `SELECT c.id, c.mensagem, c.created_at, u.id AS usuario_id, u.nome, u.email
       FROM comentarios_chamado c
       INNER JOIN usuarios u ON u.id = c.usuario_id
       WHERE c.chamado_id = ?
       ORDER BY c.created_at ASC`,
      [ticketId]
    );

    return res.status(200).json({ success: true, comments: rows });
  } catch (error) {
    console.error('[COMMENTS_LIST]', error);
    return res.status(500).json({ success: false, message: 'Erro ao listar comentários.' });
  }
}

/**
 * Cria um comentário em um chamado.
 *
 * @async
 * @param {import('express').Request} req - Requisição HTTP com id do ticket e mensagem.
 * @param {import('express').Response} res - Resposta HTTP.
 * @returns {Promise<void>} Retorna o comentário criado.
 */
async function createComment(req, res) {
  try {
    const ticketId = Number(req.params.ticketId);
    const { mensagem } = req.body;

    if (!mensagem || !String(mensagem).trim()) {
      return res.status(400).json({ success: false, message: 'Mensagem é obrigatória.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO comentarios_chamado (chamado_id, usuario_id, mensagem) VALUES (?, ?, ?)',
      [ticketId, req.user.id, mensagem.trim()]
    );

    const [rows] = await pool.execute(
      `SELECT c.id, c.mensagem, c.created_at, u.id AS usuario_id, u.nome, u.email
       FROM comentarios_chamado c
       INNER JOIN usuarios u ON u.id = c.usuario_id
       WHERE c.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({ success: true, comment: rows[0] });
  } catch (error) {
    console.error('[COMMENTS_CREATE]', error);
    return res.status(500).json({ success: false, message: 'Erro ao criar comentário.' });
  }
}

module.exports = { listComments, createComment };
