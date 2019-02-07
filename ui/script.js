let deck = require('../taskdeck/taskdeck')()

document.addEventListener("keydown", keydown);
const cardElement = document.getElementsByClassName("card")[0];
var currentPick;

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
].map(t => deck.add({id: t[0], description: t[1], key: t[2]}));

nextTask()

function keydown(e) {
  var response;
  if(['f'].includes(e.key)) response = 0;
  if(['j'].includes(e.key)) response = 1;
  if(typeof response !== 'undefined') {
    respond(response)
  }
}

function respond(response) {
  let result = currentPick(response)
  console.log(result)
  nextTask()
}

function nextTask() {
  if(!deck.size()) {
    cardElement.innerHTML = 'done.';
    document.removeEventListener("keydown", keydown);
    console.log('done.');
    return;
  }
  let task = deck.get();
  cardElement.innerHTML = task.description;
  currentPick = deck.pick();
}
