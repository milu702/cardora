const express = require('express');
const router = express.Router();
const {
  getCommunityPosts,
  createCommunityPost,
  likeCommunityPost,
  commentOnCommunityPost,
  deleteCommunityPost,
} = require('../controllers/communityController');

router.get('/posts', getCommunityPosts);
router.post('/posts', createCommunityPost);
router.post('/posts/:id/like', likeCommunityPost);
router.post('/posts/:id/comment', commentOnCommunityPost);
router.delete('/posts/:id', deleteCommunityPost);

module.exports = router;
