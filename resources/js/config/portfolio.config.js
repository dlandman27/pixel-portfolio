// portfolio.config.js
// Configuration for portfolio projects and gallery displays

var PORTFOLIO_PROJECTS = [
  // Software Projects - Main Portfolio
  {
    id: "random-sites",
    title: "Random Sites On The Web!",
    category: "software-projects",
    description: "Random Sites On The Web is a portfolio of random websites I build. Some are useful and some are just fun to play with. It is a great site to explore and see the variety of projects I've worked on.",
    image: "resources/images/portfolio/RSOTW.png",
    link: "https://randomsitesontheweb.com/",
    type: "website"
  },
  {
    id: "colorle",
    title: "Colorle",
    category: "software-projects",
    description: "Daily color guessing game where you guess the RGB values of a color. A fun and interactive way to explore the world of colors and challenge your color recognition skills.",
    image: null,
    placeholder: "COLORLE",
    placeholderColor: true, // Use random color for background
    link: "https://randomsitesontheweb.com/sites/colorle/",
    type: "website"
  },
  {
    id: "tailwind-fractal",
    title: "Tailwind CSS Fractal",
    category: "software-projects",
    description: "Interactive color scheme visualization tool. Experiment with different colors and see how they would look on your website. A unique tool for visualizing color schemes and exploring their impact on user experience.",
    image: null,
    placeholder: "FRACTAL",
    placeholderFractal: true, // Use fractal pattern
    link: "https://randomsitesontheweb.com/sites/fractal/",
    type: "website"
  },
  {
    id: "picsum-generator",
    title: "Picsum Photo Generator",
    category: "software-projects",
    description: "Browse and copy endless stock photos for your projects. This site allows for endless scrolling through all the images from picsum.com. You can copy images by clicking on them, and use the URL to add as a stock photo in your site.",
    image: "resources/images/portfolio/picsum.png",
    link: "https://randomsitesontheweb.com/sites/randomphotos/",
    type: "website"
  },
  {
    id: "wiigit",
    title: "Wiigit",
    category: "software-projects",
    description: "Wiigit is a mobile productivity app to help people stay focused and see their progress over time, by showing insights on their habits and productivity.",
    image: "resources/images/portfolio/wgt.webp",
    link: "https://wiigit.com",
    type: "mobile-app"
  },
  
  // Web Development Projects
  {
    id: "playbook-raise",
    title: "Playbook Raise",
    category: "web-development",
    description: "Playbook Raise is a fundraising platform that I worked on, designed to help kids raise money for their teams and win prizes. This platform has been incredibly successful, generating over $2 million in funds. An example of the work I did for Playbook Sports, a software company I worked with.",
    image: "resources/images/portfolio/raise.png",
    link: "https://teambuildlegacy.playbookraise.com/details/1711/",
    type: "website"
  },
  
  // Logo Design Projects
  {
    id: "logo-516",
    title: "516 Logo Design",
    category: "logos",
    description: "A logo design project showcasing creative branding work.",
    image: "resources/images/portfolio/logos/516.jpg",
    link: "",
    type: "logo"
  },
  {
    id: "logo-thespian",
    title: "Thespian Logo",
    category: "logos",
    description: "Logo design for a theater organization.",
    image: "resources/images/portfolio/logos/thespian.png",
    link: "",
    type: "logo"
  },
  {
    id: "logo-tee-time",
    title: "Tee Time Logo",
    category: "logos",
    description: "Golf-themed logo design.",
    image: "resources/images/portfolio/logos/tee-time.jpg",
    link: "",
    type: "logo"
  },
  {
    id: "logo-nyitcom",
    title: "NYITCOM Logo",
    category: "logos",
    description: "Logo design for NYIT College of Osteopathic Medicine.",
    image: "resources/images/portfolio/logos/NYITCOM.png",
    link: "",
    type: "logo"
  },
  {
    id: "logo-metny",
    title: "METNY Logo",
    category: "logos",
    description: "Logo design project.",
    image: "resources/images/portfolio/logos/METNY.jpg",
    link: "",
    type: "logo"
  },
  {
    id: "logo-senior-experience",
    title: "Senior Experience Logo",
    category: "logos",
    description: "Logo design for senior experience program.",
    image: "resources/images/portfolio/logos/senior-experience.png",
    link: "",
    type: "logo"
  },
  
  // Graphics Projects
  {
    id: "graphic-abstract",
    title: "Abstract Graphics",
    category: "logos",
    description: "Abstract graphic design work.",
    image: "resources/images/portfolio/graphics/abstract copy.jpg",
    link: "",
    type: "graphic"
  },
  {
    id: "graphic-gears",
    title: "Gears Graphic",
    category: "logos",
    description: "Industrial-themed graphic design.",
    image: "resources/images/portfolio/graphics/gears copy.jpg",
    link: "",
    type: "graphic"
  },
  {
    id: "graphic-halloween",
    title: "Halloween Graphics",
    category: "logos",
    description: "Seasonal graphic design work.",
    image: "resources/images/portfolio/graphics/halloween.jpg",
    link: "",
    type: "graphic"
  },
  {
    id: "graphic-march-madness",
    title: "March Madness Graphics",
    category: "logos",
    description: "Sports-themed graphic design.",
    image: "resources/images/portfolio/graphics/march-madness.jpg",
    link: "",
    type: "graphic"
  },
  
  // UX Design
  {
    id: "virtual-classroom",
    title: "Reimagining the Virtual Classroom",
    category: "ux-design",
    description: "Virtual classrooms have remained popular post-COVID-19 due to benefits like accessibility and safety. However, they face challenges such as limited student-teacher interaction, mismatched expectations, and difficulties in assessing student understanding. This work reviews current virtual classroom systems addressing these issues and proposes solutions inspired by the success of physical classrooms to enhance engagement and interactivity in online learning.",
    image: "resources/images/portfolio/geometry.png",
    link: "https://dl.acm.org/doi/abs/10.1145/3591196.3596617",
    type: "research-paper",
    published: true
  },
  
  // Video Projects
  {
    id: "video-canon-collision",
    title: "Canon Collision",
    category: "logos",
    description: "Video project showcasing creative motion graphics and animation work.",
    image: null,
    placeholder: "VIDEO",
    video: "resources/images/portfolio/videos/canon-collision.mp4",
    type: "graphic"
  },
  {
    id: "video-freedom-boat-club",
    title: "Freedom Boat Club",
    category: "logos",
    description: "Video production work for Freedom Boat Club.",
    image: null,
    placeholder: "VIDEO",
    video: "resources/images/portfolio/videos/freedom-boat-club.mp4",
    type: "graphic"
  },
  {
    id: "video-li-script",
    title: "LI Script",
    category: "logos",
    description: "Video project featuring script and motion graphics.",
    image: null,
    placeholder: "VIDEO",
    video: "resources/images/portfolio/videos/li-script.mp4",
    type: "graphic"
  },
  {
    id: "video-maximum-security",
    title: "Maximum Security",
    category: "logos",
    description: "Video production showcasing security-focused content.",
    image: null,
    placeholder: "VIDEO",
    video: "resources/images/portfolio/videos/maximum-security.mp4",
    type: "graphic"
  },
  {
    id: "video-schmidts",
    title: "Schmidts",
    category: "logos",
    description: "Video project for Schmidts brand.",
    image: null,
    placeholder: "VIDEO",
    video: "resources/images/portfolio/videos/schmidts.mp4",
    type: "graphic"
  },
  {
    id: "video-seo",
    title: "SEO Video",
    category: "logos",
    description: "Video content focused on SEO and digital marketing.",
    image: null,
    placeholder: "VIDEO",
    video: "resources/images/portfolio/videos/SEO.mp4",
    type: "graphic"
  },
  {
    id: "video-social-media",
    title: "Social Media",
    category: "logos",
    description: "Social media video content and animation.",
    image: null,
    placeholder: "VIDEO",
    video: "resources/images/portfolio/videos/social-media.mp4",
    type: "graphic"
  },
  {
    id: "video-soma",
    title: "SOMA",
    category: "logos",
    description: "Video production project for SOMA.",
    image: null,
    placeholder: "VIDEO",
    video: "resources/images/portfolio/videos/SOMA.mp4",
    type: "graphic"
  }
];

