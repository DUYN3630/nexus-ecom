const express = require('express');
const router = express.Router();
const expertController = require('../controllers/expertController');

router.get('/', expertController.getAll);
router.get('/:id', expertController.getById);

module.exports = router;
