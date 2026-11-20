import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../model/user.model.js";
import { Post } from "../model/post.model.js";
import { Event } from "../model/event.model.js";

const alumniSeedData = [
  {
    name: "Rahul Sharma",
    email: "rahul.sharma@alumni.college.edu",
    password: "Password@123",
    role: "alumni",
    enrollmentNumber: "0801CS181045",
    degree: "B.Tech",
    branch: "Computer Science",
    passoutYear: "2022",
    currentCompany: "Microsoft",
    jobTitle: "Software Engineer II",
    skills: ["React", "Node.js", "Azure", "System Design", "TypeScript", "Microservices"],
    location: "Bengaluru, India",
    bio: "SDE-2 at Microsoft Azure Core. Passionate about distributed cloud systems, scalable backend architectures, and mentoring students preparing for tech interviews.",
    linkedinUrl: "https://linkedin.com/in/rahul-sharma-demo",
    githubUrl: "https://github.com/rahul-sharma-demo",
    mentorshipAvailable: true,
    isEmailVerified: true,
    isActive: true,
  },
  {
    name: "Priya Patel",
    email: "priya.patel@alumni.college.edu",
    password: "Password@123",
    role: "alumni",
    enrollmentNumber: "0801CS171032",
    degree: "B.Tech",
    branch: "Computer Science",
    passoutYear: "2021",
    currentCompany: "Google",
    jobTitle: "Software Engineer",
    skills: ["Go", "Python", "Kubernetes", "Distributed Systems", "C++", "Docker"],
    location: "Hyderabad, India",
    bio: "Infrastructure engineer at Google Cloud. Alumna from the 2021 batch. Happy to conduct mock interviews and review resumes for SDE aspirants.",
    linkedinUrl: "https://linkedin.com/in/priya-patel-demo",
    githubUrl: "https://github.com/priya-patel-demo",
    mentorshipAvailable: true,
    isEmailVerified: true,
    isActive: true,
  },
  {
    name: "Aman Verma",
    email: "aman.verma@alumni.college.edu",
    password: "Password@123",
    role: "alumni",
    enrollmentNumber: "0801IT191012",
    degree: "B.Tech",
    branch: "Information Technology",
    passoutYear: "2023",
    currentCompany: "Amazon",
    jobTitle: "Frontend Engineer",
    skills: ["React", "Next.js", "JavaScript", "Redux", "UI/UX", "Tailwind CSS"],
    location: "Bengaluru, India",
    bio: "Frontend developer at Amazon Retail. Passionate about modern web performance, accessible component libraries, and frontend system architecture.",
    linkedinUrl: "https://linkedin.com/in/aman-verma-demo",
    githubUrl: "https://github.com/aman-verma-demo",
    mentorshipAvailable: true,
    isEmailVerified: true,
    isActive: true,
  },
  {
    name: "Sneha Gupta",
    email: "sneha.gupta@alumni.college.edu",
    password: "Password@123",
    role: "alumni",
    enrollmentNumber: "0801CS161089",
    degree: "M.Tech",
    branch: "Computer Science",
    passoutYear: "2020",
    currentCompany: "Meta",
    jobTitle: "Machine Learning Engineer",
    skills: ["Python", "PyTorch", "Machine Learning", "Deep Learning", "NLP", "LLMs"],
    location: "London / Remote",
    bio: "ML Engineer working on ranking algorithms and generative models. Available for guidance on higher studies (MS/PhD) and applied AI careers.",
    linkedinUrl: "https://linkedin.com/in/sneha-gupta-demo",
    githubUrl: "https://github.com/sneha-gupta-demo",
    mentorshipAvailable: true,
    isEmailVerified: true,
    isActive: true,
  },
  {
    name: "Vikram Singh",
    email: "vikram.singh@alumni.college.edu",
    password: "Password@123",
    role: "alumni",
    enrollmentNumber: "0801EC151067",
    degree: "B.Tech",
    branch: "Electronics & Communication",
    passoutYear: "2019",
    currentCompany: "Uber",
    jobTitle: "Senior Backend Engineer",
    skills: ["Golang", "Kafka", "Microservices", "Docker", "PostgreSQL", "Redis"],
    location: "Hyderabad, India",
    bio: "Backend specialist with 6+ years building real-time dispatch and geo-routing pipelines. Transitioned from ECE to core software development.",
    linkedinUrl: "https://linkedin.com/in/vikram-singh-demo",
    githubUrl: "https://github.com/vikram-singh-demo",
    mentorshipAvailable: false,
    isEmailVerified: true,
    isActive: true,
  },
  {
    name: "Ananya Deshmukh",
    email: "ananya.deshmukh@alumni.college.edu",
    password: "Password@123",
    role: "alumni",
    enrollmentNumber: "0801ME181005",
    degree: "B.Tech",
    branch: "Mechanical Engineering",
    passoutYear: "2022",
    currentCompany: "Tesla",
    jobTitle: "Product Design Engineer",
    skills: ["CAD", "SolidWorks", "Robotics", "Product Design", "Finite Element Analysis"],
    location: "Bengaluru, India",
    bio: "Design engineer working on structural robotics and smart mobility. Open to mentoring core engineering students.",
    linkedinUrl: "https://linkedin.com/in/ananya-deshmukh-demo",
    githubUrl: "https://github.com/ananya-deshmukh-demo",
    mentorshipAvailable: true,
    isEmailVerified: true,
    isActive: true,
  },
  {
    name: "Rohan Mehra",
    email: "rohan.mehra@alumni.college.edu",
    password: "Password@123",
    role: "alumni",
    enrollmentNumber: "0801CS201077",
    degree: "B.Tech",
    branch: "Computer Science",
    passoutYear: "2024",
    currentCompany: "Flipkart",
    jobTitle: "Software Development Engineer I",
    skills: ["Java", "Spring Boot", "MySQL", "Data Structures", "Algorithms"],
    location: "Bengaluru, India",
    bio: "Recent graduate from the 2024 batch! Cracked Flipkart campus placements. Happy to guide pre-final and final year students on on-campus interview rounds.",
    linkedinUrl: "https://linkedin.com/in/rohan-mehra-demo",
    githubUrl: "https://github.com/rohan-mehra-demo",
    mentorshipAvailable: true,
    isEmailVerified: true,
    isActive: true,
  },
];

