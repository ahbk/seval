const assert = require('assert')
const polygons = require('./polygons')

describe('polygons', function () {
  describe('construct', function () {
    it('returns distinct instances', function () {
      let c1 = polygons()
      let c2 = polygons()
      assert.notStrictEqual(c1, c2)
    })
    it('add cuboid', function () {
      let c = polygons()
      c.cuboid([0, 1, 2], [3, 4, 5])
      c.use(polygons => {
        assert.deepEqual(polygons[0].vectors, [ [ 0, 1, 2 ], [ 3, 1, 2 ], [ 3, 5, 2 ], [ 0, 5, 2 ] ])
        assert.deepEqual(polygons[1].vectors, [ [ 0, 1, 2 ], [ 0, 5, 2 ], [ 0, 5, 7 ], [ 0, 1, 7 ] ])
        assert.deepEqual(polygons[2].vectors, [ [ 0, 1, 2 ], [ 0, 1, 7 ], [ 3, 1, 7 ], [ 3, 1, 2 ] ])
        assert.deepEqual(polygons[3].vectors, [ [ 3, 5, 7 ], [ 0, 5, 7 ], [ 0, 1, 7 ], [ 3, 1, 7 ] ])
        assert.deepEqual(polygons[4].vectors, [ [ 3, 5, 7 ], [ 3, 1, 7 ], [ 3, 1, 2 ], [ 3, 5, 2 ] ])
        assert.deepEqual(polygons[5].vectors, [ [ 3, 5, 7 ], [ 3, 5, 2 ], [ 0, 5, 2 ], [ 0, 5, 7 ] ])
      })
      c.apply()
    })
  })
  describe('linal', function () {
    it('distance', function () {
      [
        [ [-1, 0, 0], undefined, 1 ],
        [ [1, 2, 4], [0, 0, 0], 4.58 ],
        [ [10, -2, -4], [10, 0.001, 768], 772 ],
      ].forEach(test => {
        assert.deepEqual(.01 * Math.round(100 * polygons._linal.distance(test[0], test[1])), test[2])
      })
    })
    it('transform', function () {
      [
        [ [-1, 2, 3], [ [1, 0, 0], [0, 1, 0], [0, 0, 1] ], [-1, 2, 3 ] ],
        [ [-1, 2, 3], [ [-1, 0, 0], [0, -1, 0], [0, 0, -1] ], [1, -2, -3 ] ],
      ].forEach(test => {
        assert.deepEqual(polygons._linal.transform(test[0], test[1]), test[2])
      })
    })
  })
  describe('processors', function () {
    it('center', function () {
      let c = polygons()
      c.cuboid([0, -1, -2], [3, 4, 5])
      c.center([1, 1, 1])
      c.use(polygons => {
        assert.deepEqual(polygons[0].vectors[0], [-0.5, -1, -1.5])
      })
      c.apply()
    })
  })
  describe('transforms', function () {
    it('rotate', function () {
      let c = polygons()
      var rotate, polygon
      [
        [ [Math.PI, 0, 0], [1, -1, -1] ],
        [ [0, Math.PI, 0], [-1, 1, -1] ],
        [ [0, 0, Math.PI], [-1, -1, 1] ],
        [ [Math.PI, Math.PI, Math.PI], [1, 1, 1] ],
        [ [0, 0, 0], [1, 1, 1] ],
      ].forEach(test => {
        rotate = polygons.transforms.rotate(test[0])
        polygon = new polygons._Polygon([ [1, 1, 1] ])
        rotate(polygon)
        assert.deepEqual(polygon.vectors.map(vector => vector.map(e => Math.round(e))), [ test[1] ])
      })
    })
    it('scale', function () {
      let c = polygons()
      var scale, polygon
      [
        [0, 0, 0],
        [2, 2, 2],
        [10, -1, Math.PI],
      ].forEach(test => {
        scale = polygons.transforms.scale(test)
        polygon = new polygons._Polygon([ [1, 1, 1] ])
        scale(polygon)
        assert.deepEqual(polygon.vectors, [ test ])
      })
    })
    it('transpose', function () {
      let c = polygons()
      var transpose, polygon
      [
        [ [0, 0, 0], [1, 1, 1] ],
        [ [2, 2, 2], [3, 3, 3] ],
        [ [10, -1, Math.PI], [11, 0, Math.PI + 1] ],
      ].forEach(test => {
        transpose = polygons.transforms.transpose(test[0])
        polygon = new polygons._Polygon([ [1, 1, 1] ])
        transpose(polygon)
        assert.deepEqual(polygon.vectors, [ test[1] ])
      })
    })
    it('shading', function () {
      let c = polygons()
      var shading, polygon
      [
        [ [ [1, 0, 0], [0, 1, 0], [0, 0, 0] ], [0, 0, -1], 80, [0, 0, -800], [215, 215, 215] ],
      ].forEach(test => {
        shading = polygons.transforms.shading(test[1], test[2], test[3])
        polygon = new polygons._Polygon(test[0])
        shading(polygon)
        assert.deepEqual(polygon.color, test[4])
      })
    })
  })
})
