// pixijs
import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";

// own functions
import { generateMap, setupBackground, centerCanvas } from "./map/renderMap";
import { loadAllAssets } from "./map/utils";
import { ApiClient } from "@/library/api";
import config from "@/config";
import { polygonCorners, Orientation, Point, Layout } from "@/library/Hex";

// types
import type { HexTile, TileAPIResponse } from "@/library/types";

export async function init(ctx: any): Promise<void> {
  let app: PIXI.Application = ctx.app;
  const api = new ApiClient(config.apiUrl);
  const container = new PIXI.Container();

  app = new PIXI.Application();
  const viewport = await initializeApp(app, ctx);

  await setupMap(api, app, container);

  viewport.addChild(container);
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

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
    // const hexMap: HexTile[] = await api
    //   .get<{ hex_map: HexTile[] }>("game/generate-base-board")
    //   .then((data) => {
    //     console.log(data);
    //     // return data.hex_map;
    //     return [];
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     return [];
    //   });

    const hexMap: HexTile[] = await api
      .get<TileAPIResponse>("game/generate-base-board")
      .then((data) => {
        return data.tiles;
      })
      .catch((err) => {
        console.log(err);
        return [];
      });

    setupBackground(textures["background"], container);
    centerCanvas(app);
    generateMap(hexMap, layoutPointy, textures, container);
    placeStructures(hexMap, layoutPointy, container);

    app.stage.addChild(container);
  }

  function placeStructures(
    hexMap: HexTile[],
    layoutPointy: Orientation,
    container: PIXI.Container
  ): void {
    const uniquePoints = new Set<string>(); // Set to store unique points
    const layout = new Layout(
      layoutPointy,
      new Point(92, 92),
      new Point(
        (config.width * window.devicePixelRatio) / 2,
        (config.height * window.devicePixelRatio) / 2
      )
    );
    console.log(
      (config.width * window.devicePixelRatio) / 2,
      (config.height * window.devicePixelRatio) / 2
    );
    for (const hex of hexMap) {
      polygonCorners(layout, hex).forEach((point: Point) => {
        const roundedX = Math.round(point.x * 1000) / 1000;
        const roundedY = Math.round(point.y * 1000) / 1000;
        const pointKey = `${roundedX},${roundedY}`;
        uniquePoints.add(pointKey);
      });
    }

    const cornerContainers: PIXI.Container[] = [];

    uniquePoints.forEach((pointKey) => {
      const point = pointKey.split(",").map((x) => parseInt(x));
      const circle = new PIXI.Graphics();
      const cornerContainer = new PIXI.Container();
      const drawCirc = (alpha: number) => {
        circle.clear();
        circle.circle(0, 0, 21);
        circle.fill({ color: 0xffffff, alpha: alpha });
        circle.stroke({ color: 0x000 });
      };
      cornerContainer.interactive = true;
      cornerContainer.cursor = "pointer";

      drawCirc(0.2);

      cornerContainer.position.set(point[0], point[1]);
      cornerContainer.addChild(circle);
      container.addChild(cornerContainer);
      cornerContainers.push(cornerContainer);

      cornerContainer.on("mouseover", () => {
        drawCirc(0.8);
      });

      cornerContainer.on("mouseout", () => {
        drawCirc(0.2);
      });

      cornerContainer.on("click", () => {
        console.log("clicked on ", pointKey);
      });
    });

    // const scaleDirection = 1;
    const minScale = 0.8;
    const maxScale = 1.2;
    const scaleSpeed = 0.008;

    app.ticker.add(() => {
      cornerContainers.forEach((container) => {
        // Ensure container has a scaleDirection property
        if (!("scaleDirection" in container)) {
          (container as any).scaleDirection = 1;
        }

        const scaleDirection = (container as any).scaleDirection;

        container.scale.x += scaleDirection * scaleSpeed;
        container.scale.y += scaleDirection * scaleSpeed;

        if (container.scale.x >= maxScale || container.scale.x <= minScale) {
          (container as any).scaleDirection *= -1;
        }
      });
    });
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
    // resolution: window.devicePixelRatio,
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
