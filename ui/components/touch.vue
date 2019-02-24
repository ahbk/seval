<template>
  <div class="touch">
		<canvas id="canvas" width="600" height="600" style="border:solid black 1px;">
			Your browser does not support canvas element.
		</canvas>
		<br>
		<br>
		Log: <pre id="log" style="border: 1px solid #ccc;"></pre>
  </div>
</template>

<script>
import { from, merge } from 'rxjs'
import { tap, map, switchMap, mergeMap, filter, takeWhile } from 'rxjs/operators'
import { touchstart$of, touchchange$of } from '../observables.js'

export default {
  name: 'touch',
  data () {
    return {}
  },
  mounted: function() {
    startup()
  }
}

var ongoingTouches = {};
var el, ctx

function startup() {
  el = document.getElementsByTagName("canvas")[0];
  ctx = el.getContext("2d");

  let touchstart$ = touchstart$of(el).pipe(switchMap(e => from(e.changedTouches), (e, touch) => [e, touch]))

  let handlers = {
    touchend: handleEnd,
    touchcancel: handleCancel,
    touchmove: handleMove,
  }

  touchstart$.subscribe(([e, start]) => handleStart(e, start))

  touchstart$.pipe(
    mergeMap(([_, start]) => touchchange$of(el).pipe(
      switchMap(e => from(e.changedTouches).pipe(filter(move => move.identifier === start.identifier)), (e, move) => [e, start, move]),
      takeWhile(([e, start, move]) => e.type === 'touchmove', true),
    )),
  ).subscribe(([e, start, move]) => handlers[e.type](e, start, move))
}


function handleStart(e, touch) {
  e.preventDefault()
  ongoingTouches[touch.identifier] = copyTouch(touch);
  var color = colorForTouch(touch);
  ctx.beginPath();
  ctx.arc(touch.pageX, touch.pageY, 4, 0, 2 * Math.PI, false);  // a circle at the start
  ctx.fillStyle = color;
  ctx.fill();
  console.log("touchstart:" + touch.identifier + ".");
}

function handleMove(e, start, touch) {
  e.preventDefault()
  var color = colorForTouch(touch);
  var idx = touch.identifier

  console.log("continuing touch "+idx);
  ctx.beginPath();
  console.log("ctx.moveTo(" + ongoingTouches[idx].pageX + ", " + ongoingTouches[idx].pageY + ");");
  ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
  console.log("ctx.lineTo(" + touch.pageX + ", " + touch.pageY + ");");
  ctx.lineTo(touch.pageX, touch.pageY);
  ctx.lineWidth = 4;
  ctx.strokeStyle = color;
  ctx.stroke();

  ongoingTouches[idx] = copyTouch(touch);  // swap in the new touch record
  console.log(".");
}

function handleEnd(e, start, touch) {
  e.preventDefault()
  log("touchend");
  var color = colorForTouch(touch);
  var idx = touch.identifier;

  ctx.lineWidth = 4;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
  ctx.lineTo(touch.pageX, touch.pageY);
  ctx.fillRect(touch.pageX - 4, touch.pageY - 4, 8, 8);  // and a square at the end
  delete ongoingTouches[idx];  // remove it; we're done
}

function handleCancel(e, start, touch) {
  e.preventDefault()
  console.log("touchcancel.");
  var idx = touch.identifier;
  delete ongoingTouches[idx];  // remove it; we're done
}

function colorForTouch(touch) {
  var t = touch.identifier * 10
  var r = t % 16;
  var g = Math.floor(t + 5) % 16;
  var b = Math.floor(t + 10) % 16;
  r = r.toString(16); // make it a hex digit
  g = g.toString(16); // make it a hex digit
  b = b.toString(16); // make it a hex digit
  var color = "#" + r + g + b;
  console.log("color for touch with identifier " + touch.identifier + " = " + color);
  return color;
}

function copyTouch(touch) {
  return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
}

function log(msg) {
  var p = document.getElementById('log');
  p.innerHTML = msg + "\n" + p.innerHTML;
}
</script>
