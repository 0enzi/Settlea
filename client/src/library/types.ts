import { Sprite } from "pixi.js";
export interface PortData {
  exchangeRate: {
    text: string;
    coord: [number, number];
  };
  portType: {
    text: string | Sprite;
    coord: [number, number];
    size?: number;
  };
}
