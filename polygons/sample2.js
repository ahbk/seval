let polygons = require('../polygons/polygons')
let cluster = polygons()
let canvas = document.getElementById('mrt-canvas')
let context = canvas.getContext('2d')
var depth

resize()
window.addEventListener('resize', resize)

let block_a = [
  [0, 0, 0],
  [0, 0, 1],
  [-1, 0, 1],
  [-2, 0, 1],
  [-3, 0, 1],
  [-3, 1, 1],
  [-3, 1, 2],
  [-3, 1, 3],
]
let block_b = [
  [0, 0, 0],
  [0, 1, 0],
  [0, 2, 0],
  [1, 2, 0],
]

block_a.forEach(c => polygons.templates.cuboid(c, [1, 1, 1], 'a', [240, 220, 220])(cluster.add))
block_b.forEach(c => polygons.templates.cuboid(c, [1, 1, 1], 'b', [220, 220, 240])(cluster.add))

cluster.apply(polygons.transforms.bundle([
  [ polygons.transforms.scale([100, 100, 100]), false ],
  [ polygons.transforms.center([0, -300, 100]), p => p.name === 'a' ],
  [ polygons.transforms.rotate([Math.PI / 4, Math.PI / 4, 0], [0, -300, 100]), p => p.name === 'a' ],
  [ polygons.transforms.center([0, 300, 100]), p => p.name === 'b' ],
  [ polygons.transforms.rotate([Math.PI / 8, Math.PI / 8, Math.PI / 5], [0, 300, 100]), p => p.name === 'b' ],
  [ polygons.transforms.zsort([0, 0, -depth]), false ],
  [ draw, false ],
]))

function resize() {
  canvas.width  = canvas.offsetWidth
  canvas.height = canvas.offsetHeight
  depth = Math.max(canvas.width, canvas.height)
  context.translate(canvas.width / 2, canvas.height / 2)
  console.log(`New canvas dimensions: ${canvas.width}, ${canvas.height}`)
  cluster.apply(draw)

}

function draw (polygons) {
  context.clearRect(0, 0, canvas.width, canvas.height)
  polygons.forEach(polygon => {
    context.fillStyle = `rgb(${polygon.color[0]}, ${polygon.color[1]}, ${polygon.color[2]})`
    context.strokeStyle = 'white'
    context.beginPath()

    polygon.vectors.forEach(v => context.lineTo(depth * v[0] / (v[2] + depth), depth * v[1] / (v[2] + depth)))

    context.closePath()
    context.fill()
    context.stroke()
  })
}
