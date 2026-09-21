const fs=require('fs')
const t=fs.readFileSync('frontend/src/index.css','utf8')
const l=t.split('\n')
console.log('== does --muted exist? ==')
console.log('defined:' , /--muted\s*:/.test(t))
console.log('== global usage counts ==')
for(const k of ['--muted','--surface','--navy','--primary-dark','--card']){
  console.log(k, 'def:+' + (t.match(new RegExp(k+'\\s*:')||[]).length) + ' use:' + (t.match(new RegExp('var\\('+k+'\\)')||[]).length) + ' rawuse:' + (t.split(k).length-1))
}
console.log('== banniere block 286-346 ==')
l.slice(285,346).forEach((x,i)=>console.log((285+1+i)+'\t'+x))
