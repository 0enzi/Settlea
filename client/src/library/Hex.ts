// adapted from https://www.redblobgames.com/grids/hexagons/
export class Hex {
    private static readonly DIRECTIONS: [number, number, number][] = [
        [1, 0, -1],
        [1, -1, 0],
        [0, -1, 1],
        [-1, 0, 1],
        [-1, 1, 0],
        [0, 1, -1]
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
        return `${this.q},${this.r},${this.s}`.split('').reduce((hash, char) => {
            return Math.imul(31, hash) + char.charCodeAt(0) | 0;
        }, 0);
    }

    toString(): string {
        return `Hex(q=${this.q}, r=${this.r}, s=${this.s})`;
    }

    static toHex(direction: [number, number, number]): Hex {
        return new Hex(direction[0], direction[1]);
    }

    add(other: Hex): Hex {
        return new Hex(this.q + other.q, this.r + other.r);
    }

    subtract(other: Hex): Hex {
        return new Hex(this.q - other.q, this.r - other.r);
    }

    multiply(other: Hex): Hex {
        return new Hex(this.q * other.q, this.r * other.r);
    }

    length(): number {
        return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s)) / 2;
    }

    distanceFrom(other: Hex): number {
        return this.subtract(other).length();
    }

    getDirection(direction: number): Hex {
        if (direction < 0 || direction >= 6) {
            throw new Error("Direction must be between 0 and 5");
        }
        return Hex.toHex(Hex.DIRECTIONS[direction]);
    }

    getNeighbour(direction: number): Hex {
        return this.add(this.getDirection(direction));
    }
}

class Point {
    constructor(public x: number, public y: number) {}
}

export class Orientation {
    public forwardMatrix: number[][];
    public invMatrix: number[][];
    public startAngle: number;

    constructor(forwardMatrix: number[][], invMatrix: number[][], startAngle: number) {
        if (!Array.isArray(forwardMatrix) || !forwardMatrix.every(row => Array.isArray(row) && row.every(val => typeof val === 'number'))) {
            throw new Error("forwardMatrix must be a 2D array of numbers");
        }

        if (!Array.isArray(invMatrix) || !invMatrix.every(row => Array.isArray(row) && row.every(val => typeof val === 'number'))) {
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
        if (!(orientation instanceof Orientation)) {
            throw new Error("Orientation must be an instance of Orientation");
        }

        if (!(size instanceof Point) || !(origin instanceof Point)) {
            throw new Error("Size and origin must be instances of Point");
        }

        this.orientation = orientation;
        this.size = size;
        this.origin = origin;
    }
}