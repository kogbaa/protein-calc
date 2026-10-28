// Color palettes, each with a light and dark set. Loaded in <head> so the saved look applies before first paint.
const PALETTES={
claret:{name:'Claret',light:{bg:'#F6F1E7',card:'#FBF8F2',ink:'#4A3034',br:'#7A2533',soft:'#E6D9D2',line:'#E4D9C8',mid:'#8C7670',on:'#FBF8F2'},dark:{bg:'#2A1F1F',card:'#362828',ink:'#EDE4D8',br:'#D4929B',soft:'#4F3A3C',line:'#4F3A3C',mid:'#B8A69F',on:'#2A1F1F'}},
sage:{name:'Sage',light:{bg:'#EEF1E8',card:'#F7F9F3',ink:'#2F3A30',br:'#3F6B4A',soft:'#D6E0D2',line:'#D5DDCB',mid:'#5D6B57',on:'#F7F9F3'},dark:{bg:'#1C231E',card:'#263029',ink:'#E3EADF',br:'#9CC8A6',soft:'#34433A',line:'#34433A',mid:'#A2B1A3',on:'#1C231E'}},
ocean:{name:'Ocean',light:{bg:'#EEF3F6',card:'#F8FBFC',ink:'#1F3442',br:'#1F5F86',soft:'#D3E2EC',line:'#D2DEE6',mid:'#566D7C',on:'#F8FBFC'},dark:{bg:'#15202A',card:'#1E2C38',ink:'#E2ECF2',br:'#8EC3E6',soft:'#2C3F4F',line:'#2C3F4F',mid:'#9DB2C1',on:'#15202A'}},
marigold:{name:'Marigold',light:{bg:'#FBF4E2',card:'#FFFBF0',ink:'#3F3420',br:'#9A5300',soft:'#F1E2C0',line:'#EADDBF',mid:'#7D6C4E',on:'#FFFBF0'},dark:{bg:'#241E14',card:'#30281B',ink:'#F3EAD7',br:'#F2B866',soft:'#463A27',line:'#463A27',mid:'#BDAE92',on:'#241E14'}},
lavender:{name:'Lavender',light:{bg:'#F3F0F7',card:'#FAF8FC',ink:'#352E45',br:'#5E4A9A',soft:'#E1DAEE',line:'#DFD8E8',mid:'#6A6180',on:'#FAF8FC'},dark:{bg:'#1E1A27',card:'#292434',ink:'#EAE5F2',br:'#B9A8F0',soft:'#3B3449',line:'#3B3449',mid:'#ADA4BF',on:'#1E1A27'}},
rose:{name:'Rose',light:{bg:'#FBF0EF',card:'#FFF8F7',ink:'#4A2C30',br:'#A8344F',soft:'#F2D9DC',line:'#EDD6D6',mid:'#7E5F63',on:'#FFF8F7'},dark:{bg:'#261A1D',card:'#33242A',ink:'#F4E4E6',br:'#F29AB2',soft:'#4A333A',line:'#4A333A',mid:'#C3A7AD',on:'#261A1D'}},
espresso:{name:'Espresso',light:{bg:'#EFE7DD',card:'#F8F3EC',ink:'#3A2B22',br:'#6B4228',soft:'#DDCFC0',line:'#DCCFBF',mid:'#6E5D4F',on:'#F8F3EC'},dark:{bg:'#1F1915',card:'#2B231D',ink:'#EEE4DA',br:'#D9A57A',soft:'#40342B',line:'#40342B',mid:'#B5A596',on:'#1F1915'}},
slate:{name:'Slate',light:{bg:'#F2F2F0',card:'#FAFAF9',ink:'#26282B',br:'#2F3A48',soft:'#DFE1E3',line:'#DCDDDA',mid:'#636669',on:'#FAFAF9'},dark:{bg:'#17181A',card:'#222326',ink:'#E8E8E6',br:'#C9D3DE',soft:'#34363A',line:'#34363A',mid:'#A3A6AA',on:'#17181A'}},
tide:{name:'Tidepool',light:{bg:'#ECF4F1',card:'#F7FBF9',ink:'#1E3833',br:'#16695E',soft:'#D0E6DF',line:'#CFE1DA',mid:'#526E68',on:'#F7FBF9'},dark:{bg:'#14211F',card:'#1C2E2B',ink:'#DEEFEA',br:'#7FD1C1',soft:'#2A423D',line:'#2A423D',mid:'#9AB8B1',on:'#14211F'}},
};
const darkQ=matchMedia('(prefers-color-scheme: dark)');
function applyTheme(t){
  t=t||{};const p=PALETTES[t.pal]||PALETTES.claret,mode=t.mode||'auto';
  const dark=mode==='dark'||(mode==='auto'&&darkQ.matches),c=p[dark?'dark':'light'],r=document.documentElement.style;
  for(const k in c)r.setProperty('--'+k,c[k]);
  r.colorScheme=dark?'dark':'light';
  document.querySelectorAll('meta[name=theme-color]').forEach(m=>{m.content=mode==='auto'?p[m.media.includes('dark')?'dark':'light'].bg:c.bg});
}
// Same storage key as app.js, which loads later.
try{applyTheme(JSON.parse(localStorage.getItem('proteincalc:v1'))?.theme)}catch(e){applyTheme()}
