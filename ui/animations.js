import anime from 'animejs/lib/anime.js'

export const slideright = (targets => anime({
  targets: targets,
  easing: 'easeInSine',
  duration: 200,
  autoplay: false,
  translateX: 600,
  opacity: 0,
  rotate: 10,
}))

export const slideleft = (targets => anime({
  targets: targets,
  easing: 'easeInSine',
  duration: 200,
  autoplay: false,
  translateX: -600,
  opacity: 0,
  rotate: -10,
}))

