import Signal from 'signals'
import fullScreen from './fullscreen'
import resize from './resize'
import animate from './animate'
import key from './key'
import scroll from './scroll'
import {dragstart,drag,dragend} from '../signal/drag'

const
  modelLoaded = new Signal // model
  ,routeChange = new Signal // routefrom, routeto
  ,pageLoaded = new Signal // page
  ,projectLoaded = new Signal // project
  ,taxonomyHover = new Signal
  ,lineHighlighted = new Signal // from, to
  ,lockHeader = new Signal // boolean

export {
  modelLoaded
  ,routeChange
  ,pageLoaded
  ,projectLoaded
  ,taxonomyHover
  ,lineHighlighted
  ,lockHeader
  //
  ,fullScreen
  ,resize
  ,animate
  ,dragstart
  ,drag
  ,dragend
  ,key
  ,scroll
}