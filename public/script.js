let canvas = document.getElementById('rotating-block-canvas')
let context = canvas.getContext('2d')

// Center origin (assume canvas width=800 and height=500)
context.translate(400, 250)

animate()

function animate(m) {
  window.requestAnimationFrame(animate)
  context.clearRect(-400, -250, 800, 500)

  rotation = [m * .001, m * .001, m * .001]

  // Create a 200px sized voxel with center in origin and draw each side as a polygon
  voxel(-100, -100, -100, 200).forEach(polygon => draw(polygon, rotation, 800, context))
}

function voxel(x, y, z, w) {
  // Use (x, y, z) as top-left-front corner and create a square for each side with width w
  return [
    [ [x, y, z], [x + w, y, z], [x + w, y + w, z], [x, y + w, z] ], // Front
    [ [x, y, z + w], [x + w, y, z + w], [x + w, y + w, z + w], [x, y + w, z + w] ], // Back
    [ [x, y, z], [x + w, y, z], [x + w, y, z + w], [x, y, z + w] ], // Top
    [ [x, y + w, z], [x + w, y + w, z], [x + w, y + w, z + w], [x, y + w, z + w] ], // Bottom
    [ [x, y, z], [x, y, z + w], [x, y + w, z + w], [x, y + w, z] ], // Left
    [ [x + w, y, z], [x + w, y, z + w], [x + w, y + w, z + w], [x + w, y + w, z] ], // Right
  ]
}

function draw(polygon, rotation, depth, context) {
  context.beginPath()

  polygon.forEach(v => {
    // Rotate every vector 45 degrees in each dimension
    v = rotate(v, rotation)
    // Map 3d -> 2d
    context.lineTo(v[0] / (v[2] + depth) * depth, v[1] / (v[2] + depth) * depth)
  })

  context.closePath()
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
