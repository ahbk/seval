<template>
  <div class="dev">
    <deck></deck>
  </div>
</template>

<script>
import deck from './deck.vue'
import touch from './touch.vue'
import { store$ } from '../observables.js'

export default {
  name: 'dev',
  components: { deck },
  data () {
    return {}
  },
}
</script>
