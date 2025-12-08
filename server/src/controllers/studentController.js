// backend/controllers/studentController.js
const Activity = require('../models/Activity');
const Academics = require('../models/Academics');
const Attendance = require('../models/Attendance');
const AcademicRecord = require('../models/AcademicRecord');
const { calcCGPA } = require('../utils/grades');

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

/**
 * GET /api/student/dashboard-stats
 * Get comprehensive dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Get activities
    const activities = await Activity.find({ student: studentId });
    const activitiesByStatus = {
      total: activities.length,
      approved: activities.filter((a) => a.status === 'approved').length,
      pending: activities.filter((a) => a.status === 'pending').length,
      rejected: activities.filter((a) => a.status === 'rejected').length,
    };

    const activitiesByCategory = {
      event: activities.filter((a) => a.category === 'event').length,
      achievement: activities.filter((a) => a.category === 'achievement').length,
      skill: activities.filter((a) => a.category === 'skill').length,
    };

    // Get academic records
    const academicRecords = await AcademicRecord.find({ student: studentId }).sort({
      semester: 1,
    });
    const cgpaData = calcCGPA(academicRecords);
    const latestRecord = academicRecords[academicRecords.length - 1];

    // Get attendance
    const attendanceRecords = await Attendance.find({ student: studentId }).sort({
      createdAt: -1,
    });
    const totalAttendance = attendanceRecords.reduce(
      (sum, record) => sum + record.present,
      0
    );
    const totalDays = attendanceRecords.reduce((sum, record) => sum + record.total, 0);
    const attendancePercentage =
      totalDays > 0 ? Math.round((totalAttendance / totalDays) * 100) : 0;

    // Recent activities (last 5)
    const recentActivities = await Activity.find({ student: studentId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status category createdAt');

    // Performance trend (last 4 semesters)
    const performanceTrend = academicRecords
      .slice(-4)
      .map((record) => ({
        semester: record.semester,
        sgpa: record.sgpa,
      }));

    res.json({
      activities: {
        ...activitiesByStatus,
        byCategory: activitiesByCategory,
      },
      academics: {
        cgpa: cgpaData,
        totalSemesters: academicRecords.length,
        latestSGPA: latestRecord?.sgpa || null,
        latestSemester: latestRecord?.semester || null,
        performanceTrend,
      },
      attendance: {
        percentage: attendancePercentage,
        totalPresent: totalAttendance,
        totalDays,
        records: attendanceRecords.slice(0, 6),
      },
      recentActivities,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getActivities, addActivity, getProfile, getDashboardStats };
