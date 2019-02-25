import { Subject, Observable, fromEvent, zip, combineLatest, merge, from } from 'rxjs'
import { tap, map, filter, delay, take, switchMap, scan, takeWhile } from 'rxjs/operators'
import { webSocket } from 'rxjs/webSocket'

export const store$ = webSocket(`ws://${ window.location.host.split(':')[0] }:8000/tryout/`)
export const tryout$ = new Subject()
export const battery$ = store$.pipe(filter(r => r.ok && r.fn === 'Battery.get'), map(r => r.ok))

export const xswipe$of = el => fromEvent(el, 'touchstart').pipe(

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
