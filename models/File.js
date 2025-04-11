import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('File', FileSchema); 