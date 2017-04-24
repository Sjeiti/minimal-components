import {component, BaseComponent} from '../js/Component'

component.create('data-filter-list',class extends BaseComponent{

  _filterTimeout

  onInit(){
    this._ul = component.of(this.element.querySelector('ul'))
    this._input = component.of(this.element.querySelector('input'))
  }

  /**
   * Staggered keyup to filtering
   */
  onKeyup(){
    clearTimeout(this._filterTimeout)
    this._filterTimeout = setTimeout(this._filterList.bind(this),300)
  }

  _filterList(){
    const text = this._input.value.toLowerCase()
    Array.from(this._ul.element.querySelectorAll('li')).forEach(li=>{
      const value = li.getAttribute('data-value'),
          textContent = value.toLowerCase(),
          hasText = textContent.includes(text)
      li.classList.toggle('hidden',!hasText)
      if (hasText) {
        li.innerHTML = value.replace(new RegExp(`(${text})`,'g'),'<strong>$1</strong>')
      } else {
        li.textContent = value
      }
    })
  }
})