const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AcademicRecord = require('../models/AcademicRecord');
const { calcCGPA } = require('../utils/grades');

const allowedRoles = ['student', 'teacher', 'admin'];

const getUsers = async (req, res) => {
  try {
    const query = {};
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Filter by registration number (rollNumber)
    if (req.query.regNo) {
      query.rollNumber = req.query.regNo;
    }

    let users = await User.find(query).select('-password').sort({ createdAt: -1 });

    // If filtering by CGPA or SGPA, we need to calculate and filter
    if (req.query.cgpaMin || req.query.cgpaMax || req.query.sgpaLt || req.query.sgpaGt) {
      const filteredUsers = [];

      for (const user of users) {
        if (user.role !== 'student') {
          // Only apply CGPA/SGPA filters to students
          if (!req.query.cgpaMin && !req.query.cgpaMax) {
            filteredUsers.push(user);
          }
          continue;
        }

        // Get all academic records for this student
        const records = await AcademicRecord.find({ student: user._id }).sort({ semester: 1 });
        const cgpa = calcCGPA(records);

        // Filter by CGPA range
        if (req.query.cgpaMin && cgpa < parseFloat(req.query.cgpaMin)) {
          continue;
        }
        if (req.query.cgpaMax && cgpa > parseFloat(req.query.cgpaMax)) {
          continue;
        }

        // Filter by SGPA thresholds
        if (req.query.sgpaLt || req.query.sgpaGt) {
          const latestRecord = records[records.length - 1];
          if (!latestRecord || !latestRecord.sgpa) {
            // If no SGPA, skip if filtering by SGPA
            if (req.query.sgpaLt || req.query.sgpaGt) {
              continue;
            }
          } else {
            if (req.query.sgpaLt && latestRecord.sgpa >= parseFloat(req.query.sgpaLt)) {
              continue;
            }
            if (req.query.sgpaGt && latestRecord.sgpa <= parseFloat(req.query.sgpaGt)) {
              continue;
            }
          }
        }

        // Add CGPA to user object for frontend
        const userObj = user.toObject();
        userObj.cgpa = cgpa;
        filteredUsers.push(userObj);
      }

      users = filteredUsers;
    } else {
      // If not filtering by CGPA/SGPA, still add CGPA to student objects for convenience
      const usersWithCGPA = await Promise.all(
        users.map(async (user) => {
          if (user.role === 'student') {
            const records = await AcademicRecord.find({ student: user._id });
            const cgpa = calcCGPA(records);
            const userObj = user.toObject();
            userObj.cgpa = cgpa;
            return userObj;
          }
          return user.toObject();
        })
      );
      users = usersWithCGPA;
    }

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addUser = async (req, res) => {
  const { name, email, password = 'Welcome@123', role = 'student', department, batch } =
    req.body;
  try {
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email required' });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: allowedRoles.includes(role) ? role : 'student',
      department,
      batch,
    });
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      batch: user.batch,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/users/:id/permissions
 * Set permissions for a teacher user (admin only)
 */
const setPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: 'Permissions must be an array' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'teacher') {
      return res.status(400).json({ message: 'Permissions can only be set for teachers' });
    }

    // Validate permission names
    const validPermissions = ['viewMarks', 'editMarks'];
    const invalidPermissions = permissions.filter((p) => !validPermissions.includes(p));
    if (invalidPermissions.length > 0) {
      return res.status(400).json({
        message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
      });
    }

    user.permissions = permissions;
    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, addUser, deleteUser, setPermissions };

