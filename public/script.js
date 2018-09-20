let canvas = document.getElementById('rotating-blocks-canvas')
let context = canvas.getContext('2d')

// Center origin (assume canvas width=800 and height=500)
context.translate(400, 250)

const cuboids = [
  cuboid([-200, -150, -121], [120, 120, 120]),
  cuboid([-10, -130, -81], [180, 180, 180])
]

// Make a list of all polygons in all cuboids
polygons = cuboids.reduce((a, v) => a.concat(v))

animate(0)

function animate(m) {
  window.requestAnimationFrame(animate)
  context.clearRect(-400, -250, 800, 500)

  rotation = [m * .001, m * .001, m * .001]
  polygons
    .map(polygon => polygon.map(v => rotate(v, rotation)))
    .sort(sort)
    .forEach(polygon => draw(polygon, 800, context))
}

function sort(pa, pb) {
  la = pa.map(v => distance(v, [0, 0, -800])).sort()
  lb = pb.map(v => distance(v, [0, 0, -800])).sort()
  return lb[0] - la[0] || lb[1] - la[1] || lb[2] - la[2] || lb[3] - la[3]
}

function distance(a, b) {
  return Math.sqrt(Math.pow(a[0]-b[0], 2) + Math.pow(a[1]-b[1], 2) + Math.pow(a[2]-b[2], 2))
}

function cuboid(p, d) {
  // Create polygons for a cuboid on p with dimensions d (p and d being three dimensional vectors)
  corners = [
    p, // 0 (left, top, front)
    [ p[0] + d[0], p[1], p[2] ], // 1 (right, top, front)
    [ p[0], p[1] + d[1], p[2] ], // 2 (left, bottom, front)
    [ p[0] + d[0], p[1] + d[1], p[2] ], // 3 (right, bottom, front)
    [ p[0], p[1], p[2] + d[2] ], // 4 (left, top, back)
    [ p[0] + d[0], p[1], p[2] + d[2] ], // 5 (right, top, back)
    [ p[0], p[1] + d[1], p[2] + d[2] ], // 6 (left, bottom, back)
    [ p[0] + d[0], p[1] + d[1], p[2] + d[2] ] // 7 (right, bottom, back)
  ]
  return [
    [ corners[0], corners[1], corners[3], corners[2] ], // Front
    [ corners[4], corners[5], corners[7], corners[6] ], // Back
    [ corners[0], corners[2], corners[6], corners[4] ], // Left
    [ corners[1], corners[3], corners[7], corners[5] ], // Right
    [ corners[0], corners[1], corners[5], corners[4] ], // Top
    [ corners[2], corners[3], corners[7], corners[6] ], // Bottom
  ]
}

function draw(polygon, depth, context) {
  context.beginPath()

  let v = 200

  context.fillStyle = `rgb(${v}, ${v}, ${v})`

  polygon.forEach(v => {
    // Map 3d -> 2d
    context.lineTo(v[0] / (v[2] + depth) * depth, v[1] / (v[2] + depth) * depth)
  })

  context.closePath()
  context.fill()
  context.stroke()
}

function transform(v, m) {
  // Return a linear transformation of vector v by transformation matrix m
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
  ]
}

function rotate(v, r) {
  // Return a rotation of vector v.
  // Parameter r is an array with three elements giving the radians for the rotation (rx, ry, rz)
  [
    [ [1, 0, 0], [0, Math.cos(r[0]), -Math.sin(r[0])], [0, Math.sin(r[0]), Math.cos(r[0])], ],
    [ [Math.cos(r[1]), 0, Math.sin(r[1])], [0, 1, 0], [-Math.sin(r[1]), 0, Math.cos(r[1])], ],
    [ [Math.cos(r[2]), -Math.sin(r[2]), 0], [Math.sin(r[2]), Math.cos(r[2]), 0], [0, 0, 1], ]
  ].forEach(m => { v = transform(v, m) })

  return v
}
