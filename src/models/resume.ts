import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  user: String,
  text: String,
  skillsDetected: [String],
  suggestions: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Resume || mongoose.model("Resume", resumeSchema);
