document.addEventListener("keydown", keydown);

const card = document.getElementsByClassName("card")[0];
const tasks = [
  ['←', 0],
  ['→', 1],
  ['→', 1],
  ['→', 1],
  ['←', 0],
  ['→', 1],
  ['←', 0],
  ['←', 0],
  ['→', 1],
  ['←', 0],
];
var answer, startTime;

nextTask();

function keydown(e) {
  if(['f'].includes(e.key)) left(answer);
  if(['j'].includes(e.key)) right(answer);
}

function nextTask() {
  if(!tasks.length) {
    card.innerHTML = 'done.';
    document.removeEventListener("keydown", keydown);
    console.log('done.');
    return;
  }
  let currentTask = tasks.pop();
  answer = currentTask[1];
  card.innerHTML = currentTask[0];
  startTime = Date.now();
}

function left(answer) {
  if(!answer) {
    correctLeft()
  } else {
    incorrectLeft();
  }
}

function right(answer) {
  if(!answer) {
    incorrectRight()
  } else {
    correctRight();
  }
}

function correctLeft() {
  console.log(`correct left swipe (${time()})`);
  nextTask();
}

function incorrectLeft() {
  console.log(`incorrect left swipe (${time()})`);
  nextTask();
}

function correctRight() {
  console.log(`correct right swipe (${time()})`);
  nextTask();
}

function incorrectRight() {
  console.log(`incorrect right swipe (${time()})`);
  nextTask();
}

function time() {
  return Date.now() - startTime;
}
