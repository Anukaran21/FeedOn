const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username profilePicture followers following')
      .populate('comments.user', 'username profilePicture');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new post
router.post('/', authMiddleware, async (req, res) => {
  const { caption, imageUrl } = req.body;

  try {
    const newPost = new Post({
      user: req.userId,
      caption,
      imageUrl
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like a post
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.userId)) {
      post.likes.push(req.userId);
      await post.save();
    }
    res.json({ likes: post.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Comment on a post
router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({
      user: req.userId,
      comment: req.body.comment,
      date: Date.now()
    });
    await post.save();
    res.json({ comments: post.comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Delete a post
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Ensure the authenticated user owns the post
    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete the post using Mongoose's findByIdAndDelete
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;
