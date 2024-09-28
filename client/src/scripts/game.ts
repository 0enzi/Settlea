import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";

// own functions
import { generateMap, setupBackground, centerCanvas } from "./map/renderMap";
import { loadAllAssets } from "./map/utils";
import { ApiClient } from "@/library/api";
import config from "@/config";
import { Orientation } from "@/library/Hex";

// types
import type {
  HexTile,
  Corner,
  TileAPIResponse,
  PortData,
} from "@/library/types";

export async function init(ctx: any): Promise<void> {
  // init pixijs
  let app: PIXI.Application = ctx.app;
  const api = new ApiClient(config.apiUrl);
  const container = new PIXI.Container();

  app = new PIXI.Application();
  const viewport = await initializeApp(app, ctx);

  await setupMap(api, app, container);

  viewport.addChild(container);
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  // draw up the tiles and call functions to handle structures
  async function setupMap(
    api: ApiClient,
    app: PIXI.Application,
    container: PIXI.Container
  ): Promise<void> {
    const textures = await loadAllAssets();

    const layoutPointy = new Orientation(
      [
        [Math.sqrt(3.0), Math.sqrt(3.0) / 2.0],
        [0.0, 3.0 / 2.0],
      ],
      [
        [Math.sqrt(3.0) / 3.0, -1.0 / 3.0],
        [0.0, 2.0 / 3.0],
      ],
      0.5
    );

    const response = await api
      .get<TileAPIResponse>("game/generate-base-board")
      .then((data) => {
        return data;
      });

    const hexMap: HexTile[] = response.tiles;
    const hexCorners: Corner[] = response.corners;
    const ports: Record<string, PortData> = response.ports;

    setupBackground(textures["background"], container);
    centerCanvas(app);
    generateMap(
      app,
      hexMap,
      hexCorners,
      ports,
      layoutPointy,
      textures,
      container
    );

    app.stage.addChild(container);
  }
}

async function initializeApp(
  app: PIXI.Application,
  ctx: any
): Promise<Viewport> {
  await app.init({
    background: "#1099bb",
    width: config.width * 2,
    height: config.height * 2,
    antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio,
  });
  ctx.$el.appendChild(app.canvas);

  const viewport = new Viewport({
    screenWidth: config.width * 2,
    screenHeight: config.height * 2,
    worldWidth: config.width,
    worldHeight: config.height,
    // back
    events: app.renderer.events,
  });

  app.stage.addChild(viewport);
  viewport.drag().pinch().wheel();
  return viewport;
}
