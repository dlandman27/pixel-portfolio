const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../resources/js/woodland-depth.js');
const depth=globalThis.WoodlandDepth;
test('upright props keep their height and share the projected ground anchor',()=>{
 for(const y of [0,200,650,1000]){
  const object={x:30,y,w:80,h:120,foot:y+116};const box=depth.bounds(object);
  assert.equal(box.h,120);assert.equal(box.y+116,depth.groundY(object.foot));
 }
});
test('decks compress with the ground instead of becoming vertical walls',()=>{
 const b=depth.bounds({x:0,y:200,w:180,h:206,ground:true});
 assert.equal(b.y,200*Math.cos(48*Math.PI/180));assert.equal(b.h,206*depth.GROUND_SCALE);
});
test('only tall foreground props overlapping the traveler fade',()=>{
 const tree={asset:'pine',x:100,y:100,w:80,h:120,foot:216};
 assert.equal(depth.obscures(tree,{x:140,y:200}),true);
 assert.equal(depth.obscures(tree,{x:140,y:230}),false);
 assert.equal(depth.obscures(tree,{x:250,y:200}),false);
 assert.equal(depth.obscures({...tree,asset:'foliage'},{x:140,y:200}),false);
});

test('repeated flower beds and ground cover stay flat while reeds stand up',()=>{
 for(const asset of ['foliage','flower','mushroom','fern']){
  const b=depth.bounds({asset,x:0,y:400,w:40,h:30,foot:426});
  assert.equal(b.h,30*depth.GROUND_SCALE);
 }
 assert.equal(depth.bounds({asset:'reeds',x:0,y:400,w:24,h:34,foot:430}).h,34);
});
