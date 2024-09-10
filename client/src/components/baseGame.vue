<template>
  <div class="baseGame"></div>
</template>

<script lang="ts">
import { Application } from "pixi.js";
import { init } from "../scripts/game";
// import { ApiClient } from "../library/api";

export default {
  name: "BaseGame",
  data() {
    return {
      app: new Application(),
      // api: new ApiClient("http://127.0.0.1:8000/"),
    };
  },
  async mounted() {
    await init(this);
  },
};
</script>
