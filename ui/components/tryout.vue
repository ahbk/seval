<template>
  <div class="tryout">
    <component v-bind:is="component"></component>
  </div>
</template>

<script>
import loading from './loading.vue'
import intro from './intro.vue'
import deck from './deck.vue'
import done from './done.vue'
import fail from './fail.vue'
import { component$, store$, battery$ } from '../controller'

const vm = {
  component: 'loading'
}

component$.subscribe(c => vm.component = c)

store$.next({
  fn: 'Battery.get',
  test: 'mrt-pair',
  battery: 'default',
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
