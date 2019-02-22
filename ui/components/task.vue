<template>
  <div class="task">
    {{ task.description }}
  </div>
</template>

<script>
export default {
  name: 'task',
  props: ['task'],
  data () {
    return {}
  },
}
</script>

<style lang="css">
.task {
  position: absolute;
  background: white;

  width: 100%;
  height: 100%;

  border: 5px solid black;
  border-radius: 1vh;

  padding-top: 40%;
  font-size: 200px;
  text-align: center;
  -webkit-backface-visibility: hidden;
}
</style>
