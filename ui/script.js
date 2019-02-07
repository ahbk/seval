let deck = require('../taskdeck/taskdeck')()

document.addEventListener("keydown", keydown);
const cardElements = document.getElementsByClassName("card");
var currentPick, next;
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

function keydown(e) {
  next = false;

  if(' ' === e.key) {
    if(currentTest === 0) {
      deck.reset();
      tasks.map(t => deck.add({id: t[0], description: t[1], key: t[2]}));
      currentTest = 1;
      cardElements[0].classList.add('hidden');
      cardElements[1].classList.remove('hidden');
      next = true;
    }
    if(currentTest === 2) {
      currentTest = 0;
      cardElements[2].classList.add('hidden');
      cardElements[0].classList.remove('hidden');
      return;
    }
  }

  if(currentTest === 1) {
    var response, result;

    if('f' === e.key) {
      next = true;
      result = currentPick(0)
    }
    if('j' === e.key) {
      next = true;
      result = currentPick(1)
    }

    if(next) {
      if(!deck.size()) {
        cardElements[1].classList.add('hidden')
        cardElements[2].classList.remove('hidden')

        currentTest = 2;
        currentPick = undefined;
        return;
      }
      let task = deck.get();
      cardElements[1].innerHTML = task.description;
      currentPick = deck.pick();
    }
  }
}
