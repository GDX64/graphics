<template>
  <div class="container">
    <h1>This is an about page</h1>
    <span class="ball">Hello</span>
  </div>
</template>

<script lang="ts">
import popTest from '../pop/popTest'
import Vue from 'vue'

export default Vue.extend({
  mounted(){
    console.log('mounted')
    const startFunc = popTest(this.$el)
    startFunc()
  }
})
</script>

<style lang="scss" scoped>
.container{
  color: green;
}
.ball{
  position: absolute;
}
</style>