import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['generate', 'fix', 'explain'],
      required: true,
    },
    prompt: {
      type: String,
      default: '',
    },
    code: {
      type: String,
      default: '',
    },
    response: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: 'javascript',
    },
  },
  { timestamps: true }
);

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
export default ChatHistory;
