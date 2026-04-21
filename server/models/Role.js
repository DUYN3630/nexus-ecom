const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  roleName: { type: String, required: true },
  description: String,
  permissions: {
    canViewAllOrders: Boolean,
    canCreateOrder: Boolean,
    canEditPrice: Boolean,
    canDeleteOrder: Boolean,
    canRestoreOrder: Boolean,
    canApproveOrder: Boolean,
    canUpdateStatus: [String],
    canViewAuditLogs: Boolean
  }
});

module.exports = mongoose.model('Role', roleSchema);