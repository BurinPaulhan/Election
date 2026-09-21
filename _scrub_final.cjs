const fs = require('fs')
const path = require('path')

const roots = [
  'C:/Users/HP/Projects/Elec',
  'C:/Users/HP/Projects/Elec/frontend',
  'C:/Users/HP/Projects/Elec/frontend/src',
]

// Only names I authored as probes — NEVER the real app files.
const scratchNames = /^(?:scratch_|tmp_|fix_mojibake\.cjs$|fix_moji\.cjs$|projets_verify\.cjs$|_probe_|_probe|_dedupe|_rewrite|_collapse|_collapse_theme|_app_theme|_add_theme|_theme_|_scan_|_scan|_grep|_dump|_root_|_label|_final_|_verify|_probe|_sanity|_dedupe_theme_final\.cjs$|_grep_tokens\.cjs$|_scan_css\.cjs$|scan_css\.cjs$|tmp_scan\.cjs$|layout\.cjs$|recover\.cjs$|rootdump\.cjs$|_dedupe_theme_head\.cjs$|_rewrite_theme_head\.cjs$|_dedupe_theme\.cjs$|_probe_index\.cjs$|_probe_append\.cjs$|_probe_css_tail\.cjs$|_probe_css_tail2\.cjs$|_probe_css\.cjs$|_probe_css_theme\.cjs$|_scan_probe\.cjs$|_scan_dark\.cjs$|scan_dark\.cjs$|_probe_src\.cjs$|_theme_probe\.cjs$|_append_dark\.cjs$|_append_darkblock\.cjs$|_append_darkblock_v2\.cjs$|_dark_dedupe\.cjs$|_dark_dedupe_v2\.cjs$|_insert_head\.cjs$|empty\.cjs$|_empty3\.cjs$|_cleanup_scratch\.cjs$|_scrub_scratch\.cjs$|_scrub_final\.cjs$|_scrub_list\.cjs$|_final_scrub\.cjs$|_purge_scratch\.cjs$|_prune_list\.cjs$|_grep_state\.cjs$|_scan_state\.cjs$|_state_dump\.cjs$|_state_final\.cjs$|_probe_app\.cjs$|_probe_head\.cjs$|_probe_css_tail_final\.cjs$|_probe_css_final\.cjs$|_probe_dark_\d*\.cjs$|_dark_\w*\.css$|_dark_tokens\.\w+$|_dedupe_theme_final\.cjs$)/
// Also drop the raw .txt/.css/.fragment scratch at repo ROOT only (never in src).
const extendedDrops = /^[_.]?(?:scratch|tmp|dump|probe|scan|projets|layout|recover|rootdump|fix_|_dark|animate|reveal|dump)_[\w.-]*\.(?:cjs|txt|css|html|jsx|js)$/

let removed = 0
for (const root of roots) {
  const stack = [root]
  while (stack.length) {
    const dir = stack.pop()
    let entries
    try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch (e) { continue }
    for (const e of entries) {
      if (e.name === 'node_modules' || e.name === 'dist' || e.name === '.git') continue
      const p = path.join(dir, e.name)
      if (e.isDirectory()) { stack.push(p); continue }
      if (dir === root && extendedDrops.test(e.name)) {
        if (/\.css$/.test(e.name) && /\.css$/.test(root + '/' + p) === false) { /* noop */ }
        try { fs.unlinkSync(p); removed++; console.log('root drop  : ' + e.name) } catch (err) { console.log('skip       : ' + e.name + ' (' + err.message + ')') }
        continue
      }
      if (scratchNames.test(e.name)) {
        try { fs.unlinkSync(p); removed++; console.log('scratch    : ' + e.name) } catch (err) { console.log('skip       : ' + e.name) }
      }
    }
  }
}

console.log('\nTOTAL supprimés : ' + removed)
console.log('--- restant à la racine du projet (hors node_modules) ---')
for (const n of fs.readdirSync(roots[0])) {
  if (!['node_modules', 'dist', '.git', 'frontend'].includes(n)) console.log('  ' + n)
}
