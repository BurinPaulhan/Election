const fs = require('fs')
const path = require('path')

const walk = (dir, acc = []) => {
  let es
  try { es = fs.readdirSync(dir, { withFileTypes: true }) } catch (e) { return acc }
  for (const e of es) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist') continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) { walk(p, acc) } else { acc.push(p) }
  }
  return acc
}

const roots = ['C:/Users/HP/Projects/Elec', 'C:/Users/HP/Projects/Elec/frontend/src']
const files = roots.flatMap((r) => walk(r))

// Marqueurs : uniquement des NOMS de fichiers-martial que J'AI créés.
const scratchRe =\n
