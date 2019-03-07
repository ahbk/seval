import { Subject, zip, from, range, concat, of, combineLatest } from 'rxjs'
import { filter, map, switchMap, concatMap, take, delay, tap, delayWhen, mergeAll, bufferCount, takeUntil, materialize } from 'rxjs/operators'
import { webSocket } from 'rxjs/webSocket'


/* Subjects */

// Used for testing
const test$ = new Subject()

// Persistent storage (use fn-property to call functions in store/models.py)
const store$ = webSocket(`ws://${ window.location.host.split(':')[0] }:8000/tryout/`)

// start tryout: { start: [ epoch ] }
// end tryout: { end: [ epoch ] }
const runner$ = new Subject()

// Used to pass component names to tryout.vue
const component$ = new Subject()

// deck.vue emits solved tasks here
const solve$ = new Subject()


/* Observables */

// Emits current tryout id
const tryout$ = store$.pipe(
  filter(r => r.fn === 'Tryout.start'),
  map(r => r.ok),
)

// Emits current battery
const battery$ = store$.pipe(
  filter(r => r.ok && r.fn === 'Battery.get'),
  map(r => r.ok),
  tap(battery => battery.size = battery.tasks.length),
)

// Emits complete tryout data (as stored) on tryout end
const save$ = zip(
  store$.pipe(
    filter(r => r.fn === 'Tryout.end' && r.ok),
    map(r => r.ok),
  ),
  battery$.pipe(
    switchMap(battery => store$.pipe(
      filter(r => r.fn === 'Solve.add'),
      map(r => r.ok),
      bufferCount(battery.size),
    )),
  )
)

// Emits every task twice.
// First task is emitted immediately, then same task when solved and then next task immediately and so on.
const task$ = battery$.pipe(
  switchMap(
    battery => zip(
      from(battery.tasks),
      range(1, battery.size)
    ),
    (battery, [task, round]) => {
      task.order = round
      task.picked = task.solved = task.reponse = undefined
      return task
    },
  ),
  concatMap(task => concat(of(task), solve$.pipe(take(1)))),
)

// Emits tasks when picked.
const pick$ = task$.pipe(
  filter(task => !task.picked),
)

/* Subscriptions */

// On battery arrival: Set component to intro.
battery$.subscribe(battery => {
  component$.next('intro')
})

// On battery arrival and tryout start: 
// 1. Set component to deck
// 2. Store battery id and start time
zip(
  battery$,
  runner$.pipe(
    filter(v => v.start),
    map(v => v.start),
  ),
).subscribe(([battery, started]) => {

  component$.next('deck')

  store$.next({
    fn: 'Tryout.start',
    battery: battery.id,
    started: started,
  })
})

// On last task solved, emit end time on runner.
combineLatest(
  battery$,
  task$.pipe(
    filter(task => task.solved),
  )
).pipe(
  filter(([battery, task]) => battery.size === task.order)
).subscribe(_ =>
  runner$.next({ end: Date.now() })
)

// On tryout id and tryout end
// Pass end time and id to store$
zip(
  tryout$,
  runner$.pipe(
    filter(v => v.end),
    map(v => v.end),
  ),
).subscribe(([id, ended]) => {
  store$.next({
    fn: 'Tryout.end',
    id: id,
    ended: ended,
  })
})

// On save
// Switch to component result
save$.pipe(
  delay(500),
).subscribe(r => {
  component$.next('done')
})

// On solve
// Pass solved task and tryout id to store$
tryout$.pipe(
  switchMap(tryoutid => solve$, (tryoutid, task) => [tryoutid, task]),
).subscribe(([tryoutid, task]) => {
  store$.next({
    fn: 'Solve.add',
    tryout_id: tryoutid,
    task_id: task.id,
    picked: task.picked,
    solved: task.solved,
    response: task.response,
    order: task.order,
  })
})

// On tryout end if not save$ completed
// Switch to component loading
runner$.pipe(
  filter(v => v.end),
  delay(500),
  takeUntil(save$),
).subscribe(v => {
  component$.next('loading')
})


export { test$, store$, runner$, component$, battery$, pick$, solve$, save$ }
