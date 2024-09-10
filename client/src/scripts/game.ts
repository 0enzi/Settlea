// pixijs
import {
  Application,
  Assets,
  Sprite,
  Texture,
  Graphics,
  Container,
  BitmapText,
  Text,
} from "pixi.js";
import { Viewport } from "pixi-viewport";

// own lib
import {
  Hex,
  Layout,
  Orientation,
  Point,
  polygonCorners,
  hexToPixel,
} from "../library/Hex";
import { ApiClient } from "../library/api";

// types
import type { PortData } from "../library/types";
import type { HexMap, HexTile } from "../library/types";

const width = 1200;
const height = 650;

export async function init(ctx: any): Promise<void> {
  let app: Application = ctx.app;
  const api = new ApiClient("http://127.0.0.1:8000/");
  const container = new Container();

  app = new Application();
  const viewport = await initializeApp(app, ctx);

  await setupMap(api, app, container);

  viewport.addChild(container);

  // disp canvas coords
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;
  const text = new BitmapText({
    text: "?",
    style: {
      fontFamily: "Rubik",
      fontSize: 55,
      align: "left",
    },
  });

  text.x = 10;
  text.y = 10;

  app.stage.addChild(text);
}

async function initializeApp(app: Application, ctx: any): Promise<Viewport> {
  await app.init({
    background: "#1099bb",
    width: width * 2,
    height: height * 2,
    antialias: true,
    autoDensity: true,
    // resolution: window.devicePixelRatio,
  });
  ctx.$el.appendChild(app.canvas);

  const viewport = new Viewport({
    screenWidth: width * 2,
    screenHeight: height * 2,
    worldWidth: width,
    worldHeight: height,
    // back
    events: app.renderer.events,
  });

  app.stage.addChild(viewport);

  viewport.drag().pinch().wheel().decelerate();

  return viewport;
}

async function setupMap(
  api: ApiClient,
  app: Application,
  container: Container
): Promise<void> {
  const textures = await loadAllAssets();
  const hexMap: HexTile[] = await api
    .get<{ hex_map: HexTile[] }>("game/gen-base-map")
    .then((data) => {
      return data.hex_map;
    })
    .catch((err) => {
      console.log(err);
      return [];
    });

  console.log(hexMap);

  setupBackground(textures["background"], container);
  centerCanvas(app);
  generateMap(hexMap, textures, container);

  app.stage.addChild(container);
}

