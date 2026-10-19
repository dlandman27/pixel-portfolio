const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
require('../resources/js/world-preview-navigation.js');require('../resources/js/woodland-world.js');
const world=globalThis.WoodlandWorld,nav=globalThis.ParkNavigation;
test('all authored walking routes clear terrain and placed-object collisions',()=>{
 for(const [a,b]of nav.edges){const A=nav.points[a],B=nav.points[b],steps=Math.ceil(Math.hypot(B[0]-A[0],B[1]-A[1]));for(let i=0;i<=steps;i++)assert.ok(world.canWalk(A[0]+(B[0]-A[0])*i/steps,A[1]+(B[1]-A[1])*i/steps),`${a} to ${b} at ${i}/${steps}`);}
});
test('world uses existing individual assets and excludes the concept painting',()=>{
 for(const asset of Object.values(world.assets))assert.ok(fs.existsSync('resources/images/'+asset.url),asset.url);
 for(const path of ['world-preview.html','resources/js/woodland-world.js','resources/js/woodland-renderer.js'])assert.ok(!fs.readFileSync(path,'utf8').includes('full-map.png'));
});
test('water is blocked while the bridge deck and dock are walkable',()=>{
 assert.equal(world.canWalk(500,280),false);assert.equal(world.canWalk(768,280),true);assert.equal(world.canWalk(801,927),true);assert.equal(world.canWalk(900,927),false);
});

test('bridge parapets block movement at both approaches',()=>{
 for(const y of [210,280,370]){assert.equal(world.canWalk(711,y),false);assert.equal(world.canWalk(827,y),false);assert.equal(world.canWalk(768,y),true);}
});
