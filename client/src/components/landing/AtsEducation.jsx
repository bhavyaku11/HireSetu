import React from 'react';
import { Card } from '../ui/Card';
import { CheckCircle2, XCircle, FileText, Layout, Type, FileJson } from 'lucide-react';

export default function AtsEducation() {
  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden border-t border-surface-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 shadow-soft-xs">
            <span className="text-[12px] font-semibold text-rose-700 tracking-tight">
              The ATS Black Hole
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-surface-900 tracking-tight leading-tight">
            How Resumes Actually Get Reviewed
          </h2>
          <p className="text-sm sm:text-[15px] text-surface-500 font-body leading-relaxed">
            Most resumes are rejected by automated software before a human ever sees them. A beautiful design means nothing if the machine can't read it. Here's what's actually happening behind the scenes.
          </p>
        </div>

        {/* 1. What You See vs What an ATS Parses */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold font-display text-surface-900 text-center">
            What You See vs. What an ATS Parses
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Human View */}
            <Card padding="p-0" className="overflow-hidden border-surface-200/80 shadow-soft-sm bg-surface-50 flex flex-col">
              <div className="bg-surface-100/50 py-3 px-5 border-b border-surface-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-semibold text-surface-600 uppercase tracking-wide">Human View (PDF)</span>
              </div>
              <div className="p-8 flex-1">
                <div className="bg-white border border-surface-200 shadow-sm p-6 space-y-4 rounded select-none">
                  <div className="border-b border-surface-200 pb-4 text-center">
                    <h4 className="text-xl font-serif text-surface-900">Emily Chen</h4>
                    <p className="text-xs text-surface-500 mt-1">emily.chen@email.com | (555) 123-4567 | San Francisco, CA</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-1/3 space-y-4">
                      <div>
                        <h5 className="text-[10px] font-bold uppercase text-brand-600 mb-1">Education</h5>
                        <p className="text-xs font-semibold text-surface-800">B.S. Computer Science</p>
                        <p className="text-[11px] text-surface-500">Stanford University<br/>2018 - 2022</p>
                      </div>
                      <div>
                        <h5 className="text-[10px] font-bold uppercase text-brand-600 mb-1">Skills</h5>
                        <p className="text-[11px] text-surface-600">React, TypeScript, Node.js, Python, AWS, Docker</p>
                      </div>
                    </div>
                    <div className="w-2/3 space-y-4">
                      <div>
                        <h5 className="text-[10px] font-bold uppercase text-brand-600 mb-1">Experience</h5>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-baseline mb-0.5">
                              <p className="text-xs font-semibold text-surface-800">Frontend Engineer</p>
                              <p className="text-[10px] text-surface-500">TechCorp Inc.</p>
                            </div>
                            <ul className="list-disc pl-3 text-[10px] text-surface-600 space-y-1">
                              <li>Led migration of legacy dashboard to React 18, reducing load time by 40%.</li>
                              <li>Mentored 2 junior engineers and established UI testing standards.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* ATS View */}
            <Card padding="p-0" className="overflow-hidden border-rose-200/80 shadow-soft-sm bg-rose-50/30 flex flex-col">
              <div className="bg-rose-100/50 py-3 px-5 border-b border-rose-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-xs font-semibold text-rose-800 uppercase tracking-wide">ATS Parsed Output (Raw Text)</span>
              </div>
              <div className="p-8 flex-1">
                <div className="bg-surface-900 border border-surface-800 shadow-inner p-5 space-y-2 rounded font-mono text-[11px] text-emerald-400 overflow-x-auto select-none leading-relaxed">
                  <div><span className="text-surface-500">{"{"}</span></div>
                  <div className="pl-4"><span className="text-purple-400">"candidate_name"</span>: <span className="text-amber-300">"Emily Chen emily.chen@email.com (555) 123-4567 San"</span>,</div>
                  <div className="pl-4"><span className="text-purple-400">"location"</span>: <span className="text-amber-300">"Francisco, CA Education"</span>,</div>
                  <div className="pl-4"><span className="text-purple-400">"education"</span>: <span className="text-surface-500">[</span></div>
                  <div className="pl-8"><span className="text-surface-500">{"{"}</span></div>
                  <div className="pl-12"><span className="text-purple-400">"degree"</span>: <span className="text-amber-300">"B.S. Computer Science Stanford University 2018 - 2022 Skills React, TypeScript, Node.js, Python, AWS, Docker Experience Frontend Engineer"</span>,</div>
                  <div className="pl-12"><span className="text-purple-400">"institution"</span>: <span className="text-amber-300">null</span></div>
                  <div className="pl-8"><span className="text-surface-500">{"}"}</span></div>
                  <div className="pl-4"><span className="text-surface-500">]</span>,</div>
                  <div className="pl-4"><span className="text-purple-400">"experience"</span>: <span className="text-surface-500">[</span></div>
                    <div className="pl-8"><span className="text-surface-500">{"{"}</span></div>
                  <div className="pl-12"><span className="text-purple-400">"company"</span>: <span className="text-amber-300">"TechCorp Inc."</span>,</div>
                  <div className="pl-12"><span className="text-purple-400">"description"</span>: <span className="text-amber-300">"Led migration of legacy dashboard to React 18, reducing load time by 40%. Mentored 2 junior engineers and established UI testing standards."</span></div>
                  <div className="pl-8"><span className="text-surface-500">{"}"}</span></div>
                  <div className="pl-4"><span className="text-surface-500">]</span></div>
                  <div><span className="text-surface-500">{"}"}</span></div>
                  <div className="mt-4 pt-3 border-t border-surface-800 text-rose-400">
                    <p>⚠ WARNING: Multi-column layout flattened incorrectly.</p>
                    <p>⚠ WARNING: Education and Skills concatenated.</p>
                    <p>⚠ WARNING: Location parsed as "Francisco, CA Education".</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* 2. ATS-Safe Practices vs ATS Killers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* ATS-Safe */}
          <Card padding="p-6 sm:p-8" className="bg-emerald-50/40 border-emerald-100 shadow-soft-sm h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-display text-emerald-900">ATS-Safe Practices</h3>
            </div>
            <ul className="space-y-4">
              {[
                'Single-column layouts that read top-to-bottom',
                'Standard section headers (e.g., "Experience", "Education")',
                'Standard bullet points (•) for lists',
                'Saved as PDF from a text-based editor (Word, Docs)',
                'Chronological or reverse-chronological order'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] text-surface-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* ATS Killers */}
          <Card padding="p-6 sm:p-8" className="bg-rose-50/40 border-rose-100 shadow-soft-sm h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-display text-rose-900">ATS Killers</h3>
            </div>
            <ul className="space-y-4">
              {[
                'Complex tables, text boxes, or side-by-side columns',
                'Critical contact info placed in header/footer margins',
                'Custom graphics or progress bars for skills',
                'Unconventional section names (e.g., "My Journey", "What I Do")',
                'Exporting a canvas/image design as a flat PDF (Photoshop, Canva)'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] text-surface-700">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* 3. The Golden Rules of Formatting */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold font-display text-surface-900 text-center">
            The Golden Rules of Formatting
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: 'Fonts & Typography',
                icon: Type,
                bullets: ['Use standard system fonts (Arial, Helvetica, Times)', 'Minimum 10pt size for body text', 'Consistent sizing for headers']
              },
              {
                title: 'Margins & Spacing',
                icon: Layout,
                bullets: ['Keep standard 0.5" to 1" margins', 'Use line spacing (1.15 to 1.2) for readability', 'Add space before new sections']
              },
              {
                title: 'Graphics & Colors',
                icon: FileText,
                bullets: ['Stick to high-contrast text (black on white)', 'No photos or headshots (unless required)', 'Avoid icons for contact info']
              },
              {
                title: 'File Format',
                icon: FileJson,
                bullets: ['Always submit as a text-based PDF', 'Do not "Print to PDF" from an image', 'Keep file size under 2MB']
              }
            ].map((rule, i) => {
              const Icon = rule.icon;
              return (
                <Card key={i} padding="p-5" className="bg-white border-surface-200 shadow-soft-xs hover:shadow-soft-sm transition-shadow h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-[14px] font-bold font-display text-surface-900 leading-tight">{rule.title}</h4>
                  </div>
                  <ul className="space-y-2 flex-1">
                    {rule.bullets.map((b, j) => (
                      <li key={j} className="text-[12px] text-surface-600 flex items-start gap-2">
                        <span className="text-indigo-400 mt-1 text-[8px] shrink-0">●</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
