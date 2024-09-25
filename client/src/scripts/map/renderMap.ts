import * as PIXI from "pixi.js";
import { Hex, Layout, Orientation, Point, hexToPixel } from "@/library/Hex";

import type { HexTile, PortData, PortRender } from "@/library/types";
import config from "@/config";

export async function generateMap(
  hexMap: HexTile[],
  ports: Record<string, PortData>,
  layoutPointy: Orientation,
  textures: Record<string, PIXI.Texture>,
  container: PIXI.Container
): Promise<void> {
  const map: Set<Hex> = new Set();
  const N = 2;

  const centerX = (config.width * window.devicePixelRatio) / 2;
  const centerY = (config.height * window.devicePixelRatio) / 2;

  const layout = new Layout(
    layoutPointy,
    new Point(92, 92),
    new Point(centerX, centerY)
  );
  const graphics = new PIXI.Graphics();

  const hexLookup = (q: number, r: number, s: number) => {
    return hexMap.find((tile) => tile.Q === q && tile.R === r && tile.S === s);
  };

  for (let q = -N; q <= N; q++) {
    for (let r = Math.max(-N, -q - N); r <= Math.min(N, -q + N); r++) {
      map.add(new Hex(q, r));
    }
  }

  for (const hex of hexMap) {
    const tileContainer = new PIXI.Container();

    const hexData = hexLookup(hex.Q, hex.R, hex.S);
    if (!hexData) {
      console.error(
        `No data found for hex at q=${hex.Q}, r=${hex.R}, s=${hex.S}`
      );
      continue;
    }

    const randTile = new PIXI.Sprite(textures[`${hexData.Type}_tile`]);

    const tileCenter: Point = hexToPixel(layout, hex);
    // const tile = new Sprite(textures.brick_tile);
    randTile.anchor.set(0.5);
    randTile.position.set(tileCenter.x, tileCenter.y);
    randTile.scale.set(0.47);
    tileContainer.addChild(randTile);

    if (hex.Type !== "desert") {
      const tokenNumber = new PIXI.Text({
        text: hex.Token.toString(),
        style: {
          fontFamily: "Bungee",
          fontSize: 30,
          fill: hex.Token === 6 || hex.Token === 8 ? "#FF0000" : "#183A37",
        },
      });

      const tokenPip = new PIXI.Text({
        text: "•".repeat(hex.Token === 7 ? 0 : 6 - Math.abs(7 - hex.Token)),

        style: {
          fontSize: 20,
          // red if token is 6 or 8
          fill: hex.Token === 6 || hex.Token === 8 ? "#FF0000" : "#183A37",
        },
      });

      tokenNumber.anchor.set(0.5);
      tokenPip.anchor.set(0.5);
      tokenNumber.position.set(tileCenter.x, tileCenter.y + 22);
      tokenPip.position.set(tileCenter.x, tileCenter.y + 45);

      tileContainer.addChild(tokenNumber);
      tileContainer.addChild(tokenPip);
    }

    container.addChild(tileContainer);
  }

  //  This is probably the most stupid way to do this, but id love to see better suggestions
  // const portMappings: Record<string, PortData> = {
  //   // 0: generic, 1: wood, 2: brick, 3: sheep, 4: ore
  //   port1: {
  //     exchangeRate: {
  //       text: "3:1",
  //       coord: [770, 490],
  //     },
  //     portType: {
  //       text: "?",
  //       coord: [775, 465],
  //     },
  //   },

  //   port2: {
  //     exchangeRate: {
  //       text: "2:1",
  //       coord: [933, 215],
  //     },
  //     portType: {
  //       text: PIXI.Sprite.from(textures.wood),
  //       coord: [945, 205],
  //       size: 0.039,
  //     },
  //   },

  //   port3: {
  //     exchangeRate: {
  //       text: "3:1",
  //       coord: [1255, 210],
  //     },
  //     portType: {
  //       text: PIXI.Sprite.from(textures.brick),
  //       coord: [1267, 200],
  //       size: 0.35,
  //     },
  //   },

  //   port4: {
  //     exchangeRate: {
  //       text: "3:1",
  //       coord: [1505, 355],
  //     },
  //     portType: {
  //       text: PIXI.Sprite.from(textures.sheep),
  //       coord: [1515, 345],
  //       size: 0.4,
  //     },
  //   },

  //   port5: {
  //     exchangeRate: {
  //       text: "2:1",
  //       coord: [1675, 649],
  //     },
  //     portType: {
  //       text: PIXI.Sprite.from(textures.ore),
  //       coord: [1688, 635],
  //       size: 0.04,
  //     },
  //   },

  //   port6: {
  //     exchangeRate: {
  //       text: "2:1",
  //       coord: [1492, 935],
  //     },
  //     portType: {
  //       text: PIXI.Sprite.from(textures.wheat),
  //       coord: [1505, 925],
  //       size: 0.045,
  //     },
  //   },

  //   port7: {
  //     exchangeRate: {
  //       text: "3:1",
  //       coord: [1250, 1060],
  //     },
  //     portType: {
  //       text: "?",
  //       coord: [1255, 1033],
  //     },
  //   },

  //   port8: {
  //     exchangeRate: {
  //       text: "3:1",
  //       coord: [947, 1055],
  //     },
  //     portType: {
  //       text: "?",
  //       coord: [950, 1027],
  //     },
  //   },

  //   port9: {
  //     exchangeRate: {
  //       text: "3:1",
  //       coord: [761, 788],
  //     },
  //     portType: {
  //       text: "?",
  //       coord: [765, 760],
  //     },
  //   },
  // };

  const portTextures: Record<string, PIXI.Sprite> = {
    wood: PIXI.Sprite.from(textures.wood),
    brick: PIXI.Sprite.from(textures.brick),
    sheep: PIXI.Sprite.from(textures.sheep),
    ore: PIXI.Sprite.from(textures.ore),
    wheat: PIXI.Sprite.from(textures.wheat),
  };

  const portMappings: Record<string, PortRender> = {};
  console.log(ports);

  for (const [key, value] of Object.entries(ports)) {
    console.log(value["exchangeRate"]);
    portMappings[key] = {
      exchangeRate: {
        text: value.exchangeRate.text.toString(),
        coord: value.exchangeRate.coord,
      },
      portType: {
        text:
          value.portType.text === "?" ? "?" : portTextures[value.portType.text],
        coord: value.portType.coord,
        size: value.portType.size, // Include size if it exists
      },
    };
  }

  // console.log(portMappings);

  for (const portName in portMappings) {
    addPorts(portMappings[portName], container);
  }

  container.addChild(graphics);
}

