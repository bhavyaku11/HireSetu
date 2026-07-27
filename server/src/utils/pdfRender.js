/**
 * Generates an ATS-friendly HTML string representing the resume,
 * mirroring the exact styling from the frontend ResumePreview component.
 */
export function generateResumeHtml(resume, sectionsData) {
  const personal = sectionsData.personal_info || {};

  const educationObj = sectionsData.education || { items: [] };
  const educationItems = Array.isArray(educationObj.items) ? educationObj.items : [];

  const experienceObj = sectionsData.experience || { items: [] };
  const experienceItems = Array.isArray(experienceObj.items) ? experienceObj.items : [];

  const projectsObj = sectionsData.projects || { items: [] };
  const projectItems = Array.isArray(projectsObj.items) ? projectsObj.items : [];

  const skillsObj = sectionsData.skills || { categories: [] };
  const skillCategories = Array.isArray(skillsObj.categories) ? skillsObj.categories : [];

  // Filter valid entries
  const validEducation = educationItems.filter((i) => i.institution && i.institution.trim() !== '');
  const validExperience = experienceItems.filter((i) => i.company && i.company.trim() !== '');
  const validProjects = projectItems.filter((i) => i.name && i.name.trim() !== '');
  const validSkills = skillCategories.filter((cat) => cat.name && cat.skills && cat.skills.length > 0);

  const hasPersonalHeader = personal.fullName || personal.email || personal.phone || personal.location;
  const hasContent =
    hasPersonalHeader ||
    personal.summary ||
    validEducation.length > 0 ||
    validExperience.length > 0 ||
    validProjects.length > 0 ||
    validSkills.length > 0;

  // Escape HTML entities to prevent injection/XSS issues during render
  const escapeHtml = (unsafe) => {
    if (!unsafe) return '';
    return unsafe
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  let htmlContent = '';

  if (!hasContent) {
    htmlContent = `
      <div class="h-full min-h-[600px] flex flex-col items-center justify-center text-slate-400 text-center space-y-3">
        <div>
          <h4 class="font-bold text-slate-600">Resume is empty</h4>
        </div>
      </div>
    `;
  } else {
    // Build Header
    let headerHtml = '';
    if (hasPersonalHeader) {
      let contactItems = [];
      if (personal.location) contactItems.push(`<span>${escapeHtml(personal.location)}</span>`);
      if (personal.phone) contactItems.push(`<span>${escapeHtml(personal.phone)}</span>`);
      if (personal.email) contactItems.push(`<span class="font-medium text-slate-800">${escapeHtml(personal.email)}</span>`);
      if (personal.linkedin) contactItems.push(`<span>${escapeHtml(personal.linkedin)}</span>`);
      if (personal.github) contactItems.push(`<span>${escapeHtml(personal.github)}</span>`);
      
      let contactHtml = contactItems.join('<span> | </span>');

      headerHtml = `
        <div class="text-center border-b border-slate-300 pb-3 space-y-1">
          <h1 class="text-xl font-bold tracking-wide uppercase text-slate-950">
            ${escapeHtml(personal.fullName || 'YOUR NAME')}
          </h1>
          <div class="flex flex-wrap justify-center items-center gap-x-3 gap-y-0.5 text-[10.5px] text-slate-700">
            ${contactHtml}
          </div>
        </div>
      `;
    }

    // Build Summary
    let summaryHtml = '';
    if (personal.summary) {
      summaryHtml = `
        <div class="space-y-1">
          <h2 class="text-[12px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5">
            Professional Summary
          </h2>
          <p class="text-slate-700 leading-normal font-normal">
            ${escapeHtml(personal.summary)}
          </p>
        </div>
      `;
    }

    // Build Experience
    let experienceHtml = '';
    if (validExperience.length > 0) {
      const expItemsHtml = validExperience.map(exp => {
        const bullets = Array.isArray(exp.bullets) ? exp.bullets.filter(b => b && b.trim() !== '') : [];
        let bulletsHtml = '';
        if (bullets.length > 0) {
          bulletsHtml = `
            <ul class="list-disc list-outside text-slate-700 pl-4 space-y-0.5 text-[10.5px] leading-normal pt-0.5">
              ${bullets.map(b => `<li><span>${escapeHtml(b)}</span></li>`).join('')}
            </ul>
          `;
        }

        return `
          <div class="space-y-0.5">
            <div class="flex justify-between items-baseline font-bold text-slate-900">
              <span>
                ${exp.role ? escapeHtml(exp.role) + ' — ' : ''}${escapeHtml(exp.company)}
              </span>
              <span class="font-medium text-slate-600 text-[10px]">
                ${escapeHtml(exp.startDate)} ${exp.startDate || exp.endDate ? '–' : ''} ${exp.current ? 'Present' : escapeHtml(exp.endDate)}
              </span>
            </div>
            ${exp.location ? `<div class="text-[10px] text-slate-600 italic">${escapeHtml(exp.location)}</div>` : ''}
            ${bulletsHtml}
          </div>
        `;
      }).join('');

      experienceHtml = `
        <div class="space-y-2">
          <h2 class="text-[12px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5">
            Work Experience
          </h2>
          <div class="space-y-2.5">
            ${expItemsHtml}
          </div>
        </div>
      `;
    }

    // Build Projects
    let projectsHtml = '';
    if (validProjects.length > 0) {
      const projItemsHtml = validProjects.map(proj => {
        const bullets = Array.isArray(proj.bullets) ? proj.bullets.filter(b => b && b.trim() !== '') : [];
        let bulletsHtml = '';
        if (bullets.length > 0) {
          bulletsHtml = `
            <ul class="list-disc list-outside text-slate-700 pl-4 space-y-0.5 text-[10.5px] leading-normal pt-0.5">
              ${bullets.map(b => `<li><span>${escapeHtml(b)}</span></li>`).join('')}
            </ul>
          `;
        }

        return `
          <div class="space-y-0.5">
            <div class="flex justify-between items-baseline font-bold text-slate-900">
              <span>
                ${escapeHtml(proj.name)}
                ${proj.link ? `<span class="font-normal text-slate-600 text-[10px] ml-2">(${escapeHtml(proj.link)})</span>` : ''}
              </span>
              ${proj.techStack ? `<span class="font-normal text-slate-600 text-[10px]"><span class="font-semibold text-slate-700">Tech:</span> ${escapeHtml(proj.techStack)}</span>` : ''}
            </div>
            ${proj.description ? `<p class="text-[10.5px] text-slate-700 italic">${escapeHtml(proj.description)}</p>` : ''}
            ${bulletsHtml}
          </div>
        `;
      }).join('');

      projectsHtml = `
        <div class="space-y-2">
          <h2 class="text-[12px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5">
            Projects
          </h2>
          <div class="space-y-2.5">
            ${projItemsHtml}
          </div>
        </div>
      `;
    }

    // Build Skills
    let skillsHtml = '';
    if (validSkills.length > 0) {
      const skillsCatHtml = validSkills.map(cat => {
        return `
          <div class="text-slate-800">
            <span class="font-bold text-slate-900">${escapeHtml(cat.name)}: </span>
            <span class="text-slate-700">${escapeHtml(cat.skills.join(', '))}</span>
          </div>
        `;
      }).join('');

      skillsHtml = `
        <div class="space-y-1.5">
          <h2 class="text-[12px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5">
            Skills
          </h2>
          <div class="space-y-1 text-[10.5px]">
            ${skillsCatHtml}
          </div>
        </div>
      `;
    }

    // Build Education
    let educationHtml = '';
    if (validEducation.length > 0) {
      const eduItemsHtml = validEducation.map(edu => {
        return `
          <div class="space-y-0.5">
            <div class="flex justify-between font-bold text-slate-900">
              <span>${escapeHtml(edu.institution)}</span>
              <span class="font-medium text-slate-600 text-[10px]">
                ${escapeHtml(edu.startDate)} ${edu.startDate || edu.endDate ? '–' : ''} ${edu.current ? 'Present' : escapeHtml(edu.endDate)}
              </span>
            </div>
            <div class="flex justify-between text-slate-700 text-[10.5px]">
              <span>
                ${escapeHtml(edu.degree)} ${edu.degree && edu.fieldOfStudy ? 'in' : ''} ${escapeHtml(edu.fieldOfStudy)}
              </span>
              ${edu.gpa ? `<span class="font-medium text-slate-600">GPA: ${escapeHtml(edu.gpa)}</span>` : ''}
            </div>
            ${edu.coursework ? `<p class="text-[10px] text-slate-600"><span class="font-semibold text-slate-700">Coursework:</span> ${escapeHtml(edu.coursework)}</p>` : ''}
          </div>
        `;
      }).join('');

      educationHtml = `
        <div class="space-y-2">
          <h2 class="text-[12px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5">
            Education
          </h2>
          <div class="space-y-2">
            ${eduItemsHtml}
          </div>
        </div>
      `;
    }

    htmlContent = `
      <div class="space-y-4">
        ${headerHtml}
        ${summaryHtml}
        ${experienceHtml}
        ${projectsHtml}
        ${skillsHtml}
        ${educationHtml}
      </div>
    `;
  }

  // Wrap in full HTML document with Tailwind loaded
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(resume.title || 'Resume')}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          background-color: white;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .resume-container {
          width: 210mm;
          min-height: 297mm;
          padding: 40px; /* equivalent to p-10 */
          background: white;
          color: #0f172a; /* slate-900 */
          font-size: 11px;
          line-height: 1.625; /* relaxed */
          box-sizing: border-box;
        }
      </style>
      <script>
        tailwind.config = {
          theme: {
            extend: {
              fontFamily: {
                sans: ['Inter', 'sans-serif'],
              }
            }
          }
        }
      </script>
    </head>
    <body>
      <div class="resume-container">
        ${htmlContent}
      </div>
    </body>
    </html>
  `;
}
