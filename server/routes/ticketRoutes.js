const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, ticketController.getAllTickets);
router.put('/:id', protect, admin, ticketController.updateTicket);
router.delete('/:id', protect, admin, ticketController.deleteTicket);

module.exports = router;
