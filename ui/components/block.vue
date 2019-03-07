<template>
  <div class="block">
    <canvas id="canvas" width="400" height="400"></canvas>
    <textarea rows="5" v-model="block" @input="reparse"></textarea>
  </div>
</template>

<script>
import Cluster from '../../polygons/cluster'
import { fit, rotate, scale, center, zsort, shading } from '../../polygons/transforms'
import { cuboid } from '../../polygons/templates'
import { projections } from '../../polygons/utils'
import { swipe$of } from '../interactions'

const vm = {
  block: '{"r":[0, 0, 0],"s":[[0, 0, 0]]}',
}

let cluster = new Cluster()
let camera = [0, 0, -500]
let perspective = projections.perspective(camera)
let transform = [
  zsort(camera),
  shading([1, -1, -1], 40, camera),
]

function grab(r) {
  let block = JSON.parse(vm.block)
  let lx = r.dx - (r.xpath[1] || 0)
  let ly = r.dy - (r.ypath[1] || 0)

  block.r[0] += Math.round(180 * (ly / 100) / Math.PI)
  block.r[1] -= Math.round(180 * (lx / 100) / Math.PI)

  vm.block = JSON.stringify(block)

  parse()

  if(r.last) {
    swipe$of(canvas).subscribe(grab)
  }
}

function parse() {
  cluster.polygons = []
  var block = ''

  try {
    block = JSON.parse(vm.block)
  } catch(error) {
    return
  }

  block.s.forEach(cube => {
    cluster.add(...cuboid(cube, 1, '#ECECEC'))
  })

  cluster.apply(
    scale(100),
    fit(200),
    center(),
    rotate(block.r.map(e => Math.PI * e / 180)),
    ...transform,
  )
}

function start() {
  let canvas = document.getElementById('canvas')
  let context = canvas.getContext('2d')

  swipe$of(canvas).subscribe(grab)

  context.translate(canvas.width/2, canvas.height/2)

  cluster.onchange = (polygons) => {
    context.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height)

    polygons.forEach(polygon => {
      context.fillStyle = polygon.fill()
      context.strokeStyle = 'white'
      context.beginPath()

      polygon.vectors.forEach(v => context.lineTo(...perspective(v)))

      context.closePath()
      context.stroke()
      context.fill()
    })
  }
  parse()
}

export default {
  name: 'block',
  data () {
    return vm
  },
  methods: {
    reparse: parse,
  },
  mounted: function() {
    this.$nextTick(start)
  },
}
</script>

<style>
.block {
}
textarea {
  width: 100%;
}
canvas {
  display: block;
  margin: 0 auto;
}
</style>
