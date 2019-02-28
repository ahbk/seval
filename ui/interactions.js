import anime from 'animejs/lib/anime.js'
import { fromEvent, interval } from 'rxjs'
import { map, filter, take, tap, switchMap, scan, takeWhile } from 'rxjs/operators'

export function solve(task, element, callback) {
  let animeparams = {
    right: {
      easing: 'easeInSine',
      duration: 200,
      autoplay: false,
      translateX: 600,
      opacity: 0,
      rotate: 10,
    },
    left: {},
  }

  Object.assign(animeparams.left, animeparams.right)
  animeparams.left.translateX = -animeparams.right.translateX
  animeparams.left.rotate = -animeparams.right.rotate

  // These are animations for left and right response respectively
  animeparams.right.targets = animeparams.left.targets = element
  let targets = {
    right: anime(animeparams.right),
    left: anime(animeparams.left),
  }

  let xswipe$ = xswipe$of(element)
  let xswipesub = xswipe$.subscribe(grab)

  let typesub = fromEvent(document, 'keydown').pipe(
    map(e => ({'f': 'left', 'j': 'right'}[e.key])),
    filter(r => r != null),
    take(1),
  ).subscribe(direction => {
    grab({
      dx: 0,
      direction: direction,
      swipe: true,
      last: true,
    })
  })

  function grab(op) {
    let rs = 3
    let seek = Math.abs(op.dx) / 2
    let target = targets[op.direction]

    target.seek(seek)

    if(!op.last) { return }

    if(op.swipe) {
      typesub.unsubscribe()
      xswipesub.unsubscribe()

      target.play()

      callback({left: 0, right: 1}[op.direction])
    } else {
      interval(1).pipe(take(Math.floor(seek/rs))).subscribe({
        next(t) { target.seek(seek - t * rs) },
        complete() {
          target.seek(0)
          xswipe$.subscribe(grab)
        },
      })
    }
  }
}

function xswipe$of(el) {
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
        direction: cur.dx > 0 ? 'right' : 'left',
        swipe: Math.abs(cur.dx - acc.xpath[3]) > 10,
        xpath: [cur.dx, ...acc.xpath].slice(0, 4),
        last: cur.last
      }
    }, { xpath: [] }),

    /* Complete observable on touchend or touchcance */
    takeWhile(op => !op.last, true),
  )
}
