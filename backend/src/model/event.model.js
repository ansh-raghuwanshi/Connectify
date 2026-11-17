import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    location: {
      type: String,
      default: "Online",
      trim: true,
    },
    eventLink: {
      type: String,
      default: "",
      trim: true,
    },
    bannerUrl: {
      type: String,
      default: "",
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    capacity: {
      type: Number,
      default: 100,
    },
    category: {
      type: String,
      enum: ["Webinar", "Workshop", "Reunion", "Networking", "Career Fair", "General"],
      default: "General",
    },
  },
  { timestamps: true }
);

eventSchema.index({ date: 1 });
eventSchema.index({ organizer: 1 });

export const Event = mongoose.model("Event", eventSchema);
export default Event;
