import './node_modules/normalize.css/normalize.css'
import Vue from 'vue'
import dev from './components/dev.vue'

const vue = new Vue({
  el: '#dev-container',
  components: { dev },
})
