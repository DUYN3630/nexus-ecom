const express = require('express');
const router = express.Router();
const partController = require('../controllers/partController');
const { protect, adminOrExpert } = require('../middleware/auth');

router.get('/', protect, adminOrExpert, partController.getAll);
router.post('/', protect, adminOrExpert, partController.create);
router.put('/:id', protect, adminOrExpert, partController.update);
router.delete('/:id', protect, adminOrExpert, partController.delete);

module.exports = router;
