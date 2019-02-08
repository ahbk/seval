let deck = require('../tryout/deck')();
let tryout = require('../tryout/tryout')();

document.addEventListener("keydown", keydown);
const cardElements = document.getElementsByClassName("card");
var currentTest = 0;

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
  cardElements[0].classList.remove('hidden');
  cardElements[2].classList.add('hidden');
}

function start() {
  cardElements[0].classList.add('hidden');
  cardElements[1].classList.remove('hidden');
}

function next() {
  cardElements[1].innerHTML = tryout.task().description;
}

function done() {
  cardElements[1].classList.add('hidden')
  cardElements[2].classList.remove('hidden')
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
