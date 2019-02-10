;(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory()
    : typeof define === 'function' && define.amd ? define(factory) : global.polygons = factory() // eslint-disable-line
}(this, function () {
  'use strict'

  function Tryout () {
    const deck = require('../tryout/deck')()
    var _tasks = []
    var _task

    var observers = {
      'start': [],
      'done': [],
      'reset': [],
      'pick': [],
      'solve': [],
    }

    this.on = (event, fn) => {
      if(typeof fn === 'undefined') {
        observers[event].map(fn => fn())
      } else {
        observers[event].push(fn)
      }
    }

    this.start = () => {
      this.on('start')
      this.started = Date.now()
    }

    this.reset = () => {
      this.on('reset')
      deck.reset()
      this.started = this.completed = undefined
    }

    this.task = (id) => {
      return deck.get(id)
    }

    this.pick = (id) => {
      this.on('pick')
      _task = deck.pick(id)
    }

    this.solve = (response, id) => {
      this.on('solve')
      let result = _task.solve(response, id)
      if(!deck.remaining()) {
        this.on('done')
        this.completed = Date.now()
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
