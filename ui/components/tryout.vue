<template>
  <div class="tryout">
    <fail v-if="error" :error="error"></fail>
    <intro v-else-if="intro"></intro>
    <deck v-else-if="deck"></deck>
    <done v-else-if="done"></done>
  </div>
</template>

<script>
import Vue from 'vue'
import intro from './intro.vue'
import deck from './deck.vue'
import done from './done.vue'
import fail from './fail.vue'
import { filter } from 'rxjs/operators'
import { store$, start$, keydown$, end$ } from '../observables'

const vm = {
  id: undefined,
  started: false,
  ended: false,
  error: false,
}

store$.subscribe({ error(err) { vm.error = 'Servern som skulle langa fram testet svarade inte.' } })

// set state to started (from ready)
start$.subscribe(start)
end$.subscribe(complete)

// set state to ready (from ended)
keydown$.pipe(
  filter(e => e.key === ' ' && vm.started && vm.ended),
).subscribe(reset)

// start tryout
function start() {
  vm.started = Date.now()

  store$.next({
    fn: 'Tryout.create',
    with: {
      started: vm.started,
    },
  })
}

// reset tryout
function reset() {
  _tasks = undefined
  vm.id = undefined
  vm.started = false
  vm.ended = false
  vm.round = 0
}

// complete tryout
function complete() {
  vm.ended = Date.now()

  store$.next({
    fn: 'Tryout.update',
    where: {
      id: vm.id,
    },
    with: {
      completed: vm.ended,
    },
  })

  store$.next({
    fn: 'Tryout.summarize',
    where: {
      id: vm.id,
    },
  })
}

export default {
  name: 'tryout',
  components: {
    intro,
    deck,
    done,
    fail,
  },
  data () {
    return vm
  },
  computed: {
    intro: function() { return !this.started && !this.ended },
    deck: function() { return this.started && !this.ended },
    done: function() { return this.started && this.ended },
  },
}
</script>

<style lang="css">
.tryout {
  padding-top: 10vh;
  height: 90vh;
  max-width: 70vh;
  margin: auto;
}

</style>
