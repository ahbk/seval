;(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory()
    : typeof define === 'function' && define.amd ? define(factory) : global.tryout = factory() // eslint-disable-line
}(this, function () {
  'use strict'

  function Tryout () {
    const deck = require('../tryout/deck')()
    var _tasks = []
    var _task

    this.start = () => {
      this.started = Date.now()
      if(this.onstart) this.onstart({})
    }

    this.reset = () => {
      deck.reset()
      this.started = this.completed = undefined
      if(this.onreset) this.onreset({})
    }

    this.task = (id) => {
      return deck.get(id)
    }

    this.pick = (id) => {
      _task = deck.pick(id)
      if(this.onpick) this.onpick({ task: _task })
    }

    this.solve = (response, id) => {
      _task.solve(response, id)
      if(this.onsolve) this.onsolve({ task: _task })

      if(!deck.remaining()) {
        this.completed = Date.now()
        if(this.ondone) this.ondone({})
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
