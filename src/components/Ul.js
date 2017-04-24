import {component, BaseComponent} from '../js/Component'

component.create('data-ul',class extends BaseComponent{
  constructor(...args){
    super(...args)
    const document = this._element.ownerDocument
        ,fragment = document.createDocumentFragment()
    this._options.forEach(text=>{
      const li = document.createElement('li')
      li.setAttribute('data-value',text)
      li.textContent = text
      fragment.appendChild(li)
    })
    this._element.appendChild(fragment)
  }
  _parseOptions(str) {
    return str.split(/,/g)
  }
})