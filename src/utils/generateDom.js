import { generateImage } from './generateFile'

export function generateDom () {
  let element = document.createElement('div')
  element.setAttribute('style', 'width: 100%; height: 100%; background: red; border: 1px solid blue;')
  generateImage(element)
}