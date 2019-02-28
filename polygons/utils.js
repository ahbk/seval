export const linal = {
  normal: (a, b, c) => linal.cross(a.map((e, i) => b[i] - e), a.map((e, i) => c[i] - e)).map((e, i) => a[i] + e),
  cross: (a, b) => [ a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0] ],
  dot: (a, b) => a.reduce((acc, cur, i) => acc + cur * b[i], 0) / (linal.distance(a) * linal.distance(b)),
  distance: (a, b) => Math.sqrt(a.reduce((acc, cur, i) => acc + Math.pow(cur - (b ? b[i] : 0), 2), 0)),
  transform: (a, m) => m.map(row => row.reduce((acc, cur, i) => acc + cur * a[i], 0)),
  rotate: (a, r) => [
    [ [1, 0, 0], [0, Math.cos(r[0]), -Math.sin(r[0])], [0, Math.sin(r[0]), Math.cos(r[0])] ],
    [ [Math.cos(r[1]), 0, Math.sin(r[1])], [0, 1, 0], [-Math.sin(r[1]), 0, Math.cos(r[1])] ],
    [ [Math.cos(r[2]), -Math.sin(r[2]), 0], [Math.sin(r[2]), Math.cos(r[2]), 0], [0, 0, 1] ],
  ].reduce((acc, cur) => linal.transform(acc, cur), a),
}

export const extension = polygons => {
  let ext = [
    polygons[0].vectors[0].slice(),
    polygons[0].vectors[0].slice(),
  ]

  polygons.forEach(polygon => polygon.vectors.forEach(vector => {
    vector.forEach((e, i) => {
      ext[0][i] = Math.min(ext[0][i], e)
      ext[1][i] = Math.max(ext[1][i], e)
    })
  }))

  return ext
}

export const vscalar = v => {
  return v instanceof Array ? v : Array(3).fill(v)
}

export const rgbToHex = (rgb) => {
  return '#' + rgb.map(v => (
    ('0' + Math.max(Math.min(v, 255), 0).toString(16)).slice(-2)
  )).join('')
}

export const hexToRgb = (hex) => {
  var c = parseInt(hex.replace('#', ''), 16)
  return [(c >> 16) & 255, (c >> 8) & 255, c & 255]
}

export const svg = (polygons, projection) => {
  let m = []
  var points, color
  polygons.forEach(polygon => {
    points = polygon.vectors.map(v => projection(v)).map(point => point.join(',')).join(' ')
    m.push(`<polygon points="${ points }" style="fill:${ polygon.fill() };stroke:white;stroke-width:.3" />`)
  })
  return m.join('\n')
}

export const projections = {
  planar: () => v => [v[0], v[1]],
  perspective: (camera) => v => [-camera[2] * v[0] / (v[2] - camera[2]), -camera[2] * v[1] / (v[2] - camera[2])],
}
