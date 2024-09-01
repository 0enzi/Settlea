<template>
  <div class="stage" @click="pop"></div>
</template>

<script lang="ts">
import { Application, Assets, Sprite } from "pixi.js";

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
    this.app = new Application();

    await this.app.init({
      background: "#1099bb",
      width: 1265,
      height: 650,
    });

    this.$el.appendChild(this.app.canvas);

    const texture = await Assets.load("https://pixijs.com/assets/bunny.png");

    const bunny = new Sprite(texture);

    bunny.anchor.set(0.5);

    bunny.x = this.app.screen.width / 2;
    bunny.y = this.app.screen.height / 2;

    this.app.stage.addChild(bunny);

    this.app.ticker.add((time) => {
      bunny.rotation += 0.1 * time.deltaTime;
    });
  },
  methods: {
    async pop() {
      console.log("pop");
    },
  },
};
</script>
