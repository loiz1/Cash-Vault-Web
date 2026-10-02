(() => {
  'use strict';
  /* Modos: intro (onboarding rotativo), splash (carga) y login (Google).
     La escena es una ilustración fija; lo único que cambia en pantalla son
     los textos del cartel y los chips (Comenzar / Google / Cargando). */
  const MODE = 'intro';
  const INTROS = [];
  const WAIT_LABEL = "";
  const SUB_LABEL = "";
  const INTRO_MS = 8000;

  const $ = id => document.getElementById(id);

  function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  const rr = (a,b,R) => a + (b-a)*R();
  const q = n => Math.round(n*10)/10;
  const clamp = (v,a,b) => v<a?a:v>b?b:v;

  let W=0, H=0, M=0, U=0, S=0, portrait=false;

  function area(p){let a=0;for(let i=0;i<p.length;i++){const u=p[i],v=p[(i+1)%p.length];a+=u[0]*v[1]-v[0]*u[1];}return a;}
  function orient(p){return area(p)<0?p.slice().reverse():p;}
  function trace(p,j,step,R){
    let s='';const n=p.length;
    for(let i=0;i<n;i++){
      const a=p[i],b=p[(i+1)%n],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,k=Math.max(1,Math.round(L/step)),nx=-dy/L,ny=dx/L;
      for(let t=0;t<k;t++){
        let x=a[0]+dx*t/k,y=a[1]+dy*t/k;
        if(t>0){const o=(R()-.5)*2*j;x+=nx*o;y+=ny*o;}
        s+=(s?'L':'M')+q(x)+' '+q(y);
      }
    }
    return s+'Z';
  }
  const cut  = (p,j,step,R) => trace(orient(p),j,step,R);
  const hole = (p,j,step,R) => trace(orient(p).slice().reverse(),j,step,R);
  function poly(p){p=orient(p);let s='M'+q(p[0][0])+' '+q(p[0][1]);for(let i=1;i<p.length;i++)s+='L'+q(p[i][0])+' '+q(p[i][1]);return s+'Z';}
  function circ(cx,cy,r,n){const p=[];n=n||Math.max(8,Math.round(r*1.4));for(let i=0;i<n;i++){const a=i/n*Math.PI*2;p.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return p;}
  function wave(base,amps,lens,R){const ph=amps.map(()=>R()*Math.PI*2);return x=>{let y=base;for(let i=0;i<amps.length;i++)y+=amps[i]*Math.sin(x/lens[i]*Math.PI*2+ph[i]);return y;};}
  function ridge(fn,bottom,step,j,R){const p=[];for(let x=-M;x<=W+M+step;x+=step)p.push([x,fn(x)+(R()-.5)*2*j]);p.push([W+M+step,bottom],[-M,bottom]);return poly(p);}

  function pine(cx,by,h,w,R){
    const n=h>420?9:h>160?7:h>70?5:h>32?4:3;
    const trunkH=h*.09,crown=h-trunkH,tip=by-h,st=crown/(n+.45);
    const j=Math.max(.45,h/520),step=Math.max(5,h/70),lean=(R()-.5)*w*.12;
    let d='';
    for(let i=0;i<n;i++){
      const top=tip+i*st,bot=tip+(i+1.45)*st,k=(i+1)/n;
      const base=w*.5*(.26+.74*Math.pow(k,.9));
      const hr=base*(1+(R()-.5)*.16),hl=base*(1+(R()-.5)*.16),droop=st*.14;
      const cx0=cx+lean*(1-k);
      d+=cut([[cx0,top],[cx+hr,bot+(R()-.5)*droop],[cx+hr*.5,bot-st*.28],[cx,bot-st*.18],[cx-hl*.5,bot-st*.28],[cx-hl,bot+(R()-.5)*droop]],j,step,R);
    }
    const tw=Math.max(1.4,w*.055);
    d+=cut([[cx-tw,by+4],[cx-tw*.75,by-trunkH-st*.6],[cx+tw*.75,by-trunkH-st*.6],[cx+tw,by+4]],.3,8,R);
    return d;
  }
  function blade(bx,by,h,lean,wb){
    const L=[],Rt=[];
    for(let i=0;i<=6;i++){const t=i/6,x=bx+lean*t*t,y=by-h*t,hw=wb*.5*(1-t)*(1-t*.15);L.push([x-hw,y]);if(i<6)Rt.push([x+hw,y]);}
    return poly(L.concat(Rt.reverse()));
  }
  function bankFn(xa,xb,yEdge,wob){
    return x=>{const s=clamp((x-xa)/(xb-xa),0,1);return yEdge+wob(x)+Math.pow(s,3)*(H+M-yEdge)*1.02;};
  }
  function bankPath(fn,x0,x1,R){const p=[],st=x1>x0?9:-9;for(let x=x0;st>0?x<=x1:x>=x1;x+=st)p.push([x,Math.min(H+M,fn(x))+(R()-.5)*1.6]);p.push([x1,H+M],[x0,H+M]);return poly(p);}

  function mushroom(cx,by,s,R){
    const tilt=(R()-.5)*s*.3,capY=by-s*.86,rx=s*(.46+R()*.16),ry=s*(.34+R()*.12);
    const stem=cut([[cx-s*.17,by+2],[cx-s*.11+tilt*.6,capY+s*.05],[cx+s*.11+tilt*.6,capY+s*.05],[cx+s*.19,by+2]],.35,4,R);
    const cp=[];
    for(let i=0;i<=14;i++){const a=Math.PI+i/14*Math.PI;cp.push([cx+tilt+Math.cos(a)*rx,capY+Math.sin(a)*ry]);}
    cp.push([cx+tilt+rx*.7,capY+ry*.2],[cx+tilt,capY+ry*.28],[cx+tilt-rx*.7,capY+ry*.2]);
    const cap=cut(cp,.4,4,R);
    let dots='';const nd=2+Math.floor(R()*3);
    for(let i=0;i<nd;i++){const a=Math.PI*(1.15+R()*.7),rr2=R()*.55+.25;dots+=cut(circ(cx+tilt+Math.cos(a)*rx*rr2,capY+Math.sin(a)*ry*rr2*.9,s*(.05+R()*.05),7),.2,3,R);}
    return {stem,cap,dots};
  }
  function fern(bx,by,len,dir,R){
    let d='';const tipX=bx+dir*len*.62,tipY=by-len*.86,cx=bx+dir*len*.02,cy=by-len*.78;
    const P=t=>[(1-t)*(1-t)*bx+2*(1-t)*t*cx+t*t*tipX,(1-t)*(1-t)*by+2*(1-t)*t*cy+t*t*tipY];
    const sp=[],sp2=[];
    for(let i=0;i<=10;i++){const t=i/10,[x,y]=P(t),w=1.8*(1-t)+.4;sp.push([x-w,y]);sp2.push([x+w,y]);}
    d+=poly(sp.concat(sp2.reverse()));
    for(let t=.1;t<.97;t+=.075){
      const [x,y]=P(t),[x2,y2]=P(Math.min(1,t+.01)),ta=Math.atan2(y2-y,x2-x),L=len*.26*(1-t*.78);
      for(const side of [-1,1]){
        const a=ta+side*1.05,ex=x+Math.cos(a)*L,ey=y+Math.sin(a)*L,mx=x+Math.cos(a)*L*.5,my=y+Math.sin(a)*L*.5,wd=L*.2;
        d+=cut([[x,y],[mx+Math.cos(a+Math.PI/2)*wd,my+Math.sin(a+Math.PI/2)*wd],[ex,ey],[mx-Math.cos(a+Math.PI/2)*wd,my-Math.sin(a+Math.PI/2)*wd]],.25,4,R);
      }
    }
    return d;
  }
  function foxglove(bx,by,h,lean,side,R){
    let stalk='',bells='',inner='';
    const P=t=>[bx+lean*t*t,by-h*t];
    const L=[],Rt=[];
    for(let i=0;i<=8;i++){const t=i/8,[x,y]=P(t),w=2.2*(1-t)+.7;L.push([x-w,y]);Rt.push([x+w,y]);}
    stalk=poly(L.concat(Rt.reverse()));
    for(const sd of [-1,1]){const ll=h*.28;stalk+=cut([[bx,by],[bx+sd*ll*.35,by-ll*.5],[bx+sd*ll*.9,by-ll*.62],[bx+sd*ll*.55,by-ll*.18]],.5,6,R);}
    for(let t=.36;t<.97;t+=.048){
      const [x,y]=P(t),s=h*.075*(1-(t-.36)*1.05),sd=side*((Math.round(t*100)%3===0)?-1:1);
      if(t>.86){bells+=cut(circ(x+sd*s*.35,y+s*.2,s*.42,7),.2,3,R);continue;}
      bells+=cut([[x,y-s*.15],[x+sd*s*.55,y+s*.05],[x+sd*s*1.05,y+s*1.05],[x+sd*s*.78,y+s*1.28],[x+sd*s*.38,y+s*1.14],[x+sd*s*.12,y+s*.5]],.25,3,R);
      inner+=cut(circ(x+sd*s*.66,y+s*1.02,s*.13,6),.1,3,R);
    }
    return {stalk,bells,inner};
  }

  /* Zorro estático (parte de la ilustración; sin animaciones SMIL). */
  const FOX = `
    <g class="fox-tail"><path class="c-fox" d="M-30 -38C-46 -51 -70 -53 -86 -41C-96 -33 -99 -19 -93 -8C-87 -16 -76 -22 -64 -24C-52 -26 -41 -26 -32 -28Z"/>
      <path class="c-foxc" d="M-93 -8C-99 -19 -96 -33 -86 -41C-84 -33 -80 -24 -76 -18C-82 -16 -88 -12 -93 -8Z"/></g>
    <path class="c-foxd" d="M-22 -24L-15 -24L-16.5 -1H-22.5ZM13 -24L19 -24L18.5 -1H12.5Z" opacity=".78"/>
    <path class="c-fox" d="M-34 -30C-38 -41 -29 -49 -13 -49.5C3 -50.5 18 -50 28 -44C34 -40 36 -32 32 -24C26 -19 16 -19 8 -21L-20 -21C-28 -21 -33 -24 -34 -30Z"/>
    <path class="c-foxd" d="M-31.5 -26L-23 -24L-24 -1.5C-21 -1.2 -20 -0 -20 0H-31L-30.5 -2ZM22 -27L29 -27L29.5 -1.5C32 -1 33 0 33 0H23Z"/>
    <path class="c-fox" d="M22 -40C24 -48 27 -54 30 -58L28.5 -75L38 -63.5L44 -64L50.5 -77L52.5 -61C56 -57 60.5 -54 66 -51.5C68.5 -50.5 68.5 -47 66 -46C60 -44 54 -43 48 -41C42 -38 36 -34 30 -32Z"/>
    <path class="c-foxc" d="M40 -48.5C48 -50.5 58 -50.5 66 -46C60 -44 54 -43 48 -41C44 -39 40 -37 35.5 -35C37 -40 38 -45 40 -48.5ZM23.5 -38.5C29 -36.5 33 -35 36 -35.5C34 -30 30 -24.5 24.5 -22.5C22 -28 22 -34 23.5 -38.5Z"/>
    <path class="c-foxd" d="M31 -70.5L35.8 -63.8L31.6 -62.6ZM49.2 -71.6L50.2 -62.4L46.2 -63.4Z"/>
    <path class="c-foxd" d="M46.5 -58.2C48.6 -60.4 51.6 -60.4 53.2 -58.4C51 -57.2 48.8 -57.2 46.5 -58.2Z"/>
    <circle class="c-foxd" cx="66.6" cy="-48.6" r="2.4"/>`;

  const svgOf = id => $(id).querySelector('svg');
  let groundAt = () => 0;

  function sizeLayers(){
    const lw=W+2*M, lh=H+2*M;
    document.querySelectorAll('.layer').forEach(el=>{
      el.style.left=(-M)+'px'; el.style.top=(-M)+'px';
      el.style.width=lw+'px'; el.style.height=lh+'px';
      const s=el.querySelector(':scope>svg');
      if(s){s.setAttribute('viewBox',`${-M} ${-M} ${lw} ${lh}`);s.setAttribute('width',lw);s.setAttribute('height',lh);}
    });
  }

  function build(){
    const R = mulberry32(1847);
    W = Math.max(240, innerWidth); H = Math.max(420, innerHeight);
    portrait = H > W*1.08;
    U = Math.sqrt(W*H)/100;
    S = Math.min(W,H)*.042;
    M = Math.ceil(S*1.35+14);
    sizeLayers();
    const P = (land,port) => portrait ? port : land;
    const far = wave(H*P(.395,.43),[H*.034,H*.016,H*.007],[W*1.15,W*.43,W*.16],R);
    const d1 = ridge(far,H+M,9,.9,R);
    svgOf('L1').innerHTML = `<path class="c-far" d="${d1}"/><path class="grain" d="${d1}"/>`;
    const hill = wave(H*P(.47,.5),[H*.036,H*.014,H*.006],[W*.9,W*.34,W*.13],R);
    let d2 = ridge(hill,H+M,9,.9,R);
    const phs = R()*6;
    for(let x=-M; x<W+M; x+=rr(5,15,R)){
      if(Math.sin(x/W*8.5+phs)+Math.sin(x/W*21+phs*2)*.5 > .35){const h=rr(2.1,4.2,R)*U;d2+=pine(x,hill(x)+3,h,h*.55,R);}
    }
    let roofs='',wins='';
    for(const cxF of P([.2,.8],[.24,.8])){
      const cx=W*cxF,s=Math.max(12,U*2.3),by=hill(cx)+s*.25;
      d2+=cut([[cx-s*.52,by],[cx-s*.52,by-s*.62],[cx+s*.52,by-s*.62],[cx+s*.52,by]],.4,5,R);
      d2+=cut([[cx+s*.2,by-s*.8],[cx+s*.2,by-s*1.12],[cx+s*.36,by-s*1.12],[cx+s*.36,by-s*.7]],.3,4,R);
      roofs+=cut([[cx-s*.66,by-s*.54],[cx,by-s*1.08],[cx+s*.66,by-s*.54]],.4,4,R);
      for(const wx of [-.26,.18]){wins+=poly([[cx+wx*s,by-s*.42],[cx+(wx+.15)*s,by-s*.42],[cx+(wx+.15)*s,by-s*.24],[cx+wx*s,by-s*.24]]);}
    }
    /* Cartel «AstroSeec» en arco sobre dos postes cortos. La parte superior de
       cada poste se calcula sobre la curva del arco, de modo que toca la base
       de las letras justo debajo de ellas. */
    const fs=W*.052, ay=H*.60, acy=H*.535, pw=W*.013, postH=H*.05;
    const ax0=W*.25, ax1=W*.59;
    const arcY=x=>{const t=(x-ax0)/(ax1-ax0);return ay+2*t*(1-t)*(acy-ay);};
    const px1=W*.34, px2=W*.50;
    const py1=arcY(px1)-fs*.04, py2=arcY(px2)-fs*.04;
    const sign=`<defs><path id="signArc" d="M ${q(ax0)} ${q(ay)} Q ${q((ax0+ax1)/2)} ${q(acy)} ${q(ax1)} ${q(ay)}"/></defs><g class="hollywood" style="--signfs:${q(fs)}"><rect class="post" x="${q(px1-pw/2)}" y="${q(py1)}" width="${q(pw)}" height="${q(postH)}"/><rect class="post" x="${q(px2-pw/2)}" y="${q(py2)}" width="${q(pw)}" height="${q(postH)}"/><text class="signword"><textPath href="#signArc" startOffset="50%" text-anchor="middle">AstroSeec</textPath></text></g>`;
    svgOf('L2').innerHTML = `<path class="c-hill" d="${d2}"/><path class="c-roof" d="${roofs}"/><path class="grain" d="${d2}${roofs}"/><path class="c-win" d="${wins}"/>`;
    const rg = wave(H*P(.545,.565),[H*.014,H*.007],[W*.7,W*.23],R);
    let d3 = ridge(rg,H+M,9,.9,R);
    for(let x=-M; x<W+M; ){const h=rr(3.6,7.8,R)*U*(portrait?1.15:1),w=h*rr(.46,.58,R);d3+=pine(x,rg(x)+4,h,w,R);x+=w*rr(.42,.8,R);}
    svgOf('L3').innerHTML = `<path class="c-ridge" d="${d3}"/><path class="grain" d="${d3}"/>`;
    const md = wave(H*P(.6,.615),[H*.008,H*.004],[W*.8,W*.25],R);
    const d4 = ridge(md,H+M,10,.6,R);
    const yBot=H*P(.86,.84), N=40, amp=W*P(.12,.2), ph=R()*.7-.2, cl=[];
    const Lb=[],Rb=[];
    for(let i=0;i<=N;i++){
      const t=i/N,y=md(W*.5)+5+(yBot-md(W*.5)-5)*Math.pow(t,1.3);
      const x=W*.52+amp*Math.sin(t*Math.PI*1.9+ph)*Math.pow(t,.65)+W*.03*Math.sin(t*9+ph);
      const w=W*.006+W*P(.25,.4)*Math.pow(t,1.75);
      cl.push([x,y,w]);Lb.push([x-w/2+(R()-.5)*1.4,y]);Rb.push([x+w/2+(R()-.5)*1.4,y]);
    }
    const dr=poly(Lb.concat(Rb.slice().reverse()));
    let rip='';
    for(let i=0;i<22;i++){
      const k=Math.floor(rr(.18,1,R)*N),[x,y,w]=cl[k],cx=x+(R()-.5)*w*.55,len=w*rr(.12,.32,R),th=Math.max(1,w*.022);
      rip+=poly([[cx-len/2,y],[cx,y-th],[cx+len/2,y],[cx,y+th*.6]]);
    }
    svgOf('L4').innerHTML = `<path class="c-meadow" d="${d4}"/><path class="c-river" d="${dr}"/><path class="c-ripple" d="${rip}"/><path class="grain" d="${d4}"/>${sign}`;
    const w5 = wave(0,[H*.012,H*.006],[W*.5,W*.17],R);
    const xL5=W*P(.4,.44), xR5=W*P(.61,.56), y5=H*P(.675,.69);
    const bL5=bankFn(-M,xL5,y5,w5), bR5=bankFn(W+M,xR5,y5*1.005,w5);
    let d5=bankPath(bL5,-M,xL5,R)+bankPath(bR5,W+M,xR5,R);
    const pinesAlong=(fn,xa,xb,hMin,hMax,wr,fromEdge)=>{let d='';for(let x=xa;x<xb;){const s=fromEdge(x),h=rr(hMin,hMax,R)*(1-s*.5),w=Math.min(h*wr,W*P(.14,.2));if(fn(x)<H*.95)d+=pine(x,fn(x)+5,h,w,R);x+=w*rr(.4,.7,R);}return d;};
    d5+=pinesAlong(bL5,-M*.6,xL5*.74,H*P(.2,.19),H*P(.36,.3),.44,x=>clamp((x+M)/(xL5+M),0,1),R);
    d5+=pinesAlong(bR5,xR5+(W-xR5)*.26,W+M*.6,H*P(.2,.19),H*P(.36,.3),.44,x=>clamp((W+M-x)/(W+M-xR5),0,1),R);
    svgOf('L5').innerHTML = `<path class="c-moss" d="${d5}"/><path class="grain" d="${d5}"/>`;
    const w6 = wave(0,[H*.01,H*.005],[W*.4,W*.15],R);
    const xL6=W*P(.26,.34), xR6=W*P(.74,.66), y6=H*P(.82,.83);
    const bL6=bankFn(-M,xL6,y6,w6), bR6=bankFn(W+M,xR6,y6,w6);
    let d6=bankPath(bL6,-M,xL6,R)+bankPath(bR6,W+M,xR6,R);
    const giants = portrait
      ? [[-.06,.9],[.12,.52],[1.05,.86],[.9,.5]]
      : [[.015,1.02],[.098,.7],[.975,.96],[.9,.64]];
    for(const [gx,gh] of giants){const x=W*gx,h=H*gh,w=Math.min(h*.4,W*P(.2,.36));d6+=pine(x,(gx<.5?bL6:bR6)(x)+8,h,w,R);}
    svgOf('L6').innerHTML = `<path class="c-teal" d="${d6}"/><path class="grain" d="${d6}"/>`;
    const g7w = wave(H*P(.785,.8),[H*.011,H*.006],[W*.95,W*.3],R);
    const g7 = g7w;
    groundAt = g7;
    let d7 = ridge(g7,H+M,8,.7,R);
    let tufts='';
    for(let x=-M;x<W+M;x+=rr(18,60,R)){const y=g7(x)+2,n=3+Math.floor(R()*3);for(let k=0;k<n;k++)tufts+=blade(x+k*2.2,y+2,rr(.9,2.1,R)*U,rr(-.6,.6,R)*U,rr(2,3.4,R));}
    let stems='',caps='',dots='';
    const clusters = P([[.1,4],[.6,3],[.87,5],[.38,2]],[[.12,3],[.64,3],[.9,2]]);
    for(const [cf,n] of clusters){
      for(let k=0;k<n;k++){
        const x=W*cf+(k-(n-1)/2)*U*rr(1.4,2.6,R),s=U*rr(1.1,3.1,R)*(k===Math.floor(n/2)?1.25:1)*P(1,1.25);
        const m=mushroom(x,g7(x)+s*.18,s,R);stems+=m.stem;caps+=m.cap;dots+=m.dots;
      }
    }
    let ferns='';
    for(const [ff,sz,dr2] of P([[.03,13,1],[.33,9,-1],[.47,7,1],[.72,10,1],[.96,12,-1]],[[.04,12,1],[.42,9,-1],[.78,10,1]])){
      const x=W*ff;ferns+=fern(x,g7(x)+4,sz*U*P(1,1.25),dr2,R);ferns+=fern(x+U*.8,g7(x)+4,sz*U*.7*P(1,1.25),-dr2,R);
    }
    let pebbles='';
    for(let i=0;i<9;i++){const x=rr(.05,.95,R)*W,y=g7(x)+rr(.6,3.5,R)*U,r=rr(.3,.75,R)*U;pebbles+=cut(circ(x,y,r,9).map(([a,b])=>[a,y+(b-y)*.6]),.25,3,R);}
    let fall1='',fall2='',lowT='';
    const nFall=Math.round(W/48);
    for(let i=0;i<nFall;i++){
      const x=rr(-.02,1.02,R)*W,top=g7(x)+U*2.2,y=top+Math.pow(R(),1.3)*(H*.965-top),sz=rr(.45,.9,R)*U,a=R()*Math.PI,ca=Math.cos(a),sa=Math.sin(a);
      const lp=[[-1,0],[-.3,-.42],[.35,-.36],[1,0],[.3,.4],[-.35,.36]].map(([u,v])=>[x+(u*ca-v*sa*.8)*sz,y+(u*sa+v*ca*.8)*sz*.62]);
      if(R()<.6)fall1+=cut(lp,.2,3,R);else fall2+=cut(lp,.2,3,R);
    }
    for(let i=0;i<Math.round(W/90);i++){const x=rr(0,1,R)*W,y=g7(x)+rr(.24,.8,R)*(H*.95-g7(x));for(let k=0;k<3;k++)lowT+=blade(x+k*2.4,y,rr(.6,1.4,R)*U,rr(-.5,.5,R)*U,rr(2,3,R));}
    svgOf('L7').innerHTML = `<path class="c-ground" d="${d7}"/><path class="c-fall1" d="${fall1}"/><path class="c-fall2" d="${fall2}"/><path class="c-tuft" d="${tufts}${lowT}"/><path class="c-pebble" d="${pebbles}"/><path class="c-fern" d="${ferns}"/><path class="c-stem" d="${stems}"/><path class="c-cap" d="${caps}"/><path class="grain" d="${d7}${stems}${caps}"/><path class="c-dot glowdots" d="${dots}"/><g id="foxG">${FOX}</g>`;
    /* Zorro plantado sobre el terreno (estático). */
    const foxS=clamp(U*(portrait?.78:.72),5,11.5)/8, foxX=W*.46, foxY=g7(foxX);
    $('foxG').setAttribute('transform',`translate(${q(foxX)} ${q(foxY)}) scale(${(foxS).toFixed(3)})`);
    const g8 = wave(H*P(.945,.955),[H*.008,H*.005],[W*.6,W*.2],R);
    let d8 = ridge(g8,H+M,9,.8,R), fg2='';
    for(let x=-M;x<W+M;x+=rr(3.5,9,R)){
      const s=Math.abs(x-W/2)/(W/2),hm=H*(.018+P(.23,.2)*Math.pow(clamp(s,0,1.2),2.4)),h=hm*rr(.35,1,R),lean=rr(-.38,.38,R)*h,wb=rr(4,9,R)*(U/11+.4);
      const b=blade(x,g8(x)+6,h,lean,wb);
      if(R()<.3)fg2+=b;else d8+=b;
    }
    svgOf('L8').innerHTML = `<path class="c-fg2" d="${fg2}"/><path class="c-fg" d="${d8}"/><path class="grain" d="${d8}${fg2}"/>`;
    const e=Math.max(10,Math.min(W,H)*.024), rad=e*3;
    const outer=[[-M-4,-M-4],[W+M+4,-M-4],[W+M+4,H+M+4],[-M-4,H+M+4]];
    const rrect=(ins,wob)=>{const p=[],x0=ins,y0=ins,x1=W-ins,y1=H-ins,r=rad;
      const seg=(ax,ay,bx,by)=>{const L=Math.hypot(bx-ax,by-ay),k=Math.max(1,Math.round(L/11));for(let t=0;t<k;t++){const u=t/k;p.push([ax+(bx-ax)*u+(R()-.5)*wob,ay+(by-ay)*u+(R()-.5)*wob]);}};
      const arc=(cx,cy,a0)=>{for(let i=0;i<6;i++){const a=a0+i/6*Math.PI/2;p.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}};
      seg(x0+r,y0,x1-r,y0);arc(x1-r,y0+r,-Math.PI/2);seg(x1,y0+r,x1,y1-r);arc(x1-r,y1-r,0);seg(x1-r,y1,x0+r,y1);arc(x0+r,y1-r,Math.PI/2);seg(x0,y1-r,x0,y0+r);arc(x0+r,y0+r,Math.PI);
      return p;};
    const mat=cut(outer,0,4000,R)+hole(rrect(e,2.4),.5,6,R);
    const frame=cut(outer,0,4000,R)+hole(rrect(e*.55,1.2),.3,8,R);
    svgOf('L9').innerHTML = `<path class="c-mat" d="${mat}"/><path class="c-frame" d="${frame}"/><path class="grain" d="${frame}"/>`;
    buildHangers();
  }

  /* Sol (día) o luna y estrellas (noche) colgando fijos del cielo, más las
     nubes. Semilla propia por estado: el toggle regenera exactamente los
     mismos cuerpos. En vertical el cartel centra el ancho, así que el sol y
     las nubes cuelgan del cielo abierto del valle a sus costados. */
  function buildHangers(){
    const R=mulberry32(night?4242:777);
    const hang=$('hang'), m=Math.min(W,H);
    const items=[];
    if(night){
      const n=Math.round(W/90);
      for(let i=0;i<n;i++){
        const ss=rr(6,12,R)*(m/400);
        items.push({x:rr(.06,.94,R)*W,y:rr(.05,.34,R)*H,h:ss,html:`<svg viewBox="-8 -8 16 16" width="${q(ss)}" height="${q(ss)}"><path fill="#e8b865" d="M0-7 1.9-1.9 7 0 1.9 1.9 0 7-1.9 1.9-7 0-1.9-1.9Z"/></svg>`});
      }
    }
    const orbD=clamp(m*.16,70,168), orbX=W*(portrait?.8:.7), orbY=H*(portrait?.4:.2);
    const orbSvg = night
      ? `<svg viewBox="-50 -50 100 100" width="${q(orbD)}" height="${q(orbD)}"><path fill="#f5ecd6" d="${cut(circ(0,0,44,44),.5,5,R)}"/><path fill="#e3d4b3" d="${cut(circ(-14,-10,9,14),.4,3,R)}${cut(circ(12,8,6,10),.3,3,R)}${cut(circ(-6,18,5,9),.3,3,R)}${cut(circ(18,-16,4,8),.3,3,R)}"/><path fill="url(#grainPat)" d="${cut(circ(0,0,44,40),.1,50,R)}"/></svg>`
      : (()=>{let rays=[];for(let i=0;i<44;i++){const a=i/44*Math.PI*2,r=i%2?47:58;rays.push([Math.cos(a)*r,Math.sin(a)*r]);}
          return `<svg viewBox="-62 -62 124 124" width="${q(orbD)}" height="${q(orbD)}"><path fill="#c8642d" d="${cut(rays,.5,5,R)}"/><path fill="#d9a45b" d="${cut(circ(0,0,42,40),.5,5,R)}"/><path fill="#e6b772" d="${cut(circ(-4,-5,29,30),.4,5,R)}"/><path fill="url(#grainPat)" d="${cut(circ(0,0,42,40),.1,50,R)}"/></svg>`;})();
    items.push({x:orbX,y:orbY,h:orbD,html:orbSvg});
    const cloudFill = night ? '#c7c9ec' : '#fbf6ea';
    const cloudShape=(sc)=>{let d='';for(const [cx,cy,r] of [[-30,4,17],[-9,-9,24],[16,-5,20],[35,6,13]])d+=cut(circ(cx*sc,cy*sc,r*sc,22),.5,5,R);d+=cut([[-46*sc,20*sc],[-46*sc,6*sc],[48*sc,6*sc],[48*sc,20*sc]],.5,6,R);return d;};
    const clouds=portrait?[[.3,.39,.7],[.62,.375,.6]]:[[.44,.12,1],[.575,.305,.62]];
    clouds.forEach(([cx,cy,sc])=>{const cw=m*.19*sc;items.push({front:true,x:W*cx,y:H*cy,h:cw*.5,html:`<svg viewBox="-52 -36 104 60" width="${q(cw)}" height="${q(cw*.58)}"><path fill="${cloudFill}" d="${cloudShape(1)}"/><path fill="rgba(120,90,40,.16)" d="${cut([[-46,20],[-46,13],[48,13],[48,20]],.4,6,R)}"/></svg>`});});
    const tpl=it=>{
      const len=it.y+M;
      return `<div class="hang" style="left:${q(it.x+M)}px;--len:${q(len)}px"><span class="string"></span><div class="obj">${it.html}</div></div>`;
    };
    hang.innerHTML=items.filter(it=>!it.front).map(tpl).join('');
    $('hangFront').innerHTML=items.filter(it=>it.front).map(tpl).join('');
  }

  function makeGrain(){
    const c=document.createElement('canvas');c.width=c.height=160;const g=c.getContext('2d'),id=g.createImageData(160,160),d=id.data;
    for(let i=0;i<d.length;i+=4){const n=Math.random();if(n<.5){d[i]=74;d[i+1]=52;d[i+2]=30;d[i+3]=(.5-n)*46;}else{d[i]=255;d[i+1]=251;d[i+2]=240;d[i+3]=(n-.5)*40;}}
    g.putImageData(id,0,0);
    for(let k=0;k<90;k++){g.strokeStyle=k%3?'rgba(255,252,242,.2)':'rgba(96,66,36,.13)';g.lineWidth=.6;g.beginPath();const x=Math.random()*160,y=Math.random()*160,a=Math.random()*6.28,l=4+Math.random()*14;g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(a+.6)*l*.5,y+Math.sin(a+.6)*l*.5,x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();}
    return c.toDataURL();
  }

  /* ── Textos de intro dentro del cartel colgante (solo modo intro) ── */
  const startBtn=$('startBtn'),startLabel=$('startLabel');
  const tagSub=$('tagSub'),tagIntro=$('tagIntro');
  let introI=0,introTimer=0,introBusy=false;

  if(MODE==='intro'&&INTROS.length){
    tagSub.remove();
    tagIntro.hidden=false;
  }else{
    tagIntro.remove();
    if(SUB_LABEL)tagSub.textContent=SUB_LABEL;
  }
  if(MODE==='splash'){
    startBtn.remove();
    $('pager').remove();
    $('loadChip').hidden=false;
    $('ver').hidden=false;
  }else{
    $('loadChip').remove();
    if(MODE==='login')$('pager').remove();
  }

  function buildDots(){
    const dots=$('tagDots');
    dots.textContent='';
    INTROS.forEach((_,n)=>{
      const d=document.createElement('i');
      if(n===introI)d.className='on';
      dots.appendChild(d);
    });
  }
  function paintIntro(){
    const it=INTROS[introI];
    if(!it)return;
    $('tagText').textContent=it.text;
    $('tagText').classList.remove('out');
    [...$('tagDots').children].forEach((d,n)=>d.classList.toggle('on',n===introI));
    $('live').textContent=it.label;
  }
  function showIntro(n,manual){
    if(introBusy||INTROS.length<2)return;
    introI=(n+INTROS.length)%INTROS.length;
    introBusy=true;
    $('tagText').classList.add('out');
    setTimeout(()=>{paintIntro();introBusy=false;},420);
    [...$('tagDots').children].forEach((d,k)=>d.classList.toggle('on',k===introI));
    armIntro();
  }
  function armIntro(){
    clearTimeout(introTimer);
    if(INTROS.length<2)return;
    introTimer=setTimeout(()=>showIntro(introI+1),INTRO_MS);
  }
  if(MODE==='intro'&&INTROS.length>1){
    buildDots();paintIntro();armIntro();
    $('tagNext').addEventListener('click',()=>showIntro(introI+1,true));
    $('tagPrev').addEventListener('click',()=>showIntro(introI-1,true));
    $('tag').addEventListener('pointerenter',()=>clearTimeout(introTimer));
    $('tag').addEventListener('pointerleave',armIntro);
  }
  /* Reuso del WebView: reinicia el tour al primer texto sin recargar. */
  window.resetIntro=function(){
    const tt=$('tagText'),td=$('tagDots');
    if(MODE!=='intro'||!INTROS.length||!tt||!td)return;
    introI=0;introBusy=false;clearTimeout(introTimer);
    tt.classList.remove('out');
    buildDots();paintIntro();armIntro();
  };

  startBtn.addEventListener('click',()=>{
    if(MODE==='intro'&&window.AndroidIntro)AndroidIntro.finish();
    else if(MODE==='login'&&window.AndroidLogin)AndroidLogin.start();
  });
  /* Estado de conexión del login: la app llama loginLoading(true/false). */
  window.loginLoading=function(on){
    if(MODE!=='login')return;
    startBtn.classList.toggle('busy',!!on);
    startLabel.textContent=on?(WAIT_LABEL||'…'):startLabel.dataset.label;
  };
  if(MODE==='login')startLabel.dataset.label=startLabel.textContent;

  let rT=0;
  let lastW=0,lastH=0;
  function checkSize(){
    if(innerWidth===lastW&&innerHeight===lastH)return;
    lastW=innerWidth;lastH=innerHeight;
    build();
  }
  window.addEventListener('resize',()=>{clearTimeout(rT);rT=setTimeout(checkSize,120);});

  /* ── Modo noche: toggle instantáneo (sin animaciones). El estado se
     recuerda y se aplica ANTES de construir, para que el primer fotograma
     ya salga en el modo elegido. ── */
  let night=false;
  try{night=localStorage.getItem('od-night')==='1'}catch(e){}
  const nightBtn=$('nightBtn');
  if(night)document.body.classList.add('night');
  if(MODE!=='splash'){
    nightBtn.setAttribute('aria-pressed',String(night));
    $('nightLabel').textContent=night?'Día':'Noche';
    nightBtn.addEventListener('click',()=>{
      night=!night;
      document.body.classList.toggle('night',night);
      nightBtn.setAttribute('aria-pressed',String(night));
      $('nightLabel').textContent=night?'Día':'Noche';
      buildHangers(); // sol↔luna y estrellas, en un solo repintado
      try{localStorage.setItem('od-night',night?'1':'0')}catch(e){}
    });
  }else{
    nightBtn.remove();
  }

  const notify=()=>{try{parent.postMessage(night?'diorama:noche':'diorama:dia','*')}catch(e){}};
  notify();
  nightBtn.addEventListener('click',notify);
  startBtn.addEventListener('click',()=>{try{parent.postMessage('diorama:contacto','*')}catch(e){}});

  checkSize();
  try{$('grainImg').setAttribute('href',makeGrain());}catch(e){}
  /* Dibujo completo: revelar la escena entera en un solo fotograma. */
  document.body.classList.remove('preload');
  /* El WebView a veces se adjunta con altura provisional (ventana en
     animación, insets pendientes): se vuelve a comprobar el tamaño unos
     instantes después y solo se reconstruye si cambió. */
  setTimeout(checkSize,400);
  setTimeout(checkSize,1200);
  setTimeout(checkSize,2500);
})();
