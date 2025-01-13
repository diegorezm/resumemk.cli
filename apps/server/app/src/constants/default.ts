export const DEFAULT_RESUME = `
<center>

# JOHN DOE
[johndoe.dev](https://johndoe.dev) | [john.doe@example.com](mailto:john.doe@example.com) | [linkedin.com/in/johndoe](https://linkedin.com/in/johndoe) | [github.com/johndoe](https://github.com/johndoe)

</center>

---

<div class="resume-section">

## Objective
Full Stack Developer skilled in PHP, Java, and JavaScript/TypeScript. Seeking opportunities to apply my expertise to innovative projects, enhance team collaboration, and deliver robust technical solutions.

</div>

---

<div class="resume-section">

## Education

### Generic University - Anywhere, USA  
  _Computer Science_  
  September 2021 - June 2024

</div>

---

<div class="resume-section">

## Technical Skills

- **Programming Languages**: Java, JavaScript/TypeScript, Python, PHP

- **Frameworks**: Spring Boot, Next.js, React, Svelte, Laravel

- **Databases**: PostgreSQL, MySQL, SQLite, MongoDB

- **Tools**: Git, Docker, Node.js, Tailwind CSS, CI/CD (GitHub Actions)

- **Markup**: HTML, CSS, Markdown

</div>

---

<div class="resume-section">

## Experience

### Software Development Intern  
  _Tech Solutions Inc., New York, NY_  
  June 2023 - August 2023  
  - Collaborated with a team to develop and optimize web applications using React and Node.js.
  - Assisted in creating RESTful APIs and integrating third-party services.
  - Implemented front-end enhancements, ensuring responsiveness and cross-browser compatibility.
  - Conducted software testing and debugging, improving code quality and performance.

### Customer Support Representative  
  _Global Assist Co., Los Angeles, CA_  
  July 2022 - April 2023  
  - Provided technical support to resolve customer issues efficiently and effectively.
  - Created documentation and guides to streamline problem resolution processes.
  - Assisted in training new hires on customer interaction protocols and tools.

</div>

---

<div class="resume-section">

## Projects

### Generic Clinic Management System  
  [GitHub](https://github.com/johndoe/clinic-management-system)  
  _PHP, Laravel, Livewire, Alpine.js, MySQL_

  - Designed and developed a backend system for managing patient, doctor, and appointment records.
  - Implemented CRUD operations for efficient handling of clinical data.
  - Automated appointment scheduling with doctor availability verification.
  - Built a responsive and interactive interface using Alpine.js and Livewire.
  - Ensured secure data storage with MySQL integration.
  - Successfully deployed the application, achieving high uptime and user satisfaction.

### Task Tracker App  
  [GitHub](https://github.com/johndoe/task-tracker)  
  _React, Node.js, PostgreSQL_

  - Created a task management application for personal and team use.
  - Developed a feature-rich front end with React, allowing dynamic task updates.
  - Integrated PostgreSQL for reliable data management and retrieval.
  - Implemented authentication and role-based access controls.

</div>

---

<div class="resume-section">

## Certifications

- [Full Stack Web Development - Coursera](https://example.com)
- [Java Programming Masterclass - Udemy](https://example.com)
- [Advanced JavaScript - Pluralsight](https://example.com)
- [Database Management with SQL - Codecademy](https://example.com)

<br>

</div>
`

export const DEFAULT_STYLES = `
:root {
  --resume-background: #eff1f5;
  --resume-foreground: #4c4f69;

  --title-color: #000;
  --subtitle-color: #5c5f77;
  --link-color: #1e66f5;

  --fs-xs: 14px;
  --fs-sm: 16px;
  --fs-md: 18px;
  --fs-lg: 20px;
}

.resume {
  margin: 0 auto;
  padding: 1em;
  background: var(--resume-background);
  color: var(--resume-foreground);
  font-family: Arial, Helvetica, sans-serif;
  font-size: var(--fs-xs);
  line-height: 1.5;
  max-width: 1200px;
}

.resume a {
  color: var(--link-color);
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  font-weight: bold;
}


.resume h1 {
  text-align: center;
  font-size: var(--fs-lg);
  margin-bottom: 0.8rem;
  color: var(--title-color);
}

.resume h2 {
  font-size: var(--fs-md);
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: var(--title-color);
}

.resume h3 {
  font-size: var(--fs-sm);
  color: var(--subtitle-color);
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.resume .resume-section {
  padding: 0.7rem;
}

.resume ul {
  list-style-type: disc;
  margin-top: 0.5rem;
}

.resume li {
  margin-bottom: 0.5rem;
}

.resume em {
  font-style: italic;
}

.resume strong {
  font-weight: bold;
}
`
