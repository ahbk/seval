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
import { Subject, combineLatest, zip, from, interval } from 'rxjs'
import { tap, map, filter, delay, take, bufferCount } from 'rxjs/operators'
import { store$, tasks$, keydown$, tryout$, xswipe$of } from '../observables.js'

// Request some tasks
store$.next({
  fn: 'Task.read'
})

var _tasks
const vm = {
  tasks: [],
  rounds: 10,
}

// Emits true every time the component is mounted
const mounted$ = new Subject()

// Emits a task object and a task element when a new task is picked, group with bufferCount.
const pick$ = new Subject()

// Emits a task object when a task is solved
const solve$ = new Subject()

// When tasks are loaded, component is mounted and a tryout is created: stash tasks and pick first task.
zip(tasks$, mounted$, tryout$).subscribe(([tasks, m, t]) => {
  _tasks = tasks
  pick(1)
})

// Get next task, mark it as picked and emit on pick$
// Vue will emit element as soon as it's loaded
function pick(round) {
  let t = Object.assign({}, _tasks[Math.floor(Math.random()*_tasks.length)])
  t.order = round
  t.solved = undefined
  t.response = undefined
  t.picked = Date.now()

  vm.tasks.push(t)

  pick$.next(t)
}

// Let user interact with task and emit solve on solve-like behavior
pick$.pipe(bufferCount(2)).subscribe(([task, el]) => {

  let xswipe$ = xswipe$of(el)

  let xswipeSubscriber = xswipe$.subscribe(grab)

  let typeSubscriber = keydown$.pipe(
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

    if(!op.last) return

    if(op.swipe) {
      target.finished.then(() => solve$.next())
      target.play()
      solve$.next([task, op.direction])
      typeSubscriber.unsubscribe()
      xswipeSubscriber.unsubscribe()
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

  // These are animations for left and right response respectively
  let targets = {
    right: anime({
      targets: el,
      easing: 'easeOutExpo',
      duration: 1000,
      autoplay: false,
      translateX: 600,
      opacity: 0,
      rotate: 10,
    }),
    left: anime({
      targets: el,
      easing: 'easeOutExpo',
      duration: 1000,
      autoplay: false,
      translateX: -600,
      opacity: 0,
      rotate: -10,
    })
  }
})

// Solve task
combineLatest(tryout$, solve$.pipe(filter(v => v))).subscribe(([tryout, [task, response]]) => solve(tryout, task, response))

// Pop solved task when post-solve stuff is done
solve$.pipe(bufferCount(2)).subscribe(v => {
  vm.tasks.shift()
})

solve$.pipe(filter(v => v), delay(100)).subscribe(([task, response]) => {
  if(vm.rounds && task.order === vm.rounds) {
    end()
  } else {
    pick(task.order + 1)
  }
})

function end() {
  _tasks = undefined
  document.dispatchEvent(new Event('end-tryout'))
}

function solve(tryout, t, response) {
  t.solved = Date.now()
  t.response = response

  store$.next({
    fn: 'Solve.create',
    with: {
      tryout_id: tryout,
      task_id: t.id,
      picked: t.picked,
      solved: t.solved,
      response: response,
      order: t.order,
      correct: t.key === response ? 1 : 0,
    },
  })
}

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
          pick$.next(el)
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
  height: 74vh;
  width: 52vh;
}
</style>