// Square mapping: Assign projects to specific garden squares
// Format: "row-column" (e.g., "1-1" = row 1, column 1)
// span: number of columns the project spans (1 or 2)
// spanRows: number of rows the project spans (1 or 2) - for vertical spans
var PORTFOLIO_SQUARE_MAP = {
  // Row 1: 3 Singles (Random Sites single, then 2 logos)
  "1-1": { projectId: "random-sites", span: 1, spanRows: 1 }, // Random Sites - single
  "1-2": { projectId: "logo-516", span: 1, spanRows: 1 }, // Logo - single
  "1-3": { projectId: "logo-thespian", span: 1, spanRows: 1 }, // Logo - single
  
  // Row 2: 4 Singles (Wiigit, logos, and RSOTW site)
  "2-1": { projectId: "wiigit", span: 1, spanRows: 1 }, // Wiigit - single
  "2-2": { projectId: "logo-tee-time", span: 1, spanRows: 1 }, // Logo - single
  "2-3": { projectId: "logo-nyitcom", span: 1, spanRows: 1 }, // Logo - single
  "2-4": { projectId: "colorle", span: 1, spanRows: 1 }, // Colorle - single
  
  // Row 3: 4 Singles (Playbook Raise, logos, and RSOTW site)
  "3-1": { projectId: "playbook-raise", span: 1, spanRows: 1 }, // Playbook Raise - single
  "3-2": { projectId: "logo-metny", span: 1, spanRows: 1 }, // Logo - single
  "3-3": { projectId: "logo-senior-experience", span: 1, spanRows: 1 }, // Logo - single
  "3-4": { projectId: "tailwind-fractal", span: 1, spanRows: 1 }, // Tailwind Fractal - single
  
  // Row 4: 4 Singles (Virtual Classroom, graphics, and RSOTW site)
  "4-1": { projectId: "virtual-classroom", span: 1, spanRows: 1 }, // UX Research - single
  "4-2": { projectId: "graphic-abstract", span: 1, spanRows: 1 }, // Graphic - single
  "4-3": { projectId: "graphic-gears", span: 1, spanRows: 1 }, // Graphic - single
  "4-4": { projectId: "picsum-generator", span: 1, spanRows: 1 }, // Picsum Generator - single
  
  // Row 5: 4 Singles (graphics and empty spots)
  "5-1": { projectId: "graphic-halloween", span: 1, spanRows: 1 }, // Graphic - single
  "5-2": { projectId: "graphic-march-madness", span: 1, spanRows: 1 }, // Graphic - single
  "5-3": { projectId: null, span: 1, spanRows: 1 }, // Empty - single
  "5-4": { projectId: null, span: 1, spanRows: 1 }, // Empty - single
  
  // Row 6: 4 Singles (Videos)
  "6-1": { projectId: "video-canon-collision", span: 1, spanRows: 1 }, // Video - single
  "6-2": { projectId: "video-freedom-boat-club", span: 1, spanRows: 1 }, // Video - single
  "6-3": { projectId: "video-li-script", span: 1, spanRows: 1 }, // Video - single
  "6-4": { projectId: "video-maximum-security", span: 1, spanRows: 1 }, // Video - single
  
  // Row 7: 4 Singles (Videos)
  "7-1": { projectId: "video-schmidts", span: 1, spanRows: 1 }, // Video - single
  "7-2": { projectId: "video-seo", span: 1, spanRows: 1 }, // Video - single
  "7-3": { projectId: "video-social-media", span: 1, spanRows: 1 }, // Video - single
  "7-4": { projectId: "video-soma", span: 1, spanRows: 1 }, // Video - single
  
  // Row 8: Empty for future projects
  "8-1": { projectId: null, span: 1, spanRows: 1 },
  "8-2": { projectId: null, span: 1, spanRows: 1 },
  "8-3": { projectId: null, span: 1, spanRows: 1 },
  "8-4": { projectId: null, span: 1, spanRows: 1 }
};

// Portfolio sections for the main modal
var PORTFOLIO_SECTIONS = {
  aboutMe: {
    title: "About Me",
    content: "Dylan Landman"
  },
  myStory: {
    title: "My Story",
    content: "My Story content goes here..."
  },
  projects: {
    title: "My Projects",
    description: "Explore my diverse range of projects, showcasing my skills in software development, logo design, web development, and user experience design.",
    categories: [
      { id: "logos", name: "Logos" },
      { id: "web-development", name: "Web Development" },
      { id: "software-projects", name: "Software Projects" },
      { id: "ux-design", name: "UX Design" }
    ]
  },
  newsletter: {
    title: "Newsletter",
    content: "Newsletter signup form goes here..."
  },
  contact: {
    title: "Contact Me",
    content: "Contact form goes here..."
  }
};

// Helper function to get projects by category
function getProjectsByCategory(category) {
  return PORTFOLIO_PROJECTS.filter(function(project) {
    return project.category === category;
  });
}

// Helper function to get project by ID
function getProjectById(id) {
  return PORTFOLIO_PROJECTS.find(function(project) {
    return project.id === id;
  });
}


