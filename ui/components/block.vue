<template>
  <div class="block">
    <canvas id="c"></canvas>
  </div>
</template>

<script>
import * as THREE from 'three'
import { fromEvent, merge } from 'rxjs'
import { map, filter } from 'rxjs/operators'

function getCompoundBoundingBox(group) {
  var box = null

  group.traverse(member => {
    var geometry = member.geometry
    if (geometry === undefined) return

    geometry.computeBoundingBox()

    if (box === null) {
      box = geometry.boundingBox.clone().translate(member.position)
    } else {
      box.union(geometry.boundingBox.clone().translate(member.position))
    }
  })

  return box
}

const rotate$ = fromEvent(document, 'keydown').pipe(
  map(e => ({
    u: [-1, 0, 0],
    d: [1, 0, 0],
    l: [0, 1, 0],
    r: [0, -1, 0],
    i: [0, 0, 1],
    o: [0, 0, -1],
  }[e.key])),
  filter(r => r),
)

const move$ = fromEvent(document, 'keydown').pipe(
  map(e => ({
    U: [0, 1, 0],
    D: [0, -1, 0],
    L: [-1, 0, 0],
    R: [1, 0, 0],
    I: [0, 0, 1],
    O: [0, 0, -1],
  }[e.key])),
  filter(r => r),
)

const build$ = fromEvent(document, 'keydown').pipe(
  filter(e => e.key === ' '),
  map(e => true),
)

const zoom$ = fromEvent(document, 'keydown').pipe(
  map(e => ({
    '+': 1,
    '-': -1,
  }[e.key])),
  filter(r => r),
)

function makeRedrawer(renderer, camera, scene) {
  return function() {
    let width = renderer.domElement.clientWidth
    let height = renderer.domElement.clientHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()

    if (renderer.domElement.width !== width || renderer.domElement.height !== height) {
      renderer.setSize(width, height, false);
    }

    renderer.render(scene, camera)
  }
}

function makeMover(geometry, redraw) {
  const rotation = [0, 0, 0]
  return function(delta) {
    rotation.forEach((e, i) => {
      rotation[i] = e + delta[i] / 7
    })
    let axis = new THREE.Vector3(...delta)
    geometry.rotateOnWorldAxis(axis, .1)
    redraw()
  }
}

function makeRotator(geometry, redraw) {
  const rotation = [0, 0, 0]
  return function(delta) {
    rotation.forEach((e, i) => {
      rotation[i] = e + delta[i] / 7
    })
    let axis = new THREE.Vector3(...delta)
    geometry.rotateOnWorldAxis(axis, .1)
    redraw()
  }
}

function start() {
  const canvas = document.querySelector('#c')

  const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true})

  const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 50)
  camera.position.z = 6

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xFFFFFF)

  const light = new THREE.DirectionalLight(0x888888, 1)
  light.position.set(-1, 2, 4)
  scene.add(light)


  const space = new THREE.Group()
  scene.add(space)

  const block = new THREE.Group()
  space.add(block)


  const cursor = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 1.1, 1.1),
    new THREE.MeshPhongMaterial({ color: 0x000000, opacity: 0.4, transparent: true })
  )

  space.add(cursor)

  const redraw = makeRedrawer(renderer, camera, scene)
  redraw()

  rotate$.subscribe(makeRotator(space, redraw))

  zoom$.subscribe(zoom => {
    camera.position.z += zoom / 7
    redraw()
  })

  merge(move$, rotate$).subscribe(_ => {
    let bb = new THREE.Box3().setFromObject(space)
    camera.lookAt(bb.getCenter())
    console.log(camera.view)
  })

  move$.subscribe(move => {
    cursor.position.x += move[0]
    cursor.position.y += move[1]
    cursor.position.z += move[2]
    redraw()
  })

  build$.subscribe(build => {
    block.children.forEach(cube => {
      if(!cube.position.distanceTo(cursor.position)) {
        block.remove(cube)
        build = false
      }
    })
    if(build) {
      let geometry = new THREE.BoxGeometry(1, 1, 1)
      let material = new THREE.MeshPhongMaterial({emissive: 0x882255})
      let cube = new THREE.Mesh(geometry, material)
      let edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: 0xFFFFFF })
      )
      cube.add(edges)

      cube.position.x = cursor.position.x
      cube.position.y = cursor.position.y
      cube.position.z = cursor.position.z

      block.add(cube)
    }
    redraw()
  })

}


export default {
  name: 'block',
  data () {
    return {}
  },
  methods: {
  },
  mounted: function() {
    this.$nextTick(start)
  },
}
</script>

<style>
canvas {
  display: block;
  margin: 0 auto;
  width: 600px;
  height: 600px;
  touch-action: auto;
}
</style>
