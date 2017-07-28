/**
 * Creates an object pool for a factory method
 * Adds a drop function to each instance
 * @name iddqd.pattern.pool
 * @method
 * @param {Function} fnc The factory function we want to pool
 * @returns {Function} The pooled method
 */
export default function(fnc){
  let aPool = []
  function drop(){
    /* jshint validthis:true */
    aPool.push(this)
    return this
  }
  return function(){
    let oInstance
    if (aPool.length) {
      oInstance = aPool.pop()
      if (oInstance.reset) oInstance.reset.apply(oInstance,arguments)
    } else {
      oInstance = fnc.apply(fnc,arguments)
      oInstance.drop = drop
    }
    return oInstance
  }
}