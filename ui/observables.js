import { Observable, fromEvent, zip, combineLatest } from 'rxjs'
import { tap, map, filter, delay } from 'rxjs/operators'
import { webSocket } from 'rxjs/webSocket'

export const keydown$ = fromEvent(document, 'keydown')
export const start$ = fromEvent(document, 'start-tryout')
export const end$ = fromEvent(document, 'end-tryout')
export const store$ = webSocket(`ws://${ window.location.host.split(':')[0] }:8000/tryout/`)
export const ready$ = store$.pipe(filter(r => r.fn === 'Task.read'))
export const tasks$ = store$.pipe(filter(r => r.fn === 'Task.read'), map(r => r.ok))
export const tryout$ = store$.pipe(filter(r => r.fn === 'Tryout.create'), map(r => r.ok))

