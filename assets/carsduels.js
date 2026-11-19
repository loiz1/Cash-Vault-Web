(function(){
  var year=document.getElementById('year');
  if(year)year.textContent=new Date().getFullYear();
  var names=['BrisaPixel','RayoLento','NeoCurva','NubeVeloz','PixelCometa','SolDeCobre','TrazadaFina','MentaTurbo','LuzDePista'];
  for(var i=names.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var temp=names[i];names[i]=names[j];names[j]=temp}
  document.querySelectorAll('[data-player-name]').forEach(function(el,index){el.textContent=names[index]});
  var rankSeconds=[48,46,50];
  document.querySelectorAll('[data-player-time]').forEach(function(el,index){var seconds=rankSeconds[index]+Math.floor(Math.random()*2);var millis=String(Math.floor(Math.random()*100)).padStart(2,'0');el.textContent='01:'+String(seconds).padStart(2,'0')+'.'+millis});
  var items=document.querySelectorAll('[data-reveal]');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce||!('IntersectionObserver'in window)){items.forEach(function(el){el.classList.add('is-visible')});return}
  var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}})},{threshold:.12,rootMargin:'0px 0px -35px 0px'});
  items.forEach(function(el){observer.observe(el)});
  var hero=document.querySelector('.hero-backdrop');
  var ticking=false;
  function moveHero(){if(!hero||window.innerWidth<701)return;var y=window.scrollY;hero.style.transform='translate3d(0,'+(y*.16)+'px,0)';ticking=false}
  window.addEventListener('scroll',function(){if(!ticking){window.requestAnimationFrame(moveHero);ticking=true}},{passive:true});
})();
