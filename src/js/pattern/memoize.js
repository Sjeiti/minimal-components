/**
 * Memoisation function
 * Memoizes the return values to the functions argument values
 * @name iddqd.pattern.memoize
 * @method
 * @param {Function} fnc The function we want to memoize
 * @param {(Object|Storage)} [storage=undefined] The storage type. Leave undefined for local variable, or localStorage or sessionStorage.
 * @param {boolean} [async=undefined] If true the last of the arguments will be seen as the callback function in an asynchronous method.
 * @returns {Object} The memoized function
 * @todo cleanup add max cache size to prevent memory leaks
 */
export default function(fnc,storage,async){
  let oCache = storage||{}
    ,sKeySuffix = 0
    ,sFnc

  if (async) {
    sFnc = ''+fnc
    for (let i=0, l=sFnc.length; i<l; i++) {
      sKeySuffix = ((sKeySuffix<<5)-sKeySuffix)+sFnc.charCodeAt(i)
      sKeySuffix = sKeySuffix&sKeySuffix
    }
    //function a(a,b,cb){setTimeout(function(){cb(a+b)},1000)};b=iddqd.pattern.memoize(a,null,true);b(2,4,function(c){console.log(c)});b(2,4,function(c){console.log('c',c)})
    let oPending = {}
      ,oArrayProto = Array.prototype
      ,stringify = JSON.stringify
      ,parse = JSON.parse

    return function(){
      let fnCallback = oArrayProto.pop.call(arguments)
      let sKey = sKeySuffix+stringify(arguments)
      if (sKey in oCache) {
        fnCallback.apply(fnCallback,parse(oCache[sKey]))
      } else {
        if (sKey in oPending) {
          oPending[sKey].push(fnCallback)
        } else {
          let aPending = oPending[sKey] = [fnCallback]
          oArrayProto.push.call(arguments,function(){
            oCache[sKey] = stringify(oArrayProto.slice.call(arguments))
            for (let i=0,l=aPending.length;i<l;i++) {
              let pendingCallback = aPending[i]
              pendingCallback.apply(pendingCallback,arguments)
            }
          })
          fnc.apply(fnc,arguments)
        }
      }
    }
  }
  return function () {
    let sKey = sKeySuffix+JSON.stringify(arguments)
    return (sKey in oCache)?oCache[sKey]:oCache[sKey] = fnc.apply(fnc,arguments)
  }
}