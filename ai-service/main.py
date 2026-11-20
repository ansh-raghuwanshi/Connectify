from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import re

app = FastAPI(
    title="Connectify AI Service",
    description="Intelligent search parsing, NLP entity extraction, and conversational assistant for Connectify",
    version="1.0.0"
)

                                                 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str = Field(..., description="The user's natural language question or discovery query")
    intent: Optional[str] = Field("alumni_search", description="Default or requested intent")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="User contextual data")

class FilterSchema(BaseModel):
    skills: List[str] = []
    company: Optional[str] = None
    jobTitle: Optional[str] = None
    branch: Optional[str] = None
    department: Optional[str] = None
    passingYear: Optional[str] = None
    location: Optional[str] = None
    mentorshipOnly: bool = False

class QueryResponse(BaseModel):
    intent: str
    query: str
    filters: Optional[Dict[str, Any]] = None
    explanation: str
    suggestedActions: List[str] = []

class ProfileSummaryRequest(BaseModel):
    name: str
    role: str
    degree: Optional[str] = ""
    branch: Optional[str] = ""
    passoutYear: Optional[str] = ""
    currentCompany: Optional[str] = ""
    jobTitle: Optional[str] = ""
    skills: List[str] = []
    bio: Optional[str] = ""

                                                        
KNOWN_SKILLS = [
    "react", "node.js", "nodejs", "python", "javascript", "typescript",
    "java", "c++", "golang", "go", "rust", "aws", "docker", "kubernetes",
    "machine learning", "deep learning", "ai", "data science", "sql",
    "mongodb", "postgresql", "fastapi", "django", "express", "flutter",
    "android", "ios", "devops", "cloud", "system design", "microservices",
    "cybersecurity", "ui/ux", "figma", "nlp", "computer vision"
]

                          
KNOWN_COMPANIES = [
    "google", "microsoft", "amazon", "apple", "meta", "netflix",
    "uber", "adobe", "salesforce", "oracle", "cisco", "intel",
    "ibm", "tcs", "infosys", "wipro", "accenture", "deloitte",
    "flipkart", "swiggy", "zomato", "razorpay", "paytm", "goldman sachs",
    "jpmorgan", "morgan stanley"
]

                         
BRANCH_MAP = {
    "computer science": "Computer Science",
    "cse": "Computer Science",
    "cs": "Computer Science",
    "information technology": "Information Technology",
    "it": "Information Technology",
    "mechanical": "Mechanical Engineering",
    "civil": "Civil Engineering",
    "electrical": "Electrical Engineering",
    "electronics": "Electronics Engineering",
    "ece": "Electronics & Communication",
    "chemical": "Chemical Engineering",
    "biotechnology": "Biotechnology"
}

def extract_search_filters(text: str) -> FilterSchema:
    lower_text = text.lower()
    filters = FilterSchema()

                       
    found_skills = []
    for skill in KNOWN_SKILLS:
                                                       
        escaped_skill = re.escape(skill)
        if any(c in skill for c in "+.#"):
            pattern = r'(?:^|[^a-zA-Z0-9])' + escaped_skill + r'(?:$|[^a-zA-Z0-9])'
        else:
            pattern = r'\b' + escaped_skill + r'\b'
        if re.search(pattern, lower_text):
            found_skills.append(skill.title() if len(skill) > 3 else skill.upper())
    filters.skills = list(set(found_skills))

                        
    for comp in KNOWN_COMPANIES:
        pattern = r'\b' + re.escape(comp) + r'\b'
        if re.search(pattern, lower_text):
            filters.company = comp.title()
            break

                                                                    
    if not filters.company:
        comp_match = re.search(r'\b(?:at|for|joined|working in)\s+([A-Z][a-zA-Z0-9&]+)', text)
        if comp_match:
            candidate = comp_match.group(1).strip()
            if candidate.lower() not in ["the", "a", "an", "my", "our"]:
                filters.company = candidate

                               
    for key, formal_name in BRANCH_MAP.items():
        pattern = r'\b' + re.escape(key) + r'\b'
        if re.search(pattern, lower_text):
            filters.branch = formal_name
            break

                                                                                          
    year_match = re.search(r'\b(20[1-2][0-9])\b', text)
    if year_match:
        filters.passingYear = year_match.group(1)

                         
    role_patterns = [
        (r'\b(?:software engineer|sde|developer)\b', "Software Engineer"),
        (r'\b(?:frontend|front-end)\b', "Frontend Engineer"),
        (r'\b(?:backend|back-end)\b', "Backend Engineer"),
        (r'\b(?:data scientist|data analyst)\b', "Data Scientist"),
        (r'\b(?:product manager|pm)\b', "Product Manager"),
        (r'\b(?:devops engineer|sre)\b', "DevOps Engineer"),
        (r'\b(?:machine learning engineer|ml engineer)\b', "ML Engineer"),
        (r'\b(?:designer|ui/ux designer)\b', "UI/UX Designer")
    ]
    for pattern, role_title in role_patterns:
        if re.search(pattern, lower_text):
            filters.jobTitle = role_title
            break

                          
    if re.search(r'\b(?:mentor|mentorship|guidance|guide me|advice)\b', lower_text):
        filters.mentorshipOnly = True

    return filters

