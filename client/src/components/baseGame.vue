<template>
  <div class="container">
    <div class="baseGame"></div>
    <TemplateC class="overlay" />
  </div>
</template>

<script lang="ts">
import { Application } from "pixi.js";
import { init } from "../scripts/game";
import TemplateC from "./templateC.vue";

export default {
  name: "BaseGame",
  components: { TemplateC },

  data() {
    return {
      app: new Application(),
    };
  },
  async mounted() {
    await init(this);
  },
};
</script>

<style>
.container {
  position: static;
}

/* .baseGame canvas, */
.overlay {
  position: absolute;
}
canvas {
  border: 1px solid black;
}
</style>
