import { User } from "../model/user.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const escapeRegex = (str) => {
  if (typeof str !== "string") return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const matchKeywordInText = (text, keyword) => {
  if (!text || !keyword) return false;
  const escaped = escapeRegex(keyword);
  if (/[^a-zA-Z0-9]/.test(keyword)) {
    return new RegExp(`(^|[^a-zA-Z0-9])${escaped}($|[^a-zA-Z0-9])`, "i").test(text);
  }
  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
};

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

const categorizeSkills = (skills = []) => {
  const lowerSkills = skills.map((s) => s.toLowerCase().trim());
  const clusters = {
    frontend: [],
    backend: [],
    cloudDevOps: [],
    dataAi: [],
    architecture: [],
    other: [],
  };

  const map = [
    { cat: "frontend", items: ["react", "next.js", "nextjs", "vue", "angular", "javascript", "typescript", "html", "css", "tailwind", "redux", "ui/ux", "figma", "frontend"] },
    { cat: "backend", items: ["node.js", "nodejs", "express", "python", "django", "fastapi", "golang", "go", "java", "spring", "c++", "c#", "microservices", "rest", "graphql", "backend"] },
    { cat: "cloudDevOps", items: ["aws", "azure", "gcp", "docker", "kubernetes", "devops", "ci/cd", "terraform", "linux", "cloud", "sre"] },
    { cat: "dataAi", items: ["machine learning", "deep learning", "ai", "nlp", "computer vision", "pytorch", "tensorflow", "data science", "data analyst", "sql", "mongodb", "postgresql"] },
    { cat: "architecture", items: ["system design", "distributed systems", "scalability", "software architecture", "high availability"] },
  ];

  skills.forEach((skill) => {
    const sLow = skill.toLowerCase().trim();
    let matched = false;
    for (const group of map) {
      if (group.items.some((item) => sLow.includes(item) || item.includes(sLow))) {
        clusters[group.cat].push(skill);
        matched = true;
        break;
      }
    }
    if (!matched) {
      clusters.other.push(skill);
    }
  });

  return clusters;
};

