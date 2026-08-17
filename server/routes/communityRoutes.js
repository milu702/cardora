const express = require('express');
const router = express.Router();
const {
  getCommunityPosts,
  createCommunityPost,
  likeCommunityPost,
  commentOnCommunityPost,
  deleteCommunityPost,
} = require('../controllers/communityController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/posts', optionalAuth, getCommunityPosts);
router.post('/posts', optionalAuth, createCommunityPost);
router.post('/posts/:id/like', optionalAuth, likeCommunityPost);
router.post('/posts/:id/comment', optionalAuth, commentOnCommunityPost);
router.delete('/posts/:id', optionalAuth, deleteCommunityPost);

module.exports = router;

