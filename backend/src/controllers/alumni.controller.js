import { User } from "../model/user.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Format user document to match frontend alumni interface
 */
const formatAlumniRecord = (user) => ({
  id: user._id.toString(),
  user: {
    id: user._id.toString(),
    name: user.name,
    profilePicture: user.profilePicture || null,
  },
  degree: user.degree || "B.Tech",
  branch: user.branch || "",
  passingYear: user.passoutYear ? parseInt(user.passoutYear, 10) || user.passoutYear : null,
  currentCompany: user.currentCompany || "",
  jobTitle: user.jobTitle || "",
  skills: user.skills || [],
  bio: user.bio || "",
  location: user.location || "",
  linkedinUrl: user.linkedinUrl || "",
  githubUrl: user.githubUrl || "",
  mentorshipAvailable: user.mentorshipAvailable || false,
  createdAt: user.createdAt,
});

/**
 * Get all alumni with advanced search, filtering, and pagination
 */
const getAlumni = asyncHandler(async (req, res) => {
  const {
    search,
    branch,
    department,
    passingYear,
    passoutYear,
    company,
    currentCompany,
    skills,
    location,
    page = 1,
    limit = 10,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  // Query alumni users
  const filter = {
    role: "alumni",
    isActive: true,
  };

  // Search by keyword across name, company, skills, or job title
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    filter.$or = [
      { name: searchRegex },
      { currentCompany: searchRegex },
      { jobTitle: searchRegex },
      { skills: searchRegex },
      { branch: searchRegex },
    ];
  }

  if (branch) {
    filter.branch = new RegExp(`^${branch.trim()}$`, "i");
  }

  if (department) {
    filter.department = new RegExp(`^${department.trim()}$`, "i");
  }

  const targetYear = passingYear || passoutYear;
  if (targetYear) {
    filter.passoutYear = targetYear.toString().trim();
  }

  const targetCompany = company || currentCompany;
  if (targetCompany) {
    filter.currentCompany = new RegExp(targetCompany.trim(), "i");
  }

  if (location) {
    filter.location = new RegExp(location.trim(), "i");
  }

  if (skills) {
    const skillList = Array.isArray(skills)
      ? skills
      : skills.split(",").map((s) => s.trim());
    filter.skills = { $in: skillList.map((s) => new RegExp(`^${s}$`, "i")) };
  }

  const [total, alumniUsers] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select("-password -refreshToken -emailVerificationToken -emailVerificationExpires")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
  ]);

  const formattedData = alumniUsers.map(formatAlumniRecord);

  return res.status(200).json({
    success: true,
    message: "Alumni retrieved successfully",
    data: formattedData,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  });
});

/**
 * Get alumni by ID
 */
const getAlumniById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findOne({
    _id: id,
    role: "alumni",
    isActive: true,
  }).select("-password -refreshToken -emailVerificationToken -emailVerificationExpires");

  if (!user) {
    throw new apiError(404, "Alumni profile not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Alumni retrieved successfully", formatAlumniRecord(user)));
});

/**
 * Update current logged-in alumni profile
 */
const updateAlumniProfile = asyncHandler(async (req, res) => {
  const {
    currentCompany,
    jobTitle,
    skills,
    degree,
    branch,
    passoutYear,
    passingYear,
    bio,
    location,
    linkedinUrl,
    githubUrl,
    mentorshipAvailable,
  } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new apiError(404, "User not found");
  }

  if (currentCompany !== undefined) user.currentCompany = currentCompany;
  if (jobTitle !== undefined) user.jobTitle = jobTitle;
  if (skills && Array.isArray(skills)) user.skills = skills;
  if (degree !== undefined) user.degree = degree;
  if (branch !== undefined) user.branch = branch;
  if (passoutYear || passingYear) user.passoutYear = (passoutYear || passingYear).toString();
  if (bio !== undefined) user.bio = bio;
  if (location !== undefined) user.location = location;
  if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;
  if (githubUrl !== undefined) user.githubUrl = githubUrl;
  if (mentorshipAvailable !== undefined) user.mentorshipAvailable = Boolean(mentorshipAvailable);

  await user.save();

  return res
    .status(200)
    .json(new apiResponse(200, "Alumni profile updated successfully", formatAlumniRecord(user)));
});

export { getAlumni, getAlumniById, updateAlumniProfile };
