const KEY='proteincalc:v1';
const uid=()=>Math.random().toString(36).slice(2,9);
const pad=n=>String(n).padStart(2,'0');
const dkey=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const today=()=>dkey(new Date());
const fmt=n=>{n=Math.round(n*10)/10;return n%1?n.toFixed(1):String(n)};
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const DEFAULTS={
  goal:160,maxOz:16,lastOz:6,
  favs:[{id:uid(),name:'Greek yogurt',g:23},{id:uid(),name:'Protein shake',g:25},{id:uid(),name:'2 eggs',g:12},{id:uid(),name:'Cheese stick',g:7}],
  meats:[{id:uid(),name:'Chicken breast',r:6.5},{id:uid(),name:'Beef 90/10',r:5.7},{id:uid(),name:'Ground turkey',r:5.3},{id:uid(),name:'Salmon',r:5.6}],
  sel:null,day:{start:null,entries:[]},history:[],theme:{mode:'auto',pal:'claret'}
};

let mem=null;
function load(){
  try{const s=localStorage.getItem(KEY);if(s)return Object.assign(structuredClone(DEFAULTS),JSON.parse(s))}catch(e){if(mem)return mem}
  return structuredClone(DEFAULTS);
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){mem=S}}
let S=load();
if(!S.sel||!S.meats.find(m=>m.id===S.sel))S.sel=S.meats[0]?.id||null;

const dayTotal=()=>S.day.entries.reduce((a,e)=>a+e.g,0);

function renderToday(){
  const t=dayTotal(),g=S.goal;
  $('tot').textContent=fmt(t);
  $('rt').textContent=fmt(t)+'g';
  $('bar').style.width=Math.min(100,g?t/g*100:0)+'%';
  $('left').textContent=t>=g?'Goal met':fmt(g-t)+'g to go';
  $('goalLbl').textContent='Goal '+g+'g';
  const d=S.day.start?new Date(S.day.start+'T12:00'):new Date();
  const lbl=d.toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'});
  $('dayLabel').textContent=S.day.start&&S.day.start!==today()?lbl+' (not ended)':lbl;

  $('favs').innerHTML=S.favs.map(f=>`<button class="tag" data-fav="${f.id}"><b>${fmt(f.g)}g</b><span>${esc(f.name)}</span></button>`).join('')||'<p class="hint">Add favorites from the tag icon above.</p>';
  $('meats').innerHTML=S.meats.map(m=>`<button class="chip${m.id===S.sel?' on':''}" data-meat="${m.id}">${esc(m.name)}</button>`).join('');
  renderLog();renderSlider();
}
function renderLog(){
  $('log').innerHTML=S.day.entries.length?S.day.entries.map(e=>`<div class="rr tap" data-entry="${e.id}"><span class="nm">${esc(e.name)}</span><span>${fmt(e.g)}g</span></div>`).join(''):'<div class="empty">Nothing logged yet.</div>';
}
function renderSlider(){
  const sl=$('sl');sl.max=S.maxOz;
  if(+sl.value>S.maxOz)sl.value=S.maxOz;
  const oz=+sl.value,m=S.meats.find(x=>x.id===S.sel);
  const g=m?Math.round(oz*m.r):0;
  sl.style.setProperty('--p',((oz-sl.min)/(sl.max-sl.min)*100)+'%');
  $('oz').textContent=fmt(oz);$('pg').textContent=g;
  $('maxTick').textContent=S.maxOz+' oz';$('midTick').textContent=fmt((1+S.maxOz)/2)+' oz';
  $('addMeat').textContent=m?`Add ${g}g ${m.name.toLowerCase()}`:'Add a meat in settings';
}

let lastAdded=null,tTimer=null;
function add(name,g){
  if(!S.day.start)S.day.start=today();
  const e={id:uid(),name,g};S.day.entries.push(e);save();
  lastAdded=e.id;renderToday();toast(`Added ${fmt(g)}g`,true);
}
function toast(msg,undo){
  $('tMsg').textContent=msg;$('tUndo').style.display=undo?'':'none';
  $('toast').classList.add('on');clearTimeout(tTimer);
  tTimer=setTimeout(()=>$('toast').classList.remove('on'),3000);
}
$('tUndo').onclick=()=>{
  if(lastAdded){S.day.entries=S.day.entries.filter(e=>e.id!==lastAdded);if(!S.day.entries.length)S.day.start=null;save();renderToday();lastAdded=null}
  $('toast').classList.remove('on');
};

