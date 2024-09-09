import random
import time


def validate_tiles(hex_map):
    hex_dict = {(tile.q, tile.r): tile for tile in hex_map}
    for tile in hex_map:
        for i in range(6):
            neighbour = tile.get_neighbour(i)
            neighbor_tile = hex_dict.get((neighbour.q, neighbour.r))
            if neighbor_tile:
                if tile.token == neighbor_tile.token:
                    return False
                if (tile.token == 6 and neighbor_tile.token == 8) or (tile.token == 8 and neighbor_tile.token == 6):
                    return False
    return True


def start_validation(hex_map):
    legal = False
    iteration = 0
    start_time = time.time()

    while not legal:
        iteration += 1
        tokens = ['2'] + ['3'] * 2 + ['4'] * 2 + ['5'] * 2 + ['6'] * 2 + ['8'] * 2 + ['9'] * 2 + ['10'] * 2 + ['11'] * 2 + ['12']
        tokenised_map = hex_map.copy()

        for hex_tile in tokenised_map:
            if hex_tile.resource == 'desert':
                continue
            random.shuffle(tokens)
            token = tokens.pop()
            hex_tile.set_token(int(token))

        legal = validate_tiles(tokenised_map)

    end_time = time.time()
    duration = end_time - start_time

    return tokenised_map, iteration, duration
