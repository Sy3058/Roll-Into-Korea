<template>
  <div>
    <Board />
  </div>
</template>

<script>
import Board from "./components/Board.vue";
import CityIntro from "./components/CityIntro.vue";

export default {
  name: "App",
  components: {
    Board, CityIntro
  },
};
</script>
