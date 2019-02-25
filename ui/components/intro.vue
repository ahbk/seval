<template>
  <div class="intro">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
    <br />
    <button id="start" :disabled="state !== 'ready'" @click="start">
      {{ button.text[state] }}
    </button>
  </div>
</template>

<script>
import Vue from 'vue'
import { Subject, zip } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { store$, tryout$, battery$ } from '../observables'

const mounted$ = new Subject()
const vm = { 
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

battery$.subscribe(r => {
  vm.state = 'ready'
  vm.title = r.title
  vm.description = r.instructions
})

zip(mounted$, battery$).subscribe(() => {
  document.getElementById('start').focus()
})

export default {
  name: 'intro',
  props: [ ],
  components: { },
  data () {
    return vm
  },
  methods: {
    start: function() {
      this.state = 'starting'
      tryout$.next('start')
    },
  },
  mounted() {
    Vue.nextTick(() => {
      mounted$.next()
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
