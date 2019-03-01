<template>
  <div class="done">
    <h1>Klar!</h1>
    <p>Du fick {{ correct }}/{{ size }} rätt och {{ score }} poäng.</p>
    <ol class="result">
      <li v-for="solve in solves">
        <span v-if="solve.correct">rätt</span>
        <span v-else>fel</span>
        {{ solve.time }} ms ({{ solve.score }} poäng)
      </li>
    </ol>
    <button class="button" ref="restart" @click="restart">
      Kör igen
    </button>
  </div>
</template>

<script>
import { Subject, zip } from 'rxjs'
import { withLatestFrom } from 'rxjs/operators'
import { save$, store$ } from '../controller'

let mounted$ = new Subject()
let restart$ = new Subject()

mounted$.pipe(withLatestFrom(save$)).subscribe(([vm, [tryout, solves]]) => {
  vm.correct = solves.reduce((acc, cur) => acc + cur.correct, 0)
  vm.score = solves.reduce((acc, cur) => acc + cur.score, 0)
  vm.size = solves.length
  solves.forEach(solve => vm.solves.push(solve))

  vm.$nextTick(() => {
    vm.$refs.restart.focus()
  })

})

restart$.subscribe(vm => {
  store$.next({
    fn: 'Battery.get',
    code: 'mrt-pair-swipe',
  })
})

export default {
  name: 'done',
  data () {
    return {
      correct: undefined,
      score: undefined,
      size: undefined,
      solves: [],
    }
  },
  methods: {
    restart: function() {
      restart$.next(this)
    },
  },
  mounted: function() {
    this.$nextTick(function() {
      mounted$.next(this)
    })
  },
}
</script>
