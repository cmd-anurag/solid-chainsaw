const router = require('express').Router();
const {
  getPendingActivities,
  approveActivity,
  rejectActivity,
} = require('../controllers/teacherController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorizeRoles('teacher'));

router.get('/activities/pending', getPendingActivities);
router.put('/activity/approve/:id', approveActivity);
router.put('/activity/reject/:id', rejectActivity);

module.exports = router;

