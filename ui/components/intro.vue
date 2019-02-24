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
import { store$, ready$ } from '../observables'

const vm = { 
  title: 'Piltest',
  description: 'Om pilen pekar vänster, swipa vänster, om pilen pekar höger, swipa höger.',
  state: 'loading',
  button: {
    text: {
      loading: 'Laddar test...',
      ready: 'Starta testet',
      starting: 'Startar testet...',
    },
  },
}

ready$.subscribe(r => {
  vm.state = 'ready'
  Vue.nextTick(() => {
    document.getElementById('start').focus()
  })
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
      document.dispatchEvent(new Event('start-tryout'))
    },
  },
  mounted: function() {
    this.state = 'loading'
  },
}
</script>

<style lang="css">
.intro {
  text-align: center;
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
