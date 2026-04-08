const express = require('express');
const router = express.Router();
const { searchFreelancers, getFreelancerPublicProfile, globalSearch } = require('../controllers/searchController');

router.get('/', globalSearch);
router.get('/freelancers', searchFreelancers);
router.get('/freelancers/:id', getFreelancerPublicProfile);

module.exports = router;
