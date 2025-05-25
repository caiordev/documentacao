<script setup>
import Header from './components/Header.vue'
</script>

<template>
  <div class="app">
    <Header />
    <main>
      <router-view />
    </main>
  </div>
</template>

<style>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background-color: #1a1a1a;
  color: white;
}

main {
  flex: 1;
  width: 100%;
}

/* Override some of the default Vue styles */
#app {
  max-width: 100%;
  margin: 0;
  padding: 0;
  width: 100%;
}

@media (min-width: 1024px) {
  body {
    display: block;
  }

  #app {
    display: block;
    grid-template-columns: none;
    padding: 0;
  }
}
</style>
