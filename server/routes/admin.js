const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, toggleSuspend, verifyFreelancer, approveGig, getAdminLogs, getAnalytics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/suspend', toggleSuspend);
router.put('/freelancers/:id/verify', verifyFreelancer);
router.put('/gigs/:id/approve', approveGig);
router.get('/logs', getAdminLogs);
router.get('/analytics', getAnalytics);
module.exports = router;
