const {test}=require('node:test');const assert=require('node:assert/strict');require('../resources/js/woodland-character.js');
const character=globalThis.WoodlandCharacter;
test('walking uses only the six authored proportion-matched frames',()=>{
 for(const [facing,row]of Object.entries({front:0,left:1,right:2,back:3})){
  const frames=new Set();for(let distance=0;distance<100;distance++){
   const p=character.pose({moving:true,distance,facing});assert.equal(p.row,row);assert.equal(p.sheet,'authored');assert.ok(p.frame>=2&&p.frame<=7);frames.add(p.frame);
  }assert.equal(frames.size,6);
 }
});
test('walk loop preserves the authored pose ordering',()=>{assert.deepEqual(character.WALK_SEQUENCE,[2,3,4,5,6,7]);});
test('idle and jump preserve the full neutral frame and return to ground',()=>{
 assert.equal(character.pose({moving:false}).frame,2);
 assert.equal(character.pose({action:'jump',elapsed:0}).lift,0);
 assert.equal(character.pose({action:'jump',elapsed:350}).lift,30);
 assert.ok(character.pose({action:'jump',elapsed:700}).lift<.0001);
});
