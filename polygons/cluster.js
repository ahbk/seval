export default function Cluster () {
  this.polygons = []
  this.onchange = Function.prototype

  this.add = (...polygons) => {
    polygons.forEach(polygon => this.polygons.push(polygon))
  }

  this.apply = (...transforms) => {
    transforms.forEach(transform => transform(this.polygons))
    if(typeof this.onchange === 'function') {
      this.onchange(this.polygons)
    }
  }
}
