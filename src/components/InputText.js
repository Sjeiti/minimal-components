import {component, BaseComponent} from '../js/Component'

component.create('data-input-text',class extends BaseComponent{

  _validateTimeout

  constructor(...args){
    super(...args)
    this._element.type = 'text'
    this._element.classList.add('form-control')
    /*const label = this._element.ownerDocument.createElement('label')
    label.innerText = this._options.label+' '
    this._element.parentNode.insertBefore(label,this._element)
    label.appendChild(this._element)*/
  }
  onInit(){
    this._formComponent = component.of(this._element.form)
  }
  onClick(){
    this._element.select()
  }
  onKeyup(){
    clearTimeout(this._validateTimeout)
    this._validateTimeout = setTimeout(this._validate.bind(this),200)
  }
  _parseOptions(str) {
    return Object.assign({},{validation:/^.+$/},super._parseOptions(str))
  }
  _validate(){
    this._element.classList.toggle('invalid',!this.isValid)
  }
  get isValid(){
    return this._options.validation.test(this.value)
  }
  get value(){
    return this._element.value
  }
  double(){
    this._element.value = this._element.value+this._element.value
  }
})