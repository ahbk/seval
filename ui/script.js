import Vue from 'vue'
import { Observable, fromEvent } from 'rxjs'
import { tap, map, filter, delay } from 'rxjs/operators'
import { webSocket } from 'rxjs/webSocket'
import tryout from './tryout.vue'

const _tasks = []
const keydown$ = fromEvent(document, 'keydown')
const next$ = property$('round').pipe(filter(v => v))
const store$ = webSocket(`ws://${ window.location.host.split(':')[0] }:8000/tryout/`)

// Set up view model
const vm = new Vue({
  el: '#tryout',
  template: '<tryout :started="started" :tasks="tasks" :completed="completed"/>',
  components: { tryout },
  data: {
    id: undefined,
    started: undefined,
    completed: undefined,
    tasks: [],
    round: 0,
    rounds: 3,
    test: 'asdf',
  },
})

// request tasks
store$.next({
  fn: 'Task.read'
})

// set state to started (from ready)
keydown$.pipe(
  filter(e => e.key === ' ' && !vm.started && !vm.completed),
).subscribe(start)

// set state to ready (from completed)
keydown$.pipe(
  filter(e => e.key === ' ' && vm.started && vm.completed),
).subscribe(reset)

// solve current task (task0)
keydown$.pipe(
  filter(e => vm.tasks[0] && !vm.tasks[0].solved),
  map(e => { return {'f': '0', 'j': '1'}[e.key] }),
  filter(r => r != null && vm.started && !vm.completed),
).subscribe(solve)

// pick a task or complete on next round
next$.pipe(delay(100)).subscribe(round => round > vm.rounds ? complete() : pick(round))

// arriving tasks
store$.pipe(
  filter(r => r.fn === 'Task.read'),
  map(r => r.ok),
).subscribe(r => r.forEach(t => _tasks.push(t)))

// arriving id
store$.pipe(
  filter(r => r.fn === 'Tryout.create'),
  map(r => r.ok),
).subscribe(id => vm.id = id)

// make a vue-property rxjs-observable
function property$(prop) {
  return new Observable(subscriber => {
    let cb = (newVal, oldVal) => {
      subscriber.next(newVal)
    }
    vm.$watch(prop, cb)
  })
}

// start tryout
function start() {
  vm.started = Date.now()
  vm.round = 1

  store$.next({
    fn: 'Tryout.create',
    with: {
      started: vm.started,
    },
  })
}

// pick next task
function pick(round) {
  let t = _tasks[Math.floor(Math.random()*_tasks.length)]
  t.order = round
  t.solved = undefined
  t.response = undefined
  t.picked = Date.now()

  vm.tasks.push(t)
}

// reset tryout
function reset() {
  vm.id = undefined
  vm.started = undefined
  vm.completed = undefined
  vm.round = 0
}

// solve current task
function solve(response) {
  let t = vm.tasks[0]
  t.solved = Date.now()
  t.response = response

  store$.next({
    fn: 'Solve.create',
    with: {
      tryout_id: vm.id,
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
    vm.round++
  })
}

// complete tryout
function complete() {
  vm.completed = Date.now()

  store$.next({
    fn: 'Tryout.update',
    where: {
      id: vm.id,
    },
    with: {
      completed: vm.completed,
    },
  })

  store$.next({
    fn: 'Tryout.summarize',
    where: {
      id: vm.id,
    },
  })
}
