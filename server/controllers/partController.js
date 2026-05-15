const Part = require('../models/Part');

const partController = {
  // @desc    Get all parts
  // @route   GET /api/parts
  // @access  Private/Admin
  getAll: async (req, res) => {
    try {
      const parts = await Part.find().sort({ name: 1 });
      res.json(parts);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách linh kiện", error: error.message });
    }
  },

  // @desc    Create a new part
  // @route   POST /api/parts
  // @access  Private/Admin
  create: async (req, res) => {
    try {
      const { name, sku, category, stock, price, compatibleDevices, description } = req.body;
      
      const partExists = await Part.findOne({ sku });
      if (partExists) {
        return res.status(400).json({ message: "SKU này đã tồn tại" });
      }

      const newPart = new Part({
        name,
        sku,
        category,
        stock,
        price,
        compatibleDevices,
        description
      });

      await newPart.save();
      res.status(201).json(newPart);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi tạo linh kiện", error: error.message });
    }
  },

  // @desc    Update a part
  // @route   PUT /api/parts/:id
  // @access  Private/Admin
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedPart = await Part.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedPart) {
        return res.status(404).json({ message: "Không tìm thấy linh kiện" });
      }
      res.json(updatedPart);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật linh kiện", error: error.message });
    }
  },

  // @desc    Delete a part
  // @route   DELETE /api/parts/:id
  // @access  Private/Admin
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedPart = await Part.findByIdAndDelete(id);
      if (!deletedPart) {
        return res.status(404).json({ message: "Không tìm thấy linh kiện" });
      }
      res.json({ message: "Đã xóa linh kiện thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa linh kiện", error: error.message });
    }
  }
};

module.exports = partController;
