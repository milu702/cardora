const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  likePost,
  commentOnPost,
  updateComment,
  sharePost,
  savePost,
  reportPost,
  updatePost,
  deletePost,
  searchPosts,
} = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/search', searchPosts);

router.route('/posts')
  .post(protect, upload.array('images', 5), createPost)
  .get(getPosts);

router.route('/posts/:id')
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.post('/posts/:id/like', protect, likePost);
router.post('/posts/:id/comment', protect, commentOnPost);
router.put('/posts/:postId/comments/:commentId', protect, updateComment);
router.post('/posts/:id/share', sharePost);
router.post('/posts/:id/save', protect, savePost);
router.post('/posts/:id/report', protect, reportPost);

module.exports = router;
