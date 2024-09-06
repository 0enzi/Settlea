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

import {
  Hex,
  Layout,
  Orientation,
  Point,
  polygonCorners,
} from "../library/Hex";

import type { PortData } from "../library/types";

const width = 1200;
const height = 650;

export async function init(ctx: any): Promise<void> {
  let app: Application = ctx.app;
  const container = new Container();

  app = new Application();
  await initializeApp(app, ctx);

  await setupMap(app, container);

  // TODO: uncomment and add zoom at mouse coords
  // setupEventListeners(app, container);

  // Adding a feature to display canvas coordinates
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

  app.stage.addEventListener("pointermove", (e) => {
    text.text = `${Math.round(e.global.x * 100) / 100}, ${
      Math.round(e.global.y * 100) / 100
    }`;
  });
}

async function initializeApp(app: Application, ctx: any): Promise<void> {
  await app.init({
    background: "#1099bb",
    width: width * window.devicePixelRatio,
    height: height * window.devicePixelRatio,
    // antialias: true,
    resolution: window.devicePixelRatio,
  });
  ctx.$el.appendChild(app.canvas);
}

async function setupMap(app: Application, container: Container): Promise<void> {
  const textures = await loadAllAssets();

  setupBackground(textures["background"], container);
  centerCanvas(app);
  generateMap(textures, container);

  app.stage.addChild(container);
}

async function loadAllAssets() {
  Assets.add({ alias: "background", src: "../../assets/temp_background.png" });
  Assets.add({ alias: "wood", src: "../../assets/icons/wood.svg" });
  Assets.add({ alias: "brick", src: "../../assets/icons/brick.svg" });
  Assets.add({ alias: "sheep", src: "../../assets/icons/sheep.svg" });
  Assets.add({ alias: "wheat", src: "../../assets/icons/wheat.svg" });
  Assets.add({ alias: "ore", src: "../../assets/icons/rock.svg" });

  const assets = Assets.load([
    "wood",
    "brick",
    "sheep",
    "wheat",
    "ore",
    "background",
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
  texture.source.scaleMode = "nearest";
  const background = new Sprite(texture);
  background.anchor.set(0.5);
  background.position.set(
    (width * window.devicePixelRatio) / 2,
    (height * window.devicePixelRatio) / 2
  );
  background.scale.set(0.65);
  container.addChild(background);
}

function setupEventListeners(app: Application, container: Container): void {
  let isPanning = false;
  let lastX = 0;
  let lastY = 0;
  const panningSpeed = 1.5;
  const zoomSpeed = 0.04;
  const minZoom = 0.5;
  const maxZoom = 2.0;
  let currentScale = 1;

  window.addEventListener("wheel", (event: WheelEvent) => {
    event.preventDefault();
    const scaleChange = event.deltaY > 0 ? 1 - zoomSpeed : 1 + zoomSpeed;
    currentScale *= scaleChange;
    currentScale = Math.max(minZoom, Math.min(maxZoom, currentScale));
    container.scale.set(currentScale);
  });

  app.canvas.addEventListener("mousedown", (event: MouseEvent) => {
    isPanning = true;
    lastX = event.clientX;
    lastY = event.clientY;
  });

  app.canvas.addEventListener("mousemove", (event: MouseEvent) => {
    if (!isPanning) return;

    const deltaX = (event.clientX - lastX) * panningSpeed;
    const deltaY = (event.clientY - lastY) * panningSpeed;

    container.position.x += deltaX;
    container.position.y += deltaY;

    lastX = event.clientX;
    lastY = event.clientY;
  });

  const stopPanning = () => {
    isPanning = false;
  };

  app.canvas.addEventListener("mouseup", stopPanning);
  app.canvas.addEventListener("mouseleave", stopPanning);
}

async function generateMap(
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

  for (let q = -N; q <= N; q++) {
    for (let r = Math.max(-N, -q - N); r <= Math.min(N, -q + N); r++) {
      map.add(new Hex(q, r));
    }
  }

  for (const hex of map) {
    const corners = polygonCorners(layout, hex);
    graphics.moveTo(corners[0].x, corners[0].y);

    for (let i = 1; i < corners.length; i++) {
      graphics.lineTo(corners[i].x, corners[i].y);
    }
    graphics.lineTo(corners[0].x, corners[0].y);
    graphics.stroke({ width: 0.5, color: 0x183a37 });
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
        size: 0.125,
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
        size: 0.12,
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