document.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-fav],[data-meat],[data-entry],[data-go],[data-rmfav],[data-rmmeat],[data-past],[data-savepast],[data-rmpast],[data-mode],[data-pal],.rm');
  if(!b||ev.target.tagName==='INPUT')return;
  if(b.dataset.fav){const f=S.favs.find(x=>x.id===b.dataset.fav);if(f)add(f.name,f.g)}
  else if(b.dataset.meat){S.sel=b.dataset.meat;save();renderToday()}
  else if(b.dataset.savepast)savePast(b.dataset.savepast);
  else if(b.dataset.rmpast){
    const d=b.dataset.rmpast;if(confirm(`Remove ${longDate(d)} from history?`)){S.history=S.history.filter(h=>h.date!==d);pastSel=null;save();renderHistory()}
  }
  else if(b.classList.contains('rm')){
    const id=b.dataset.id;S.day.entries=S.day.entries.filter(e=>e.id!==id);if(!S.day.entries.length)S.day.start=null;save();renderToday();
  }
  else if(b.dataset.entry){
    const row=b,sel=row.classList.contains('sel');renderLog();
    if(!sel){const r=$('log').querySelector(`[data-entry="${row.dataset.entry}"]`);r.classList.add('sel');r.lastElementChild.outerHTML=`<button class="rm" data-id="${row.dataset.entry}">Remove</button>`}
  }
  else if(b.dataset.go)go(b.dataset.go);
  else if(b.dataset.mode||b.dataset.pal){S.theme={...S.theme,...b.dataset.mode?{mode:b.dataset.mode}:{pal:b.dataset.pal}};save();applyTheme(S.theme);renderUsual()}
  else if(b.dataset.rmfav){S.favs=S.favs.filter(f=>f.id!==b.dataset.rmfav);save();renderUsual()}
  else if(b.dataset.rmmeat){
    if(S.meats.length<=1&&!confirm('Remove your last meat?'))return;
    S.meats=S.meats.filter(m=>m.id!==b.dataset.rmmeat);if(S.sel===b.dataset.rmmeat)S.sel=S.meats[0]?.id||null;save();renderUsual()}
  else if(b.dataset.past){
    pastSel=pastSel===b.dataset.past?null:b.dataset.past;renderHistory();
    if(pastSel)$('past').querySelector('.pin')?.focus();
  }
});

$('sl').addEventListener('input',()=>{renderSlider()});
$('sl').addEventListener('change',()=>{S.lastOz=+$('sl').value;save()});
$('addMeat').onclick=()=>{
  const m=S.meats.find(x=>x.id===S.sel);if(!m){go('usual');return}
  const oz=+$('sl').value;add(`${m.name} ${fmt(oz)}oz raw`,Math.round(oz*m.r));
};

function closeDay(){
  const t=dayTotal(),date=S.day.start||today(),ex=S.history.find(h=>h.date===date);
  if(ex)ex.total+=t;else S.history.push({date,total:t});
  S.history.sort((a,b)=>a.date<b.date?-1:1);
  S.day={start:null,entries:[]};lastAdded=null;save();
  return t;
}
$('endDay').onclick=()=>{
  if(!S.day.entries.length){toast('Nothing to end yet',false);return}
  if(!confirm(`End the day at ${fmt(dayTotal())}g? It'll be saved to history and the counter resets.`))return;
  const t=closeDay();renderToday();toast(`Saved ${fmt(t)}g to history`,false);
};

// Days end on their own at midnight: on open, on return to the app, and by timer while it's on screen.
let midTimer=null;
function rollover(){
  if(S.day.entries.length&&S.day.start&&S.day.start<today()){
    const d=new Date(S.day.start+'T12:00').toLocaleDateString(undefined,{weekday:'long'});
    const t=closeDay();renderToday();
    if($('v-history').classList.contains('on'))renderHistory();
    toast(`${d} saved: ${fmt(t)}g`,false);
  }
  clearTimeout(midTimer);
  const n=new Date();midTimer=setTimeout(rollover,new Date(n.getFullYear(),n.getMonth(),n.getDate()+1,0,0,1)-n);
}

