require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

const app = express();

app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || process.env.ALLOWED_ORIGINS.split(',').includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(express.json());
app.use(cors(process.env.NODE_ENV === 'production' ? corsOptions : {}));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
