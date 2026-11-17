import mongoose from "mongoose";

const mentorshipSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    alumni: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    topic: {
      type: String,
      default: "Career Guidance",
      trim: true,
    },
    message: {
      type: String,
      required: [true, "A message or note to the mentor is required"],
      trim: true,
    },
    responseNote: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

mentorshipSchema.index({ student: 1, alumni: 1 });
mentorshipSchema.index({ alumni: 1, status: 1 });

export const Mentorship = mongoose.model("Mentorship", mentorshipSchema);
export default Mentorship;
