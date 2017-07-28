import {component, BaseComponent} from '../js/Component'

component.create('data-issues',class extends BaseComponent{
  constructor(...args){
    super(...args)
    const pathname = location.pathname
    const elm = this._element
    const rjson = r=>r.json()
    const api = 'https://api.github.com/repos/sjeiti/project-invoice'
    fetch(`${api}/milestones`)
      .then(rjson,err=>{elm.querySelector('ul').textContent = 'error';})
      .then(result=>result.pop())
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
      })
    this._element.appendChild(BaseComponent.getFragment(`
	<h3>issues</h3>
	<ul></ul>`))
  }
})