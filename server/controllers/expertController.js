const Expert = require('../models/Expert');

const expertController = {
  getAll: async (req, res) => {
    try {
      const experts = await Expert.find();
      res.json(experts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getById: async (req, res) => {
    try {
      const expert = await Expert.findById(req.params.id);
      res.json(expert);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = expertController;