async function loadAllAssets() {
  Assets.add({ alias: "background", src: "assets/temp_background.png" });
  Assets.add({ alias: "wood", src: "assets/icons/wood.png" });
  Assets.add({ alias: "brick", src: "assets/icons/brick.png" });
  Assets.add({ alias: "sheep", src: "assets/icons/sheep.png" });
  Assets.add({ alias: "wheat", src: "assets/icons/wheat.png" });
  Assets.add({ alias: "ore", src: "assets/icons/rock.png" });
  Assets.add({ alias: "wood_tile", src: "assets/tiles/wood.png" });
  Assets.add({ alias: "brick_tile", src: "assets/tiles/brick.png" });
  Assets.add({ alias: "sheep_tile", src: "assets/tiles/sheep.png" });
  Assets.add({ alias: "wheat_tile", src: "assets/tiles/wheat.png" });
  Assets.add({ alias: "ore_tile", src: "assets/tiles/ore.png" });
  Assets.add({ alias: "desert_tile", src: "assets/tiles/desert.png" });

  const assets = Assets.load([
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

function addPorts(portData: PortData, container: Container): void {
  const ratesText = new Text({
    text: portData.exchangeRate.text,
    style: { fontFamily: "Rubik" },
  });

  ratesText.x = portData.exchangeRate.coord[0];
  ratesText.y = portData.exchangeRate.coord[1];
  ratesText.style.fontSize = 20;
  container.addChild(ratesText);

  // if its a sprite
  if (portData.portType.text instanceof Sprite) {
    const typeSprite = portData.portType.text as Sprite;
    typeSprite.anchor.set(0.5);
    typeSprite.position.set(
      portData.portType.coord[0],
      portData.portType.coord[1]
    );

    typeSprite.scale.set(portData.portType.size);
    container.addChild(typeSprite);
  } else {
    const typeText = new Text({
      text: portData.portType.text,
      style: { fontFamily: "Rubik", fontWeight: "bold" },
    });

    typeText.x = portData.portType.coord[0];
    typeText.y = portData.portType.coord[1];
    container.addChild(typeText);
  }
}

function setupBackground(texture: Texture, container: Container): void {
  texture.source.scaleMode = "linear";
  const background = new Sprite(texture);
  background.anchor.set(0.5);
  background.position.set(
    (width * window.devicePixelRatio) / 2,
    (height * window.devicePixelRatio) / 2
  );
  background.scale.set(0.65);
  container.addChild(background);
}

async function generateMap(
  hexMap: HexTile[],
  textures: Record<string, Texture>,
  container: Container
): Promise<void> {
  const map: Set<Hex> = new Set();
  const N = 2;
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

  const centerX = (width * window.devicePixelRatio) / 2;
  const centerY = (height * window.devicePixelRatio) / 2;

  const layout = new Layout(
    layoutPointy,
    new Point(92, 92),
    new Point(centerX, centerY)
  );

  const graphics = new Graphics();

  const hexLookup = (q: number, r: number, s: number) => {
    return hexMap.find((tile) => tile.q === q && tile.r === r && tile.s === s);
  };

  for (let q = -N; q <= N; q++) {
    for (let r = Math.max(-N, -q - N); r <= Math.min(N, -q + N); r++) {
      map.add(new Hex(q, r));
    }
  }

  for (const hex of hexMap) {
    const tileContainer = new Container();

    const hexData = hexLookup(hex.q, hex.r, hex.s);
    if (!hexData) {
      console.error(
        `No data found for hex at q=${hex.q}, r=${hex.r}, s=${hex.s}`
      );
      continue;
    }

    const randTile = new Sprite(textures[`${hexData.resource}_tile`]);

    const tileCenter: Point = hexToPixel(layout, hex);
    // const tile = new Sprite(textures.brick_tile);
    randTile.anchor.set(0.5);
    randTile.position.set(tileCenter.x, tileCenter.y);
    randTile.scale.set(0.47);
    tileContainer.addChild(randTile);

    if (hex.resource !== "desert") {
      const tokenNumber = new Text({
        text: hex.token.toString(),
        style: {
          fontFamily: "Bungee",
          fontSize: 35,
          fill: hex.token === 6 || hex.token === 8 ? "#FF0000" : "#183A37",
        },
      });

      const tokenPip = new Text({
        //random number from 1 to 5
        text: "•".repeat(hex.token === 7 ? 0 : 6 - Math.abs(7 - hex.token)),

        style: {
          fontSize: 16,
          // red if token is 6 or 8
          fill: hex.token === 6 || hex.token === 8 ? "#FF0000" : "#183A37",
        },
      });

      tokenNumber.anchor.set(0.5);
      tokenPip.anchor.set(0.5);
      tokenNumber.position.set(tileCenter.x, tileCenter.y + 25);
      tokenPip.position.set(tileCenter.x, tileCenter.y + 45);

      tileContainer.addChild(tokenNumber);
      tileContainer.addChild(tokenPip);
    }

    container.addChild(tileContainer);
  }

  //  This is probably the most stupid way to do this, but id love to see better suggestions
  const portMappings: Record<string, PortData> = {
    // 0: generic, 1: wood, 2: brick, 3: sheep, 4: ore
    port1: {
      exchangeRate: {
        text: "3:1",
        coord: [770, 490],
      },
      portType: {
        text: "?",
        coord: [775, 465],
      },
    },
    port2: {
      exchangeRate: {
        text: "2:1",
        coord: [933, 215],
      },
      portType: {
        text: Sprite.from(textures.wood),
        coord: [945, 205],
        size: 0.039,
      },
    },

    port3: {
      exchangeRate: {
        text: "3:1",
        coord: [1255, 210],
      },
      portType: {
        text: Sprite.from(textures.brick),
        coord: [1267, 200],
        size: 0.35,
      },
    },

    port4: {
      exchangeRate: {
        text: "3:1",
        coord: [1505, 355],
      },
      portType: {
        text: Sprite.from(textures.sheep),
        coord: [1515, 345],
        size: 0.4,
      },
    },

    port5: {
      exchangeRate: {
        text: "2:1",
        coord: [1675, 649],
      },
      portType: {
        text: Sprite.from(textures.ore),
        coord: [1688, 635],
        size: 0.04,
      },
    },
    port6: {
      exchangeRate: {
        text: "2:1",
        coord: [1492, 935],
      },
      portType: {
        text: Sprite.from(textures.wheat),
        coord: [1505, 925],
        size: 0.045,
      },
    },
    port7: {
      exchangeRate: {
        text: "3:1",
        coord: [1250, 1060],
      },
      portType: {
        text: "?",
        coord: [1255, 1033],
      },
    },
    port8: {
      exchangeRate: {
        text: "3:1",
        coord: [947, 1055],
      },
      portType: {
        text: "?",
        coord: [950, 1027],
      },
    },
    port9: {
      exchangeRate: {
        text: "3:1",
        coord: [761, 788],
      },
      portType: {
        text: "?",
        coord: [765, 760],
      },
    },
  };

  for (const portName in portMappings) {
    addPorts(portMappings[portName], container);
  }

  container.addChild(graphics);
}

function centerCanvas(app: Application): void {
  app.canvas.style.width = `${width}px`;
  app.canvas.style.height = `${height}px`;
  app.canvas.style.position = "absolute";
  app.canvas.style.top = "50%";
  app.canvas.style.left = "50%";
  app.canvas.style.transform = "translate(-50%, -50%)";
}