const generateExecutiveProfileSummary = (targetUser, viewerUser = null) => {
  const name = targetUser.name || "Professional";
  const role = targetUser.role || "alumni";
  const company = targetUser.currentCompany || "";
  const title = targetUser.jobTitle || (role === "student" ? "Student" : "Technology Professional");
  const degree = targetUser.degree || "B.Tech";
  const branch = targetUser.branch || "Computer Science";
  const year = targetUser.passoutYear || "";
  const skills = targetUser.skills || [];
  const bio = targetUser.bio || "";
  const location = targetUser.location || "";
  const clusters = categorizeSkills(skills);

  let headline = "";
  if (company && title) {
    headline = `${title} at ${company} | ${degree} in ${branch}${year ? ` (Class of '${String(year).slice(-2)})` : ""}`;
  } else if (title) {
    headline = `${title} | ${branch} Specialist`;
  } else {
    headline = `${role === "alumni" ? "Alumni Member" : "Engineering Scholar"} | ${branch}`;
  }

  const currentYear = new Date().getFullYear();
  const gradYearNum = parseInt(year, 10);
  const yearsSinceGrad = gradYearNum ? Math.max(0, currentYear - gradYearNum) : 1;

  let seniorityLabel = "Early-Career Innovator";
  if (yearsSinceGrad >= 5 || (title && /senior|lead|staff|principal|manager|head/i.test(title))) {
    seniorityLabel = "Established Industry Leader";
  } else if (yearsSinceGrad >= 2) {
    seniorityLabel = "High-Impact Industry Engineer";
  } else if (role === "student") {
    seniorityLabel = "Emerging Engineering Talent";
  }

  let narrativeParagraphs = [];

  if (company && title) {
    narrativeParagraphs.push(
      `${name} is a ${seniorityLabel} currently driving engineering and technology initiatives as a ${title} at ${company}. Having earned a ${degree} in ${branch}${year ? ` (Class of ${year})` : ""}, ${name} exemplifies the academic excellence and practical engineering rigor cultivated at the university.`
    );
  } else if (role === "student") {
    narrativeParagraphs.push(
      `${name} is an active engineering student in the ${branch} department (${degree}${year ? `, Expected Class of ${year}` : ""}), actively developing core software competencies and building practical project experience.`
    );
  } else {
    narrativeParagraphs.push(
      `${name} is a verified ${role} graduate specializing in ${branch} (${degree}${year ? `, Class of ${year}` : ""}), actively engaged across the professional engineering ecosystem.`
    );
  }

  const skillHighlights = [];
  if (clusters.architecture.length > 0) skillHighlights.push(`architecting ${clusters.architecture.join(" and ")}`);
  if (clusters.backend.length > 0) skillHighlights.push(`building resilient backend infrastructure with ${clusters.backend.slice(0, 3).join(", ")}`);
  if (clusters.cloudDevOps.length > 0) skillHighlights.push(`cloud scaling via ${clusters.cloudDevOps.slice(0, 3).join(", ")}`);
  if (clusters.frontend.length > 0) skillHighlights.push(`delivering high-performance user interfaces in ${clusters.frontend.slice(0, 3).join(", ")}`);
  if (clusters.dataAi.length > 0) skillHighlights.push(`leveraging data intelligence and ${clusters.dataAi.slice(0, 3).join(", ")}`);

  if (skillHighlights.length > 0) {
    narrativeParagraphs.push(
      `Technically proficient across modern distributed environments, ${name}'s core focus includes ${skillHighlights.join(", as well as ")}. ${name} brings practical, end-to-end expertise in shipping reliable software at scale.`
    );
  } else if (skills.length > 0) {
    narrativeParagraphs.push(
      `Key technical proficiencies include ${skills.join(", ")}, with an emphasis on applied problem-solving and modern development workflows.`
    );
  }

  if (bio) {
    narrativeParagraphs.push(`Personal statement: "${bio}"`);
  }

  const mentorshipFocus = [];
  if (company) {
    mentorshipFocus.push(`Hiring lifecycle, interview strategies, and internal culture at ${company}`);
  }
  if (clusters.architecture.length > 0 || clusters.backend.length > 0) {
    mentorshipFocus.push("System design, scalable backend patterns, and production debugging");
  }
  if (clusters.frontend.length > 0) {
    mentorshipFocus.push("Frontend architecture, UI component libraries, and performance optimization");
  }
  if (clusters.cloudDevOps.length > 0) {
    mentorshipFocus.push("DevOps workflows, container orchestration, and cloud infrastructure best practices");
  }
  if (clusters.dataAi.length > 0) {
    mentorshipFocus.push("Machine learning pipelines, data processing, and analytical modeling");
  }
  mentorshipFocus.push("Resume reviews, portfolio critiques, and transition from college to industry");

  const viewerName = viewerUser?.name || "a fellow student";
  const viewerBranch = viewerUser?.branch || "Engineering";
  let targetCompanyOrField = company || "the tech industry";
  let topSkills = skills.slice(0, 2).join(" & ") || branch;

  const tailoredOutreach = `Hi ${name},\n\nI hope you're having a great week! I came across your profile in the Connectify alumni network and was really inspired by your journey from our college's ${branch} department to ${targetCompanyOrField}${title ? ` as a ${title}` : ""}.\n\nAs a current student in ${viewerBranch} interested in ${topSkills}, I would be immensely grateful for 10-15 minutes of your guidance when your schedule permits. I'd love to ask a couple of quick questions about preparing for roles in your field.\n\nThank you for your time and for supporting our alumni community!\n\nBest regards,\n${viewerName}`;

  const strengths = [];
  const suggestions = [];

  if (skills.length >= 4) {
    strengths.push(`Diverse technical stack (${skills.length} demonstrated skills)`);
  } else {
    suggestions.push("Add 3-5 specific technical skills or frameworks to enhance search discovery");
  }

  if (company && title) {
    strengths.push(`Clear professional identity as ${title} at ${company}`);
  } else {
    suggestions.push("Specify your target role or current employer to highlight your trajectory");
  }

  if (bio && bio.length > 20) {
    strengths.push("Personalized bio that establishes authenticity and career perspective");
  } else {
    suggestions.push("Draft a concise 2-sentence bio emphasizing your engineering passions and goals");
  }

  if (targetUser.mentorshipAvailable) {
    strengths.push("Active mentorship beacon enabled, signaling accessibility to student peers");
  } else if (role === "alumni") {
    suggestions.push("Enable mentorship availability if you have bandwidth for occasional student inquiries");
  }

  return {
    success: true,
    userId: targetUser._id?.toString(),
    name,
    role,
    headline,
    seniorityLabel,
    location,
    executiveSummary: narrativeParagraphs.join("\n\n"),
    summary: narrativeParagraphs.join(" "),
    competencies: {
      frontend: clusters.frontend,
      backend: clusters.backend,
      cloudDevOps: clusters.cloudDevOps,
      dataAi: clusters.dataAi,
      architecture: clusters.architecture,
      all: skills,
    },
    mentorshipFocus,
    tailoredOutreach,
    strengths,
    suggestions,
    careerTrajectory: `${degree} in ${branch}${year ? ` ('${String(year).slice(-2)})` : ""} → ${title || "Engineer"}${company ? ` @ ${company}` : ""}`,
  };
};

const generateCareerGuidance = async (queryText, user, matchedAlumni = []) => {
  const q = queryText.toLowerCase();

  if (process.env.GEMINI_API_KEY) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const systemInstruction = `You are Connectify AI, the college's official career intelligence assistant. You provide structured, motivating, practical advice for students and alumni. Keep responses clear with markdown bolding, actionable bullet points, and practical steps.`;
      const prompt = `User query: "${queryText}". The user is ${user?.name || "a college member"} (${user?.role || "student"}). Available alumni in network: ${matchedAlumni.map((a) => `${a.user?.name} (${a.jobTitle} @ ${a.currentCompany})`).join(", ")}. Provide an insightful, comprehensive answer.`;

      const geminiRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
        }),
      });

      if (geminiRes.ok) {
        const gData = await geminiRes.json();
        const geminiText = gData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (geminiText) {
          return geminiText;
        }
      }
    } catch (gErr) {
      console.warn("[Gemini API] Query skipped, using built-in intelligence engine:", gErr.message);
    }
  }

  if (/interview|crack|prep|leetcode|dsa/i.test(q)) {
    return `### 🎯 Technical Interview Preparation Playbook\n\nTo maximize your performance in technical hiring pipelines:\n\n1. **Data Structures & Algorithms (DSA Mastery)**:\n   - Focus on high-frequency patterns: Two Pointers, Sliding Window, Fast/Slow Pointers, Binary Search, BFS/DFS Tree & Graph traversals, and Dynamic Programming fundamentals.\n   - Complete the **NeetCode 150** or **Blind 75** rather than randomly solving hundreds of problems. Aim for understanding time/space complexities ($O(1)$ to $O(N \\log N)$).\n\n2. **System Design & Architecture (Mid to Senior Levels)**:\n   - Study load balancing, database sharding/replication, caching strategies (Redis), CDN edge caching, and asynchronous task queues (Kafka/RabbitMQ).\n   - Practice designing scalable real-world systems: TinyURL, Notification Service, Feed Generator, and Chat Architecture.\n\n3. **Behavioral & Company Leadership Principles**:\n   - Structure your answers using the **STAR Method** (Situation, Task, Action, Result).\n   - Have 4–5 core project stories prepared highlighting conflict resolution, technical trade-offs, and ownership.\n\n💡 *Tip: Check out our verified alumni below who work at top tech companies. You can request mock interviews or resume reviews directly via 1-on-1 Mentorship!*`;
  }

  if (/roadmap|learn|fullstack|frontend|backend|devops|machine learning|ai/i.test(q)) {
    return `### 🗺️ Comprehensive Engineering Career Roadmap\n\nHere is an industry-aligned roadmap for high-demand technical specializations:\n\n1. **Core Fundamentals**:\n   - Master one core programming language deeply (TypeScript/JavaScript, Python, Go, or Java).\n   - Master Git, terminal workflows, and HTTP/RESTful lifecycle fundamentals.\n\n2. **System Construction & Architecture**:\n   - **Fullstack**: React 19 / Next.js with Tailwind CSS on the frontend; Node.js / Express or FastAPI on the backend; PostgreSQL or MongoDB for persistence.\n   - **DevOps / Cloud**: Docker containerization, Kubernetes orchestration, CI/CD GitHub Actions, and Terraform infrastructure-as-code on AWS or GCP.\n   - **AI / ML**: Python, PyTorch/TensorFlow, Vector Databases (Pinecone/Milvus), LangChain, and fine-tuning open models.\n\n3. **Portfolio & Proof of Work**:\n   - Build 2 standout full-stack projects featuring real-time capabilities (WebSockets), secure JWT authentication, and automated cloud deployments rather than generic tutorial clones.\n\n🚀 *Browse our recommended alumni mentors below who are currently working with these exact technologies!*`;
  }

  if (/referral|reach out|message|cold message|networking/i.test(q)) {
    return `### 🤝 How to Network & Request Referrals Professionally\n\nReaching out to alumni is one of the highest-yield career strategies on Connectify:\n\n1. **The 3-Step Outreach Framework**:\n   - **Warm Connection**: Mention your shared college or department heritage immediately.\n   - **Specific Curiosity**: Reference their current company, tech stack, or open-source projects.\n   - **Low-Friction Ask**: Don't ask for a referral immediately in message #1. Ask for 10 minutes of advice or feedback on your resume.\n\n2. **High-Converting Message Template**:\n   > *"Hi [Alumni Name], I noticed your journey from our college's CS department to [Company]. As a 3rd-year student passionate about distributed systems, I'd love to ask 1 or 2 quick questions about how you navigated technical interviews. Thank you!"*\n\n3. **After Building Rapport**:\n   - Once they reply and share insights, share your tailored resume and the specific Job ID you want to apply for.\n\n✨ *Use the 'AI Summary' button on any alumni card in the directory to automatically generate a custom cold message drafted specifically for that alumnus!*`;
  }

  if (/resume|cv|placement|internship/i.test(q)) {
    return `### 📄 Resume Optimization & Placement Strategy\n\n1. **Single-Page Standard**:\n   - Use a clean, single-column format (e.g. Jake's Resume LaTeX template). Ensure ATS parseability.\n\n2. **XYZ Impact Bullet Points**:\n   - Frame accomplishments using Google's formula: *"Accomplished [X] as measured by [Y] by doing [Z]"*.\n   - E.g.: *"Reduced API response latency by 35% by implementing Redis caching and database indexing across 10k daily queries."*\n\n3. **Highlight Proof of Work**:\n   - Include live demo URLs and GitHub repository links for your top 2 projects.\n\n💡 *Ask alumni in your target companies to do a 10-minute resume critique before submitting applications!*`;
  }

  return `### 🎓 Connectify AI Insights & Guidance\n\nI analyzed your query: **"${queryText}"**.\n\nTo support your career and networking goals:\n- **Alumni Directory**: Connect directly with verified graduates working in software engineering, cloud, data science, and product management.\n- **1-on-1 Mentorship**: Request structured mentorship sessions for mock interviews, career guidance, and resume reviews.\n- **Direct Messaging**: Chat in real-time with alumni to build meaningful relationships.\n\nBelow are verified alumni whose professional background and tech stacks align with your interests. Explore their profiles or click **AI Summary** for an executive dossier!`;
};

