import {component, BaseComponent} from '../js/Component'

component.create('data-page-header',class extends BaseComponent{
  constructor(...args){
    super(...args)
    const pathname = location.pathname
    this._element.classList.add('clearfix')
    this._element.appendChild(BaseComponent.getFragment(`<nav>
      <ul class="nav navbar-nav">
        ${this._options.menu.map(([text,uri])=>`<li${uri===pathname&&' class="active"'||''}>
          <a href="${uri}">${text}</a>
        </li>`).join('')}
      </ul>
      <div data-search="{label:'',placeholder:'Search all the things'}" class="pull-right"></div>
    </nav>`))
  }
})