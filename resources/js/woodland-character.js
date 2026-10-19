/* Whole authored frames, decoded before play. No cut-up or rotated limbs. */
(function(root){
  'use strict';
  const ROWS={front:0,left:1,right:2,back:3};
  const ACTION_MS={jump:700,wave:1200};
  // The original front frame 1 has different proportions; use the six matching
  // frames in their original authored cycle.
  const WALK_SEQUENCE=[2,3,4,5,6,7];
  function pose({moving=false,running=false,distance=0,facing='front',action=null,elapsed=0}={}){
    const progress=action?Math.min(1,Math.max(0,elapsed/ACTION_MS[action])):0;
    const frame=moving?WALK_SEQUENCE[Math.floor(distance/(running?9:8))%WALK_SEQUENCE.length]:2;
    return {frame,row:ROWS[facing]??0,sheet:'authored',lift:action==='jump'?Math.sin(progress*Math.PI)*30:0};
  }
  async function mount(canvas){
    const frames={};
    await Promise.all(Object.keys(ROWS).flatMap(direction=>[2,3,4,5,6,7].map(async frame=>{
      const image=new Image();image.src=`resources/images/characters/skins/forest/dylan-${direction}-${frame}.png`;await image.decode();
      frames[direction+'-'+frame]=image;
    })));
    // Bake complete source frames into equal cells once. A 2x logical atlas
    // retains clean facial details without sampling high-resolution sources
    // differently on every animation tick.
    const atlas=document.createElement('canvas');atlas.width=6*64;atlas.height=4*96;
    const atlasContext=atlas.getContext('2d');atlasContext.imageSmoothingEnabled=true;atlasContext.imageSmoothingQuality='high';
    function eyeAnchor(image){
      const sample=document.createElement('canvas');sample.width=image.width;sample.height=image.height;
      const context=sample.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);
      const data=context.getImageData(0,0,image.width,image.height).data;
      let left=image.width,right=-1;
      for(let y=Math.floor(image.height*.2);y<image.height*.43;y++)for(let x=0;x<image.width;x++){
        const i=(y*image.width+x)*4;
        if(data[i+3]>200&&data[i]<18&&data[i+1]<30&&data[i+2]<45){left=Math.min(left,x);right=Math.max(right,x);}
      }
      return right<0?0:((left+right)/2-image.width/2)*80/image.height;
    }
    for(const [direction,row]of Object.entries(ROWS)){
      const reference=eyeAnchor(frames[direction+'-2']);
      for(let frame=2;frame<=7;frame++){
        const image=frames[direction+'-'+frame],height=80,width=image.width/image.height*height;
        const registration=reference-eyeAnchor(image);
        atlasContext.drawImage(image,(frame-2)*64+32-width/2+registration,row*96+8,width,height);
      }
    }
    const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;let previous='';
    return {draw(state){
      const p=pose(state),direction=state.facing||'front',key=direction+'-'+p.frame;
      canvas.style.transform=`translateY(${-p.lift}px)`;
      canvas.dataset.action=state.action||(state.running&&state.moving?'run':state.moving?'walk':'idle');
      if(previous===key)return;previous=key;
      ctx.clearRect(0,0,64,96);
      ctx.drawImage(atlas,(p.frame-2)*64,ROWS[direction]*96,64,96,0,0,64,96);
    }};
  }
  root.WoodlandCharacter={pose,mount,ACTION_MS,WALK_SEQUENCE};
})(typeof window==='undefined'?globalThis:window);
