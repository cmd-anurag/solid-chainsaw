const Activity = require('../models/Activity');
const TeacherAssignment = require('../models/TeacherAssignment');
const User = require('../models/User');

const getPendingActivities = async (req, res) => {
  try {
    const query = { status: 'pending' };
    if (req.query.category) {
      query.category = req.query.category;
    }

    let activities = await Activity.find(query)
      .populate({
      path: 'student',
      select: 'name department batch',
      match: { department: req.user.department }
      })
      .sort({ createdAt: -1 });

    activities = activities.filter(a => a.student);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStatus = async (req, res, status) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    activity.status = status;
    activity.verifiedBy = req.user._id;
    await activity.save();

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveActivity = (req, res) => updateStatus(req, res, 'approved');
const rejectActivity = (req, res) => updateStatus(req, res, 'rejected');

/**
 * GET /api/teachers/:id/students
 * Get students assigned to a teacher
 */
const getAssignedStudents = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if teacher exists
    const teacher = await User.findById(id);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Get teacher assignment
    const assignment = await TeacherAssignment.findOne({ teacher: id }).populate(
      'studentIds',
      'name email department batch rollNumber'
    );

    if (!assignment || !assignment.studentIds || assignment.studentIds.length === 0) {
      return res.json([]);
    }

    res.json(assignment.studentIds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPendingActivities, approveActivity, rejectActivity, getAssignedStudents };

