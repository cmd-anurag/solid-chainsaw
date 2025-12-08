// backend/controllers/analyticsController.js
const User = require('../models/User');
const Activity = require('../models/Activity');
const AcademicRecord = require('../models/AcademicRecord');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { calcCGPA } = require('../utils/grades');

/**
 * GET /api/analytics/overview
 * Get comprehensive analytics overview
 */
const getOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalActivities,
      pendingActivities,
      approvedActivities,
      totalAcademicRecords,
      recentNotifications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      Activity.countDocuments(),
      Activity.countDocuments({ status: 'pending' }),
      Activity.countDocuments({ status: 'approved' }),
      AcademicRecord.countDocuments(),
      Notification.countDocuments({ read: false }),
    ]);

    res.json({
      users: {
        total: totalUsers,
        students: totalStudents,
        teachers: totalTeachers,
        admins: totalUsers - totalStudents - totalTeachers,
      },
      activities: {
        total: totalActivities,
        pending: pendingActivities,
        approved: approvedActivities,
        rejected: totalActivities - pendingActivities - approvedActivities,
      },
      academics: {
        totalRecords: totalAcademicRecords,
      },
      notifications: {
        unread: recentNotifications,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/analytics/activities
 * Get activity analytics with trends
 */
const getActivityAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Activity trends by date
    const activitiesByDate = await Activity.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Activities by category
    const activitiesByCategory = await Activity.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
          },
        },
      },
    ]);

    // Activities by status
    const activitiesByStatus = await Activity.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      trends: activitiesByDate,
      byCategory: activitiesByCategory,
      byStatus: activitiesByStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/analytics/academics
 * Get academic performance analytics
 */
const getAcademicAnalytics = async (req, res) => {
  try {
    // Get all academic records
    const records = await AcademicRecord.find().populate('student', 'name department batch');

    // Calculate statistics
    const sgpaValues = records.map((r) => r.sgpa).filter((s) => s != null);
    const avgSGPA = sgpaValues.length > 0
      ? sgpaValues.reduce((a, b) => a + b, 0) / sgpaValues.length
      : 0;

    // SGPA distribution
    const distribution = {
      excellent: sgpaValues.filter((s) => s >= 9).length,
      good: sgpaValues.filter((s) => s >= 8 && s < 9).length,
      average: sgpaValues.filter((s) => s >= 7 && s < 8).length,
      belowAverage: sgpaValues.filter((s) => s < 7).length,
    };

    // Performance by semester
    const bySemester = await AcademicRecord.aggregate([
      {
        $group: {
          _id: '$semester',
          count: { $sum: 1 },
          avgSGPA: { $avg: '$sgpa' },
          maxSGPA: { $max: '$sgpa' },
          minSGPA: { $min: '$sgpa' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Performance by department
    const byDepartment = await AcademicRecord.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      { $unwind: '$studentInfo' },
      {
        $group: {
          _id: '$studentInfo.department',
          count: { $sum: 1 },
          avgSGPA: { $avg: '$sgpa' },
        },
      },
    ]);

    res.json({
      overall: {
        totalRecords: records.length,
        avgSGPA: Math.round(avgSGPA * 100) / 100,
        distribution,
      },
      bySemester,
      byDepartment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/analytics/users
 * Get user analytics
 */
const getUserAnalytics = async (req, res) => {
  try {
    // Users by role
    const byRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    // Users by department
    const byDepartment = await User.aggregate([
      {
        $match: { department: { $exists: true, $ne: null } },
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Users by batch
    const byBatch = await User.aggregate([
      {
        $match: { batch: { $exists: true, $ne: null }, role: 'student' },
      },
      {
        $group: {
          _id: '$batch',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    // Recent registrations
    const recentRegistrations = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);

    res.json({
      byRole,
      byDepartment,
      byBatch,
      recentRegistrations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOverview,
  getActivityAnalytics,
  getAcademicAnalytics,
  getUserAnalytics,
};