@app.get("/")
def root():
    return {
        "service": "Connectify AI Microservice",
        "status": "online",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/v1/query", response_model=QueryResponse)
def handle_ai_query(req: QueryRequest):
    query_text = req.query.strip()
    if not query_text:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    lower = query_text.lower()

                                              
    if any(phrase in lower for phrase in ["how to", "how do i", "what is connectify", "where is", "help me use"]):
        explanation = (
            "Connectify is your college's official alumni networking hub. You can discover alumni "
            "using advanced search filters, interact with posts in the social feed, register for campus events, "
            "request career mentorship from experienced graduates, and message alumni directly."
        )
        return QueryResponse(
            intent="platform_help",
            query=query_text,
            filters=None,
            explanation=explanation,
            suggestedActions=[
                "Explore Alumni Directory",
                "Browse Upcoming Events",
                "Request Mentorship",
                "View Social Feed"
            ]
        )

                                                     
    filters = extract_search_filters(query_text)

                                                                   
    criteria_parts = []
    if filters.company:
        criteria_parts.append(f"working at {filters.company}")
    if filters.jobTitle:
        criteria_parts.append(f"with role '{filters.jobTitle}'")
    if filters.branch:
        criteria_parts.append(f"from {filters.branch}")
    if filters.skills:
        criteria_parts.append(f"skilled in {', '.join(filters.skills)}")
    if filters.passingYear:
        criteria_parts.append(f"graduated in {filters.passingYear}")
    if filters.mentorshipOnly:
        criteria_parts.append("currently offering mentorship")

    if criteria_parts:
        explanation = f"Searching for verified Connectify alumni {', '.join(criteria_parts)}."
    else:
        explanation = f"Searching alumni directory for keywords matching '{query_text}'."

    return QueryResponse(
        intent="alumni_search",
        query=query_text,
        filters=filters.model_dump(exclude_none=True),
        explanation=explanation,
        suggestedActions=[
            "Refine search with skills",
            "Filter by batch year",
            "Filter by department"
        ]
    )

@app.post("/api/v1/summarize-profile")
def summarize_profile(req: ProfileSummaryRequest):
    name = req.name or "Professional"
    company = req.currentCompany or ""
    title = req.jobTitle or ("Student" if req.role == "student" else "Technology Professional")
    degree = req.degree or "B.Tech"
    branch = req.branch or "Engineering"
    year = req.passoutYear or ""
    skills = req.skills or []
    bio = req.bio or ""

    headline = f"{title} at {company} | {degree} in {branch}" if company else f"{title} | {branch}"

    paragraphs = []
    if company and title:
        paragraphs.append(
            f"{name} is an experienced {title} at {company}. A proud graduate with a {degree} in {branch}"
            f"{f' (Class of {year})' if year else ''}, {name} brings solid technical rigor and real-world engineering problem-solving to high-scale industry environments."
        )
    else:
        paragraphs.append(
            f"{name} is an active engineering {req.role} specializing in {branch} ({degree}"
            f"{f', Class of {year}' if year else ''}), focused on modern software architectures and emerging technologies."
        )

    if skills:
        paragraphs.append(
            f"Key technical competencies include {', '.join(skills)}. {name} excels at building scalable applications, modern component libraries, and robust service architectures."
        )

    if bio:
        paragraphs.append(f"Personal profile statement: \"{bio}\"")

    outreach_template = (
        f"Hi {name},\n\n"
        f"I noticed your journey from our college's {branch} department to {company or 'the industry'}.\n"
        f"As a fellow engineering scholar, I'd love to ask a quick question about your experiences when you have a moment.\n\n"
        f"Thank you!"
    )

    return {
        "success": True,
        "name": name,
        "headline": headline,
        "summary": " ".join(paragraphs),
        "executiveSummary": "\n\n".join(paragraphs),
        "mentorshipFocus": [
            f"Hiring lifecycle and interview prep for {company or 'tech firms'}",
            "Technical architecture and production software practices",
            "Resume reviews and transition from college to industry"
        ],
        "tailoredOutreach": outreach_template,
        "strengths": [
            f"Proven domain background in {branch}",
            f"{len(skills)} verified technical skills" if skills else "Active academic involvement"
        ]
    }

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=False)
