(async () => {
  'use strict';
  const $=id=>document.getElementById(id), nav=ParkNavigation;
  const depth=WoodlandDepth;
  const scene=$('scene'),sprite=$('sprite'),traveler=$('traveler'),panel=$('panel');
  const places=[
    {id:'tent',title:'The woodland tent',action:'Light the lantern',node:'tent',x:225,y:423},
    {id:'cat',title:'The park cat',action:'Say hello',node:'libraryFork',x:458,y:646},
    {id:'cave',title:'The grotto',action:'Read the welcome note',node:'cave',x:768,y:185},
    {id:'workshop',title:'The workshop',action:'Browse projects',node:'workshop',x:1253,y:504},
    {id:'library',title:'Little park library',action:'Open the field guide',node:'library',x:375,y:652},
    {id:'campfire',title:'The campfire',action:'Sit for a moment',node:'campW',x:651,y:567},
    {id:'picnic',title:'Picnic garden',action:'Take a break',node:'picnic',x:1360,y:766},
    {id:'dock',title:'The fishing dock',action:'Cast a line',node:'dock',x:801,y:927}
  ];
  let player={x:770,y:421},keys=new Set(),overview=false,route=[],destination=null,nearest=null,last=0,step=0,facing='front',page=0,fishAnimation=0;
  let entranceView=false;
  let renderer=null,character=null,action=null,actionStarted=0,runToggle=false;
  let camera={x:0,y:0,scale:1},cameraReady=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function performAction(name){if(panel.open||action)return;action=name;actionStarted=performance.now();}
  $('jump-action').onclick=()=>performAction('jump');
  $('wave-action').onclick=()=>performAction('wave');
  $('run-toggle').onclick=()=>{runToggle=!runToggle;$('run-toggle').setAttribute('aria-pressed',String(runToggle));};
  function setOverview(value){entranceView=false;overview=value;$('overview').textContent=overview?'Explore on foot':'Whole map';$('overview').setAttribute('aria-pressed',String(overview));}
  function visit(place){setOverview(false);const start=nav.nearest(player.x,player.y);route=nav.route(start,place.node);destination=place;$('places').hidden=true;$('places-toggle').setAttribute('aria-expanded','false');$('arrival').textContent=`Walking to ${place.title.toLowerCase()} · Arrow keys to take over`;}
  const markers=[];
  for(const place of places){const marker=document.createElement('button');marker.className='destination';marker.style.left=place.x+'px';marker.style.top=(depth.groundY(place.y)-8)+'px';marker.setAttribute('aria-label',`Walk to ${place.title}`);marker.append(document.createTextNode('·'));const label=document.createElement('span');label.textContent=place.title;marker.append(label);marker.onclick=()=>visit(place);$('destinations').append(marker);markers.push({place,element:marker});const item=document.createElement('button');item.textContent=place.title+' →';item.onclick=()=>visit(place);$('place-list').append(item);}
  $('work-shortcut').onclick=()=>openPlace(places.find(p=>p.id==='workshop'));
  $('overview').textContent='Whole map';$('overview').setAttribute('aria-pressed','false');
  $('overview').onclick=()=>setOverview(!overview);
  $('entrance-view').onclick=()=>{entranceView=true;overview=false;route=[];keys.clear();$('overview').textContent='Whole map';};
  $('places-toggle').onclick=()=>{$('places').hidden=!$('places').hidden;$('places-toggle').setAttribute('aria-expanded',String(!$('places').hidden));};
  function stopFishing(){cancelAnimationFrame(fishAnimation);fishAnimation=0;}
  $('close-panel').onclick=()=>panel.close();panel.addEventListener('close',()=>{stopFishing();keys.clear();last=performance.now();});
  panel.addEventListener('click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)panel.close();}});
  function paragraph(text){const p=document.createElement('p');p.textContent=text;$('panel-content').append(p);return p;}
  function button(text,fn){const b=document.createElement('button');b.textContent=text;b.onclick=fn;$('panel-content').append(b);return b;}
  function readPage(){const pages=['Follow the water. The stone bridge connects the quiet grotto to the rest of the park. Past the campfire, the southern path leads to the fishing dock.','The workshop is east of the campfire. Its shelves hold real projects, from small playful websites to larger experiments.','The paths make a loop. Take the west branch for the tent and library, then follow the southern trail back through the picnic garden.'];$('panel-content').textContent='';paragraph(pages[page%pages.length]);paragraph(`Field guide · page ${page%pages.length+1} of ${pages.length}`);button('Turn the page',()=>{renderer.playSection('library',375,652);page++;readPage();});}
  function fishing(){paragraph('A small fishing game for this map preview. Stop the float inside the green zone to land a catch.');const meter=document.createElement('div');meter.className='meter';const target=document.createElement('span');target.className='target';const float=document.createElement('span');float.className='float';meter.append(target,float);$('panel-content').append(meter);const status=paragraph('Ready when you are.');let running=false,pos=0,start=0;const cast=button('Cast line',()=>{if(running){stopFishing();running=false;const caught=pos>=43&&pos<=59;renderer.playSection('dock',801,927);status.textContent=caught?'A silver minnow! A good start to the afternoon.':'Just a ripple. Try another cast.';cast.textContent='Cast again';return;}running=true;start=performance.now();cast.textContent='Reel in';status.textContent='Wait for the green zone…';function tick(t){pos=(Math.sin((t-start)/530)+1)*48;float.style.left=pos+'%';if(running&&panel.open)fishAnimation=requestAnimationFrame(tick);}fishAnimation=requestAnimationFrame(tick);});}
  function openPlace(place){renderer.playSection(place.id,place.x,place.y);route=[];destination=null;keys.clear();stopFishing();$('panel-kicker').textContent='WOODLAND PARK';$('panel-title').textContent=place.title;$('panel-content').textContent='';
    if(place.id==='workshop'){paragraph('A few things I have built. Choose a project to explore.');for(const id of ['random-sites','colorle','wiigit']){const project=getProjectById(id);if(!project)continue;const article=document.createElement('article'),title=document.createElement('h3'),desc=document.createElement('p'),link=document.createElement('a');title.textContent=project.title;desc.textContent=project.description;link.textContent='Visit project ↗';link.href=project.link;link.target='_blank';link.rel='noopener noreferrer';article.append(title,desc,link);$('panel-content').append(article);}}
    else if(place.id==='tent'){paragraph('The lantern is lit. A quiet place to settle in before exploring the park.');button('Relight the lantern',()=>renderer.playSection('tent',225,423));button('Walk to the campfire',()=>{panel.close();visit(places.find(p=>p.id==='campfire'));});}
    else if(place.id==='cat'){paragraph('The local quality inspector accepts a scratch behind the ears.');button('Pet the cat',()=>renderer.playSection('cat',458,646));}
    else if(place.id==='library')readPage();
    else if(place.id==='dock')fishing();
    else if(place.id==='cave'){paragraph('Welcome to my little world. I’m Dylan Landman. This park is a place to explore my projects, follow your curiosity, and take the scenic route.');paragraph('The workshop is across the bridge to the east. The library has a field guide, and the dock has a little fishing game.');button('Walk to the workshop',()=>{panel.close();visit(places.find(p=>p.id==='workshop'));});}
    else if(place.id==='campfire'){paragraph('A warm fire, a seat, and no rush. Stay a little while.');button('Next stop: the library',()=>{panel.close();visit(places.find(p=>p.id==='library'));});}
    else{paragraph('A shady table at the end of the woodland loop. The workshop is up the path; the fishing dock is to the southwest.');button('Head to the dock',()=>{panel.close();visit(places.find(p=>p.id==='dock'));});}
    panel.showModal();
  }
  $('interact').onclick=()=>{if(nearest)openPlace(nearest);};
  const movementKeys=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'];
  window.addEventListener('keydown',e=>{if(panel.open)return;const k=e.key.length===1?e.key.toLowerCase():e.key;if(k==='Shift')keys.add('Shift');if(k===' '){e.preventDefault();if(!e.repeat)performAction('jump');}if(movementKeys.includes(k)){e.preventDefault();keys.add(k);route=[];destination=null;setOverview(false);}if(k==='e'&&!e.repeat&&nearest){e.preventDefault();openPlace(nearest);}});
  window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));window.addEventListener('blur',()=>{keys.clear();route=[];});document.addEventListener('visibilitychange',()=>{keys.clear();last=performance.now();});
  for(const b of document.querySelectorAll('#movement button')){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);route=[];destination=null;setOverview(false);});for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,()=>keys.delete(b.dataset.key));}
  function tick(now){if(document.hidden){last=now;requestAnimationFrame(tick);return;}renderer.update(now);const dt=Math.min((now-last)/1000||0,.035);last=now;let dx=0,dy=0;
    if(!panel.open){dx=Number(keys.has('ArrowRight')||keys.has('d'))-Number(keys.has('ArrowLeft')||keys.has('a'));dy=Number(keys.has('ArrowDown')||keys.has('s'))-Number(keys.has('ArrowUp')||keys.has('w'));
      if(route.length){const goal=route[0];dx=goal[0]-player.x;dy=goal[1]-player.y;if(Math.hypot(dx,dy)<4){route.shift();dx=dy=0;if(!route.length&&destination){const place=destination;destination=null;openPlace(place);}}}
    }
    if(action&&now-actionStarted>=WoodlandCharacter.ACTION_MS[action])action=null;
    const running=runToggle||keys.has('Shift');
    let moved=0;const length=Math.hypot(dx,dy);if(length&&!panel.open){if(action==='wave')action=null;const speed=running?182:104;dx=dx/length*speed*dt;dy=dy/length*speed*dt;const before={...player};if(WoodlandWorld.canWalk(player.x+dx,player.y))player.x+=dx;if(WoodlandWorld.canWalk(player.x,player.y+dy))player.y+=dy;moved=Math.hypot(player.x-before.x,player.y-before.y);if(moved>.01){facing=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'back':'front');step+=moved;}}
    if(moved<.01)step=0;
    character.draw({moving:moved>.01,running,distance:step,facing,action,elapsed:now-actionStarted});
    traveler.style.zIndex=100+Math.round(player.y);traveler.style.left=player.x.toFixed(3)+'px';traveler.style.top=depth.groundY(player.y).toFixed(3)+'px';renderer.updateDepth(player);
    const fit=Math.min(innerWidth/1536,innerHeight/depth.groundY(1024));const entranceScale=Math.max(2.5,Math.min(5,innerWidth/280));const scale=entranceView?entranceScale:overview?fit:Math.max(2.5,Math.min(5,innerWidth/280));const tx=entranceView?innerWidth/2-768*scale:overview?(innerWidth-1536*scale)/2:Math.min(0,Math.max(innerWidth-1536*scale,innerWidth/2-player.x*scale));const ty=entranceView?innerHeight*.5-depth.groundY(180)*scale:overview?(innerHeight-depth.groundY(1024)*scale)/2:Math.min(0,Math.max(innerHeight-depth.groundY(1024)*scale,innerHeight/2-depth.groundY(player.y)*scale));const ease=reduced||!cameraReady?1:1-Math.exp(-dt*12);camera.x+=(tx-camera.x)*ease;camera.y+=(ty-camera.y)*ease;camera.scale+=(scale-camera.scale)*ease;cameraReady=true;scene.style.transform=`translate(${camera.x.toFixed(3)}px,${camera.y.toFixed(3)}px) scale(${camera.scale})`;
    for(const marker of markers)marker.element.hidden=!overview&&Math.hypot(player.x-marker.place.x,player.y-marker.place.y)<55;
    nearest=places.find(p=>Math.hypot(player.x-p.x,player.y-p.y)<55);$('interact').hidden=!nearest||panel.open||overview||route.length>0;if(nearest)$('interact').querySelector('span').textContent=nearest.action;if(!route.length&&!panel.open)$('arrival').textContent=overview?'Choose a marker to visit · Or explore on foot':'WASD move · Shift run · Space jump';requestAnimationFrame(tick);
  }
  try {
    [renderer,character]=await Promise.all([WoodlandRenderer.mount(scene),WoodlandCharacter.mount(sprite)]);
    requestAnimationFrame(tick);
  } catch(error) { $('arrival').textContent='The map could not load. '+error.message;console.error(error); }
})();
