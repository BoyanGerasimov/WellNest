const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment
} = require('../controllers/forumController');
const { protect } = require('../middleware/auth');
const { validateForumPost, validateForumComment } = require('../middleware/validator');

// Public routes (but require authentication for like status)
router.get('/posts', protect, getPosts);
router.get('/posts/:id', protect, getPost);

// Protected routes
router.use(protect);

router.post('/posts', validateForumPost, createPost);
router.put('/posts/:id', validateForumPost, updatePost);
router.delete('/posts/:id', deletePost);
router.post('/posts/:id/like', toggleLike);
router.post('/posts/:id/comments', validateForumComment, addComment);
router.delete('/comments/:id', deleteComment);

module.exports = router;

