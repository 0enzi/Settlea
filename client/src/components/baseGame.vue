<style scoped>
@font-face {
  font-family: "Rubik";
  src: url("https://fonts.googleapis.com/css2?family=Rubik:wght@700&display=swap")
    format("ttf");
}
</style>

<template>
  <div class="baseGame"></div>
</template>

<script lang="ts">
import { Application } from "pixi.js";
import { init } from "../scripts/game";

export default {
  name: "BaseGame",
  data() {
    return {
      app: new Application(),
      colors: [
        "#ff0000",
        "#00ff00",
        "#0000ff",
        "#ffff00",
        "#ff00ff",
        "#00ffff",
        "#000000",
      ],
    };
  },
  async mounted() {
    await init(this);
  },
};
</script>
