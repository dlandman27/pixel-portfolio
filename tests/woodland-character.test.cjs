const {test}=require('node:test');const assert=require('node:assert/strict');require('../resources/js/woodland-character.js');
const character=globalThis.WoodlandCharacter;
test('walk and run use all eight frames with stable direction rows',()=>{
 for(const [facing,row] of Object.entries({front:0,left:1,right:2,back:3}))for(const running of [false,true]){
  const frames=new Set();for(let distance=0;distance<96;distance++){const p=character.pose({moving:true,running,distance,facing});assert.equal(p.row,row);assert.equal(p.sheet,running?'run':'walk');frames.add(p.frame);}assert.equal(frames.size,8);
 }
});
test('jump leaves and returns to the baseline; wave stays grounded',()=>{
 assert.equal(character.pose({action:'jump',elapsed:0}).lift,0);
 assert.equal(character.pose({action:'jump',elapsed:350}).lift,30);
 assert.equal(character.pose({action:'jump',elapsed:700}).lift,0);
 assert.equal(character.pose({action:'wave',elapsed:600}).row,1);
 assert.equal(character.pose({action:'wave',elapsed:600}).lift,0);
});

test('limb movement is continuous rather than swapping whole character frames',()=>{
 const a=character.motion({moving:true,distance:12}),b=character.motion({moving:true,distance:12.001});
 assert.ok(Math.abs(a.leftArm-b.leftArm)<.001);
 assert.equal(a.leftArm,-a.rightArm);
 assert.equal(character.motion({moving:false}).leftArm,0);
 assert.ok(character.motion({action:'wave',elapsed:500}).leftArm>2);
});
