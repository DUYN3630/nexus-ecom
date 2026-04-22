const Warranty = require('../models/Warranty');

const warrantyController = {
  check: async (req, res) => {
    try {
      const { serialNumber } = req.params;
      const warranty = await Warranty.findOne({ serialNumber: serialNumber.toUpperCase() });
      
      if (!warranty) {
        return res.status(404).json({ message: "Không tìm thấy thông tin bảo hành cho thiết bị này." });
      }

      res.json(warranty);
    } catch (error) {
      res.status(500).json({ message: "Lỗi hệ thống khi tra cứu bảo hành." });
    }
  }
};

module.exports = warrantyController;
