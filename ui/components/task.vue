<template>
  <div class="task" v-html="description">
  </div>
</template>

<script>
import { rotate, scale, center, zsort, shading, fit } from '../../polygons/transforms'
import { cuboid } from '../../polygons/templates'
import { projections, svg } from '../../polygons/utils'
import Cluster from '../../polygons/cluster'

let camera = [0, 0, -500]
let perspective = projections.perspective(camera)
let colors = ['#ECCCEC', '#CCECEC']
let transform = [
  scale(30),
  center(),
  fit(80),
  zsort(camera),
  shading([1, -1, -1], 40, camera),
]

function render(task) {
  var cluster
  var descr = ''
  let data = JSON.parse(task.data)

  if(data.b.s === 'a') { data.b.s = data.a.s }
  if(data.a.s === 'b') { data.a.s = data.b.s }

  Array(data.a, data.b).forEach((block, i) => {
    cluster = new Cluster()

    block.s.forEach(cube => {
      cluster.add(...cuboid(cube, 1, colors[i]))
    })

    cluster.apply(
      rotate(block.r.map(e => Math.PI * e / 180)),
      ...transform,
    )
    descr += `<svg viewBox="0 0 100 100"><g transform="translate(50, 50)"> ${ svg(cluster.polygons, perspective) }</g></svg>`
  })
  
  return descr
}

export default {
  name: 'task',
  props: ['task'],
  data() {
    return {}
  },
  computed: {
    description: function() {
      return render(this.task)
    }
  }
}
</script>

<style lang="css">
.task {
  position: absolute;
  background: white;

  width: 100%;
  height: 100%;
  max-width: 65vh;

  border-radius: 1vh;

  -webkit-backface-visibility: hidden;
}

svg {
  width: 45vh;
  display: block;
  margin-left: auto;
  margin-right: auto;
}
</style>
