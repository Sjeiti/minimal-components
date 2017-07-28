import Signal from 'signals'

let resize = new Signal
    ,win = window
    ,doc = document
    ,html = doc.documentElement
    ,body = doc.body
    ,w
    ,h

setSize()

win.addEventListener('resize', function(docElm){
  const wOld = w
    ,hOld = h
  setSize()
  resize.dispatch(w,h,wOld,hOld)
},false)

function setSize(){
  resize.w = resize.width  = w = win.innerWidth  || html.clientWidth || body.clientWidth
  resize.h = resize.height = h = win.innerHeight || html.clientHeight|| body.clientHeight
}

export default resize