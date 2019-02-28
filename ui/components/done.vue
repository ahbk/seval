<template>
  <div class="done">
    <h1>Klar!</h1>
    <p>Du fick {{ correct }}/{{ size }} rätt.</p>
    <ol class="result">
      <li v-for="solve in solves">
        asdf
      </li>
    </ol>
  </div>
</template>

<script>
import { Subject, zip, combineLatest } from 'rxjs'
import { save$, test$ } from '../controller'

const mounted$ = new Subject()

combineLatest(test$, mounted$).subscribe(([tryout, vm]) => {
  console.log(tryout)
  vm.correct = tryout.ok.solves.reduce((acc, cur) => acc + cur.correct, 0)
  vm.size = tryout.ok.solves.length
  tryout.ok.solves.forEach(solve => vm.solves.push(solve))
})

export default {
  name: 'done',
  data () {
    return {
      correct: undefined,
      size: undefined,
      solves: [],
    }
  },
  mounted: function() {
    this.$nextTick(function() {
      mounted$.next(this)
    })
  },
}
</script>
