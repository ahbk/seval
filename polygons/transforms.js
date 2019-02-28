import { linal, vscalar, extension } from './utils'

// Move vectors by offset
export const transpose = offset => polygons => polygons.forEach(polygon => polygon.vectors = polygon.vectors.map(
  vector => vector.map((e, i) => e + offset[i])
))

// Rotate vectors around center by rotation array with radians for x, y and z.
export const rotate = (rotation, center) => {
  center = center || [0, 0, 0]
  return polygons => {
    polygons.forEach(polygon => {
      polygon.vectors = polygon.vectors.map(vector => linal.rotate(vector.map((e, i) => e - center[i]), rotation).map((e, i) => e + center[i]))
    })
  }
}

// Scale vectors by three dimensional scaling factor scale
export const scale = scale => {
  scale = vscalar(scale)
  return (polygons) => polygons.forEach(polygon => {
    polygon.vectors = polygon.vectors.map(vector => vector.map((e, i) => e * scale[i]))
  })
}

// Darken the color on surfaces as it deviates from a light source
export const shading = (source, intensity, observer) => polygons => polygons.forEach(polygon => {
  let normal = linal.normal(polygon.vectors[0], polygon.vectors[1], polygon.vectors[2])
  var dot = linal.dot(normal, source)

  // If surface isn't facing observer, flip it.
  if (Math.acos(linal.dot(normal, observer.map((e, i) => polygon.vectors[0][i] - e))) < Math.PI / 2) {
    dot = -dot
  }

  polygon.shade = Math.round(-2 * intensity * Math.acos(dot) / Math.PI)
})

// Sort polygons by distance to observer (closest to observer appears last)
export const zsort = observer => polygons => {
  polygons.sort((a, b) => {
    // Return the sum of the difference in distance from observer between vectors in polygon a and b
    // Why does this work? Who knows.
    let distances = [a, b].map(p => p.vectors.map(vector => linal.distance(vector, observer)))
    return distances[0].reduce((acc, cur, i) => acc + distances[1][i] - cur, 0)
  })
}

// Scale the cluster to fit in box
export const fit = (box) => {
  box = vscalar(box || 1)
  return (polygons) => {
    let ext = extension(polygons)
    let size = ext[0].map((e, i) => ext[1][i] - e)
    let _scale = Math.min(...size.map((e, i) => box[i]/e))
    if(_scale < 1) scale(_scale)(polygons)
  }
}

// Center the cluster in origin
export const center = (location) => {
  location = location || [0, 0, 0]

  return (polygons) => {
    let ext = extension(polygons)
    let offset = ext[0].map((e, i) => location[i] - (e + (ext[1][i] - e) / 2))
    transpose(offset)(polygons)
  }
}
