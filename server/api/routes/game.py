from fastapi import APIRouter
import random

# from server.utils.hex_utils import Hex
# from server.utils.base_validation import start_validation

from utils.hex_utils import Hex
from utils.base_validation import start_validation
from typing import Dict, Any

# from serverutils.layout_utils import scarcity_map

router = APIRouter()


@router.get("/gen-base-map/", status_code=201)
def gen_base_map() -> Dict[str, Any]:
    N = 3
    hex_map = set()
    hex_search_ez = {}

    # Generate resources
    resources = ['wood'] * 4 + ['sheep'] * 4 + ['wheat'] * 4 + ['brick'] * 3 + ['ore'] * 3 + ['desert']

    # Create hex tiles

    hex_map.clear()
    hex_search_ez.clear()
    random.shuffle(resources)

    for q in range(-N, N + 1):
        r1 = max(-N, -q - N)
        r2 = min(N, -q + N)
        for r in range(r1, r2 + 1):

            if len(resources) == 0:
                break
            resource = resources.pop()
            hex_tile = Hex(q, r, resource)
            hex_map.add(hex_tile)
            hex_search_ez[f"{q},{r}"] = hex_tile
            print(f"{q},{r}")

    # Validate hex map and get result
    hex_map, iterations, duration = start_validation(hex_map)

    # Return as JSON
    result = [{
        "q": tile.q, "r": tile.r, "s": tile.s,
        "resource": tile.resource, "token": tile.token
    } for tile in hex_map]

    return {
        "hex_map": result,
        # "iterations": iterations,
        "generation_time_ms": duration * 1000
    }
