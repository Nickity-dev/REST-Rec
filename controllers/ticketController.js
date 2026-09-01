/**
 * @module controllers/ticketController
 */

const { pool } = require('../config/db');

/**
 * Lista todos os chamados do usuário autenticado ou de todos, conforme o perfil.
 *
 * @async
 * @param {import('express').Request} req - Requisição HTTP com usuário autenticado.
 * @param {import('express').Response} res - Resposta HTTP.
 * @returns {Promise<void>} Retorna lista de chamados.
 * @throws {Error} Em caso de falha ao consultar os chamados.
 */
async function listTickets(req, res) {
  try {
    const { user } = req;
    let query = `
      SELECT c.id, c.titulo, c.descricao, c.status, c.prioridade, c.created_at, c.updated_at,
             u.id AS cliente_id, u.nome AS cliente_nome, u.email AS cliente_email,
             t.id AS tecnico_id, t.nome AS tecnico_nome
      FROM chamados c
      LEFT JOIN usuarios u ON u.id = c.cliente_id
      LEFT JOIN usuarios t ON t.id = c.tecnico_id
    `;

    const params = [];

    if (user.tipo === 'cliente') {
      query += ' WHERE c.cliente_id = ?';
      params.push(user.id);
    }

    query += ' ORDER BY c.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return res.status(200).json({ success: true, tickets: rows });
  } catch (error) {
    console.error('[TICKETS_LIST]', error);
    return res.status(500).json({ success: false, message: 'Erro ao listar chamados.' });
  }
}

/**
 * Cria um novo chamado.
 *
 * @async
 * @param {import('express').Request} req - Requisição HTTP com dados do ticket.
 * @param {import('express').Response} res - Resposta HTTP.
 * @returns {Promise<void>} Retorna o chamado criado.
 * @throws {Error} Em caso de falha ao cadastrar o chamado.
 */
async function createTicket(req, res) {
  try {
        const { titulo, descricao, prioridade = 'Media' } = req.body;
    let { tecnico_id } = req.body;

    if (!titulo || !descricao) {
      return res.status(400).json({ success: false, message: 'Título e descrição são obrigatórios.' });
    }

    // Trata 0, undefined ou string vazia como "sem técnico atribuído"
    tecnico_id = tecnico_id ? Number(tecnico_id) : null;

    // Se um técnico foi informado, valida se ele existe antes de tentar inserir
    if (tecnico_id !== null) {
      const [tecnicoRows] = await pool.execute(
        "SELECT id FROM usuarios WHERE id = ? AND tipo = 'tecnico'",
        [tecnico_id]
      );
      if (tecnicoRows.length === 0) {
        return res.status(400).json({ success: false, message: 'Técnico informado não existe.' });
      }
    }

    const status = 'Aberto';
    const [result] = await pool.execute(
      'INSERT INTO chamados (titulo, descricao, status, prioridade, cliente_id, tecnico_id) VALUES (?, ?, ?, ?, ?, ?)',
      [titulo.trim(), descricao.trim(), status, prioridade, req.user.id, tecnico_id]
    ); 
    const [rows] = await pool.execute(
      `SELECT c.id, c.titulo, c.descricao, c.status, c.prioridade, c.created_at, c.updated_at,
              u.id AS cliente_id, u.nome AS cliente_nome, u.email AS cliente_email
       FROM chamados c
       LEFT JOIN usuarios u ON u.id = c.cliente_id
       WHERE c.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({ success: true, ticket: rows[0] });
  } catch (error) {
    console.error('[TICKETS_CREATE]', error);
    return res.status(500).json({ success: false, message: 'Erro ao criar chamado.' });
  }
}

/**
 * Busca um chamado específico pela identificação.
 *
 * @async
 * @param {import('express').Request} req - Requisição HTTP com id do ticket.
 * @param {import('express').Response} res - Resposta HTTP.
 * @returns {Promise<void>} Retorna detalhes do chamado.
 */
async function getTicketById(req, res) {
  try {
    const ticketId = Number(req.params.id);

    const [rows] = await pool.execute(
      `SELECT c.id, c.titulo, c.descricao, c.status, c.prioridade, c.created_at, c.updated_at,
              u.id AS cliente_id, u.nome AS cliente_nome, u.email AS cliente_email,
              t.id AS tecnico_id, t.nome AS tecnico_nome
       FROM chamados c
       LEFT JOIN usuarios u ON u.id = c.cliente_id
       LEFT JOIN usuarios t ON t.id = c.tecnico_id
       WHERE c.id = ?`,
      [ticketId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Chamado não encontrado.' });
    }

    return res.status(200).json({ success: true, ticket: rows[0] });
  } catch (error) {
    console.error('[TICKETS_GET_BY_ID]', error);
    return res.status(500).json({ success: false, message: 'Erro ao buscar chamado.' });
  }
}

/**
 * Atualiza o status de um chamado.
 *
 * @async
 * @param {import('express').Request} req - Requisição HTTP com o novo status.
 * @param {import('express').Response} res - Resposta HTTP.
 * @returns {Promise<void>} Retorna o chamado atualizado.
 */
async function updateTicketStatus(req, res) {
  try {
    const ticketId = Number(req.params.id);
    const { status } = req.body;
   const allowedStatuses = ['Aberto', 'Em Atendimento', 'Concluido'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status inválido.' });
    }

    const [result] = await pool.execute('UPDATE chamados SET status = ? WHERE id = ?', [status, ticketId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Chamado não encontrado.' });
    }

    const [rows] = await pool.execute('SELECT * FROM chamados WHERE id = ?', [ticketId]);
    return res.status(200).json({ success: true, ticket: rows[0] });
  } catch (error) {
    console.error('[TICKETS_UPDATE_STATUS]', error);
    return res.status(500).json({ success: false, message: 'Erro ao atualizar status do chamado.' });
  }
}

/**
 * Remove um chamado do sistema.
 *
 * @async
 * @param {import('express').Request} req - Requisição HTTP com id do ticket.
 * @param {import('express').Response} res - Resposta HTTP.
 * @returns {Promise<void>} Retorna confirmação de exclusão.
 */
async function deleteTicket(req, res) {
  try {
    const ticketId = Number(req.params.id);
    const [result] = await pool.execute('DELETE FROM chamados WHERE id = ?', [ticketId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Chamado não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Chamado removido com sucesso.' });
  } catch (error) {
    console.error('[TICKETS_DELETE]', error);
    return res.status(500).json({ success: false, message: 'Erro ao remover chamado.' });
  }
}

module.exports = {
  listTickets,
  createTicket,
  getTicketById,
  updateTicketStatus,
  deleteTicket
};
