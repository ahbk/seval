<template>
  <div class="loading">
    <p>Laddar...</p>
    <canvas id="loading-canvas" width="100" height="100"></canvas>
  </div>
</template>

<script>
import Cluster from '../../polygons/cluster'
import { rotate, scale, center, zsort, shading } from '../../polygons/transforms'
import { cuboid } from '../../polygons/templates'
import { projections } from '../../polygons/utils'

let cluster = new Cluster()
let camera = [0, 0, -500]
let perspective = projections.perspective(camera)
let transform = [
  rotate([.02, .01, .005]),
  zsort(camera),
  shading([1, -1, -1], 40, camera),
]

var play = true

cluster.polygons = cuboid([0, 0, 0], 1, '#ECECEC')
cluster.apply(scale(50), center())

function animate() {
  if (play) window.requestAnimationFrame(animate)
  cluster.apply(...transform)
}

function show() {
  let canvas = document.getElementById('loading-canvas')
  let context = canvas.getContext('2d')

  context.translate(canvas.width/2, canvas.height/2)

  cluster.onchange = (polygons) => {
    context.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height)

    polygons.forEach(polygon => {
      context.fillStyle = polygon.fill()
      context.beginPath()

      polygon.vectors.forEach(v => context.lineTo(...perspective(v)))

      context.closePath()
      context.fill()
    })
  }
}

export default {
  name: 'loading',
  data () {
    return {}
  },
  mounted: function() {
    this.$nextTick(function() {
      animate()
      show()
    })
  }
}
</script>

<style>
.loading {
  padding-top: 100px;
  text-align: center;
}
</style>
