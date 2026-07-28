import React, { useState } from 'react';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import Badge, { Pill } from '../components/ui/Badge';
import Input, { TextArea } from '../components/ui/Input';

export default function StyleGuide() {
  const [inputValue, setInputValue] = useState('');
  const [errorInput, setErrorInput] = useState('Invalid email format');
  const [textAreaVal, setTextAreaVal] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-body pb-20 selection:bg-indigo-500/20 dark:bg-indigo-400/20 selection:text-indigo-700 dark:text-indigo-300">
      {/* Top Banner Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-700/80 px-6 py-4 shadow-soft-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500 flex items-center justify-center text-white font-bold font-display shadow-soft-sm text-lg">
              R
            </div>
            <div>
              <h1 className="text-lg font-bold font-display text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                HireSetu Design System
              </h1>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Tokens, Base Components & Style Reference
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Badge variant="primary" dot>
              v1.0 Design Tokens
            </Badge>
            <a
              href="/dashboard"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:text-indigo-300 hover:underline"
            >
              ← Back to App
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-12">
        {/* Section 1: Visual Identity & Color Palette */}
        <section className="space-y-4">
          <div className="border-b border-slate-200/70 dark:border-slate-700/70 pb-3">
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">1. Color Palette</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Primary violet/indigo accent scale and soft cool/lavender neutrals.
            </p>
          </div>

          {/* Primary Violet Scale */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
              Primary Brand Scale (Violet / Indigo)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
              {[
                { name: '50', bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-900 dark:text-indigo-400', hex: '#F4F2FF' },
                { name: '100', bg: 'bg-indigo-100 dark:bg-indigo-800/30', text: 'text-indigo-900 dark:text-indigo-400', hex: '#E9E5FF' },
                { name: '200', bg: 'bg-indigo-200 dark:bg-indigo-700/40', text: 'text-indigo-900 dark:text-indigo-400', hex: '#D4CCFF' },
                { name: '300', bg: 'bg-indigo-300 dark:bg-indigo-400', text: 'text-indigo-950 dark:text-indigo-400', hex: '#B4A3FF' },
                { name: '400', bg: 'bg-indigo-400 dark:bg-indigo-400', text: 'text-white', hex: '#8E75F7' },
                { name: '500', bg: 'bg-indigo-500 dark:bg-indigo-400', text: 'text-white', hex: '#6D5EF0', tag: 'Primary' },
                { name: '600', bg: 'bg-indigo-600 dark:bg-indigo-400', text: 'text-white', hex: '#5542E2' },
                { name: '700', bg: 'bg-indigo-700 dark:bg-indigo-300', text: 'text-white', hex: '#4431C9' },
                { name: '800', bg: 'bg-indigo-800 dark:bg-indigo-400', text: 'text-white', hex: '#3829A4' },
                { name: '900', bg: 'bg-indigo-900 dark:bg-indigo-400', text: 'text-white', hex: '#2F2482' },
                { name: '950', bg: 'bg-indigo-950 dark:bg-indigo-400', text: 'text-white', hex: '#1A134E' },
              ].map((c) => (
                <div
                  key={c.name}
                  className={`${c.bg} ${c.text} p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-soft-xs flex flex-col justify-between h-24`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold font-display text-xs">{c.name}</span>
                    {c.tag && (
                      <span className="text-[9px] font-mono px-1 py-0.5 bg-white/30 rounded text-current">
                        {c.tag}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono opacity-80">{c.hex}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Neutral Surface Scale */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
              Neutral Surface Scale (Cool Gray / Lavender Tinted)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
              {[
                { name: '50', bg: 'bg-slate-50 dark:bg-slate-900', text: 'text-slate-900 dark:text-slate-100', hex: '#F8F9FD' },
                { name: '100', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-900 dark:text-slate-100', hex: '#F0F3F9' },
                { name: '200', bg: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-900 dark:text-slate-100', hex: '#E2E7F4' },
                { name: '300', bg: 'bg-slate-300 dark:bg-slate-400', text: 'text-slate-900 dark:text-slate-100', hex: '#CBD3E6' },
                { name: '400', bg: 'bg-slate-400 dark:bg-slate-400', text: 'text-white', hex: '#93A1C0' },
                { name: '500', bg: 'bg-slate-500 dark:bg-slate-400', text: 'text-white', hex: '#637294' },
                { name: '600', bg: 'bg-slate-600 dark:bg-slate-400', text: 'text-white', hex: '#465373' },
                { name: '700', bg: 'bg-slate-700 dark:bg-slate-400', text: 'text-white', hex: '#323D57' },
                { name: '800', bg: 'bg-slate-800 dark:bg-slate-200', text: 'text-white', hex: '#1E263B' },
                { name: '900', bg: 'bg-slate-900 dark:bg-slate-100', text: 'text-white', hex: '#0E1424' },
                { name: '950', bg: 'bg-slate-950 dark:bg-slate-50', text: 'text-white', hex: '#080C17' },
              ].map((c) => (
                <div
                  key={c.name}
                  className={`${c.bg} ${c.text} p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-soft-xs flex flex-col justify-between h-24`}
                >
                  <span className="font-bold font-display text-xs">{c.name}</span>
                  <span className="text-[10px] font-mono opacity-80">{c.hex}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Typography Scale */}
        <section className="space-y-4">
          <div className="border-b border-slate-200/70 dark:border-slate-700/70 pb-3">
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">2. Typography Scale</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <code className="font-mono bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-1 py-0.5 rounded">Outfit</code> for Headings and <code className="font-mono bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-1 py-0.5 rounded">Plus Jakarta Sans</code> for Body.
            </p>
          </div>

          <Card padding="p-8" className="space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 uppercase">H1 — 36px / Bold</span>
                <h1 className="text-4xl font-extrabold font-display text-slate-900 dark:text-slate-100 tracking-tight">
                  Craft Your Perfect ATS Resume with AI
                </h1>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 uppercase">H2 — 28px / Bold</span>
                <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-slate-100 tracking-tight">
                  Personalized Recommendations & Real-Time Formatting
                </h2>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 uppercase">H3 — 24px / SemiBold</span>
                <h3 className="text-2xl font-semibold font-display text-slate-900 dark:text-slate-100 tracking-tight">
                  Experience & Projects Section Editor
                </h3>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 uppercase">H4 — 20px / SemiBold</span>
                <h4 className="text-xl font-semibold font-display text-slate-800 dark:text-slate-200">
                  Skills & Technical Competencies
                </h4>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 uppercase">H5 — 16px / Medium</span>
                <h5 className="text-base font-medium font-display text-slate-800 dark:text-slate-200">
                  Education & Professional Certifications
                </h5>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 uppercase">Body Large — 16px</span>
                <p className="text-base text-slate-700 dark:text-slate-400 leading-relaxed font-body">
                  HireSetu automatically parses your raw work history and formats it into clean, recruiter-approved ATS templates optimized for tech companies.
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 uppercase">Body Regular — 14px</span>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-body">
                  Each section is saved automatically as you type with real-time feedback and structured database persistence.
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 uppercase">Body Small — 12px</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-body">
                  Last saved 2 minutes ago. All changes are encrypted and safely stored in Cloud MySQL.
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 uppercase">Caption / Micro — 11px</span>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider font-body">
                  PRO TIP: USE QUANTIFIABLE METRICS IN YOUR BULLET POINTS
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 3: Button System */}
        <section className="space-y-4">
          <div className="border-b border-slate-200/70 dark:border-slate-700/70 pb-3">
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">3. Button Base Components</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Primary, Secondary, Outline, Ghost, and Danger variants across sizes with loading & icon states.
            </p>
          </div>

          <Card padding="p-6" className="space-y-6">
            {/* Variants */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">Button Variants</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="danger">Danger Button</Button>
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">Button Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm">
                  Small (sm)
                </Button>
                <Button variant="primary" size="md">
                  Medium (md)
                </Button>
                <Button variant="primary" size="lg">
                  Large (lg)
                </Button>
              </div>
            </div>

            {/* States & Icons */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">States & Icons</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" leftIcon={<span>✨</span>}>
                  Create AI Resume
                </Button>
                <Button variant="secondary" rightIcon={<span>→</span>}>
                  Continue to Builder
                </Button>
                <Button variant="primary" isLoading>
                  Saving Resume...
                </Button>
                <Button variant="outline" isDisabled>
                  Disabled Action
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 4: Card System */}
        <section className="space-y-4">
          <div className="border-b border-slate-200/70 dark:border-slate-700/70 pb-3">
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">4. Card & Container System</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Soft diffused shadows (`shadow-soft-md`), `rounded-2xl`, glassmorphism, and hover lift effects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Standard Card */}
            <Card>
              <CardHeader>
                <Badge variant="primary" dot>
                  Active Draft
                </Badge>
                <CardTitle>Senior Full Stack Resume</CardTitle>
                <CardDescription>Created on July 22 • 5 sections complete</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Targeted for Senior Engineer and Tech Lead roles. Includes React, Node.js, and Cloud Infrastructure bullets.
                </p>
              </CardContent>
              <CardFooter>
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400">Edited 10m ago</span>
                <Button size="sm" variant="secondary">
                  Open Builder
                </Button>
              </CardFooter>
            </Card>

            {/* Hoverable Card */}
            <Card hoverable>
              <CardHeader>
                <Badge variant="success" dot>
                  ATS Score: 94%
                </Badge>
                <CardTitle>Hoverable Interactive Card</CardTitle>
                <CardDescription>Smooth translate-y hover lift effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Hover over this card to observe the soft border accent shift and vertical lift animation.
                </p>
              </CardContent>
              <CardFooter>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Explore Template →</span>
              </CardFooter>
            </Card>

            {/* Glassmorphism Card */}
            <Card glass>
              <CardHeader>
                <Badge variant="secondary">Glassmorphism</Badge>
                <CardTitle>Backdrop Blurred Glass Card</CardTitle>
                <CardDescription>Semi-transparent frosted background</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Ideal for sticky headers, overlay modals, and floating control panels.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="outline">
                  Configure Glass
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Section 5: Badges & Pills */}
        <section className="space-y-4">
          <div className="border-b border-slate-200/70 dark:border-slate-700/70 pb-3">
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">5. Badges & Pill Tags</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Status indicators, categorization tags, and pill badges with dot pulses.
            </p>
          </div>

          <Card padding="p-6" className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
                Status Badges (With Dots)
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" dot>
                  Primary Active
                </Badge>
                <Badge variant="secondary" dot>
                  Secondary Processing
                </Badge>
                <Badge variant="success" dot>
                  All Changes Saved
                </Badge>
                <Badge variant="warning" dot>
                  Unsaved Draft
                </Badge>
                <Badge variant="danger" dot>
                  Sync Failed
                </Badge>
                <Badge variant="neutral" dot>
                  Archived
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
                Pill Tags & Category Badges
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <Pill variant="primary">JavaScript</Pill>
                <Pill variant="primary">React 19</Pill>
                <Pill variant="primary">Node.js</Pill>
                <Pill variant="secondary">Tailwind CSS</Pill>
                <Pill variant="secondary">MySQL 8</Pill>
                <Pill variant="outline">Docker</Pill>
                <Pill variant="outline">REST API</Pill>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 6: Form Controls */}
        <section className="space-y-4">
          <div className="border-b border-slate-200/70 dark:border-slate-700/70 pb-3">
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">6. Form Controls</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Input fields, helper labels, icon integrations, error focus rings, and textareas.
            </p>
          </div>

          <Card padding="p-6" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Standard Input */}
              <Input
                label="Full Name"
                isRequired
                placeholder="e.g. Alex Morgan"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                helperText="Enter your name as it should appear on your resume header."
              />

              {/* Input with Icon */}
              <Input
                label="Email Address"
                isRequired
                leftIcon={<span>✉️</span>}
                placeholder="alex@example.com"
              />

              {/* Input with Error State */}
              <Input
                label="Account Email"
                isRequired
                leftIcon={<span>✉️</span>}
                value="invalid-email-address"
                error={errorInput}
                onChange={(e) => setErrorInput(e.target.value)}
              />

              {/* Disabled Input */}
              <Input
                label="Account ID (Read-only)"
                value="USER_849204_SECURE"
                isDisabled
                helperText="System generated unique identifier."
              />

              {/* Textarea */}
              <div className="md:col-span-2">
                <TextArea
                  label="Professional Summary"
                  isRequired
                  placeholder="Senior Software Engineer with 6+ years of experience building scalable web applications..."
                  value={textAreaVal}
                  onChange={(e) => setTextAreaVal(e.target.value)}
                  helperText="Keep summary between 2-4 sentences highlighting core tech stack and major achievements."
                />
              </div>
            </div>
          </Card>
        </section>

        {/* Section 7: Soft Shadows & Elevation */}
        <section className="space-y-4">
          <div className="border-b border-slate-200/70 dark:border-slate-700/70 pb-3">
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">7. Soft Shadows & Elevation</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Diffused violet-tinted shadow tokens for clean visual layering.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { label: 'shadow-soft-xs', class: 'shadow-soft-xs' },
              { label: 'shadow-soft-sm', class: 'shadow-soft-sm' },
              { label: 'shadow-soft-md', class: 'shadow-soft-md' },
              { label: 'shadow-soft-lg', class: 'shadow-soft-lg' },
              { label: 'shadow-soft-xl', class: 'shadow-soft-xl' },
              { label: 'shadow-glow', class: 'shadow-glow' },
            ].map((s) => (
              <div
                key={s.label}
                className={`bg-white p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center justify-center text-center h-28 space-y-2 ${s.class}`}
              >
                <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">{s.label}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-400">Diffused Tint</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
