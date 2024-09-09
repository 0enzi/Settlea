from collections import namedtuple
import numpy as np

Point = namedtuple('Point', ['x', 'y'])


class Layout:
    def __init__(self, orientation, size: Point, origin: Point):
        self.orientation = orientation
        self.size = size
        self.origin = origin


class Orientation:
    def __init__(self, forward_matrix, inv_matrix, start_angle_):
        self.forward_matrix = np.array(forward_matrix)
        self.inv_matrix = np.array(inv_matrix)
        self.start_angle = start_angle_


scarcity_map = {
    2: 1, 3: 2, 4: 3, 5: 4, 6: 5,
    8: 5, 9: 4, 10: 3, 11: 2, 12: 1
}
