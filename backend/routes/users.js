
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Middleware to get current user
const getCurrentUser = async (req) => {
  const userId = req.userId; // Assuming authMiddleware sets req.userId
  return await User.findById(userId);
};

// Get user profile
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('followers', 'username profilePicture') // Populate followers with username and profilePicture
      .populate('following', 'username profilePicture'); // Populate following with username and profilePicture

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const posts = await Post.find({ user: user._id });
    res.json({ user, posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Follow a user
router.post('/follow/:id', authMiddleware, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await getCurrentUser(req);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!userToFollow.followers.includes(currentUser._id)) {
      userToFollow.followers.push(currentUser._id);
      currentUser.following.push(userToFollow._id);
      await userToFollow.save();
      await currentUser.save();
    }

    res.json({ followers: userToFollow.followers });
  } catch (err) {
    console.error('Error following user', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unfollow a user
router.delete('/follow/:id', authMiddleware, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await getCurrentUser(req);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userToUnfollow.followers.includes(currentUser._id)) {
      userToUnfollow.followers = userToUnfollow.followers.filter(followerId => followerId.toString() !== currentUser._id.toString());
      currentUser.following = currentUser.following.filter(followingId => followingId.toString() !== userToUnfollow._id.toString());
      await userToUnfollow.save();
      await currentUser.save();
    }

    res.json({ followers: userToUnfollow.followers });
  } catch (err) {
    console.error('Error unfollowing user', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
