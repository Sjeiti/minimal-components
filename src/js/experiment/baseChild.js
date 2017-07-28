import experiment from './base'

let inst = experiment('child',{init})
	,zuper = inst.zuper
  //
  ,target
  ,canvas
  ,context
  
function init(_target) {
  target = _target
  canvas = zuper.init(_target)
  context = inst.context
  return canvas
}

export default inst.expose