function avgSince(days){
  const c=new Date();c.setDate(c.getDate()-days);const k=dkey(c);
  const r=S.history.filter(h=>h.date>k&&h.date<=today());
  return r.length?Math.round(r.reduce((a,h)=>a+h.total,0)/r.length):null;
}
function renderHistory(){
  const a7=avgSince(7),a30=avgSince(30);
  $('avg7').textContent=a7??'—';$('avg30').textContent=a30??'—';
  const map=Object.fromEntries(S.history.map(h=>[h.date,h.total]));
  const tk=today();map[tk]=(map[tk]||0)+(S.day.start===tk||!S.day.start?dayTotal():0);
  const ds=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);ds.push(d)}
  const vals=ds.map(d=>map[dkey(d)]||0);
  const top=Math.max(S.goal*1.15,...vals,1);
  $('bars').innerHTML=`<div class="goalline" style="bottom:${S.goal/top*100}%"></div>`+ds.map((d,i)=>{
    const v=vals[i],isT=dkey(d)===tk&&S.day.entries.length>0&&S.day.start===tk;
    return `<div class="b${isT?' today':v<S.goal?' lo':''}" style="height:${v/top*100}%">${v?`<em>${Math.round(v)}</em>`:''}</div>`}).join('');
  $('days').innerHTML=ds.map(d=>`<span>${d.toLocaleDateString(undefined,{weekday:'narrow'})}</span>`).join('');

  const mo={};S.history.forEach(h=>{const k=h.date.slice(0,7);(mo[k]=mo[k]||[]).push(h.total)});
  const keys=Object.keys(mo).sort().reverse().slice(0,12);
  $('months').innerHTML=keys.length?keys.map(k=>{const a=mo[k],n=new Date(k+'-15T12:00');
    return `<div class="rr"><span>${n.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</span><span>${Math.round(a.reduce((x,y)=>x+y,0)/a.length)}g avg</span></div>`}).join(''):'<div class="empty">End your first day to start the ledger.</div>';

  const past=[...S.history].reverse().slice(0,30);
  $('past').innerHTML=past.length?past.map(h=>h.date===pastSel
    ?`<div class="rr tap sel" data-past="${h.date}"><span>${shortDate(h.date)}</span><span class="row" style="gap:6px"><input type="number" class="pin" value="${fmt(h.total)}" inputmode="decimal" aria-label="Grams for ${shortDate(h.date)}"><button class="rm" data-savepast="${h.date}">Save</button><button class="rm ghost" data-rmpast="${h.date}">Remove</button></span></div>`
    :`<div class="rr tap" data-past="${h.date}"><span>${shortDate(h.date)}</span><span>${fmt(h.total)}g</span></div>`).join(''):'<div class="empty">No days saved yet.</div>';
  const y=new Date();y.setDate(y.getDate()-1);$('pDate').max=dkey(y);if(!$('pDate').value)$('pDate').value=dkey(y);
}
const shortDate=d=>new Date(d+'T12:00').toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
const longDate=d=>new Date(d+'T12:00').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
let pastSel=null;
const okGrams=v=>v>0&&v<2000;
function savePast(d){
  const v=parseFloat($('past').querySelector('.pin').value),h=S.history.find(x=>x.date===d);
  if(!okGrams(v)){toast('Enter grams between 0 and 2000',false);return}
  if(h)h.total=v;pastSel=null;save();renderHistory();toast(`${shortDate(d)} set to ${fmt(v)}g`,false);
}
$('past').addEventListener('keydown',ev=>{if(ev.key==='Enter'&&ev.target.classList.contains('pin'))savePast(pastSel)});
$('pAdd').onclick=()=>{
  const d=$('pDate').value,v=parseFloat($('pG').value);
  if(!d||d>=today()){$('pErr').textContent='Pick a day before today.';return}
  if(S.history.some(h=>h.date===d)){$('pErr').textContent=`${shortDate(d)} is already saved. Tap it above to change it.`;return}
  if(!okGrams(v)){$('pErr').textContent='Enter grams between 0 and 2000.';return}
  $('pErr').textContent='';S.history.push({date:d,total:v});S.history.sort((a,b)=>a.date<b.date?-1:1);
  $('pG').value='';save();renderHistory();toast(`Added ${shortDate(d)}: ${fmt(v)}g`,false);
};
['pDate','pG'].forEach(id=>$(id).addEventListener('input',()=>{$('pErr').textContent=''}));

