const Activity = require('../models/Activity');
const Academics = require('../models/Academics');
const Attendance = require('../models/Attendance');

const getActivities = async (req, res) => {
  try {
    const query = { student: req.user._id };
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const activities = await Activity.find(query).sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addActivity = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !category) {
      return res.status(400).json({ message: 'Title and category required' });
    }

    const filePath = req.file ? `/uploads/${req.file.filename}` : undefined;

    const activity = await Activity.create({
      student: req.user._id,
      title,
      description,
      category,
      file: filePath,
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const academics = await Academics.find({ student: req.user._id }).sort({
      createdAt: -1,
    });
    const attendance = await Attendance.find({ student: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      user: req.user,
      academics,
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getActivities, addActivity, getProfile };

