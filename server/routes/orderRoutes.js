const express = require('express');
const router = express.Router();
const {
    getAllOrders,
    createOrder,
    updateOrder,
    softDeleteOrder,
    restoreOrder,
    getPurchasedProducts
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// Tất cả các route dưới đây đều được bảo vệ
router.use(protect);

router.get('/purchased-products', getPurchasedProducts);

router.route('/')
    .get(getAllOrders)
    .post(createOrder);

router.route('/:id')
    .put(updateOrder);

router.route('/:id/soft-delete')
    .patch(softDeleteOrder);

router.route('/:id/restore')
    .patch(restoreOrder);

module.exports = router;
