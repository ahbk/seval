<template>
  <div class="deck">
    <transition-group name="deck" v-on:enter="onpick">
      <task
        class="task"
        v-for="task in tasks"
        :task="task"
        :key="task.order"
        :response="task.response"
        >
      </task>
    </transition-group>
    <button ref="left" class="left">❌</button>
    <button ref="right" class="right">✓</button>
  </div>
</template>

<script>
import anime from 'animejs/lib/anime.js'
import task from './task.vue'
import { Subject, zip } from 'rxjs'
import { delay } from 'rxjs/operators'
import { pick$, solve$ } from '../controller'
import { xswipe, xtype, xbuttons } from '../interactions'

const mounted$ = new Subject()
const picked$ = new Subject()
const tasks = []
const buttons = {
  left: undefined,
  right: undefined,
}

mounted$.subscribe(vm => {
  vm.tasks = tasks
  buttons.left = vm.$refs.left
  buttons.right = vm.$refs.right
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

  let solve = response => {
    task.solved = Date.now()
    task.response = response
    solve$.next(task)
  }

  xbuttons(buttons.left, buttons.right, element, solve)
  xtype(element, solve)
  xswipe(element, solve)
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

<style scoped>
.deck {
  position: relative;
  margin: auto;
  height: 90vh;
}
button {
  position: absolute;
  bottom: 0;
  font-size: 40px;
  border: none;
  background-color: white;
}
.left {
  left: 0;
  color: red;
}

.right {
  right: 0;
  color: green;
}
</style>
