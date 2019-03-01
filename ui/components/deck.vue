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
import anime from 'animejs/lib/anime.js'
import task from './task.vue'
import { Subject, zip } from 'rxjs'
import { delay } from 'rxjs/operators'
import { pick$, solve$ } from '../controller'
import { solve } from '../interactions'

const mounted$ = new Subject()
const picked$ = new Subject()
const tasks = []

mounted$.subscribe(vm => {
  vm.tasks = tasks
})

pick$.pipe(
  delay(200),
).subscribe(task => {
  tasks.push(task)
})

solve$.pipe(
  delay(300),
).subscribe(task => {
  tasks.shift()
})

zip(pick$, picked$).pipe(
  delay(200),
).subscribe(([task, element]) => {

  task.picked = Date.now()

  solve(task, element, (response) => {
    task.solved = Date.now()
    task.response = response
    solve$.next(task)
  })
})

export default {
  name: 'deck',
  components: { task },
  data () {
    return {
      tasks: [],
    }
  },
  methods: {
    onpick: function(el, done) {

      picked$.next(el)

      el.setAttribute('style', 'opacity: 0')
      anime({
        targets: el,
        easing: 'linear',
        opacity: 1,
        duration: 300,
        changeComplete: e => { done() },
      })
    },
  },
  mounted: function() {
    this.$nextTick(function() {
      mounted$.next(this)
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
