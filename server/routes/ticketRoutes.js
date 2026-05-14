const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { protect, adminOrExpert } = require('../middleware/auth');

router.get('/ping', (req, res) => res.json({ message: 'Ticket routes are alive' }));
router.get('/', protect, adminOrExpert, ticketController.getAllTickets);
router.get('/history', ticketController.getTicketHistory);
router.post('/', ticketController.createTicket); // Public route for AI Chat
router.post('/:id/claim', protect, adminOrExpert, ticketController.claimTicket);
router.post('/:id/message', protect, adminOrExpert, ticketController.sendExpertMessage);
router.put('/:id', protect, adminOrExpert, ticketController.updateTicket);
router.delete('/:id', protect, adminOrExpert, ticketController.deleteTicket);

module.exports = router;
