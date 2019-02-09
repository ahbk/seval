const deck = require('../tryout/deck')();
const tryout = require('../tryout/tryout')();
document.addEventListener("keydown", keydown);

import Vue from 'vue';
const tryoutVue = new Vue({
  el: '#tryout',
  data: {
    state: tryout.states.ready,
    task: '',
    solvedTask: '',
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
}

function start() {
  tryoutVue.state = tryout.states.started
}

function next() {
  tryoutVue.solvedTask = tryoutVue.task
  tryoutVue.task = tryout.task().description;
}

function done() {
  tryoutVue.state = tryout.states.completed
}

function keydown(e) {

  if(' ' === e.key) {
    if(tryout.state === tryout.states.ready) {
      tryout.start();
      tryout.pick();
    }
    if(tryout.state === tryout.states.completed) {
      tryout.reset();
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
