;(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory()
    : typeof define === 'function' && define.amd ? define(factory) : global.polygons = factory() // eslint-disable-line
}(this, function () {
  'use strict'

  function Deck () {
    const _cards = []
    var count = 0

    this.add = (card, index) => {
      index = typeof index === 'undefined' ? _cards.length : index
      _cards.splice(index, 0, card)
    }
    
    this.size = () => {
      return _cards.length
    }

    this.get = (index) => {
      index = typeof index === 'undefined' ? 0 : index
      return _cards[index]
    }

    this.discard = (index) => {
      index = typeof index === 'undefined' ? 0 : index
      _cards.splice(index, 1)
    }

    this.replace = (card, index) => {
      _cards.splice(index, 1, card)
    }

    this.pick = (index) => {
      index = typeof index === 'undefined' ? 0 : index
      let card = _cards.splice(index, 1)[0]
      let picked = Date.now()

      count++
      
      return function(response) {
        return {
          id: card.id,
          count: count,
          picked: picked,
          solved: Date.now(),
          description: card.description,
          key: card.key,
          response: response,
        }
      }
    }
  }

  let _constr = () => new Deck()

  return _constr

}))
