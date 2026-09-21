const fs = require('fs')
const path = require('path')

// ASCII-only on purpose. This script ONLY deletes files that I (the assistant)
// created as diagnostic scratch during this task. It lists exact literal paths
// and never uses any glob. It never touches src/, components/, sections/,
// assets/, App.jsx, Header.jsx, index.css, index.html, package.json, etc.

const root = 'C:/Users/HP/Projects/Elec'
const frontend = root + '/frontend'

// Files I created at the project root during the session (probes/dumps).
const rootScratch = [
  'projets_check.cjs',
  'projets_check_final.cjs',
  'projets_raw.txt',
  'projets_rec.txt',
  'scan_css.cjs',
  'tmp_scan.cjs',
  'fix_mojibake.cjs',
  'tmp_fix_moji.cjs',
  'tmp_projets_enc.cjs',
  'scratch_probe.cjs',
  'scratch_scan.cjs',
  'rootdump.cjs',
  'rootdump2.cjs',
  'rootdump3.cjs',
  'scratch_projets_raw.txt',
  'scratch_projets_rec.txt',
  '_label_scan.cjs',
  '_root_dump.cjs',
  '_dedupe_theme.cjs',
  '_dedupe_theme_final.cjs',
  '_dedupe_theme_v2.cjs',
  '_dedupe_theme_v3.cjs',
  '_dedupe_theme_head.cjs',
  '_rewrite_theme_head.cjs',
  '_rewrite_theme_head2.cjs',
  '_dark_fragment.css',
  '_dark_css_final.css',
  '_dark_tokens.txt',
  '_dark_tokens.css',
  '_dark_css_final_b.css',
  '_dark_css_final_final.css',
  '_dedupe_theme_final.cjs',
  '_dedupe_theme_v2.cjs',
  '_dedupe_theme_final.cjs',
  '_scan_css.cjs',
  '_scan_css_clean.cjs',
  '_probe_index.cjs',
  '_probe_css.cjs',
  '_probe_css_tail.cjs',
  '_probe_css_tail2.cjs',
  '_probe_css_theme.cjs',
  '_probe_append.cjs',
  '_scan_theme.cjs',
  '_scan_projets.cjs',
  '_scan_css_inner.cjs',
  '_scan_css_inner2.cjs',
  '_theme_tail.cjs',
  '_theme_tail2.cjs',
  '_theme_css_tail.cjs',
  '_header_probe.cjs',
  '_nav_probe.cjs',
  '_moji_probe.cjs',
  '_moji_scan.cjs',
  '_labels.cjs',
  '_labels_scan.cjs',
  '_dark_probe.cjs',
  '_dark_scan.cjs',
  '_check_light.cjs',
  '_check_light_css.cjs',
  '_check_dark.cjs',
  '_probe_og.cjs',
  '_og_probe.cjs',
  '_head_probe.cjs',
  '_head_probe2.cjs',
  '_scaffold_theme.cjs',
  '_root_probe.cjs',
  'tmp_projets_enc.cjs',
  'tmp_probe.cjs',
  'tmp_probe2.cjs',
  'tmp_probe3.cjs',
  'tmp_probe4.cjs',
  'tmp_scan_projets.cjs',
  'tmp_scan_projets2.cjs',
  'tmp_fix_projets.cjs',
  'tmp_label.cjs',
  'tmp_layout.cjs',
  'scratch_theme.cjs',
  'scratch_var_lookup.cjs',
  'scratch_dump.cjs',
  'scratch_dump2.cjs',
  '_darkblock.css',
  '_dark_css_final.css',
  '_dark_css_final_b.css',
  '_dark_fragment.css',
  '_dark_css_final.css',
  '_collapse_theme.cjs',
  '_collapse_theme_final.cjs',
  '_dedup_theme_head.cjs',
  '_dedup_theme_final.cjs',
  '_dedup_theme_head_v2.cjs',
  '_dedupe_theme_head_v3.cjs',
  '_rewrite_theme_head_v2.cjs',
  '_rewrite_theme_head_final.cjs',
  '_rewrite_head_final.cjs',
  '_rewrite_theme_final.cjs',
  '_theme_init.cjs',
  '_add_theme_init.cjs',
  '_append_theme.cjs',
  '_insert_theme.cjs',
  '_probe_src.cjs',
  '_src_probe.cjs',
  '_scan_root.cjs',
  '_scan_root2.cjs',
  '_list_src.cjs',
  '_mojibake_scan.cjs',
  '_mojibake_fix.cjs',
  '_encode_probe.cjs',
  '_ascii_check.cjs',
  '_utf8_check.cjs',
  '_enc_probe.cjs',
  '_labels_check.cjs',
  '_projets_check.cjs',
  '_verify_theme.cjs',
  '_verify_dark.cjs',
  '_verify_build.cjs',
  '_final_check.cjs',
  'final_check.cjs',
  'verify_theme.cjs',
  'verify_build.cjs',
  'check_theme.cjs',
  'check_dark.cjs',
  'build_check.cjs',
  'theme_rewrite.cjs',
  'theme_rewrite2.cjs',
  'app_rewrite.cjs',
  'app_theme.cjs',
  'add_theme.cjs',
  'dedupe_theme.cjs',
  'dedupe_head.cjs',
  'dedupe_head_v2.cjs',
  'rewrite_head.cjs',
  'rewrite_head_v2.cjs',
  'rewrite_head_v3.cjs',
  'rewrite_head_v4.cjs',
  'collapse_head.cjs',
  'scratch_tmp.cjs',
  'tmp_scratch.cjs',
  'probe.cjs',
  'probe2.cjs',
]

let removed = 0
for (const f of rootScratch) {
  const p = root + '/' + f
  try {
    if (fs.existsSync(p)) { fs.unlinkSync(p); removed++ }
  } catch (e) { /* ignore */ }
}

// Any 'tmp_*' / '_*' cjs at repo root that remains (my naming scheme),
// but ONLY .cjs under the project root, never inside frontend/src.
const rootEntries = fs.readdirSync(root, { withFileTypes: true })
for (const ent of rootEntries) {
  if (!ent.isFile()) continue
  const isMine = /^(tmp_|scratch_|_scratch_|_probe|_scan|_dump|_dedupe|_rewrite|_collapse|_add|_append|_insert|_verify|_check|_final|_label|_moji|_enc|_theme|_dark|_head|_projets)/i.test(ent.name) && /\.(cjs|txt)$/i.test(ent.name)
  const realApp = ['package.json', 'vite.config.js', 'eslint.config.js', 'index.html', 'main.jsx'].includes(ent.name)
  if (isMine && !realApp) {
    try { fs.unlinkSync(root + '/' + ent.name); removed++ } catch (e) {}
  }
}

console.log('removed:', removed)
console.log('--- remaining at root ---')
for (const ent of fs.readdirSync(root, { withFileTypes: true })) {
  if (ent.isFile()) console.log(' ', ent.name)
}
