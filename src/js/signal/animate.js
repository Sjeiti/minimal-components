import Signal from 'signals'
import {requestAnimationFrame} from '../utils/utils'

let fDeltaT = 0
  ,iCurMillis
  ,iLastMillis = Date.now()
const signal = new Signal
  ,iMilliLen = 10
  ,aMillis = (function(a,n){
    for (let i=0;i<iMilliLen;i++) a.push(n)
    return a
  })([],iLastMillis)
  ,iFrameNr = 0

animate()

function animate(){
  iCurMillis = Date.now()
  aMillis.push(iCurMillis-iLastMillis)
  aMillis.shift()
  fDeltaT = 0
  for (let i=0;i<iMilliLen;i++) fDeltaT += aMillis[i]
  iLastMillis = iCurMillis
  signal.dispatch(fDeltaT/iMilliLen,iCurMillis,iFrameNr)
  requestAnimationFrame(animate)
}

/**
 * Animates something
 * @name animate
 * @memberof iddqd.animate
 * @method
 * @private
 * @param {Number} duration Length of animation in milliseconds.
 * @param {Function} step Function called each step with a progress parameter (a 0-1 float).
 * @param {Function} complete Callback function when animation finishes.
 * @return {Object} An animation object with a cancel function.
 */
signal.during = (duration,step,complete)=>{
  let timeStart = Date.now()
    ,isRunning = true
    ,fnRun = function(){
      if (isRunning) {
        let timeCurrent = Date.now()-timeStart;
        if (timeCurrent<duration) {
          step(timeCurrent/duration);
          requestAnimationFrame(fnRun);
        } else {
          step(1);
          complete&&complete();
        }
      }
    };
  function cancel(){
    isRunning = false;
  }
  fnRun();
  return {
    cancel
  };
}

export default signal