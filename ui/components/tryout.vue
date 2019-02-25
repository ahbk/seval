<template>
  <div class="tryout">
    <component v-bind:is="state"></component>
  </div>
</template>

<script>
import Vue from 'vue'
import loading from './loading.vue'
import intro from './intro.vue'
import deck from './deck.vue'
import done from './done.vue'
import fail from './fail.vue'
import { combineLatest } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { store$, battery$, tryout$ } from '../observables'

const vm = {
  state: 'loading',
}

store$.next({
  fn: 'Battery.get',
  code: 'mrt-pair-swipe',
})

battery$.subscribe(_ => { vm.state = 'intro' })

combineLatest(tryout$.pipe(filter(e => e === 'start')), battery$).subscribe(([e, battery]) => {
  vm.state = 'deck'

  store$.next({
    fn: 'Tryout.start',
    started: Date.now(),
    battery: battery.id,
  })
})

export default {
  name: 'tryout',
  components: {
    loading,
    intro,
    deck,
    done,
    fail,
  },
  data () {
    return vm
  },
}
</script>

<style lang="css">
.tryout {
  padding: 10px 7px 3px 7px;
  height: 100vh;
  max-width: 70vh;
  margin: auto;
}
</style>
