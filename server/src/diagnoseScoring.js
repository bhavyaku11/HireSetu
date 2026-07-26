const ATS_KILLER = `
John Smith		jane@test.com		(555) 123-4567
────────────────────────────────────
My Journey                    |  Core Passions
                              |
★ Led amazing stuff           |  ★ Leadership
✦ Did incredible things       |  ✦ Innovation
▶ Changed the world           |  ▶ Strategy
                              |
What Drives Me                |  My Toolbox
I love building things        |  Python | Java | Go
I thrive under pressure       |  React | Node.js
                              |
Where I Grew	Stanford	2015	CS
`;

const lines = ATS_KILLER.split('\n').map(l => l.trim()).filter(Boolean);
const headingCandidates = lines.slice(3);

headingCandidates.forEach((line, i) => {
  const cleaned = line.replace(/^[\s•\-*#>\d.:\u2022\u2013\u2014]+/, '').trim();
  const isTitleCase = /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/.test(cleaned);
  const isAllCaps = cleaned === cleaned.toUpperCase() && cleaned !== cleaned.toLowerCase();
  console.log(`Line ${i+4}: "${cleaned}" | len=${cleaned.length} | TC=${isTitleCase} | AC=${isAllCaps} | has|=${cleaned.includes('|')} | has,=${cleaned.includes(',')}`);
});
