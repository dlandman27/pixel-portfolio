/* Each terrain pixel and prop is rendered from the authored world, never a map painting. */
(function(root){
  'use strict';
  const world=root.WoodlandWorld;
  function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  function load(url){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Could not load '+url));image.src='resources/images/'+url;});}
  async function mount(scene){
    const entries=await Promise.all(Object.entries(world.assets).map(async([key,asset])=>[key,await load(asset.url)]));
    const atlas=await load('world-v2/terrain-atlas.png');
    const textures={};
    for(const [name,rect] of Object.entries({water:[628,942,624,310],path:[2,942,622,310]})){
      const tile=canvas(64,32),t=tile.getContext('2d',{willReadFrequently:true});t.imageSmoothingEnabled=false;t.drawImage(atlas,...rect,0,0,64,32);
      const data=t.getImageData(0,0,64,32).data;textures[name]=[];
      const base=name==='water'?[8,124,145]:[197,167,115],weight=name==='water'?.62:.48;
      for(let i=0;i<data.length;i+=4){const rgb=base.map((v,c)=>Math.round(v*(1-weight)+data[i+c]*weight));textures[name].push(`rgb(${rgb.join(',')})`);}
    }
    const images=Object.fromEntries(entries),terrain=canvas(world.WIDTH/2,world.HEIGHT/2),ctx=terrain.getContext('2d');
    terrain.className='world-terrain';terrain.setAttribute('aria-label','Woodland terrain');
    const colors={grass:['#719440','#7b9d46','#658737','#8baa4e'],path:['#c5a773','#c9ac79','#bfa16e','#ceaf7b'],water:['#087b91','#09869a','#138c9e','#0a7188'],cliff:['#626b58','#69715e','#737966','#586450'],bridge:['#baa177'],dock:['#896039','#987044']};
    for(let y=0;y<terrain.height;y++)for(let x=0;x<terrain.width;x++){
      let type=world.terrainAt(x*2,y*2);
      const edge=world.pathDistance(x*2,y*2);
      // Break the perfect capsule outline into small grass tufts at trail edges.
      if((type==='grass'||type==='path')&&Math.abs(edge)<5)type=edge+(world.hash(Math.floor(x/2),Math.floor(y/2))-.5)*8<0?'path':'grass';
      const palette=colors[type]||colors.grass;
      const n=world.hash(Math.floor(x/3),Math.floor(y/2));ctx.fillStyle=palette[type==='grass'||type==='path'?(n>.94?2:n>.8?1:0):Math.floor(n*palette.length)];if(textures[type]){
        const block=world.hash(Math.floor(x/64),Math.floor(y/32));
        const u=block>.5?63-x%64:x%64,v=block>.25&&block<.75?31-y%32:y%32;
        ctx.fillStyle=textures[type][v*64+u];
      }ctx.fillRect(x,y,1,1);
      if(type==='dock'&&y%7===0){ctx.fillStyle='#584530';ctx.fillRect(x,y,1,1);}
      if(type==='grass'&&world.hash(x,y)<.025){ctx.fillStyle='#9ead5b';ctx.fillRect(x,y,1,2);}
      if(type==='water'&&world.hash(x,y)<.06){ctx.fillStyle='#259faf';ctx.fillRect(x,y,2,1);}
      if(type==='water'&&!world.inWater(x*2,y*2-4)){ctx.fillStyle='#9bc7ab';ctx.fillRect(x,y,1,1);}
    }
    // Stepped soil banks give the water a visible edge beneath its grass lip.
    for(let x=0;x<terrain.width;x++){
      const wx=x*2;
      if(!world.terrainAt(wx,world.riverBottom(wx)).includes('bridge')){
        const bottom=Math.floor(world.riverBottom(wx)/2);ctx.fillStyle='#405d3c';ctx.fillRect(x,bottom,1,3);ctx.fillStyle='#a0ae63';ctx.fillRect(x,bottom+3,1,1);
      }
      const lake=Math.floor(world.lakeTop(wx)/2);
      if(world.terrainAt(wx,lake*2)!=='dock'){ctx.fillStyle='#536342';ctx.fillRect(x,lake-2,1,3);ctx.fillStyle='#a1b175';ctx.fillRect(x,lake-3,1,1);}
    }
    // Pixel-stepped contact shadows tie separate sprites to the same ground plane.
    for(const object of world.objects){
      if(!['pine','rock','workshop','library','picnic','tackle','tent','bench'].includes(object.asset))continue;
      const cx=Math.round((object.x+object.w*.55)/2),cy=Math.round((object.y+object.h-6)/2);
      const rx=Math.max(5,Math.round(object.w*.32)),ry=Math.max(2,Math.round(object.w*.06));
      for(let dy=-ry;dy<=ry;dy++){
        const span=Math.floor(rx*Math.sqrt(1-dy*dy/(ry*ry)));
        for(let dx=-span;dx<=span;dx++){
          const t=world.terrainAt((cx+dx)*2,(cy+dy)*2);
          if(t!=='grass'&&t!=='path')continue;
          ctx.fillStyle='#173b2730';ctx.fillRect(cx+dx,cy+dy,1,1);
        }
      }
    }
    scene.prepend(terrain);
    // Normalize source art onto the same two-world-unit pixel grid. Alpha testing
    // prevents soft generated edge haze from becoming a halo around every prop.
    const flowingWater=[];
    const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
    for(const object of world.objects){
      const c=canvas(Math.round(object.w/2),Math.round(object.h/2)),p=c.getContext('2d',{willReadFrequently:true});p.imageSmoothingEnabled=false;if(object.source)p.drawImage(images[object.asset],...object.source,0,0,c.width,c.height);else p.drawImage(images[object.asset],0,0,c.width,c.height);
      const data=p.getImageData(0,0,c.width,c.height);for(let i=3;i<data.data.length;i+=4)data.data[i]=data.data[i]<160?0:255;p.putImageData(data,0,0);
      if(object.asset==='waterfall'){
        const pixels=[];
        for(let i=0;i<data.data.length;i+=4){
          const [red,green,blue,alpha]=data.data.slice(i,i+4);
          if(alpha&&green>120&&blue>140&&red<green*.78)pixels.push(i);
        }
        flowingWater.push({context:p,base:new Uint8ClampedArray(data.data),data,pixels,width:c.width});
      }
      c.setAttribute('aria-hidden','true');c.className='world-prop';c.dataset.object=object.id;c.style.cssText=`left:${Math.round(object.x)}px;top:${Math.round(object.y)}px;width:${object.w}px;height:${object.h}px;z-index:${object.ground?2:100+Math.round(object.foot)}`;scene.append(c);
      if(object.id==='bridge'){
        // Parapets are foreground geometry; the deck remains below the traveler.
        const rails=canvas(c.width,c.height),r=rails.getContext('2d');r.drawImage(c,0,0);r.clearRect(28,0,34,c.height);
        rails.className='world-prop';rails.setAttribute('aria-hidden','true');rails.dataset.object='bridge-parapets';rails.style.cssText=c.style.cssText;rails.style.zIndex=100+Math.round(object.y+object.h);scene.append(rails);
      }
    }
    const water=canvas(world.WIDTH/2,world.HEIGHT/2),w=water.getContext('2d');water.setAttribute('aria-hidden','true');water.className='world-water';scene.append(water);let previous=-1;
    return {update(now){const frame=reducedMotion?0:Math.floor(now/140);if(previous===frame)return;previous=frame;
      for(const flow of flowingWater){
        for(const i of flow.pixels){
          const x=(i/4)%flow.width,y=Math.floor(i/4/flow.width);
          const band=(y-frame*3+Math.floor(x/3)*5)%19;
          const light=band>=0&&band<3?28:band>=3&&band<6?-12:0;
          flow.data.data[i]=Math.max(0,Math.min(255,flow.base[i]+light));
          flow.data.data[i+1]=Math.max(0,Math.min(255,flow.base[i+1]+light));
          flow.data.data[i+2]=Math.max(0,Math.min(255,flow.base[i+2]+light));
        }
        flow.context.putImageData(flow.data,0,0);
      }
      w.clearRect(0,0,water.width,water.height);for(let y=120;y<512;y+=9)for(let x=3;x<768;x+=17){const px=x+Math.floor(Math.sin(frame*.25+y)*3),py=y+Math.floor(world.hash(x,y)*5);if(world.terrainAt(px*2,py*2)!=='water')continue;w.fillStyle=world.hash(x,y)>.65?'#78c4bb88':'#3ba5ac66';w.fillRect(px,py,2+Math.floor(world.hash(y,x)*4),1);}}};
  }
  root.WoodlandRenderer={mount};
})(window);
