// Every fact here comes from rajchauhan.dev, Raj's GitHub (github.com/Raj3019) or his live projects.
// Keep it that way: no invented clients, awards, reviews or numbers.

export const person = {
  first: 'Raj',
  last: 'Chauhan',
  name: 'Raj Chauhan',
  role: 'Full Stack Developer',
  status: 'Open to opportunities',
  tagline: 'Build reliable products from API to interface',
  principle: 'Good software should feel simple on the surface and stay dependable underneath.',
  email: 'rajchauhan3019@gmail.com',
  site: 'https://rajchauhan.dev',
  bio: [
    'I’m a full-stack developer who likes building products from the ground up. Depending on the work, that might mean designing an API, wiring up authentication, deploying a service, or polishing the frontend.',
    'Lately, I’ve been spending a lot of time on serverless workflows, data pipelines, and practical LLM integrations. I care about code that holds up in production and interfaces that don’t make people work harder than they need to.',
  ],
  social: [
    { label: 'GitHub', href: 'https://github.com/Raj3019', handle: '@Raj3019' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/backenddeveloperrajchauhan/', handle: 'in/backenddeveloperrajchauhan' },
    { label: 'X', href: 'https://x.com/aksharaj369', handle: '@aksharaj369' },
  ],
  contributions: 329,
};

export const stack = ['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Python', 'Node.js', 'Express.js', 'Docker', 'MongoDB', 'PostgreSQL', 'AWS', 'OpenAI'];
// Tools seen in his shipped work (NeoHire, Hunter, Swiggy agent), used in the ticker only.
export const ticker = ['TypeScript', 'React', 'Next.js', 'Node.js', 'Express.js', 'Python', 'FastAPI', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS Lambda', 'Vercel', 'OpenAI', 'Groq', 'Tailwind CSS'];

export const experience = [
  {
    org: 'Apex36 Technology Service LLP', role: 'Junior Developer', type: 'Full-time', from: 'Jul 2024', to: 'Present',
    text: 'Building backend systems, serverless APIs, authentication, data workflows, and LLM integrations for production products.',
    tags: ['Python', 'Node.js', 'AWS Lambda', 'REST APIs', 'GPT / Claude'],
  },
];
export const education = [
  { org: 'K.P.B. Hinduja College of Commerce', what: 'Bachelor of Computer Applications', when: '2021 — 2024' },
  { org: 'D.J. Doshi Gurukul of Commerce', what: 'H.S.C. · Commerce', when: 'Completed 2021' },
];

export const projects = [
  {
    id: 'neohire', name: 'NeoHire', kind: 'AI hiring', year: '2026',
    line: 'AI-powered candidate matching and recruiter discovery.',
    long: 'A two-sided hiring platform. Candidates upload a resume and get roles scored against their profile; recruiters switch modes to discover matching talent. Matching and scoring run on fast LLM inference.',
    stack: [['Next.js', 'Frontend'], ['Node.js', 'Backend'], ['Groq', 'AI inference']],
    live: 'https://www.neohire.site', code: 'https://github.com/Raj3019/NeoHire',
    img: 'neohire.webp', crop: 'neohire-match.webp', alt: 'NeoHire landing page with an AI match dashboard',
  },
  {
    id: 'indian-jobs', name: 'Indian Jobs', kind: 'Data visualisation', year: '2026',
    line: 'A data-rich view of India’s changing job market.',
    long: '211 occupations across the Indian economy in one page, from agricultural labourers to software developers. Each rectangle is sized by employment and coloured by growth outlook, median pay, education or AI exposure, built on 2024–25 survey data.',
    stack: [['Python', 'Data processing'], ['Data viz', 'Interactive analytics'], ['Vercel', 'Deployment']],
    live: 'https://indian-jobs-ten.vercel.app', code: 'https://github.com/Raj3019/indian-jobs',
    img: 'indian-jobs.webp', crop: 'indian-jobs-map.webp', alt: 'India Job Market Visualizer treemap of 211 occupations',
  },
  {
    id: 'hunter', name: 'Hunter', kind: 'Job automation', year: '2026',
    line: 'Assist-only job automation for Indian job seekers.',
    long: 'Parses a resume, searches supported job portals, scores every listing against the candidate’s profile and drafts a tailored resume per job. The user applies on the original listing and confirms the outcome in a tracker: no blind auto-apply.',
    stack: [['Python', 'FastAPI'], ['React', 'Vite'], ['Tailwind CSS', 'UI']],
    code: 'https://github.com/Raj3019/Hunter', art: 'pipeline',
  },
  {
    id: 'swiggy-agent', name: 'Swiggy AI Agent', kind: 'AI agent', year: '2026',
    line: 'A conversational agent for food, groceries and table bookings.',
    long: 'Built on the Swiggy Builders Club MCP platform. It orders food, shops for groceries and books restaurant tables through chat and Telegram, and can order from a photo: a dish becomes a food order, a recipe becomes a grocery list.',
    stack: [['Next.js', 'App'], ['Vercel AI SDK', 'Agent'], ['OpenRouter', 'Multi-model']],
    code: 'https://github.com/Raj3019/Swiggy-agent', art: 'chat',
  },
];

export const services = [
  {
    n: '01', title: 'Backend & APIs', short: 'Backend & APIs',
    statement: 'APIs, authentication and the business logic underneath, built to hold up in production.',
    text: 'REST APIs with clear contracts, auth that does what it should, and data models that stay sane as the product grows.',
    tags: ['REST APIs', 'Authentication', 'Node.js / Express', 'FastAPI', 'PostgreSQL / MongoDB'],
    media: ['code-api', 'code-auth', 'neohire-steps'],
  },
  {
    n: '02', title: 'AI & LLM integrations', short: 'AI & LLM',
    statement: 'Practical LLM features wired into real products: matching, scoring, agents and chat.',
    text: 'GPT, Claude and Groq-powered features that solve a real step in the workflow, not demos bolted onto the side.',
    tags: ['OpenAI / Claude', 'Groq', 'Vercel AI SDK', 'MCP agents', 'Prompt design'],
    media: ['neohire-match', 'code-llm', 'chat'],
  },
  {
    n: '03', title: 'Full-stack web apps', short: 'Web apps',
    statement: 'Interfaces that don’t make people work harder than they need to.',
    text: 'React and Next.js front ends connected end to end to the APIs behind them, from first screen to deployment.',
    tags: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    media: ['neohire', 'pipeline', 'code-ui'],
  },
  {
    n: '04', title: 'Serverless & cloud', short: 'Serverless',
    statement: 'Serverless workflows and deployments that stay quiet and dependable.',
    text: 'AWS Lambda functions, Vercel deployments and Docker where it helps: small moving parts that are easy to run.',
    tags: ['AWS Lambda', 'Docker', 'Vercel', 'CI / CD'],
    media: ['terminal', 'code-lambda', 'indian-jobs'],
  },
  {
    n: '05', title: 'Data pipelines & dashboards', short: 'Data & dashboards',
    statement: 'Collecting, cleaning and visualising data so a complex picture reads in one page.',
    text: 'Python pipelines that turn scattered sources into one clean dataset, and interactive views people can actually explore.',
    tags: ['Python', 'Data processing', 'Data viz', 'Interactive analytics'],
    media: ['indian-jobs-map', 'code-data', 'indian-jobs-wide'],
  },
];

export const process = [
  { t: 'Understand', d: 'Requirements, users, data and the edge cases before a line of code.' },
  { t: 'Design the system', d: 'API contracts, schema and auth decided up front, so the build stays simple.' },
  { t: 'Build & integrate', d: 'Backend, frontend and LLM features built together and tested as one product.' },
  { t: 'Ship & improve', d: 'Deployed on serverless or Vercel, watched in production and improved in small steps.' },
];

export const principles = [
  ['Code that holds up in production', 'Readable, tested where it matters, and boring in the best way once it’s live.'],
  ['Interfaces that stay out of the way', 'People shouldn’t have to work harder than they need to.'],
  ['Practical AI, not demos', 'LLM features that remove a real step from someone’s workflow.'],
  ['API to interface', 'Comfortable owning the whole path: data, backend, auth, frontend and deploy.'],
  ['Simple on the surface', 'Dependable underneath. That’s the bar for everything I ship.'],
];

export const faq = [
  ['What kind of work do you do?', 'Full-stack product work: backend systems, serverless APIs, authentication, data workflows and LLM integrations, plus the React / Next.js front ends that sit on top.'],
  ['Are you open to new opportunities?', 'Yes. I’m currently a Junior Developer at Apex36 Technology Service LLP and open to opportunities. The quickest way to reach me is email.'],
  ['Which stack do you work in?', 'TypeScript, React, Next.js and Tailwind on the front end; Node.js, Express and Python (FastAPI) on the back end; PostgreSQL and MongoDB; Docker, AWS and Vercel; OpenAI, Claude and Groq for AI features.'],
  ['Can you build AI features into an existing product?', 'That’s a big part of my recent work: matching and scoring in NeoHire and Hunter, and a multi-model agent in the Swiggy AI Agent.'],
  ['Where can I see your code?', 'Most of my projects are public on GitHub at github.com/Raj3019, with live links for NeoHire and Indian Jobs.'],
  ['How do we start?', 'Send a short note about the product or role and what you need. I’ll reply by email with questions or next steps.'],
];
