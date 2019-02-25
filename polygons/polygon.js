import { rgbToHex, hexToRgb } from './utils'

export default function Polygon (vectors, color) {
  this.vectors = vectors
  this.color = hexToRgb(color)
  this.shade = 0

  this.fill = function() {
    return rgbToHex(this.color.map(c => c + this.shade))
  }
}
