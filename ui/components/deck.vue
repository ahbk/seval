<template>
  <div class="deck">
    <transition-group
      name="deck"
      v-on:enter="onpick"
      v-on:leave="onsolve"
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
import { Subject, combineLatest } from 'rxjs'
import { map, filter, delay, switchMap, take } from 'rxjs/operators'
import { store$, tasks$, keydown$, tryout$ } from '../observables.js'

var _tasks
const round$ = new Subject()
const vm = {
  tasks: [],
  rounds: 3,
}

let solve$ = combineLatest(
  tryout$,
  round$.pipe(
    switchMap(round => keydown$.pipe(
      map(e => ({'f': '0', 'j': '1'}[e.key])),
      filter(r => r != null),
      take(1),
      map(response => [round, response])
    ))
  )
)

solve$.subscribe(([tryout, [round, response]]) => solve(tryout, round - 1, response))
solve$.pipe(delay(200)).subscribe(([tryout, [round, response]]) => {
  if(vm.rounds && round > vm.rounds) {
    end()
  } else {
    pick(round)
  }
})

store$.next({
  fn: 'Task.read'
})

tasks$.subscribe(r => {
  _tasks = r
  pick(1)
})

function end() {
  _tasks = undefined
  document.dispatchEvent(new Event('end-tryout'))
}

function pick(round) {
  let t = _tasks[Math.floor(Math.random()*_tasks.length)]
  t.order = round
  t.solved = undefined
  t.response = undefined
  t.picked = Date.now()

  vm.tasks.push(t)
  round$.next(round + 1)
}

function solve(tryout, round, response) {
  let t = vm.tasks[0]
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

  Vue.nextTick(() => {
    vm.tasks.pop()
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
          done()
        },
      })
    },
    onsolve: function(el, done) {
      el.setAttribute('style', 'z-index: 1')
      let direction = el.getAttribute('response') === '0' ? -1 : 1
      anime({
        targets: el,
        easing: 'easeOutExpo',
        translateX: direction * 600,
        opacity: 0,
        rotate: direction * 10,
        duration: 1000,
        changeComplete: e => {
          done()
        },
      })
    },
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
