<template>
  <div class="container">
    <div class="baseGame">
      <ChatBox class="chat-box" />
    </div>
  </div>
</template>

<script lang="ts">
import { Application } from "pixi.js";
import { init } from "../scripts/game";
import ChatBox from "./chatBox.vue";

export default {
  name: "BaseGame",

  data() {
    return {
      app: new Application(),
    };
  },
  components: {
    ChatBox,
  },
  async mounted() {
    await init(this);
  },
};
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* Prevent scrolling */
}

.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden; /* Lock content within the viewport */
}

.baseGame {
  width: 1200px;
  height: 650px;
  position: relative;
}

.chat-box {
  width: 21%;
  height: 40%;
  position: absolute;
  bottom: 0; /* Move to the bottom of baseGame */
  right: 0; /* Move to the right of baseGame */
  z-index: 10;
}
</style>
