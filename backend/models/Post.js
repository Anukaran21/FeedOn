const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caption: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    required: true
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    comment: { 
      type: String, 
      required: true 
    },
    date: { 
      type: Date, 
      default: Date.now 
    }
  }],
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
