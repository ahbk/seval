const deck = require('../tryout/deck')()
const tryout = require('../tryout/tryout')()
const anime = require('animejs/lib/anime.js')

import Vue from 'vue'
const ui = new Vue({
  el: '#tryout',
  data: {
    state: 'ready',
    tasks: [],
  },
  methods: {
    solve: function(el, done) {
      el.setAttribute('style', 'z-index: 1')
      let direction = tryout.task(el.getAttribute('task-id')).response === 0 ? -1 : 1
      anime({
        targets: el,
        easing: 'easeOutExpo',
        translateX: direction * 650,
        duration: 800,
        changeComplete: done,
      })
    },
  }
})

tryout.load([
  [0, '←', 0],
  [1, '→', 1],
  [2, '→', 1],
  [3, '→', 1],
  [4, '←', 0],
  [5, '→', 1],
  [6, '←', 0],
  [7, '←', 0],
  [8, '→', 1],
  [9, '←', 0],
])

tryout.on('start', () => ui.state = 'started')
tryout.on('done', () => ui.state = 'completed')

tryout.on('reset', () => {
  ui.state = 'ready'
  ui.tasks = []
})

tryout.on('pick', () => {
  ui.tasks.unshift(tryout.task())
  while(ui.tasks.length > 1) {
    ui.tasks.pop()
  }
})

document.addEventListener("keydown", function(e) {
  if(' ' === e.key) {
    if(!tryout.started) {
      tryout.start()
      tryout.pick()
    }
    if(tryout.completed) {
      tryout.reset()
    }
  }

  if(tryout.started && !tryout.completed) {
    if('f' === e.key) {
      tryout.solve(0)
      tryout.pick()
    }
    if('j' === e.key) {
      tryout.solve(1)
      tryout.pick()
    }
  }
})
