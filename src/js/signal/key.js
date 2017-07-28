import Signal from 'signals'
import animate from './animate'

/**
* Wrapper namespace for keyboard signals.<br/>
* Is really an Array containing pressed keycodes.
* @namespace iddqd.signal.key
* @summary Wrapper namespace for keyboard signals.
*/

let eLastKeyDown
  // ,bInit = false
  /**
   * Signal for keyPress.<br/>
   * The callback for this signal is Function(keys,event)
   * @name iddqd.signal.keypress
   * @type Signal
   */
  ,press = new Signal//signal(init)
  /**
   * Signal for keyDown.<br/>
   * The callback for this signal is Function(keyCode,keys,event)
   * @name iddqd.signal.keydown
   * @type Signal
   */
  ,down = new Signal//signal(initDown)
  /**
   * Signal for keyUp.<br/>
   * The callback for this signal is Function(keyCode,keys,event)
   * @name iddqd.signal.keyup
   * @type Signal
   */
  ,up = new Signal//signal(initUp)
  //
  ,key = Object.assign([],{
    press: press
    ,down: down
    ,up: up
  })
;
// function init(){
//   if (!bInit) {
//     bInit = true;
    // up.add(fn).detach();
    // press.add(fn).detach();
    // down.add(fn).detach();
  // }
// }
// function initDown(signal){
//   init();
  document.addEventListener('keydown',function(e){
    const iKeyCode = e.keyCode;
    key[iKeyCode] = true;
    eLastKeyDown = e;
    down.dispatch(iKeyCode,key,e);
    animate.add(keypress);
  });
// }
// function initUp(signal){
//   init();
  document.addEventListener('keyup',function(e){
    const iKeyCode = e.keyCode;
    key[iKeyCode] = false;
    animate.remove(keypress);
    up.dispatch(iKeyCode,key,e);
  });
// }
function keypress(){
  press.dispatch(key,eLastKeyDown);
}

export default key;