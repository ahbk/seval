import { slideright, slideleft } from './animations'
import { fromEvent, interval, from, merge } from 'rxjs'
import { map, filter, take, tap, switchMap, scan, takeWhile } from 'rxjs/operators'

const xbuttons = function(left, right, element, callback) {
  let subscriber = merge(
    fromEvent(left, 'click').pipe(map(e => 'left')),
    fromEvent(right, 'click').pipe(map(e => 'right')),
  ).subscribe(direction => {
    let animation = {
      right: slideright(element),
      left: slideleft(element),
    }[direction]

    animation.play()

    subscriber.unsubscribe()
    callback({left: 0, right: 1}[direction])
  })
}

const xtype = function(element, callback) {

  let subscriber = fromEvent(document, 'keydown').pipe(
    map(e => ({'f': 'left', 'j': 'right'}[e.key])),
    filter(r => r != null),
  ).subscribe(direction => {

    let animation = {
      right: slideright(element),
      left: slideleft(element),
    }[direction]

    animation.play()

    subscriber.unsubscribe()
    callback({left: 0, right: 1}[direction])
  })
}

const xswipe = function(element, callback) {

  let animations = {
    right: slideright(element),
    left: slideleft(element),
  }

  let xswipe$ = swipe$of(element)
  let xswipesub = xswipe$.subscribe(grab)

  function grab(op) {
    let rs = 3
    let seek = Math.abs(op.dx) / 2
    let animation = animations[op.direction]

    animation.seek(seek)

    if(!op.last) {
      return
    }

    if(op.swipe) {
      xswipesub.unsubscribe()

      animation.play()

      callback({left: 0, right: 1}[op.direction])
    } else {
      interval(1).pipe(take(Math.floor(seek/rs))).subscribe({
        next(t) { animation.seek(seek - t * rs) },
        complete() {
          animation.seek(0)
          xswipe$.subscribe(grab)
        },
      })
    }
  }
}

function swipe$of(el) {
  return fromEvent(el, 'touchstart').pipe(

    /* Take only the first changed touch of the first touchstart-event */
    tap(e => e.preventDefault()),
    take(1),
    switchMap(e => from(e.changedTouches).pipe(take(1))),

    /**
     * Emit object for each consecutive changedTouches with same identifier as start touch
     * dx: Δ-pageX between start touch and move touch
     * last: true if this is the last move of the touch
     */ 
    switchMap(start => merge(
      fromEvent(el, 'touchmove'),
      fromEvent(el, 'touchend'),
      fromEvent(el, 'touchcancel'),
    ).pipe(

      // Get all changed touches from the touchmove
      tap(e => e.preventDefault()),
      switchMap(e => from(e.changedTouches).pipe(

        // Filter out moves that doesn't belong to the started touch
        filter(move => move.identifier === start.identifier),

        // Use switchMap's result selector to create object
      ), (e, move) => {
        return {
          dx: move.pageX - start.pageX,
          dy: move.pageY - start.pageY,
          last: e.type !== 'touchmove'
        }
      })
    )),

    /**
     * Create a representation of the swipe
     */
    scan((acc, cur) => {
      return {
        dx: cur.dx,
        dy: cur.dy,
        direction: cur.dx > 0 ? 'right' : 'left',
        swipe: Math.abs(cur.dx - acc.xpath[3]) > 10,
        xpath: [cur.dx, ...acc.xpath].slice(0, 4),
        ypath: [cur.dy, ...acc.ypath].slice(0, 4),
        last: cur.last
      }
    }, { xpath: [], ypath: [] }),

    /* Complete observable on touchend or touchcance */
    takeWhile(op => !op.last, true),
  )
}

export { xswipe, xtype, xbuttons, swipe$of }
