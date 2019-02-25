import Polygon from './polygon'
import { vscalar } from './utils'

// Create six polygons for a cuboid
export const cuboid = (position, size, ...forPolygon) => {
  size = vscalar(size)

  let polygons = []
  let add = vectors => { polygons.push(new Polygon(vectors, ...forPolygon)) }

  // Find below the three polygons in corner [0, 0, 0] (c0 as in "corner zero")
  // Corner one (c1) can be constructed by inverting c0
  // c0 + c1 = all six polygons (24 vectors) required to build a cubiod
  let c0 = [
    ['000', '100', '110', '010'],
    ['000', '010', '011', '001'],
    ['000', '001', '101', '100'] ]

  Array('1', '0').forEach(h => c0.map(s => s.map(c => position.map((p, i) => p + (c[i] === h) * size[i]))).forEach(add))

  return polygons
}
