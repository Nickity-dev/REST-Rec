/**
 * @swagger
 * /api/tickets:
 *   get:
 *     tags: [Tickets]
 *     summary: Listar chamados
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de chamados
 *   post:
 *     tags: [Tickets]
 *     summary: Criar chamado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo, descricao]
 *             properties:
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               prioridade:
 *                 type: string
 *               tecnico_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Chamado criado
 */

const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  listTickets,
  createTicket,
  getTicketById,
  updateTicketStatus,
  deleteTicket
} = require('../controllers/ticketController');

const router = express.Router();

router.use(authenticateToken);
router.get('/', listTickets);
router.post('/', createTicket);
router.get('/:id', getTicketById);
router.patch('/:id/status', updateTicketStatus);
router.delete('/:id', deleteTicket);

module.exports = router;
