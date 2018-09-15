let canvas = document.getElementById('rotating-block-canvas')
let context = canvas.getContext('2d')

// Center origin (assume canvas width=800 and height=500)
context.translate(400, 250)

// Create a 200px sized voxel with center in origin and draw each side as a polygon
voxel(-100, -100, -100, 200).forEach(polygon => draw(polygon, 800, context))

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

function draw(polygon, depth, context) {
  context.beginPath()

  polygon.forEach(v => {
    // Map 3d -> 2d
    context.lineTo(v[0] / (v[2] + depth) * depth, v[1] / (v[2] + depth) * depth)
  })

  context.closePath()
  context.stroke()
}
