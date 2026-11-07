document.querySelectorAll('.saq-menu').forEach(menu => {
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && menu.open){menu.open=false;menu.querySelector('summary').focus();}
  });
  document.addEventListener('click', e => {if(menu.open && !menu.contains(e.target)) menu.open=false;});
});
// Carry only campaign attribution across the public journeys, never personal fields.
function decorateSaqLink(a){
  const u=new URL(a.href,location.href);
  if(!['www.souverainauquotidien.com','test.souverainauquotidien.com','rdv.souverainauquotidien.com','livre.souverainauquotidien.com','regeneration.souverainauquotidien.com','alchimie.souverainauquotidien.com'].includes(u.hostname))return;
  let stored={};try{stored=window.h3cAttribution?.()||{};}catch{}
  const current=new URLSearchParams(location.search);
  for(const k of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','h3c']){
    const v=current.get(k)||stored[k];if(v && !u.searchParams.has(k))u.searchParams.set(k,String(v).slice(0,200));
  }
  a.href=u.href;
}
document.querySelectorAll('.saq-shell a[href]').forEach(decorateSaqLink);
document.querySelector('.saq-shell')?.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(a)decorateSaqLink(a);});
document.querySelectorAll('table').forEach(table=>{
  if(table.closest('.saq-table-scroll'))return;
  const wrap=document.createElement('div');wrap.className='saq-table-scroll';wrap.tabIndex=0;
  wrap.setAttribute('role','region');wrap.setAttribute('aria-label','Tableau, défilement horizontal si nécessaire');
  table.before(wrap);wrap.append(table);
});
