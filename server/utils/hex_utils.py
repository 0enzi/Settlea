class Hex:
    DIRECTIONS = [
        (1, 0, -1), (1, -1, 0), (0, -1, 1),
        (-1, 0, 1), (-1, 1, 0), (0, 1, -1)
    ]

    def __init__(self, q: int, r: int, resource: str = None, token: int = 0):
        self.q = q
        self.r = r
        self.s = -q - r
        self.resource = resource
        self.token = token

    def __eq__(self, other):
        if isinstance(other, Hex):
            return self.q == other.q and self.r == other.r and self.s == other.s
        return False

    def __ne__(self, other):
        return not self.__eq__(other)

    def __hash__(self):
        return hash((self.q, self.r, self.s))

    def __repr__(self):
        return f"Type: {self.resource}, Coord(q={self.q}, r={self.r}, s={self.s}), Token={self.token}"

    def add(self, other):
        return Hex(self.q + other.q, self.r + other.r)

    def subtract(self, other):
        return Hex(self.q - other.q, self.r - other.r)

    def get_neighbour(self, direction: int):
        return self.add(self.to_hex(Hex.DIRECTIONS[direction]))

    def to_hex(self, direction):
        return Hex(direction[0], direction[1])

    def set_token(self, token: int):
        self.token = token
