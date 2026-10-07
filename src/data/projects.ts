import { socialUrls } from './site'

export interface Project {
  slug: string
  title: string
  image: string
  imageAlt: string
  summary: string
  description: string
  technologies: string[]
  features: string[]
  liveDemo: string | null
  sourceCode: string | null
  reverse: boolean
  // Case study fields. Optional sections are rendered only when filled in with verified facts.
  problem?: string
  role: string
  built: string[]
  facts?: string[]
  outcome?: string[]
}

export const projects: Project[] = [
  {
    slug: 'love-leetcode',
    title: 'Love LeetCode',
    image: '/Loveleetcode.png',
    imageAlt: 'Love LeetCode home page: a DSA practice platform with problem sets and an in-browser code editor',
    summary: 'A DSA practice platform with customised problem sets, learning paths and an in-browser code editor.',
    description: 'A full-stack platform for practising data structures and algorithms. Learners pick problems by pattern, difficulty and frequency, follow level-based learning paths, run code in the browser and track their progress.',
    technologies: ['Node js', 'Express', 'Prisma', 'PostgreSQL', 'Auth0', 'React', 'Monaco-editor', 'Tailwind CSS', 'Zod', 'Zustand'],
    features: ['Customised problem sets', 'Level-based learning paths', 'In-browser code execution', 'Personal problem sheets', 'Progress tracking', 'Cloud storage'],
    liveDemo: 'https://loveleetcode.in',
    sourceCode: `${socialUrls.github}/love-leetcode-platform`,
    reverse: false,
    problem: 'Practising DSA usually means juggling a problem list, an editor and a progress spreadsheet in separate places.',
    role: 'Built and maintain the frontend and backend.',
    built: [
      'A problem library that can be filtered by pattern, difficulty and frequency.',
      'Four level-based learning paths, from beginner to advanced.',
      'An in-browser code editor (Monaco) that runs code against test cases.',
      'A dashboard with progress statistics and personal playlists.',
    ],
    outcome: ['200+ registered users.'],
    facts: [
      '79 commits in the frontend repository and 52 in the backend repository.',
      'The frontend repository has 8 outside contributors, opened up for Hacktoberfest 2025.',
    ],
  },
  {
    slug: 'dcode',
    title: 'Dcode',
    image: '/Dcode.png',
    imageAlt: 'Dcode home page: an open-source collaboration platform for student developers',
    summary: 'A student-led open-source platform where developers find projects, contribute and track progress.',
    description: 'A platform that connects student developers with open-source projects. Users explore projects, contribute through pull requests, and follow their progress through streaks and a leaderboard.',
    technologies: ['React', 'Node.js', 'Firebase', 'MongoDB', 'Firebase Auth', 'Auth0'],
    features: ['User authentication and onboarding', 'Contribution management', 'Leaderboard recognition', 'Progress tracking and streaks', 'Admin tools'],
    liveDemo: null, // dcode.codes is offline; the GitHub repository is the link for now
    sourceCode: 'https://github.com/DCODE-HQ/DCODE-platform',
    reverse: true,
    problem: 'Students who want to start with open source often do not know where to begin or how to track their contributions.',
    role: 'Contributor in the DCODE-HQ organisation, working on the backend setup, data models and interface fixes.',
    built: [
      'Backend setup and data models.',
      'Interface fixes, including the contact page.',
      'Documentation: README improvements.',
    ],
    facts: [
      'Second-largest contributor to the platform repository by commits: 91 of about 368.',
      'The DCODE-HQ organisation describes DCODE as a student-led open-source initiative.',
    ],
  },
  {
    slug: 'neutron-2025',
    title: 'Neutron 2025',
    image: '/Neutron2025.png',
    imageAlt: 'Neutron 2025 festival website home page in a Windows 95 inspired theme',
    summary: 'The website for Neutron 2.0 (2025), the tech fest of Newton School of Technology and Rishihood University.',
    description: 'The festival website for Neutron Fest, an AI-focused techno-cultural festival by Newton School of Technology and Rishihood University, with event details, schedules, registration and partner information.',
    technologies: ['React', 'Tailwind CSS', 'CSS'],
    features: ['Event details', 'Schedules', 'Registration', 'Partner information', 'Dynamic navigation'],
    liveDemo: 'https://neutron2-0-windows95.vercel.app',
    sourceCode: null,
    reverse: false,
    problem: 'The festival needed a new website for its second edition, Neutron 2.0.',
    role: 'Frontend developer on the team that rebuilt the site from scratch (March to April 2025).',
    built: [
      'The festival site in React and Tailwind CSS, rebuilt from scratch for the second edition.',
      'Event, workshop and competition listings with schedules.',
      'Registration and partner information pages.',
    ],
    outcome: [
      'The site received 200K+ views.',
      'The festival drew 2K+ attendees through paid registrations.',
    ],
  },
  {
    slug: 'health-up',
    title: 'Health Up',
    image: '/Health-Up.jpeg',
    imageAlt: 'Health Up home page: a fitness tracking web application',
    summary: 'A fitness web app for workout plans, nutrition tracking and progress monitoring.',
    description: 'A health and fitness app with personalised workout plans, nutrition tracking and progress monitoring.',
    technologies: ['React', 'Tailwind CSS', 'JavaScript'],
    features: ['Personalised workout plans', 'Nutrition tracking', 'Progress monitoring'],
    liveDemo: 'https://health-up-weld.vercel.app/',
    sourceCode: `${socialUrls.github}/Health-UP`,
    reverse: true,
    role: 'Built the frontend; the backend lives in a separate repository (Health_Up_backend).',
    built: [
      'A React frontend with Google sign-in.',
      'Workout plan, nutrition and progress views.',
    ],
  },
  {
    slug: 'university-fest',
    title: 'University Fest',
    image: '/Neutron2.O-retro.jpeg',
    imageAlt: 'University fest website home page in a retro theme',
    summary: 'A retro-themed website for a university fest: events, schedules and registration.',
    description: 'A university fest website that lists events, workshops and competitions, with registration and announcements.',
    technologies: ['React', 'Tailwind CSS', 'JavaScript'],
    features: ['Event details', 'Schedules', 'Registration', 'Partner information'],
    liveDemo: 'https://neutron2-0-retro.vercel.app/',
    sourceCode: null,
    reverse: false,
    role: 'Frontend Developer.',
    built: [
      'A retro-themed fest site in React and Tailwind CSS.',
      'Event listings, schedules and registration.',
    ],
  },
]

export const getProject = (slug: string) => projects.find((p) => p.slug === slug)
