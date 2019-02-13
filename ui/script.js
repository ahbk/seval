const deck = require('../tryout/deck')()
const tryout = require('../tryout/tryout')()
const anime = require('animejs/lib/anime.js')
const socket = new WebSocket(`ws://${ window.location.host.split(':')[0] }:8000/ws/result/`)
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
      tryout.pick()
      anime({
        targets: el,
        easing: 'easeOutExpo',
        translateX: direction * 600,
        opacity: 0,
        duration: 500,
        changeComplete: () => {
          done()
        },
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

socket.onmessage = (e) => {
  var data = JSON.parse(e.data)
  console.log(data)
}

tryout.onstart = (e) => {
  let payload = {
    tryout: {
      started: tryout.started,
    },
  }
  socket.send(JSON.stringify(payload))
  ui.state = 'started'
}

tryout.ondone = (e) => {
  ui.state = 'completed'
}

tryout.onreset = (e) => {
  ui.state = 'ready'
  ui.tasks = []
}

tryout.onsolve = (e) => {
  ui.tasks.pop()
}

tryout.onpick = (e) => {
  ui.tasks.unshift(e.task)
}

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
    }
    if('j' === e.key) {
      tryout.solve(1)
    }
  }
})
