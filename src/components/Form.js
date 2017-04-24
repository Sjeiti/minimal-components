import {component, BaseComponent} from '../js/Component'

component.create('data-form',class extends BaseComponent{
  onInit(){
    console.log('onInit:this.element',this.element); // todo: remove log
    this._components = Array
        .from(this._element.elements)
        .map(elm=>component.of(elm))
        .filter(comp=>comp)
  }
  onSubmit(e){
    e.preventDefault()
    this._components.forEach(comp=>comp.double&&comp.double())
  }
})