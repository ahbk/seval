<template>
  <div class="intro">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
    <br />
    <button ref="start" :disabled="state !== 'ready'" @click="start">
      {{ button.text[state] }}
    </button>
  </div>
</template>

<script>
import Vue from 'vue'
import { Subject, combineLatest } from 'rxjs'
import { battery$, runner$ } from '../controller'

let mounted$ = new Subject()
let start$ = new Subject()

combineLatest(battery$, mounted$).subscribe(([battery, vm]) => {
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
  components: { },
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
    Vue.nextTick(() => {
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

.intro button {
  background-color: #28a745;
  border: 0;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
}

.intro button:hover {
  cursor: pointer;
  background-color: #218838;
}

.intro button:disabled {
  opacity: .65;
  cursor: auto;
}

.intro button:focus {
  box-shadow: 0 0 0 0.2rem rgba(40,167,69,.5);
}

.intro button:active {
  background-color: #1e7e34;
}
</style>
