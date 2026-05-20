const express = require('express');
const router = express.Router();
const warrantyController = require('../controllers/warrantyController');
const repairController = require('../controllers/repairController');
const { protect, adminOrExpert } = require('../middleware/auth');

/**
 * PUBLIC ROUTES
 */

// Diagnostic Ping
router.get('/ping', (req, res) => res.json({ message: "Support API is reachable" }));

// Repair Tracking by Phone
router.get('/repair-tracking/:phone', repairController.getByPhone);

// Warranty Check by Serial Number
router.get('/warranty/:serialNumber', warrantyController.check);

// Create Repair Request
router.post('/repair', repairController.create);

// Confirm Repair (Customer Approval)
router.post('/repair/:id/confirm', repairController.confirmRepair);

// Get Medical Record by Serial Number
router.get('/medical-record/:serialNumber', repairController.getMedicalRecord);


/**
 * USER ROUTES (Protected)
 */

// Get My Repairs
router.get('/my-repairs', protect, repairController.getMyRepairs);


/**
 * ADMIN/STAFF ROUTES (Protected)
 */

// Get All Repair Requests
router.get('/repairs', protect, adminOrExpert, repairController.getAll);

// Get Repairs assigned to an Expert
router.get('/repairs/expert/:expertId', protect, adminOrExpert, repairController.getExpertRepairs);

// Update Repair Status
router.patch('/repair/:id', protect, adminOrExpert, repairController.updateStatus);

module.exports = router;
