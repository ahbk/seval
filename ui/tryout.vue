<template>
  <div id="tryout">
    <div class="deck">
      <div class="intro" v-if="!started && !completed">
        <h1>Piltest</h1>
        <p>Om pilen pekar vänster, tryck på f, om pilen pekar höger, tryck på j.</p>
        <p>Tryck på mellanslag för att starta testet.</p>
        {{test}}
      </div>
      <transition-group name="deck" v-on:enter="pick" v-on:leave="solve">
        <div
                        class="task"
                        v-if="started && !completed"
                        v-for="task in tasks"
                        :key="task.order"
                        :response="task.response"
                        >
                        {{ task.description }}
        </div>
      </transition-group>
      <div class="done" v-if="started && completed">
        <h1>Klar!</h1>
        <p>Du kom etta.</p>
        <p>Tryck på mellanslag för att komma tillbaka till början.</p>
      </div>
    </div>
  </div>
</template>

<script>
import anime from 'animejs/lib/anime.js'
export default {
  name: 'tryout',
  props: ['test', 'started', 'completed', 'tasks', 'id', 'round', 'rounds'],
  data () {
    return {
    }
  },
  methods: {
    pick: function(el, done) {
      el.setAttribute('style', 'opacity: 0')
      anime({
        targets: el,
        easing: 'linear',
        opacity: 1,
        duration: 300,
        changeComplete: done,
      })
    },
    solve: function(el, done) {
      el.setAttribute('style', 'z-index: 1')
      let direction = el.getAttribute('response') === '0' ? -1 : 1
      anime({
        targets: el,
        easing: 'easeOutExpo',
        translateX: direction * 600,
        opacity: 0,
        rotate: direction * 10,
        duration: 1000,
        changeComplete: done,
      })
    },
  }
}
</script>

<style lang="css">
#app {
  color: #56b983;
}
</style>
