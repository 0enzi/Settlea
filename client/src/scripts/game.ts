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
  const texture: Texture = await Assets.load(
    "../../assets/temp_background.png"
  );

  setupBackground(texture, container);
  centerCanvas(app);
  generateMap(container);

  app.stage.addChild(container);

  // Define the structure for all port mappings
  const portMappings: Record<string, PortData> = {
    // 0: generic, 1: wood, 2: brick, 3: sheep, 4: ore
    port1: {
      exchangeRate: {
        text: "3:1",
        coord: [770, 490],
      },
      portType: {
        text: "?", // 0 represents generic in this context
        coord: [775, 465],
      },
    },
    // Add other ports similarly...
  };

  for (const portName in portMappings) {
    addPorts(portMappings[portName], container);
  }
}

function addPorts(portData: PortData, container: Container): void {
  const ratesText = new Text({
    text: portData.exchangeRate.text,
    style: { fontFamily: "Rubik" },
  });

  const typeText = new Text({
    text: portData.portType.text,
    style: { fontFamily: "Rubik", fontWeight: "bold" },
  });

  ratesText.x = portData.exchangeRate.coord[0];
  ratesText.y = portData.exchangeRate.coord[1];
  typeText.x = portData.portType.coord[0];
  typeText.y = portData.portType.coord[1];

  typeText.style.fontSize = 25;
  ratesText.style.fontSize = 20;

  container.addChild(ratesText);
  container.addChild(typeText);
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

function generateMap(container: Container): void {
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
