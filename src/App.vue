<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">

/* RESETS */

@import 'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css';

html body {
  margin: 0;
  background: rgb(230,230,230);
  background: linear-gradient(0deg, rgba(199,199,199,1) 0%, rgba(255,255,255,1) 33%, rgba(255,255,255,1) 75%, rgba(230,230,230,1) 100%);

  * {
    padding: 0;
    margin: 0;
    position: relative;
    box-sizing: border-box;
  }
}

/* BASE */

#app {
  min-width: 100vw;
  min-height: 100vh;
  color: #2c3e50;
  font-family: 'Avenir', Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>
