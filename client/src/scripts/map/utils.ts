import * as PIXI from "pixi.js";

export async function loadAllAssets() {
  PIXI.Assets.add({ alias: "background", src: "assets/temp_background.png" });
  PIXI.Assets.add({ alias: "wood", src: "assets/icons/wood.png" });
  PIXI.Assets.add({ alias: "brick", src: "assets/icons/brick.png" });
  PIXI.Assets.add({ alias: "sheep", src: "assets/icons/sheep.png" });
  PIXI.Assets.add({ alias: "wheat", src: "assets/icons/wheat.png" });
  PIXI.Assets.add({ alias: "ore", src: "assets/icons/rock.png" });
  PIXI.Assets.add({ alias: "wood_tile", src: "assets/tiles/wood.png" });
  PIXI.Assets.add({ alias: "brick_tile", src: "assets/tiles/brick.png" });
  PIXI.Assets.add({ alias: "sheep_tile", src: "assets/tiles/sheep.png" });
  PIXI.Assets.add({ alias: "wheat_tile", src: "assets/tiles/wheat.png" });
  PIXI.Assets.add({ alias: "ore_tile", src: "assets/tiles/ore.png" });
  PIXI.Assets.add({ alias: "desert_tile", src: "assets/tiles/desert.png" });

  const assets = PIXI.Assets.load([
    "wood",
    "brick",
    "sheep",
    "wheat",
    "ore",
    "background",
    "wood_tile",
    "brick_tile",
    "sheep_tile",
    "wheat_tile",
    "ore_tile",
    "desert_tile",
  ]);

  return assets;
}
