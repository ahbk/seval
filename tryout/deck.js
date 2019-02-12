;(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory()
    : typeof define === 'function' && define.amd ? define(factory) : global.deck = factory() // eslint-disable-line
}(this, function () {
  'use strict'

  function Task(id, description, key) {
    this.id = id
    this.description = description
    this.key = key

    this.picked = this.solved = this.order = undefined

    var observers = {
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

    this.pick = (order) => {
      this.picked = Date.now()
      this.order = order
      this.on('pick')
      return this
    }

    this.solve = (response) => {
      this.response = response
      this.solved = Date.now()
      this.on('solve')
      return this
    }
  }

  function Deck() {
    const _tasks = []
    const _map = {}

    var top = 0

    this.add = (task, index) => {
      index = typeof index === 'undefined' ? _tasks.length : index
      _map[task.id] = index
      _tasks.splice(index, 0, new Task(task.id, task.description, task.key))
    }

    this.reset = () => {
      top = 0
    }
    
    this.remaining = () => {
      return _tasks.length - top
    }

    this.get = (id) => {
      let index = typeof id === 'undefined' ? top : _map[id]
      return _tasks[index]
    }

    this.pick = (id) => {
      if(this.remaining()) {
        let index = typeof id === 'undefined' ? top : _map[id]
        top++
        return _tasks[index].pick(top)
      }
    }
  }

  let _constr = () => new Deck()

  return _constr

}))
