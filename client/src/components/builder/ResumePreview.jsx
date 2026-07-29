import React from 'react';
import { DocumentSurface } from '../ui/DocumentSurface';

export default function ResumePreview({ sections = {} }) {
  const personal = sections.personal_info || {};

  const educationObj = sections.education || { items: [] };
  const educationItems = Array.isArray(educationObj.items) ? educationObj.items : [];

  const experienceObj = sections.experience || { items: [] };
  const experienceItems = Array.isArray(experienceObj.items) ? experienceObj.items : [];

  const projectsObj = sections.projects || { items: [] };
  const projectItems = Array.isArray(projectsObj.items) ? projectsObj.items : [];

  const skillsObj = sections.skills || { categories: [] };
  const skillCategories = Array.isArray(skillsObj.categories) ? skillsObj.categories : [];

  // Filter valid entries
  const validEducation = educationItems.filter((i) => i.institution && i.institution.trim() !== '');
  const validExperience = experienceItems.filter((i) => i.company && i.company.trim() !== '');
  const validProjects = projectItems.filter((i) => i.name && i.name.trim() !== '');
  const validSkills = skillCategories.filter((cat) => cat.name && cat.skills && cat.skills.length > 0);

  const hasPersonalHeader = personal.fullName || personal.email || personal.phone || personal.location;
  const hasContent = hasPersonalHeader || personal.summary || validEducation.length > 0 || validExperience.length > 0 || validProjects.length > 0 || validSkills.length > 0;

  return (
    <DocumentSurface className="w-full max-w-[210mm] min-h-[297mm] rounded-xl shadow-2xl p-10 font-sans text-[11px] leading-relaxed transition-all border-none">
      {!hasContent ? (
        <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-slate-400 text-center space-y-3">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl">
            📄
          </div>
          <div>
            <h4 className="font-bold text-slate-600">Live Resume Document</h4>
            <p className="text-xs text-slate-400 mt-1">Start entering your details in the forms to build your resume.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Header Section (Centered ATS Classic Style) */}
          {hasPersonalHeader && (
            <div className="text-center border-b border-slate-300 pb-3 space-y-1">
              <h1 className="text-xl font-bold tracking-wide uppercase text-slate-950">
                {personal.fullName || 'YOUR NAME'}
              </h1>

              <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-0.5 text-[10.5px] text-slate-700">
                {personal.location && <span>{personal.location}</span>}
                {personal.location && (personal.phone || personal.email) && <span>|</span>}
                {personal.phone && <span>{personal.phone}</span>}
                {personal.phone && personal.email && <span>|</span>}
                {personal.email && <span className="font-medium text-slate-800">{personal.email}</span>}
                {personal.linkedin && (
                  <>
                    <span>|</span>
                    <span>{personal.linkedin}</span>
                  </>
                )}
                {personal.github && (
                  <>
                    <span>|</span>
                    <span>{personal.github}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Professional Summary */}
          {personal.summary && (
            <div className="space-y-1">
              <h2 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5">
                Professional Summary
              </h2>
              <p className="text-slate-700 leading-normal font-normal">
                {personal.summary}
              </p>
            </div>
          )}

          {/* Experience Section */}
          {validExperience.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5">
                Work Experience
              </h2>

              <div className="space-y-2.5">
                {validExperience.map((exp, idx) => {
                  const bullets = Array.isArray(exp.bullets) ? exp.bullets.filter((b) => b && b.trim() !== '') : [];

                  return (
                    <div key={exp.id || idx} className="space-y-0.5">
                      <div className="flex justify-between items-baseline font-bold text-slate-900">
                        <span>
                          {exp.role ? `${exp.role} — ` : ''}
                          {exp.company}
                        </span>
                        <span className="font-medium text-slate-600 text-[10px]">
                          {exp.startDate} {exp.startDate || exp.endDate ? '–' : ''}{' '}
                          {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>

                      {exp.location && (
                        <div className="text-[10px] text-slate-600 italic">
                          {exp.location}
                        </div>
                      )}

                      {bullets.length > 0 && (
                        <ul className="list-disc list-outside text-slate-700 pl-4 space-y-0.5 text-[10.5px] leading-normal pt-0.5">
                          {bullets.map((bullet, bIdx) => (
                            <li key={bIdx}>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {validProjects.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5">
                Projects
              </h2>

              <div className="space-y-2.5">
                {validProjects.map((proj, idx) => {
                  const bullets = Array.isArray(proj.bullets) ? proj.bullets.filter((b) => b && b.trim() !== '') : [];

                  return (
                    <div key={proj.id || idx} className="space-y-0.5">
                      <div className="flex justify-between items-baseline font-bold text-slate-900">
                        <span>
                          {proj.name}
                          {proj.link && (
                            <span className="font-normal text-slate-600 text-[10px] ml-2">
                              ({proj.link})
                            </span>
                          )}
                        </span>
                        {proj.techStack && (
                          <span className="font-normal text-slate-600 text-[10px]">
                            <span className="font-semibold text-slate-700">Tech:</span> {proj.techStack}
                          </span>
                        )}
                      </div>

                      {proj.description && (
                        <p className="text-[10.5px] text-slate-700 italic">
                          {proj.description}
                        </p>
                      )}

                      {bullets.length > 0 && (
                        <ul className="list-disc list-outside text-slate-700 pl-4 space-y-0.5 text-[10.5px] leading-normal pt-0.5">
                          {bullets.map((bullet, bIdx) => (
                            <li key={bIdx}>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {validSkills.length > 0 && (
            <div className="space-y-1.5">
              <h2 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5">
                Skills
              </h2>

              <div className="space-y-1 text-[10.5px]">
                {validSkills.map((cat, idx) => (
                  <div key={cat.id || idx} className="text-slate-800">
                    <span className="font-bold text-slate-900">{cat.name}: </span>
                    <span className="text-slate-700">{cat.skills.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {validEducation.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5">
                Education
              </h2>

              <div className="space-y-2">
                {validEducation.map((edu, idx) => (
                  <div key={edu.id || idx} className="space-y-0.5">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{edu.institution}</span>
                      <span className="font-medium text-slate-600 text-[10px]">
                        {edu.startDate} {edu.startDate || edu.endDate ? '–' : ''}{' '}
                        {edu.current ? 'Present' : edu.endDate}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-700 text-[10.5px]">
                      <span>
                        {edu.degree} {edu.degree && edu.fieldOfStudy ? 'in' : ''} {edu.fieldOfStudy}
                      </span>
                      {edu.gpa && <span className="font-medium text-slate-600">GPA: {edu.gpa}</span>}
                    </div>

                    {edu.coursework && (
                      <p className="text-[10px] text-slate-600">
                        <span className="font-semibold text-slate-700">Coursework:</span> {edu.coursework}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DocumentSurface>
  );
}
