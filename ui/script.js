const deck = require('../tryout/deck')();
const tryout = require('../tryout/tryout')();
const anime = require('animejs/lib/anime.js');
document.addEventListener("keydown", keydown);

import Vue from 'vue';
const tryoutVue = new Vue({
  el: '#tryout',
  data: {
    state: tryout.states.ready,
    tasks: [],
  },
  methods: {
    leave: function(el, done) {
      anime({
        targets: el,
        translateX: 250,
        duration: 800,
        changeComplete: done,
      });
    },
  }
});

const tasks = [
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
];

tryout.load(tasks);

tryout.subscribe(tryout.events.start, start)
tryout.subscribe(tryout.events.pick, next)
tryout.subscribe(tryout.events.done, done)
tryout.subscribe(tryout.events.reset, intro)

function intro() {
  tryoutVue.state = tryout.states.ready
  tryoutVue.tasks = []
}

function start() {
  tryoutVue.state = tryout.states.started
}

function next() {
  tryoutVue.tasks.unshift(tryout.task())
  while(tryoutVue.tasks.length > 1) {
    tryoutVue.tasks.pop()
  }
}

function done() {
  tryoutVue.state = tryout.states.completed
}

function keydown(e) {
  if(' ' === e.key) {
    if(tryout.state === tryout.states.ready) {
      tryout.start()
      tryout.pick()
    }
    if(tryout.state === tryout.states.completed) {
      tryout.reset()
    }
  }

  if(tryout.state === tryout.states.started) {

    if('f' === e.key) {
      tryout.solve(0);
      tryout.pick();
    }
    if('j' === e.key) {
      tryout.solve(1);
      tryout.pick();
    }
  }
}
