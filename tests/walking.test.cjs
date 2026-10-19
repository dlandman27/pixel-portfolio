const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
test('every facing and step uses the same grounded height',()=>{
 let style;
 const context={Image:function(){},$:()=>({0:{setAttribute(){}},css(value){style=value;}})};
 vm.runInNewContext(fs.readFileSync('resources/js/sprite-manager.js','utf8'),context);
 for(const direction of ['front','back','left','right']) for(let frame=2;frame<=7;frame++){
  context.SpriteManager.setSpriteFrame(direction,frame);
  assert.equal(style['background-size'],'auto 54px');
  assert.equal(style['background-position'],'center bottom 7px');
 }
});
test('walking retains elapsed time and starts a fresh step after idle',()=>{
 const context={window:{},CollisionWorld:function(){},SpriteManager:{setSpriteFrame(){}}};
 vm.runInNewContext(fs.readFileSync('resources/js/game/game-world.js','utf8'),context);
 const world=Object.create(context.window.GameWorld.prototype);
 Object.assign(world,{_lastDir:'down',_animFrame:2,_animAccum:0});
 world.updateAnimation(150,{x:0,y:1});
 assert.equal(world._animAccum,40);
 world.updateAnimation(1,{x:0,y:0});
 assert.equal(world._animAccum,0);
 assert.equal(world._animFrame,2);
});
