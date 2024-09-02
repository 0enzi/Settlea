// adapted from https://www.redblobgames.com/grids/hexagons/
// hexagons are the bestagons 😻
export class Hex {
  private static readonly DIRECTIONS: [number, number, number][] = [
    [1, 0, -1],
    [1, -1, 0],
    [0, -1, 1],
    [-1, 0, 1],
    [-1, 1, 0],
    [0, 1, -1],
  ];

  public q: number;
  public r: number;
  public s: number;

  constructor(q: number, r: number) {
    this.q = q;
    this.r = r;
    this.s = -q - r;
  }

  equals(other: Hex): boolean {
    return this.q === other.q && this.r === other.r && this.s === other.s;
  }

  notEquals(other: Hex): boolean {
    return !this.equals(other);
  }

  hashCode(): number {
    return (this.q * 31 + this.r) * 31 + this.s;
  }

  toString(): string {
    return `Hex(q=${this.q}, r=${this.r}, s=${this.s})`;
  }

  static getDirection(direction: number): Hex {
    if (direction < 0 || direction >= 6) {
      throw new Error("Direction must be between 0 and 5");
    }
    const dir = Hex.DIRECTIONS[direction];
    return new Hex(dir[0], dir[1]);
  }

  add(other: Hex): Hex {
    return new Hex(this.q + other.q, this.r + other.r);
  }

  subtract(other: Hex): Hex {
    return new Hex(this.q - other.q, this.r - other.r);
  }

  multiply(scalar: number): Hex {
    return new Hex(this.q * scalar, this.r * scalar);
  }

  length(): number {
    return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s)) / 2;
  }

  distanceFrom(other: Hex): number {
    return this.subtract(other).length();
  }

  getNeighbour(direction: number): Hex {
    return this.add(Hex.getDirection(direction));
  }
}

export class Point {
  constructor(
    public x: number,
    public y: number
  ) {}
}

export class Orientation {
  public forwardMatrix: number[][];
  public invMatrix: number[][];
  public startAngle: number;

  constructor(
    forwardMatrix: number[][],
    invMatrix: number[][],
    startAngle: number
  ) {
    if (
      !Array.isArray(forwardMatrix) ||
      !forwardMatrix.every(
        (row) =>
          Array.isArray(row) && row.every((val) => typeof val === "number")
      )
    ) {
      throw new Error("forwardMatrix must be a 2D array of numbers");
    }

    if (
      !Array.isArray(invMatrix) ||
      !invMatrix.every(
        (row) =>
          Array.isArray(row) && row.every((val) => typeof val === "number")
      )
    ) {
      throw new Error("invMatrix must be a 2D array of numbers");
    }

    this.forwardMatrix = forwardMatrix;
    this.invMatrix = invMatrix;
    this.startAngle = startAngle;
  }
}

export class Layout {
  public orientation: Orientation;
  public size: Point;
  public origin: Point;

  constructor(orientation: Orientation, size: Point, origin: Point) {
    this.orientation = orientation;
    this.size = size;
    this.origin = origin;
  }
}

export function hexToPixel(layout: Layout, h: Hex): Point {
  const M = layout.orientation.forwardMatrix;
  const x = (M[0][0] * h.q + M[0][1] * h.r) * layout.size.x;
  const y = (M[1][0] * h.q + M[1][1] * h.r) * layout.size.y;
  return new Point(x + layout.origin.x, y + layout.origin.y);
}

export function hexCornerOffset(layout: Layout, corner: number): Point {
  const size = layout.size;
  const angle = (2.0 * Math.PI * (layout.orientation.startAngle + corner)) / 6;
  return new Point(size.x * Math.cos(angle), size.y * Math.sin(angle));
}

export function polygonCorners(layout: Layout, h: Hex): Point[] {
  const corners: Point[] = [];
  const center = hexToPixel(layout, h);
  for (let i = 0; i < 6; i++) {
    const offset = hexCornerOffset(layout, i);
    corners.push(new Point(center.x + offset.x, center.y + offset.y));
  }
  return corners;
}