function renderUsual(){
  $('favList').innerHTML=S.favs.length?S.favs.map(f=>`<div class="rr"><span class="nm">${esc(f.name)}</span><span class="row" style="gap:4px">${fmt(f.g)}g<button class="x" data-rmfav="${f.id}" aria-label="Remove ${esc(f.name)}">×</button></span></div>`).join(''):'<div class="empty">No favorites yet.</div>';
  $('meatList').innerHTML=S.meats.length?S.meats.map(m=>`<div class="rr"><span class="nm">${esc(m.name)}</span><span class="row" style="gap:4px">${fmt(m.r)}<button class="x" data-rmmeat="${m.id}" aria-label="Remove ${esc(m.name)}">×</button></span></div>`).join(''):'<div class="empty">No meats yet.</div>';
  $('goal').value=S.goal;$('maxOz').value=S.maxOz;
  $('modes').innerHTML=['auto','light','dark'].map(m=>`<button class="chip${S.theme.mode===m?' on':''}" data-mode="${m}">${m[0].toUpperCase()+m.slice(1)}</button>`).join('');
  $('pals').innerHTML=Object.entries(PALETTES).map(([k,p])=>`<button class="sw${S.theme.pal===k?' on':''}" data-pal="${k}"><span class="dots">${[p.light.bg,p.light.br,p.dark.bg,p.dark.br].map(c=>`<i style="background:${c}"></i>`).join('')}</span>${p.name}</button>`).join('');
}
function addItem(nameEl,valEl,errEl,max,fn){
  const n=$(nameEl).value.trim(),v=parseFloat($(valEl).value);
  if(!n){$(errEl).textContent='Enter a name first.';return}
  if(!(v>0&&v<=max)){$(errEl).textContent=`Enter a number between 0 and ${max}.`;return}
  $(errEl).textContent='';fn(n,v);$(nameEl).value='';$(valEl).value='';save();renderUsual();
}
$('fAdd').onclick=()=>addItem('fName','fG','fErr',200,(n,v)=>S.favs.push({id:uid(),name:n,g:v}));
$('mAdd').onclick=()=>addItem('mName','mR','mErr',15,(n,v)=>{
  const ex=S.meats.find(m=>m.name.toLowerCase()===n.toLowerCase());if(ex)ex.r=v;else S.meats.push({id:uid(),name:n,r:v});if(!S.sel)S.sel=S.meats[0].id});
['fName','fG','mName','mR'].forEach(id=>$(id).addEventListener('input',()=>{$('fErr').textContent='';$('mErr').textContent=''}));
$('goalSet').onclick=()=>{const v=parseInt($('goal').value);if(v>0&&v<1000){S.goal=v;save();toast('Goal set to '+v+'g',false)}};
$('maxSet').onclick=()=>{const v=parseInt($('maxOz').value);if(v>=2&&v<=64){S.maxOz=v;save();renderSlider();toast('Slider max set to '+v+' oz',false)}};

$('exp').onclick=async()=>{
  const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
  const name=`protein-calc-${today()}.json`;
  try{const f=new File([blob],name,{type:'application/json'});
    if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Protein Calc backup'});return}}catch(e){if(e.name==='AbortError')return}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();
};
$('impBtn').onclick=()=>$('imp').click();
$('imp').onchange=async()=>{
  const f=$('imp').files[0];if(!f)return;
  try{const d=JSON.parse(await f.text());if(!d.history||!d.day)throw 0;
    if(confirm('Replace everything on this phone with the backup?')){S=Object.assign(structuredClone(DEFAULTS),d);save();applyTheme(S.theme);renderUsual();renderToday();toast('Backup imported',false)}}
  catch(e){toast("That file isn't a Protein Calc backup",false)}
  $('imp').value='';
};

function go(v){
  pastSel=null;
  document.querySelectorAll('.view').forEach(s=>s.classList.toggle('on',s.id==='v-'+v));
  if(v==='history')renderHistory();if(v==='usual')renderUsual();if(v==='today')renderToday();
  window.scrollTo(0,0);
}

$('sl').value=Math.min(S.lastOz||6,S.maxOz);
renderToday();rollover();applyTheme(S.theme);
darkQ.addEventListener('change',()=>applyTheme(S.theme));
document.addEventListener('visibilitychange',()=>{if(!document.hidden){renderToday();rollover()}});
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js');
