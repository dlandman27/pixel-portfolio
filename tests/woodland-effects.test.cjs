const {test}=require('node:test');const assert=require('node:assert/strict');
require('../resources/js/woodland-effects.js');
test('each interactive section has an authored animation',()=>{
 for(const id of ['cave','tent','workshop','library','campfire','picnic','dock','cat'])assert.ok(WoodlandEffects.THEMES[id],id);
 assert.ok(new Set(Object.values(WoodlandEffects.THEMES)).size>=7);
});
test('particle trajectories stay finite and fade out',()=>{
 for(const kind of Object.values(WoodlandEffects.THEMES))for(let i=0;i<12;i++)for(const t of [0,.25,.5,1]){
  const p=WoodlandEffects.sample(kind,t,i);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));assert.ok(p.alpha>=0&&p.alpha<=1);
 }
});
