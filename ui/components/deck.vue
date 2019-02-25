<template>
  <div class="deck">
    <transition-group
      name="deck"
      v-on:enter="onpick"
      >
      <task
        class="task"
        v-for="task in tasks"
        :task="task"
        :key="task.order"
        :response="task.response"
        >
      </task>
    </transition-group>
  </div>
</template>

<script>
import Vue from 'vue'
import anime from 'animejs/lib/anime.js'
import task from './task.vue'
import { Subject, combineLatest, zip, from, interval, fromEvent, range, concat, of } from 'rxjs'
import { tap, map, filter, delay, take, bufferCount, switchMap, concatMap } from 'rxjs/operators'
import { store$, battery$, xswipe$of } from '../observables.js'

var _tasks

const vm = {
  tasks: [],
  rounds: 3,
}

let animeparams = {
  right: {
    easing: 'easeInSine',
    duration: 200,
    autoplay: false,
    translateX: 600,
    opacity: 0,
    rotate: 10,
  },
  left: {},
}

Object.assign(animeparams.left, animeparams.right)
animeparams.left.translateX = -animeparams.right.translateX
animeparams.left.rotate = -animeparams.right.rotate

// Emits tryout id when created
const tryoutid$ = store$.pipe(
  filter(r => r.fn === 'Tryout.start'),
  map(r => r.ok),
)

// Emits solve when added
const solveadd$ = store$.pipe(
  filter(r => r.fn === 'Solve.add' && r.ok),
  map(r => r.order),
)

// Emits true every time the component is mounted
const mounted$ = new Subject()

// Emits a task object when a task is solved
const solve$ = new Subject()

// Emits tasks when tasks are loaded, component is mounted and a tryout is created.
const task$ = zip(battery$, mounted$, tryoutid$).pipe(
  switchMap(([battery, _, tryoutid, round]) => zip(from(battery.tasks), range(1, 3)).pipe(
  ), ([battery, _, tryoutid], [task, round]) => {
    task.order = round
    task.tryout = tryoutid
    task.picked = task.solved = task.reponse = undefined
    return task
  }),
  concatMap(task => concat(of(task), solve$.pipe(take(1)))),
)

// Get next task, mark it as picked and emit on pick$
// Vue will emit element as soon as it's loaded
task$.pipe(filter(task => !task.picked), delay(200)).subscribe(task => {
  task.picked = Date.now()
  vm.tasks.push(task)
})

// Let user interact with task and emit solve on solve-like behavior
function openforsolve(el) {
  let task = vm.tasks[0]

  // These are animations for left and right response respectively
  animeparams.right.targets = animeparams.left.targets = el
  let targets = {
    right: anime(animeparams.right),
    left: anime(animeparams.left),
  }

  let xswipe$ = xswipe$of(el)
  let xswipesub = xswipe$.subscribe(grab)

  let typesub = fromEvent(document, 'keydown').pipe(
    map(e => ({'f': 'left', 'j': 'right'}[e.key])),
    filter(r => r != null),
    take(1),
  ).subscribe(direction => {
    grab({
      dx: 0,
      direction: direction,
      swipe: true,
      last: true,
    })
  })

  function grab(op) {
    let rs = 3
    let seek = Math.abs(op.dx) / 2
    let target = targets[op.direction]

    target.seek(seek)

    if(!op.last) { return }

    if(op.swipe) {
      target.play()

      task.response = {left: 0, right: 1}[op.direction]
      task.solved = Date.now()
      solve$.next(task)

      typesub.unsubscribe()
      xswipesub.unsubscribe()
    } else {
      interval(1).pipe(take(Math.floor(seek/rs))).subscribe({
        next(t) { target.seek(seek - t * rs) },
        complete() {
          target.seek(0)
          xswipe$.subscribe(grab)
        },
      })
    }
  }
}

// Pop solved task when post-solve stuff is done
solve$.pipe(delay(300)).subscribe(v => {
  vm.tasks.shift()
})

// Store solved task
solve$.subscribe(task => {
  store$.next({
    fn: 'Solve.add',
    tryout_id: task.tryout,
    task_id: task.id,
    picked: task.picked,
    solved: task.solved,
    response: task.response,
    order: task.order,
  })
})

export default {
  name: 'deck',
  components: { task },
  data () {
    return vm
  },
  methods: {
    onpick: function(el, done) {
      el.setAttribute('style', 'opacity: 0')
      anime({
        targets: el,
        easing: 'linear',
        opacity: 1,
        duration: 300,
        changeComplete: e => {
          openforsolve(el)
        },
      })
    },
  },
  mounted: function() {
    this.$nextTick(function() {
      mounted$.next(true)
    })
  },
}
</script>

<style lang="css">
.deck {
  position: relative;
  margin: auto;

  /* A8 */
  height: 92vh;
  width: 92vw;
}
</style>