const queryAiService = asyncHandler(async (req, res) => {
  const { query, intent = "alumni_search", context = {} } = req.body;

  if (!query || !query.trim()) {
    throw new apiError(400, "Query string is required");
  }

  const queryText = query.trim();
  const lowerQuery = queryText.toLowerCase();

  const isProfileSummaryQuery =
    /summarize\s+(my\s+)?profile|analyze\s+(my\s+)?profile|profile\s+summary|who\s+is\s+|tell\s+me\s+about\s+|summarize\s+/i.test(lowerQuery);

  if (isProfileSummaryQuery) {
    let targetUser = req.user;

    const nameMatch = queryText.match(/(?:about|summarize|who is)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/i);
    if (nameMatch && nameMatch[1] && !/my|me|profile/i.test(nameMatch[1])) {
      const searchedName = nameMatch[1].trim();
      const foundUser = await User.findOne({
        name: new RegExp(escapeRegex(searchedName), "i"),
      });
      if (foundUser) {
        targetUser = foundUser;
      }
    }

    const dossier = generateExecutiveProfileSummary(targetUser, req.user);
    const explanation = `### 📋 Executive AI Dossier: ${dossier.name}\n\n**${dossier.headline}**\n\n${dossier.executiveSummary}\n\n**Key Technical Competencies:**\n${dossier.competencies.all.length > 0 ? dossier.competencies.all.map((s) => `• ${s}`).join("\n") : "• General Engineering & Software Architecture"}\n\n**Mentorship & Guidance Value:**\n${dossier.mentorshipFocus.map((m) => `• ${m}`).join("\n")}\n\n**Draft Cold Message:**\n\`\`\`text\n${dossier.tailoredOutreach}\n\`\`\``;

    return res.status(200).json(
      new apiResponse(200, "AI Profile Dossier Generated", {
        type: "profile_summary",
        query: queryText,
        explanation,
        dossier,
        results: targetUser.role === "alumni" ? [formatAlumniRecord(targetUser)] : [],
        suggestedActions: [
          `Message ${dossier.name}`,
          "Request 1-on-1 Mentorship",
          "Find alumni at same company",
          "Review my own profile",
        ],
      })
    );
  }

  const skillsCatalog = [
    "react", "node.js", "nodejs", "python", "javascript", "typescript",
    "java", "c++", "golang", "go", "rust", "aws", "azure", "docker", "kubernetes",
    "machine learning", "deep learning", "ai", "data science", "sql",
    "mongodb", "postgresql", "fastapi", "django", "express", "flutter",
    "android", "ios", "devops", "cloud", "system design", "microservices",
    "cybersecurity", "ui/ux", "figma"
  ];

  const companiesCatalog = [
    "google", "microsoft", "amazon", "apple", "meta", "netflix",
    "uber", "adobe", "salesforce", "oracle", "cisco", "intel",
    "ibm", "tcs", "infosys", "wipro", "accenture", "deloitte",
    "flipkart", "swiggy", "zomato", "razorpay", "goldman sachs"
  ];

  const extractedSkills = skillsCatalog.filter((skill) =>
    matchKeywordInText(lowerQuery, skill)
  );

  let extractedCompany = companiesCatalog.find((comp) =>
    matchKeywordInText(lowerQuery, comp)
  );

  const yearMatch = queryText.match(/\b(20[1-2][0-9])\b/);
  const extractedYear = yearMatch ? yearMatch[1] : null;

  const mongoFilter = {
    role: "alumni",
    isActive: true,
  };

  if (extractedCompany) {
    mongoFilter.currentCompany = new RegExp(escapeRegex(extractedCompany), "i");
  }

  if (extractedSkills.length > 0) {
    mongoFilter.skills = {
      $in: extractedSkills.map((s) => new RegExp(`^${escapeRegex(s)}$`, "i")),
    };
  }

  if (extractedYear) {
    mongoFilter.passoutYear = extractedYear;
  }

  if (/mentor|guidance|guide/i.test(lowerQuery)) {
    mongoFilter.mentorshipAvailable = true;
  }

  const hasSpecificFilters = extractedCompany || extractedSkills.length > 0 || extractedYear;
  if (!hasSpecificFilters) {
    const searchRegex = new RegExp(escapeRegex(queryText), "i");
    mongoFilter.$or = [
      { name: searchRegex },
      { currentCompany: searchRegex },
      { jobTitle: searchRegex },
      { skills: searchRegex },
      { branch: searchRegex },
      { bio: searchRegex },
    ];
  }

  let matchingUsers = await User.find(mongoFilter)
    .select("-password -refreshToken -emailVerificationToken -emailVerificationExpires")
    .limit(12)
    .lean();

  if (matchingUsers.length === 0) {
    matchingUsers = await User.find({ role: "alumni", isActive: true })
      .select("-password -refreshToken -emailVerificationToken -emailVerificationExpires")
      .sort({ mentorshipAvailable: -1, createdAt: -1 })
      .limit(6)
      .lean();
  }

  const formattedResults = matchingUsers.map(formatAlumniRecord);

  const guidanceText = await generateCareerGuidance(queryText, req.user, formattedResults);

  return res.status(200).json(
    new apiResponse(200, "AI query processed successfully", {
      type: "alumni_search",
      query: queryText,
      explanation: guidanceText,
      filters: {
        company: extractedCompany,
        skills: extractedSkills,
        passingYear: extractedYear,
      },
      count: formattedResults.length,
      results: formattedResults,
      suggestedActions: [
        "How to prepare for Google SDE interview?",
        "Show graduates available for 1-on-1 mentorship",
        "Summarize my career profile & strengths",
        "How to message alumni for referrals?",
      ],
    })
  );
});

const summarizeProfile = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const targetId = userId || req.user._id;

  const targetUser = await User.findById(targetId).select(
    "name role degree branch department passoutYear currentCompany jobTitle skills bio location mentorshipAvailable linkedinUrl githubUrl"
  );

  if (!targetUser) {
    throw new apiError(404, "Target user profile not found");
  }

  const dossier = generateExecutiveProfileSummary(targetUser, req.user);

  return res.status(200).json(
    new apiResponse(200, "Profile dossier generated successfully", {
      success: true,
      ...dossier,
    })
  );
});

export { queryAiService, summarizeProfile };
