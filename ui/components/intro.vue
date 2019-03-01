<template>
  <div class="intro">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
    <br />
    <button class="button" ref="start" :disabled="state !== 'ready'" @click="start">
      {{ button.text[state] }}
    </button>
  </div>
</template>

<script>
import { Subject } from 'rxjs'
import { tap, withLatestFrom } from 'rxjs/operators'
import { battery$, runner$ } from '../controller'

let mounted$ = new Subject()
let start$ = new Subject()

mounted$.pipe(withLatestFrom(battery$)).subscribe(([vm, battery]) => {
  vm.state = 'ready'
  vm.title = battery.title
  vm.description = battery.instructions

  vm.$nextTick(() => {
    vm.$refs.start.focus()
  })

  start$.subscribe(vm => {
    runner$.next({ start: Date.now() })
  })
})

export default {
  name: 'intro',
  props: [ ],
  data () {
    return { 
      title: '',
      description: '',
      state: 'loading',
      button: {
        text: {
          loading: 'Laddar test...',
          ready: 'Starta testet',
          starting: 'Startar testet...',
        },
      },
    }
  },
  methods: {
    start: function() {
      this.state = 'starting'
      start$.next(this)
    },
  },
  mounted: function() {
    this.$nextTick(() => {
      mounted$.next(this)
    })
  },
}
</script>

<style lang="css">
.intro {
  text-align: center;
  padding: 0 20px 0 20px;
}
</style>
