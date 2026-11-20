import { Mentorship } from "../model/mentorship.model.js";
import { User } from "../model/user.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const requestMentorship = asyncHandler(async (req, res) => {
  const { alumniId, topic, message } = req.body;
  const studentId = req.user._id;

  if (!alumniId) {
    throw new apiError(400, "Alumni mentor ID is required");
  }

  if (!message || !message.trim()) {
    throw new apiError(400, "Please introduce yourself and explain your mentorship goal");
  }

  const alumni = await User.findOne({ _id: alumniId, role: "alumni", isActive: true });
  if (!alumni) {
    throw new apiError(404, "Alumni mentor not found or inactive");
  }

  const existingPending = await Mentorship.findOne({
    student: studentId,
    alumni: alumniId,
    status: "pending",
  });

  if (existingPending) {
    throw new apiError(400, "You already have a pending mentorship request with this mentor");
  }

  const request = await Mentorship.create({
    student: studentId,
    alumni: alumniId,
    topic: topic ? topic.trim() : "Career Guidance",
    message: message.trim(),
  });

  const populated = await Mentorship.findById(request._id)
    .populate("student", "name email role profilePicture branch passoutYear")
    .populate("alumni", "name email role profilePicture currentCompany jobTitle");

  return res
    .status(201)
    .json(new apiResponse(201, "Mentorship request submitted successfully", populated));
});

const getMyMentorshipRequests = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;

  const query = role === "alumni" ? { alumni: userId } : { student: userId };

  const requests = await Mentorship.find(query)
    .populate("student", "name email role profilePicture branch passoutYear")
    .populate("alumni", "name email role profilePicture currentCompany jobTitle")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new apiResponse(200, "Mentorship requests retrieved successfully", requests));
});

const updateMentorshipStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, responseNote } = req.body;

  const validStatuses = ["accepted", "rejected", "completed"];
  if (!status || !validStatuses.includes(status)) {
    throw new apiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const request = await Mentorship.findById(id);
  if (!request) {
    throw new apiError(404, "Mentorship request not found");
  }

  if (request.alumni.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new apiError(403, "You do not have permission to update this mentorship request");
  }

  request.status = status;
  if (responseNote !== undefined) request.responseNote = responseNote.trim();
  await request.save();

  const populated = await Mentorship.findById(request._id)
    .populate("student", "name email role profilePicture branch passoutYear")
    .populate("alumni", "name email role profilePicture currentCompany jobTitle");

  return res
    .status(200)
    .json(new apiResponse(200, `Mentorship request ${status} successfully`, populated));
});

export { requestMentorship, getMyMentorshipRequests, updateMentorshipStatus };
