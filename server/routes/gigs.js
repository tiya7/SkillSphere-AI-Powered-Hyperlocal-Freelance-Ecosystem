const express = require('express');
const router = express.Router();
const {
  createGig, getGigs, getGig, updateGig, deleteGig,
  getMyGigs, getMatchedGigs, getCategories,
} = require('../controllers/gigController');
const { protect, authorize } = require('../middleware/auth');

// Public routes - specific routes BEFORE /:id
router.get('/', getGigs);
router.get('/categories', getCategories);

// Protected specific routes BEFORE /:id wildcard
router.get('/my/gigs', protect, authorize('client'), getMyGigs);
router.get('/matched/freelancer', protect, authorize('freelancer'), getMatchedGigs);

// Wildcard route last
router.get('/:id', getGig);

// Protected CRUD
router.post('/', protect, authorize('client'), createGig);
router.put('/:id', protect, authorize('client', 'admin'), updateGig);
router.delete('/:id', protect, authorize('client', 'admin'), deleteGig);

module.exports = router;
