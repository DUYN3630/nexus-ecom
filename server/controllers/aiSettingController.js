const Setting = require('../models/Setting');

// Lấy tất cả cấu hình AI
exports.getAISettings = async (req, res) => {
  try {
    const keys = ['ai_system_instruction', 'ai_model_name', 'ai_temperature', 'ai_max_tokens'];
    const settings = await Setting.find({ key: { $in: keys } });
    
    // Chuyển mảng thành object cho dễ dùng ở frontend
    const config = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return { ...acc };
    }, {});

    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật cấu hình AI
exports.updateAISettings = async (req, res) => {
  try {
    const updates = req.body; // { key: value }
    const results = [];

    for (const [key, value] of Object.entries(updates)) {
      const setting = await Setting.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
      results.push(setting);
    }

    res.json({ message: 'Cập nhật cấu hình AI thành công', data: results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
