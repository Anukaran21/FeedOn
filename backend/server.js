const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
const path = require('path');
const multer = require('multer');


app.use(express.json());

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Destination folder for uploads
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Filename format
  }
});

const upload = multer({ storage: storage });

// Endpoint for uploading images
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const searchuserRoutes = require('./routes/searchUser');

// Use routes
app.use('/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchuserRoutes);

dotenv.config();

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(cors());


// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

//serving frontned
app.use(express.static(path.join(__dirname , "./fronend/build")))
app.get("*",(req,res)=>{
  res.sendFile(path.join(__dirname , "./fronend/build/index.html")),
  function(err){
    res.send(err)

  }

})



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
