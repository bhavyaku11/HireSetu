import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@hiresetu.com';
  const password = await bcrypt.hash('Demo123!', 10);
  
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        password,
        name: 'Alex Developer',
      }
    });
    console.log('Created demo user:', user.email);
  } else {
    console.log('Demo user already exists.');
  }

  // Create a realistic resume for this user
  let resume = await prisma.resume.findFirst({ where: { userId: user.id, isTailored: false } });
  
  const demoContent = {
    personalInfo: {
      name: "Alex Developer",
      email: "alex@hiresetu.com",
      phone: "555-0123",
      location: "San Francisco, CA",
      website: "github.com/alexdev",
      summary: "Full-stack software engineer with 4 years of experience building scalable web applications. Proficient in React, Node.js, and cloud architectures. Passionate about performance optimization and user-centric design."
    },
    experience: [
      {
        id: "exp1",
        title: "Frontend Engineer",
        company: "TechFlow Solutions",
        startDate: "2021-03",
        endDate: "Present",
        current: true,
        description: "• Led the migration of the legacy dashboard to React 18, improving page load times by 40%.\n• Implemented state management using Redux Toolkit across 3 major products.\n• Mentored 2 junior engineers and established front-end testing standards using Jest and React Testing Library."
      },
      {
        id: "exp2",
        title: "Software Developer",
        company: "DataSync Inc",
        startDate: "2019-06",
        endDate: "2021-02",
        current: false,
        description: "• Developed RESTful APIs using Node.js and Express to serve over 10,000 daily active users.\n• Optimized PostgreSQL database queries, reducing response time by 25% for complex reports.\n• Collaborated with cross-functional teams to deliver features on a bi-weekly agile cadence."
      }
    ],
    education: [
      {
        id: "edu1",
        degree: "B.S. Computer Science",
        school: "State University",
        startDate: "2015-08",
        endDate: "2019-05",
        current: false,
        description: "Graduated with Honors. Coursework in Data Structures, Algorithms, and Distributed Systems."
      }
    ],
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Docker", "Tailwind CSS", "GraphQL"]
  };

  if (!resume) {
    resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: 'Software Engineer Master Resume',
        content: JSON.stringify(demoContent),
        isTailored: false,
        versionInfo: 'Base Master Resume'
      }
    });
    console.log('Created demo master resume.');
  } else {
    // Update existing one just in case
    resume = await prisma.resume.update({
      where: { id: resume.id },
      data: { content: JSON.stringify(demoContent) }
    });
    console.log('Updated demo master resume.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
