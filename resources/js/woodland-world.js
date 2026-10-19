/* Authored world data. Terrain, placed objects and collision share these coordinates. */
(function(root){
  'use strict';
  const WIDTH=1536,HEIGHT=1024,PIXEL=2;
  const navigation=root.ParkNavigation;
  const assets={
    cliff:{url:'world-v2/cliff-terrace.png'},reeds:{url:'world-v2/river-reeds.png'},foliage:{url:'world-v2/fern-daisies.png'},pine:{url:'world-v2/pine-tree.png'},rock:{url:'world-v2/moss-rocks.png'},grotto:{url:'world-v2/stone-grotto.png'},
    waterfall:{url:'world-v2/waterfall-cliff.png'},bridge:{url:'world-v2/stone-bridge.png'},bench:{url:'world-v2/wooden-bench.png'},
    workshop:{url:'park/art-pavilion-v2.png'},library:{url:'park/woodland-library.png'},tackle:{url:'park/tackle-hut.png'},picnic:{url:'park/picnic-shelter-v2.png'},
    tent:{url:'buildings/tent1.png'},fire:{url:'world-v2/stone-fire-ring.png'},flower:{url:'nature/pink-tulips.png'},mushroom:{url:'nature/mushroom-purple.png'},
    fern:{url:'nature/bush.png'},log:{url:'nature/moss-log.png'},cat:{url:'park/park-cat.png'}
  };
  function hash(x,y){let n=Math.imul(x+137,374761393)^Math.imul(y+71,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
  function riverTop(x){return 234+Math.sin(x/139)*14+Math.sin(x/47)*4;}
  function riverBottom(x){return 344+Math.sin(x/151+1)*16;}
  function lakeTop(x){return 857+Math.sin(x/137)*31+Math.sin(x/59)*9;}
  function inBridge(x,y){return x>=739&&x<=797&&y>=200&&y<=385;}
  function inDock(x,y){return x>=752&&x<=850&&y>=838&&y<=958;}
  function inWater(x,y){return (y>=riverTop(x)&&y<=riverBottom(x))||y>=lakeTop(x);}
  function pathDistance(x,y){let best=Infinity;for(const [a,b,r] of navigation.edges){const A=navigation.points[a],B=navigation.points[b],dx=B[0]-A[0],dy=B[1]-A[1],t=Math.max(0,Math.min(1,((x-A[0])*dx+(y-A[1])*dy)/(dx*dx+dy*dy)));best=Math.min(best,Math.hypot(x-A[0]-dx*t,y-A[1]-dy*t)-r);}return best;}
  function terrainAt(x,y){if(x<0||y<0||x>=WIDTH||y>=HEIGHT)return 'void';if(inBridge(x,y))return 'bridge';if(inDock(x,y))return 'dock';if(inWater(x,y))return 'water';if(y<142&&!(x>732&&x<805&&y>108))return 'cliff';return pathDistance(x,y)<0?'path':'grass';}
  const objects=[];
  function prop(id,asset,x,y,w,h,solid,extra){const o={id,asset,x,y,w,h,foot:y+h-4,...extra};if(solid)o.solid=solid;objects.push(o);return o;}
  prop('entrance','grotto',644,12,228,172,[668,97,45,72]);
  // The cave opening remains open; its two walls are separate solids.
  const additionalSolids=[[804,97,47,72],[687,201,44,179],[805,201,44,179]];
  prop('falls','waterfall',934,-34,190,300,[950,20,150,193]);
  prop('bridge','bridge',678,190,180,206,null,{ground:true,source:[175,72,740,1260]});
  prop('workshop','workshop',1230,304,202,180,[1250,415,158,62]);
  prop('library','library',222,470,184,160,[244,568,140,56]);
  prop('picnic','picnic',1350,552,180,156,[1378,650,126,43]);
  prop('tackle','tackle',666,730,160,140,[688,810,114,52]);
  prop('tent','tent',128,286,160,140,[151,351,106,64]);
  prop('campfire','fire',741,518,68,64,[744,539,60,40],{source:[240,220,920,700]});
  prop('reading-bench','bench',404,565,76,48,[408,597,68,10]);
  prop('arrival-bench','bench',570,385,90,58,[574,425,82,12]);
  prop('picnic-bench','bench',1198,651,76,48,[1202,683,68,10]);
  prop('camp-bench-n','bench',740,470,68,40,[744,497,60,10]);
  prop('camp-bench-s','bench',736,570,84,48,[740,602,76,10]);
  prop('cat','cat',458,646,30,28);
  // Terraced rock shoulders join the grotto to the river instead of leaving a
  // flat empty lawn behind the entrance. The central approach stays clear.
  for(const [i,x,y,w,h] of [[0,420,22,170,136],[1,530,48,156,130],[2,552,105,124,124],[3,470,137,170,108],[4,536,174,134,90],[5,834,66,148,138],[6,850,161,136,104],[7,1090,76,150,150]]){
    prop('entrance-rock-'+i,i<4||i===5||i===7?'cliff':'rock',x,y,w,h,[x+18,y+h-30,w-36,24]);
  }
  for(const [i,x,y,w,h] of [[0,440,-38,120,180],[1,552,-62,96,144],[2,884,-72,108,162],[3,1060,-64,128,192],[4,380,250,116,174],[5,964,260,120,180]]){
    prop('entrance-pine-'+i,'pine',x,y,w,h,[x+w/2-8,y+h-14,16,12]);
  }
  for(const [i,x,y,w,h] of [[0,602,154,68,46],[1,674,192,48,32],[2,832,183,56,38],[3,898,206,64,44],[4,536,187,66,44],[5,644,343,60,40],[6,852,350,68,46],[7,583,430,56,38],[8,923,395,64,44],[9,534,74,52,36],[10,870,51,52,36]])prop('entrance-foliage-'+i,'foliage',x,y,w,h);
  // Far cliff tier closes the skyline behind the arch, below the foreground ledges.
  for(let x=580;x<990;x+=100)prop('backdrop-'+x,'cliff',x,-108,192,192,null,{foot:55});
  for(let x=460;x<1110;x+=58){
    if(x>680&&x<845)continue;
    const y=riverBottom(x)-8;
    prop('south-bank-'+x,'rock',x,y,70,48,null,{foot:y+36});
    if(hash(x,5)>.35)prop('shore-fern-'+x,'foliage',x+14,y+18,48,32);
  }
  for(const x of [430,578,660,861,920,1140,1250]){
    prop('north-reeds-'+x,'reeds',x,riverTop(x)-31,32,46);
    prop('south-reeds-'+x,'reeds',x+20,riverBottom(x+20)-26,30,44);
  }
  for(const x of [220,416,584,950,1142,1372])prop('lake-reeds-'+x,'reeds',x,lakeTop(x)-38,38,54);
  const landmarks=objects.slice();
  function overlapsReserved(x,y,w,h){return landmarks.some(o=>!o.ground&&x<o.x+o.w+10&&x+w>o.x-10&&y<o.y+o.h+10&&y+h>o.y-10);}
  // Overlapping crowns form woodland masses; trunks keep generous trail clearance.
  let tree=0;
  for(let y=60;y<870;y+=46)for(let x=-24;x<WIDTH;x+=44){
    const px=Math.round((x+(hash(x,y)-.5)*30)/2)*2,py=Math.round((y+(hash(y,x)-.5)*24)/2)*2;
    const w=76+Math.floor(hash(x,8)*4)*4,h=Math.round(w*1.5/2)*2,fx=px+w/2,fy=py+h-8;
    if(pathDistance(fx,fy)<58||overlapsReserved(px,py,w,h)||inWater(fx,fy)||fy>lakeTop(fx)-12)continue;
    if(fy>400&&fx>160&&fx<1370&&hash(x,y)>.66)continue;
    prop('pine-'+tree++,'pine',px,py,w,h,[fx-8,fy-6,16,12]);
  }
  let rock=0;
  for(let row=0;row<3;row++)for(let x=-35;x<WIDTH;x+=105){
    if(x>600&&x<875||x>1010&&x<1210)continue;
    const px=x+(row%2)*35,y=-70+row*65+hash(x,row)*18;
    prop('cliff-'+rock++,'cliff',px,y-32,168,152,null,{foot:y+110});
  }
  for(let x=24;x<WIDTH-50;x+=93){if(x>620&&x<850||x>920&&x<1140)continue;const y=riverTop(x)-29;prop('bank-'+rock++,'rock',x,y,62,44,[x+8,y+25,46,12]);}
  let detail=0;
  for(let y=350;y<835;y+=24)for(let x=40;x<1490;x+=26){const n=hash(x,y);if(n>.55||terrainAt(x,y)!=='grass'||pathDistance(x,y)>65||overlapsReserved(x-10,y-18,20,20))continue;prop('detail-'+detail++,n<.2?'foliage':n<.24?'mushroom':'fern',x-14,y-22,n<.2?38:20,n<.2?26:20);}
  const collisionBoxes=additionalSolids.concat(objects.filter(o=>o.solid).map(o=>o.solid));
  function canWalk(x,y,r=6){for(const [dx,dy]of [[0,0],[-r,0],[r,0],[0,-r],[0,r]]){const t=terrainAt(x+dx,y+dy);if(t==='water'||t==='cliff'||t==='void')return false;}for(const box of collisionBoxes){const [bx,by,bw,bh]=box;if(x+r>bx&&x-r<bx+bw&&y+r>by&&y-r<by+bh)return false;}return true;}
  root.WoodlandWorld={WIDTH,HEIGHT,PIXEL,assets,objects,hash,terrainAt,inWater,riverTop,riverBottom,lakeTop,pathDistance,canWalk,additionalSolids};
})(typeof window==='undefined'?globalThis:window);
