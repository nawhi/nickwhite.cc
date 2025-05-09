export const about = {
  siteUrl: 'https://nickwhite.cc',
  name: 'Nick White',
  pageTitle: 'Nick White',
  description: 'Software Engineer from London, UK.',
  github: 'https://github.com/nawhi',
  linkedin: 'https://www.linkedin.com/in/nick9white/',
  about: [
    'I am a polyglot developer who likes simple solutions to difficult problems, living documentation, just-in-time design and the principles of software craftsmanship.',
    'I believe I owe my success to a habit of ensuring I always have a deep understanding of the technologies I work with.',
    'Before joining the tech industry my background was in music, and I have always felt that software engineering is an art too - fundamentally a creative and collaborative activity.',
  ],
  projects: [
    {
      name: 'This website!',
      description:
        'Built with Astro and Tailwind CSS, based on the devfolio template by Ryan Fitzgerald',
      link: 'https://github.com/nawhi/nickwhite.cc',
    },
    {
      name: 'jq-tutorial',
      description:
        'Interactive exercises for learning jq, a command-line JSON processor',
      link: 'https://github.com/nawhi/jq-tutorial',
    },
    {
      name: 'WebStorm Golf',
      description:
        'A golf-themed way of learning to use the JetBrains WebStorm IDE',
      link: 'https://github.com/nawhi/webstorm-golf',
    },
  ],
  experience: [
    {
      name: 'Triptease',
      description: ['Senior Software Engineer, 2024 - present'],
      link: 'https://triptease.com',
      technologies: [
        'TypeScript',
        'Node.js',
        'Cloudflare Workers',
        'Lit',
        'BigQuery',
        'PostgreSQL',
      ],
      bio: [
        'Designed and delivered a new version of Triptease Personalization, a website messaging product for hotels, which is currently in alpha.',
        'Migrated a terabyte-scale analytics pipeline from Airflow to BigQuery scheduled queries, introducing test coverage and backfilling historic data.',
        'Triptease engineers work full-stack, including all development, ops and SRE, pair-programming in small autonomous squads.',
      ],
    },
    {
      name: 'DAACI',
      description: ['Senior Frontend Software Engineer, 2022 - 2024'],
      link: 'https://daaci.com',
      technologies: [
        'TypeScript',
        'Node.js',
        'React.js',
        'Redux',
        'Sass',
        'PostgreSQL',
      ],
      bio: [
        'Built out prototypes of an AI-assisted browser-based digital audio workstation, using TypeScript, React, Web Audio and Web MIDI, Next.js, Drizzle ORM and PostgreSQL.',
        'Also supported UI design and implementation in VST/AU plugins using C++20 and the JUCE framework.',
      ],
    },
    {
      name: 'Triptease',
      description: ['Software Engineer, 2020 - 2022'],
      link: 'https://triptease.com',
      technologies: [
        'TypeScript',
        'Node.js',
        'Terraform',
        'React.js',
        'MongoDB',
      ],
      bio: [
        'Worked on Triptease Personalization, a website messaging product for hotels, including message components, a rich WYSIWYG content editor, NoSQL database and CDN, event tracking and analytics platform.',
        'Previously, built a feed of hotel prices and scaled it from scratch to serving a million prices a day from over 1,000 hotels. The prices were sourced from user tracking, screen-scraping and algorithmic inference.',
        'Triptease engineers work full-stack, including all development, ops and SRE, pair-programming in small autonomous squads.',
      ],
    },
    {
      name: 'Codurance',
      description: ['Software Craftsman, 2019', 'Apprentice, 2018 - 2019'],
      link: 'https://codurance.com',
      technologies: ['C++', 'Java', 'PostgreSQL'],
      bio: [
        'Worked in a team of consultants at a fintech, setting up CI pipelines, modernising existing C++ server-side infrastructure, and helping to build new Java microservices to replace PostgreSQL stored procedures.',
        'As Apprentice, completed a three-month paid Academy program learning essential skills in software design, Extreme Programming practices, Clean Code, and Domain-Driven Design.',
      ],
    },
    {
      name: 'FilmLight',
      description: ['Software Developer, 2017 - 2018', 'Intern, 2016 - 2017'],
      link: 'https://filmlight.ltd.uk',
      technologies: ['C', 'C++', '*nix'],
      bio: [
        'Worked on button-mapping software for hardware interfaces on a film post-processing system. Worked across the full stack from usability testing and UI implementation down to optimising the display drivers. Also wrote an xUnit-style unit test framework for the in-house scripting language to aid in testing my code.',
        'As an intern, built automated testing harnesses, helped maintain the FilmLight intranet, and built developer workstations.',
      ],
    },
  ],
  skills: [
    {
      name: 'Languages & Frameworks',
      description:
        'JavaScript, TypeScript, Node.js, React, Java, Kotlin, C++, Python, Clojure',
    },
    {
      name: 'Databases',
      description: 'PostgreSQL, MongoDB, Google BigQuery, Elasticsearch',
    },
    {
      name: 'Infrastructure',
      description:
        'Amazon Web Services, Google Cloud Platform, Terraform, Airflow',
    },
    {
      name: 'Methodologies',
      description:
        'Extreme Programming, Software Craftsmanship, Continuous Discovery',
    },
  ],
  education: [
    {
      name: 'Open University',
      description: 'Mathematics modules, part-time, 2022-present',
      bio: [
        'MST124 Essential Mathematics 1: Distinction (2022)',
        'MST224 Mathematical Methods: Distinction (2024)',
      ],
    },
    {
      name: 'University of Oxford',
      description: 'BA Music, 2013 - 2016',
      bio: 'First-class honours; academic scholar, 2014-16.',
    },
  ],
};

export type About = typeof about;
