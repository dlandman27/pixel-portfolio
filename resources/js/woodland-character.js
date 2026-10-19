/* Fixed-baseline, predecoded sprite atlas animation. Movement stays subpixel;
   individual pixel-art frames remain crisp without per-frame network swaps. */
(function(root){
  'use strict';
  const ROWS={front:0,left:1,right:2,back:3};
  const ACTION_MS={jump:700,wave:1200};
  function pose({moving=false,running=false,distance=0,facing='front',action=null,elapsed=0}={}){
    if(action&&elapsed<ACTION_MS[action]){
      const progress=Math.max(0,elapsed/ACTION_MS[action]);
      return {sheet:'actions',row:action==='jump'?0:1,frame:Math.min(7,Math.floor(progress*8)),lift:action==='jump'?Math.sin(progress*Math.PI)*30:0};
    }
    if(!moving&&facing==='front')return {sheet:'actions',row:1,frame:0,lift:0};
    return {sheet:running&&moving?'run':'walk',row:ROWS[facing]??0,frame:moving?Math.floor(distance/(running?12:8))%8:2,lift:0};
  }
  function motion(state){
    const phase=(state.distance||0)/(state.running?15:17)*Math.PI;
    const moving=!!state.moving,run=!!state.running;
    let leftArm=moving?Math.sin(phase)*(run?.6:.3):0,rightArm=-leftArm;
    let leftLeg=moving?Math.sin(phase)*(run?2.2:1.2):0,rightLeg=-leftLeg;
    let leftLift=moving?Math.max(0,Math.cos(phase))*(run?2:1):0;
    let rightLift=moving?Math.max(0,-Math.cos(phase))*(run?2:1):0;
    if(state.action==='wave')leftArm=2.5+Math.sin(state.elapsed/95)*.23;
    if(state.action==='jump'){leftArm=1.7;rightArm=-1.7;leftLift=rightLift=1;}
    return {leftArm,rightArm,leftLeg,rightLeg,leftLift,rightLift};
  }
  async function mount(canvas){
    const [walk,actions]=await Promise.all(['walk','actions'].map(async name=>{const image=new Image();image.src=`resources/images/characters/woodland/${name}.png`;await image.decode();return image;}));
    const figures={};
    for(const [direction,row]of Object.entries(ROWS)){
      const image=direction==='front'?actions:walk,rows=direction==='front'?2:4;
      const col=direction==='front'?0:2,sourceRow=direction==='front'?1:row;
      const cellW=image.width/8,cellH=image.height/rows;
      const cell=document.createElement('canvas');cell.width=Math.floor(cellW);cell.height=Math.floor(cellH);
      const c=cell.getContext('2d',{willReadFrequently:true});c.drawImage(image,col*cellW,sourceRow*cellH,cellW,cellH,0,0,cell.width,cell.height);
      const pixels=c.getImageData(0,0,cell.width,cell.height).data;let left=cell.width,right=0,top=cell.height,bottom=0;
      for(let y=0;y<cell.height;y++)for(let x=0;x<cell.width;x++)if(pixels[(y*cell.width+x)*4+3]>120){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
      const figure=document.createElement('canvas');figure.width=32;figure.height=48;
      const f=figure.getContext('2d');f.imageSmoothingEnabled=false;
      const h=bottom-top+1,scale=40/h,w=(right-left+1)*scale;
      f.drawImage(cell,left,top,right-left+1,h,16-w/2,4,w,40);figures[direction]=figure;
    }
    const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
    function limb(figure,sx,sy,w,h,px,py,angle,dx=0,dy=0){
      ctx.save();ctx.translate(px+dx,py+dy);ctx.rotate(angle);ctx.drawImage(figure,sx,sy,w,h,sx-px,sy-py,w,h);ctx.restore();
    }
    return {draw(state){
      const p=pose(state),m=motion(state),facing=state.action?'front':state.facing||'front',figure=figures[facing];
      canvas.style.transform=`translateY(${-p.lift}px)`;
      canvas.dataset.action=state.action||(state.running&&state.moving?'run':state.moving?'walk':'idle');
      ctx.clearRect(0,0,32,48);
      // Only one source pose per direction: identity and eye pixels never change.
      limb(figure,6,34,10,10,12,34,0,m.leftLeg,-m.leftLift);
      limb(figure,16,34,10,10,20,34,0,m.rightLeg,-m.rightLift);
      ctx.drawImage(figure,9,24,14,12,9,24,14,12);
      limb(figure,0,24,10,12,8,25,m.leftArm);
      limb(figure,22,24,10,12,24,25,m.rightArm);
      ctx.drawImage(figure,0,0,32,25,0,0,32,25);
    }};
  }
  root.WoodlandCharacter={pose,motion,mount,ACTION_MS};
})(typeof window==='undefined'?globalThis:window);
