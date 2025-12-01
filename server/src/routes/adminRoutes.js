const router = require('express').Router();
const { getUsers, addUser, deleteUser } = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/users', getUsers);
router.post('/user/add', addUser);
router.delete('/user/delete/:id', deleteUser);

module.exports = router;

