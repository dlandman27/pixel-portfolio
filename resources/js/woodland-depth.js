/* One orthographic camera for ground, props, markers and traveler.
   Logical world coordinates remain unchanged for navigation and collisions. */
(function(root){
  'use strict';
  const TILT_DEGREES=48;
  const GROUND_SCALE=Math.cos(TILT_DEGREES*Math.PI/180);
  function groundY(y){return y*GROUND_SCALE;}
  const GROUND_DECOR=new Set(['foliage','flower','mushroom','fern']);
  function isGround(object){return object.ground||GROUND_DECOR.has(object.asset);}
  function bounds(object){
    if(isGround(object))return {x:object.x,y:groundY(object.y),w:object.w,h:object.h*GROUND_SCALE};
    const foot=object.foot??object.y+object.h;
    return {x:object.x,y:groundY(foot)-(foot-object.y),w:object.w,h:object.h};
  }
  function obscures(object,player){
    if(object.ground||!['pine','cliff','workshop','library','picnic','tackle','tent'].includes(object.asset))return false;
    const b=bounds(object),head=groundY(player.y)-38,feet=groundY(player.y);
    return object.foot>player.y+6&&player.x>b.x+object.w*.15&&player.x<b.x+object.w*.85&&head<b.y+b.h&&feet>b.y;
  }
  root.WoodlandDepth={TILT_DEGREES,GROUND_SCALE,isGround,groundY,bounds,obscures};
})(typeof window==='undefined'?globalThis:window);
