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
  mentorshipAvailable: user.mentorshipAvailable || false,
});

/**
 * AI Query & Alumni Discovery Gateway
 * Flow:
 * 1. User enters natural-language query
 * 2. Node.js backend forwards query to FastAPI microservice
 * 3. FastAPI extracts structured search filters
 * 4. Node.js validates filters and queries MongoDB for matching alumni records
 * 5. Returns real MongoDB records + explanation to frontend
 */
const queryAiService = asyncHandler(async (req, res) => {
  const { query, intent = "alumni_search", context = {} } = req.body;

  if (!query || !query.trim()) {
    throw new apiError(400, "Query string is required");
  }

  const aiServiceUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

  let aiResult = null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

  try {
    const aiResponse = await fetch(`${aiServiceUrl}/api/v1/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": req.user._id.toString(),
        "X-User-Role": req.user.role,
      },
      body: JSON.stringify({
        query: query.trim(),
        intent,
        context: {
          ...context,
          userId: req.user._id,
          userName: req.user.name,
          role: req.user.role,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (aiResponse.ok) {
      aiResult = await aiResponse.json();
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`[AI Gateway] FastAPI query skipped or timed out (${err.message}). Using native search parser fallback.`);
  }

  // If the query was platform help
  if (aiResult?.intent === "platform_help") {
    return res.status(200).json(
      new apiResponse(200, "AI guidance response", {
        type: "help",
        query: query.trim(),
        explanation: aiResult.explanation,
        suggestedActions: aiResult.suggestedActions || [],
        results: [],
      })
    );
  }

  // Build MongoDB query using AI-extracted filters or keyword fallback
  const mongoFilter = {
    role: "alumni",
    isActive: true,
  };

  const extractedFilters = aiResult?.filters || {};

  if (extractedFilters.company) {
    mongoFilter.currentCompany = new RegExp(extractedFilters.company.trim(), "i");
  }

  if (extractedFilters.jobTitle) {
    mongoFilter.jobTitle = new RegExp(extractedFilters.jobTitle.trim(), "i");
  }

  if (extractedFilters.branch) {
    mongoFilter.branch = new RegExp(extractedFilters.branch.trim(), "i");
  }

  if (extractedFilters.passingYear) {
    mongoFilter.passoutYear = extractedFilters.passingYear.toString().trim();
  }

  if (extractedFilters.skills && extractedFilters.skills.length > 0) {
    mongoFilter.skills = {
      $in: extractedFilters.skills.map((s) => new RegExp(`^${s}$`, "i")),
    };
  }

  if (extractedFilters.mentorshipOnly) {
    mongoFilter.mentorshipAvailable = true;
  }

  // If no filters were extracted, fall back to broad keyword regex across fields
  const hasSpecificFilters = Object.keys(extractedFilters).some((k) => extractedFilters[k] && extractedFilters[k].length);
  if (!hasSpecificFilters) {
    const searchRegex = new RegExp(query.trim(), "i");
    mongoFilter.$or = [
      { name: searchRegex },
      { currentCompany: searchRegex },
      { jobTitle: searchRegex },
      { skills: searchRegex },
      { branch: searchRegex },
    ];
  }

  // Fetch real records from MongoDB
  const matchingUsers = await User.find(mongoFilter)
    .select("-password -refreshToken -emailVerificationToken -emailVerificationExpires")
    .limit(20)
    .lean();

  const formattedResults = matchingUsers.map(formatAlumniRecord);

  const explanation =
    aiResult?.explanation ||
    `Found ${formattedResults.length} alumni matching your query "${query}".`;

  return res.status(200).json(
    new apiResponse(200, "AI alumni search completed", {
      type: "alumni_search",
      query: query.trim(),
      explanation,
      filters: extractedFilters,
      count: formattedResults.length,
      results: formattedResults,
      suggestedActions: aiResult?.suggestedActions || [
        "View alumni profile",
        "Request mentorship",
        "Message alumni",
      ],
    })
  );
});

/**
 * AI Profile Summarizer
 */
const summarizeProfile = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const targetId = userId || req.user._id;

  const targetUser = await User.findById(targetId).select(
    "name role degree branch passoutYear currentCompany jobTitle skills bio"
  );

  if (!targetUser) {
    throw new apiError(404, "User profile not found");
  }

  const aiServiceUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

  try {
    const response = await fetch(`${aiServiceUrl}/api/v1/summarize-profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: targetUser.name,
        role: targetUser.role,
        degree: targetUser.degree,
        branch: targetUser.branch,
        passoutYear: targetUser.passoutYear,
        currentCompany: targetUser.currentCompany,
        jobTitle: targetUser.jobTitle,
        skills: targetUser.skills || [],
        bio: targetUser.bio || "",
      }),
    });

    if (response.ok) {
      const summaryData = await response.json();
      return res.status(200).json(new apiResponse(200, "Profile summarized", summaryData));
    }
  } catch (err) {
    console.warn("[AI Gateway] Profile summary fallback used:", err.message);
  }

  // Local fallback summary
  const fallbackSummary = `${targetUser.name} is a ${targetUser.jobTitle || "Professional"} at ${
    targetUser.currentCompany || "N/A"
  }, graduated in ${targetUser.passoutYear || "recent years"} with skills in ${
    targetUser.skills?.join(", ") || "various domains"
  }.`;

  return res.status(200).json(
    new apiResponse(200, "Profile summarized", {
      success: true,
      name: targetUser.name,
      summary: fallbackSummary,
    })
  );
});

export { queryAiService, summarizeProfile };
