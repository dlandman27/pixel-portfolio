/* Short, section-specific effects share the same world and projection as props. */
(function(root){
  'use strict';
  const THEMES={cave:'lantern',tent:'lantern',workshop:'sparks',library:'pages',campfire:'embers',picnic:'butterflies',dock:'ripple',cat:'hearts'};
  function sample(kind,t,i){
    const seed=i*2.399963,phase=t+i*.12;
    if(kind==='ripple')return {x:Math.cos(seed)*t*38,y:Math.sin(seed)*t*12,alpha:1-t};
    if(kind==='butterflies')return {x:Math.sin(phase*5+seed)*26,y:-15-Math.cos(phase*3+seed)*12,alpha:Math.sin(Math.PI*t)};
    return {x:Math.sin(seed+phase*2)*(kind==='pages'?18:12),y:-t*48-i%3*6,alpha:Math.sin(Math.PI*t)};
  }
  function mount(scene,depth,reduced){
    const canvas=document.createElement('canvas');canvas.className='section-effects';canvas.width=160;canvas.height=140;canvas.setAttribute('aria-hidden','true');scene.append(canvas);
    const ctx=canvas.getContext('2d');let active=null;
    return {
      play(id,x,y,now=performance.now()){
        if(reduced)return;
        active={kind:THEMES[id]||'sparks',x,y,start:now};
        canvas.style.left=x-80+'px';canvas.style.top=depth.groundY(y)-100+'px';canvas.style.zIndex=4000;
      },
      update(now){
        ctx.clearRect(0,0,160,140);if(!active)return;
        const t=(now-active.start)/2400;if(t>=1){active=null;return;}
        const kind=active.kind;
        if(kind==='lantern'){
          ctx.globalAlpha=Math.sin(Math.PI*t)*.4;ctx.fillStyle='#f7c66a';
          for(let ring=3;ring>0;ring--){ctx.globalAlpha=Math.sin(Math.PI*t)*(.04+(.04*(4-ring)));ctx.fillRect(80-ring*9,80-ring*9,ring*18,ring*18);}
        }
        for(let i=0;i<12;i++){
          const p=sample(kind,t,i);ctx.globalAlpha=Math.max(0,p.alpha);const x=Math.round(80+p.x),y=Math.round(90+p.y);
          ctx.fillStyle=kind==='hearts'?'#f3a6a0':kind==='ripple'?'#c1e7d5':kind==='pages'?'#f3e5bd':kind==='butterflies'?'#e7d588':'#ffbd5b';
          if(kind==='hearts'){ctx.fillRect(x,y,3,2);ctx.fillRect(x-1,y-1,2,2);ctx.fillRect(x+2,y-1,2,2);ctx.fillRect(x+1,y+2,1,1);}
          else if(kind==='pages'){ctx.fillRect(x,y,5,4);ctx.fillStyle='#99835a';ctx.fillRect(x+1,y+1,3,1);}
          else if(kind==='butterflies'){ctx.fillRect(x-3,y,2,Math.sin(now/90+i)>0?3:1);ctx.fillRect(x+1,y,2,3);}
          else ctx.fillRect(x,y,i%3===0?2:1,1);
        }
        ctx.globalAlpha=1;
      }
    };
  }
  root.WoodlandEffects={THEMES,sample,mount};
})(typeof window==='undefined'?globalThis:window);