export function addPorts(
  portData: PortRender,
  container: PIXI.Container
): void {
  const ratesText = new PIXI.Text({
    text: portData.exchangeRate.text,
    style: { fontFamily: "Rubik" },
  });

  ratesText.x = portData.exchangeRate.coord[0];
  ratesText.y = portData.exchangeRate.coord[1];
  ratesText.style.fontSize = 20;
  container.addChild(ratesText);

  // if its a sprite
  if (portData.portType.text instanceof PIXI.Sprite) {
    const typeSprite = portData.portType.text as PIXI.Sprite;
    typeSprite.anchor.set(0.5);
    typeSprite.position.set(
      portData.portType.coord[0],
      portData.portType.coord[1]
    );

    typeSprite.scale.set(portData.portType.size);
    container.addChild(typeSprite);
  } else {
    const typeText = new PIXI.Text({
      text: portData.portType.text,
      style: { fontFamily: "Rubik", fontWeight: "bold" },
    });

    typeText.x = portData.portType.coord[0];
    typeText.y = portData.portType.coord[1];
    container.addChild(typeText);
  }
}

export function setupBackground(
  texture: PIXI.Texture,
  container: PIXI.Container
): void {
  texture.source.scaleMode = "linear";
  const background = new PIXI.Sprite(texture);
  background.anchor.set(0.5);
  background.position.set(
    (config.width * window.devicePixelRatio) / 2,
    (config.height * window.devicePixelRatio) / 2
  );
  background.scale.set(0.65);
  container.addChild(background);
}

export function centerCanvas(app: PIXI.Application): void {
  app.canvas.style.width = `${config.width}px`;
  app.canvas.style.height = `${config.height}px`;
  app.canvas.style.position = "absolute";
  app.canvas.style.top = "50%";
  app.canvas.style.left = "50%";
  app.canvas.style.transform = "translate(-50%, -50%)";
}
