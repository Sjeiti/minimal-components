import xhttp from '../network/xhttp'
// let xhttp = iddqd.network.xhttp

function parse(uri){
  return new Promise(function(resolve,reject){
    //XMLHttpRequest
    xhttp(uri,handleXHR.bind(null,resolve,reject))
  })
}

function handleXHR(resolve,reject,request){
  let responseText = request.responseText
    ,includes = responseText.match(/\n*\#include\s+"[^"]+"|\n*\#include\s+<[^>]+>/g)||[]
    ,promises = []
  if (includes) {
    for (let i=0,l=includes.length;i<l;i++) {
      let include = includes[i]
        ,matchIncludeUri = include.match(/"([^"]+)"|<([^>]+)>/)
        ,includeUri = matchIncludeUri&&(matchIncludeUri[1]||matchIncludeUri[2])
        ,promise = parse(includeUri)
      promises.push(promise)
    }
  }
  Promise.all(promises)
    .then(handleParseInclude.bind(null,resolve,reject,request,responseText,includes))
}

function handleParseInclude(resolve,reject,request,responseText,includes,results){
  for (let i=0,l=includes.length;i<l;i++) {
    let include = includes[i]
      ,result = results[i]
    responseText = responseText.replace(include,'\n'+result)
  }
  resolve(responseText)
}

export default parse