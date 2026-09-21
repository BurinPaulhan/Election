const fs = require('fs')
const p = 'frontend/src/sections/Projets.jsx'
const orig = fs.readFileSync(p, 'utf8')
const rec = Buffer.from(orig, 'latin1').toString('utf8')
const ol = orig.split('\n'), rl = rec.split('\n')

const MOJI = /Ã[©èêîôâùûç¨]|â€™|â€œ|â€|â€¦|â€“|â€”/g
function mj(s) { const m = s.match(MOJI); return m ? m.length : 0 }

// ASCII-only lines must be untouched
let codeDiff = 0
for (let i = 0; i < ol.length; i++) {
  if (/^[\x00-\x7f]*$/.test(ol[i])) { if (ol[i] !== rl[i]) { codeDiff++; if (codeDiff <= 5) console.log('CODE-DIFF L' + (i + 1) + '\n  o: ' + ol[i] + '\n  r: ' + rl[i]) } }
}

console.log('--- result ---')
console.log('mojibake   orig=' + mj(orig) + '  recovered=' + mj(rec))
console.log('ASCII code lines changed: ' + codeDiff)
console.log('total lines: ' + ol.length)
console.log('rec oversize? ' + (rec.length > orig.length + 1))
