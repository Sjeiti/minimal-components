import {component, BaseComponent} from '../js/Component'

component.create('data-console',class extends BaseComponent{
  constructor(...args){
    super(...args)
    this._pre = document.createElement('pre')
    this._element.appendChild(this._pre)
    console.log = this.output.bind(this)
    window.addEventListener('error', (msg, url, line, col, error)=>{
      this.output(msg, url, line, col, error)
    })
    this.output('hrllo')
    Object.assign(this._pre.style,{
      width: '100%',
      backgroundColor: '#888',
      border: '1px solid gray'
    })
  }
  output(...s){
    const text = this._pre.textContent + '\n' + s.join(' ') //Array.prototype.slice.call(arguments).join(' ')
      ,split = text.split(/\n/g);
    this._pre.textContent = split.slice(Math.max(split.length-6,0)).join('\n');
  }
})
