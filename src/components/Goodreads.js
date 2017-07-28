import {component, BaseComponent} from '../js/Component'

component.create('data-goodreads',class extends BaseComponent{
  constructor(...args){
    super(...args)
    const pathname = location.pathname
    const elm = this._element
    const key = 'kHrn2bEKZZeZDT8PSXog'
    const rjson = r=>r.json()
    const api = `https://www.goodreads.com/search.xml?key=${key}&q=Ender%27s+Game&format=json`
    console.log(api)
    fetch(`${api}`)
      .then(rjson)
      .then(result=>{
        elm.querySelector('ul').innerText = JSON.stringify(result)
      })
      /*.then(result=>result.pop())
      .then(({number})=>fetch(`${api}/issues?milestone=${number}`))
      .then(rjson)
      .then(issues=>{
        const fragment = document.createDocumentFragment()
        issues.forEach(({title})=>{
          const li = document.createElement('li')
          li.textContent = title
          fragment.appendChild(li)
        })
        elm.querySelector('ul').appendChild(fragment)
      })*/
    this._element.appendChild(BaseComponent.getFragment(`
	<h3>Goodreads</h3>
	<ul></ul>`))
  }
})