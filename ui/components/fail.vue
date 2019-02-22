<template>
  <div class="fail">
    <h1>Fail</h1>
    <p>{{ error }}</p>
  </div>
</template>

<script>
export default {
  name: 'fail',
  props: ['error'],
  data () {
    return {}
  }
}
</script>
