;(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory()
    : typeof define === 'function' && define.amd ? define(factory) : global.polygons = factory() // eslint-disable-line
}(this, function () {
  'use strict'

  function Tryout () {
    const deck = require('../tryout/deck')()
    var _tasks = []
    var subscribers = {}
    var _pick

    this.events = {
      start: 1,
      pick: 2,
      solve: 3,
      done: 4,
      reset: 5,
    }

    this.states = {
      ready: 1,
      started: 2,
      completed: 3,
    }

    this.state = this.states.ready

    this.subscribe = (event, fn) => {
      subscribers[event] = subscribers[event] || []
      subscribers[event].push(fn)
    }

    this.notify = (event) => {
      if(subscribers[event]) {
        subscribers[event].map(fn => fn())
      }
    }

    this.start = () => {
      this.state = this.states.started
      this.notify(this.events.start)
    }

    this.reset = () => {
      this.state = this.states.ready
      this.notify(this.events.reset)
      deck.reset()
      _tasks.map(t => deck.add({id: t[0], description: t[1], key: t[2]}))
    }

    this.task = () => {
      return deck.get()
    }

    this.pick = () => {
      this.notify(this.events.pick)
      _pick = deck.pick()
    }

    this.solve = (response) => {
      this.notify(this.events.solve)
      let result = _pick(response)
      console.log(result)
      if(!deck.size()) {
        this.notify(this.events.done)
        this.state = this.states.completed
      }
    }

    this.load = (tasks) => {
      tasks.map(t => deck.add({id: t[0], description: t[1], key: t[2]}))
      _tasks = _tasks.concat(tasks)
    }

  }

  let _constr = () => new Tryout()

  return _constr

}))
