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

type ResourceType = "sheep" | "wood" | "brick" | "ore" | "wheat" | "desert";

export interface HexTile {
  q: number;
  r: number;
  s: number;
  resource: ResourceType;
  token: number;
}

export interface HexMap {
  hex_map: HexTile[];
}
