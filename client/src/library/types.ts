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
  Q: number;
  R: number;
  S: number;
  Type: ResourceType;
  Token: number;
}

export interface HexMap {
  hex_map: HexTile[];
}

export interface TileAPIResponse {
  tiles: HexTile[];
  iterations: number;
  duration: string;
}