async function seedDatabase() {
  try {
    const rawUri = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME || "connectify";

    if (!rawUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    console.log(`[Seed] Connecting to MongoDB database: ${dbName}...`);
    await mongoose.connect(rawUri, { dbName });
    console.log(`[Seed] Connected to database: ${mongoose.connection.name}`);

    console.log("[Seed] Seeding alumni records...");
    const createdUsers = [];

    for (const alumni of alumniSeedData) {
      const existing = await User.findOne({ email: alumni.email });
      if (existing) {
        console.log(`[Seed] User already exists: ${alumni.name} (${alumni.email})`);
        createdUsers.push(existing);
      } else {
        const hashedPassword = await bcrypt.hash(alumni.password, 10);
        const newUser = await User.create({
          ...alumni,
          password: hashedPassword,
        });
        console.log(`[Seed] Created alumni: ${newUser.name} - ${newUser.jobTitle} @ ${newUser.currentCompany}`);
        createdUsers.push(newUser);
      }
    }

    if (createdUsers.length >= 2) {
      const existingPosts = await Post.countDocuments();
      if (existingPosts === 0) {
        console.log("[Seed] Seeding sample community feed posts...");
        await Post.create([
          {
            author: createdUsers[0]._id,
            content: "Excited to share that our team at Microsoft is hiring fresh graduates for SDE-1 roles in Azure Core! Feel free to reach out with your resume or connect with me here on Connectify.",
            tags: ["hiring", "microsoft", "sde", "jobs"],
          },
          {
            author: createdUsers[1]._id,
            content: "Had a great mock interview session with college juniors last weekend. Strong problem-solving skills! A quick tip for everyone preparing for campus drives: always write down edge cases before coding.",
            tags: ["interviews", "dsa", "tips", "google"],
          },
          {
            author: createdUsers[2]._id,
            content: "Just open-sourced a full-stack starter kit using React and Node.js. Great resource for students building their final-year major projects. Check it out and let me know your thoughts!",
            tags: ["react", "webdev", "projects"],
          },
        ]);
        console.log("[Seed] Community posts seeded successfully.");
      }
    }

    if (createdUsers.length >= 2) {
      const existingEvents = await Event.countDocuments();
      if (existingEvents === 0) {
        console.log("[Seed] Seeding sample campus events...");
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const nextMonth = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);

        await Event.create([
          {
            title: "Cracking Big Tech Interviews: Tips from Alumni",
            description: "Join Rahul Sharma (Microsoft) and Priya Patel (Google) for an interactive Q&A on DSA preparation, system design fundamentals, and resume optimization for top product companies.",
            date: nextWeek,
            location: "Google Meet (Online)",
            category: "Webinar",
            capacity: 250,
            organizer: createdUsers[0]._id,
          },
          {
            title: "Annual Alumni Homecoming & Networking Mixer 2026",
            description: "A chance for current students, graduating seniors, and alumni to connect in person, discuss industry trends, and explore career opportunities across domains.",
            date: nextMonth,
            location: "University Auditorium & Garden",
            category: "Reunion",
            capacity: 500,
            organizer: createdUsers[1]._id,
          },
        ]);
        console.log("[Seed] Campus events seeded successfully.");
      }
    }

    console.log("====================================================");
    console.log("SEEDING COMPLETED SUCCESSFULLY!");
    console.log(`Total alumni available: ${createdUsers.length}`);
    console.log("All sample alumni passwords are: Password@123");
    console.log("====================================================");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("[Seed] Error during seeding:", err);
    process.exit(1);
  }
}

seedDatabase();
