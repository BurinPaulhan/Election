const fs = require('fs')
const s = fs.readFileSync('frontend/src/sections/Projets.jsx', 'utf8')
const moji = /Ã©|Ã¨|Ãª|Ã®|Ã´|Ã¢|Ã¹|Ã»|Ã§|â€™|â€œ|â€|â€¦|â€“/g
const clean = /[àâéèêëîïôöùûüçœ]|’|“|”|…|–/g
const mHits = (s.match(moji) || []).length
const cHits = (s.match(clean) || []).length
console.log('mojibake hits =', mHits)
console.log('clean accent hits =', cHits)
const sampleLines = s.split('\n').filter(l => /Ã|â€|â€™|Ã©/.test(l)).slice(0, 8)
console.log('--- sample offending line fragments ---')
for (const l of sampleLines) console.log('  ·', l.trim().slice(0, 120))
