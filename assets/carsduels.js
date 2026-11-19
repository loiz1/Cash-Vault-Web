(function(){
  var year=document.getElementById('year');
  if(year)year.textContent=new Date().getFullYear();
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
