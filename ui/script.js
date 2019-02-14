import anime from 'animejs/lib/anime.js'
import Vue from 'vue'
import { Subject, fromEvent, concat } from 'rxjs'
import { webSocket } from 'rxjs/webSocket'
import { first, filter, map, tap, delay, takeWhile, repeat } from 'rxjs/operators'

const store = webSocket(`ws://${ window.location.host.split(':')[0] }:8000/tryout/`)
store.subscribe()

const vm = new Vue({
  el: '#tryout',
  data: {
    state: 'ready',
    tasks: [],
  },
  methods: {
    pick: function(el, done) {
      el.setAttribute('style', 'opacity: 0')
      anime({
        targets: el,
        easing: 'linear',
        opacity: 1,
        duration: 300,
        changeComplete: done,
      })
    },
    solve: function(el, done) {
      el.setAttribute('style', 'z-index: 1')
      let direction = el.getAttribute('response') === '0' ? -1 : 1
      anime({
        targets: el,
        easing: 'easeOutExpo',
        translateX: direction * 600,
        opacity: 0,
        rotate: direction * 10,
        duration: 1000,
        changeComplete: done,
      })
    },
  }
})

const tasks = [
  [1, '←', 0],
  [2, '→', 1],
  [2, '→', 1],
  [2, '→', 1],
  [1, '←', 0],
  [2, '→', 1],
  [1, '←', 0],
  [1, '←', 0],
  [2, '→', 1],
  [1, '←', 0],
]

var currentTask = 0

function nextTask() {
  let t = tasks[currentTask]
  currentTask++
  return {
    id: t[0],
    order: currentTask,
    description: t[1],
    key: t[2],
    picked: undefined,
    solved: undefined,
    response: undefined,
  }
}

const keydown$ = fromEvent(document, 'keydown')

store.next({'asdf':'asdf'})
store.subscribe(msg => console.log(msg))

let ready$ = keydown$.pipe(
  filter(e => vm.state === 'ready'),
  first(e => e.key === ' '),
  tap(e => vm.state = 'started'),
  delay(100),
  tap(() => {
    let task = nextTask()
    task.picked = Date.now()
    vm.tasks.push(task)
  }),
)

let started$ = keydown$.pipe(
  takeWhile(e => vm.state === 'started'),
  map(e => { return {'f': 0, 'j': 1}[e.key] }),
  filter(r => typeof r !== 'undefined'),
  filter(() => vm.tasks[0] && !vm.tasks[0].solved),
  tap((response) => {
    vm.tasks[0].solved = Date.now()
    vm.tasks[0].response = response
    Vue.nextTick(() => vm.tasks.pop())
  }),
  delay(100),
  filter(() => {
    if(currentTask === tasks.length) vm.state = 'completed'
    return vm.state !== 'completed'
  }),
  tap(() => {
    let task = nextTask()
    task.picked = Date.now()
    vm.tasks.push(task)
  }),
)

let completed$ = keydown$.pipe(
  filter(e => vm.state === 'completed'),
  first(e => e.key === ' '),
  tap(e => {
    vm.state = 'ready'
    currentTask = 0
  }),
)

let tryout$ = concat(ready$, started$, completed$).pipe(repeat()).subscribe()
