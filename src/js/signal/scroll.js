/** Signal for scrolling.<br/>
 * The callback for this signal is Function(scrollLeft,scrollTop)
 * @name iddqd.signal.scroll
 * @type Signal
 */
import Signal from 'signals'

let scroll = new Signal
    ,doc = document
    ,body = doc.body

window.addEventListener('touchmove',handleScroll,false);
window.addEventListener('scroll',handleScroll,false);

function handleScroll(e){
	scroll.dispatch(e,body.scrollLeft,body.scrollTop)
}

export default scroll