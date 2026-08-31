const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { listComments, createComment } = require('../controllers/commentController');

const router = express.Router();

router.use(authenticateToken);
router.get('/tickets/:ticketId/comments', listComments);
router.post('/tickets/:ticketId/comments', createComment);

module.exports = router;

/**
 * @swagger
 * /api/tickets/{ticketId}/comments:
 *   get:
 *     tags: [Comments]
 *     summary: Listar comentários de um chamado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comentários do chamado
 *   post:
 *     tags: [Comments]
 *     summary: Criar comentário em um chamado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mensagem]
 *             properties:
 *               mensagem:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comentário criado
 */
