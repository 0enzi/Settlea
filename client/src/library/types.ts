import * as PIXI from "pixi.js";

export interface PortData {
  exchangeRate: {
    text: string;
    coord: [number, number];
  };
  portType: {
    text: string;
    coord: [number, number];
    size?: number;
  };
}

export interface PortRender {
  exchangeRate: {
    text: string;
    coord: [number, number];
  };
  portType: {
    text: PIXI.Sprite | string;
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
  ports: Record<string, PortData>;
  iterations: number;
  duration: string;
}
