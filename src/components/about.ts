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
    'Before joining the tech industry my background was in music, and I have always felt that software engineering is an art too - fundamentally a creative and collaborative activity.'
  ],
  projects: [
    {
      name: 'This website!',
      description:
        'Built with Astro and Tailwind CSS, based on the devfolio template by Ryan Fitzgerald',
      link: 'https://github.com/nawhi/nickwhite.cc'
    },
    {
      name: 'jq-tutorial',
      description: 'Interactive exercises for learning jq, a command-line JSON processor',
      link: 'https://github.com/nawhi/jq-tutorial'
    },
    {
      name: 'WebStorm Golf',
      description: 'A golf-themed way of learning to use the JetBrains WebStorm IDE',
      link: 'https://github.com/nawhi/webstorm-golf'
    },
  ],
  experience: [
    {
      name: 'DAACI',
      description: ['Senior Frontend Software Engineer, 2022 - pres.'],
      link: 'https://daaci.com',
      technologies: ['React.js', 'Next.js', 'TypeScript', 'CSS', 'C++', 'JUCE'],
      bio: [
        'Implemented music generation algorithms and prototyped user interfaces, using TypeScript, React, and the Web Audio and Web MIDI APIs.',
	'Assisted with user interface design and implementation on DAACI\'s Natural Series of DAW plugins, using C++20 and the JUCE framework.',
      ]
    },
    {
      name: 'Triptease',
      description: ['Senior Software Engineer, 2021 - 2022', 'Software Engineer, 2020 - 2021'],
      link: 'https://triptease.com',
      technologies: ['Node.js', 'Terraform', 'React.js', 'TypeScript', 'MongoDB'],
      bio: [
        'Worked on the Targeted Messages product, including the UI of the messages themselves, a rich content editor with live preview for message creation, content database and CDN, event tracking and analytics platform.',
        'Previously, my team built a feed of hotel prices and scaled it from scratch to serving a million prices a day from over 1,000 hotels. The prices were sourced from user tracking, screen-scraping and algorithmic inference.',
        'Triptease engineers work full-stack, including all development, ops and SRE, in small autonomous squads.'
      ]
    },
    {
      name: 'Codurance',
      description: ['Software Craftsman, 2019', 'Apprentice, 2018 - 2019'],
      link: 'https://codurance.com',
      technologies: ['C++', 'Java', 'PostgreSQL'],
      bio: [
        'Worked in a team of consultants at a fintech, setting up CI pipelines, modernising existing C++ server-side infrastructure, and helping to build new Java microservices to replace PostgreSQL stored procedures.',
        'As Apprentice, completed a three-month paid Academy program learning essential skills in software design, Extreme Programming practices, Clean Code, and Domain-Driven Design.'
      ]
    },
    {
      name: 'FilmLight',
      description: ['Software Developer, 2017 - 2018', 'Intern, 2016 - 2017'],
      link: 'https://filmlight.ltd.uk',
      technologies: ['C', 'C++', '*nix'],
      bio: [
        'Worked on button-mapping software for hardware interfaces on a film post-processing system. Worked across the full stack from usability testing and UI implementation down to optimising the display drivers. Also wrote an xUnit-style unit test framework for the in-house scripting language to aid in testing my code.',
        'As an intern, built automated testing harnesses, helped maintain the FilmLight intranet, and built developer workstations.',
      ]
    }
  ],
  skills: [
    {
      name: 'Languages & Frameworks',
      description: 'JavaScript, TypeScript, Node.js, React, Java, Kotlin, C++, Python, Clojure'
    },
    {
      name: 'Databases',
      description:
        'Postgres (with pleasure), MongoDB (with less pleasure), Google BigQuery, Elasticsearch'
    },
    {
      name: 'Infrastructure',
      description: 'Amazon Web Services, Google Cloud Platform, Terraform, Airflow'
    },
    {
      name: 'Methodologies',
      description: 'Extreme Programming, Software Craftsmanship, Continuous Discovery'
    }
  ],
  education: [
    {
      name: 'Open University',
      description: 'Mathematics modules, part-time, 2022-present',
      bio: ['Essential Mathematics 1: Distinction (2022)']
    },
    {
      name: 'University of Oxford',
      description: 'BA Music, 2013 - 2016',
      bio: 'First-class honours; academic scholar, 2014-16.'
    }
  ]
};

export type About = typeof about;
