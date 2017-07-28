import {component, BaseComponent} from '../js/Component'
import * as experiments from '../js/experiment/experiments'

component.create('data-experiment',class extends BaseComponent{
  
  _currentExperiment
  _div

  constructor(...args){
    super(...args)
    const pathname = location.pathname
    const {element,options} = this
    element.appendChild(BaseComponent.getFragment(`
  <style>canvas{height:300px;}</style>
	<h3>experiment</h3>
  <select></select>
	<div></div>`))
    //
    this._div = element.querySelector('div')
    this._onSelectChange({target:{value:options}})
    //
    const exp = experiments.default
    const fragment = document.createDocumentFragment()
    Object.keys(exp).forEach(key=>{
      const option = document.createElement('option')
      option.textContent = key
      option.value = key
      fragment.appendChild(option)
    })  
    const select = element.querySelector('select')
    select.appendChild(fragment)
    select.addEventListener('change',this._onSelectChange.bind(this))
    select.value = options
  }
  _onSelectChange({target}){
          console.log(target.value)
    this._currentExperiment&&this._currentExperiment.exit()
    this._currentExperiment = experiments.default[target.value]
          console.log(this._currentExperiment)
    this._currentExperiment&&this._currentExperiment.init(this._div)
  }
})
