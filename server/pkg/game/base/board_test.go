package base_game

import (
	"testing"
	// "time"
)

func TestGenerateHexagonalMap(t *testing.T) {
	hex_map := GenerateHexagonMap(2)

	map_size := len(hex_map)
	expected_size := 19

	if map_size != expected_size {
		t.Errorf("Expected %v, got %v", expected_size, map_size)
	}
}

func TestValidateTiles(t *testing.T) {
	// Generate the hexagon map with N = 2
	tiles := GenerateHexagonMap(2)

	// Run StartValidation to assign tokens and get a valid configuration
	result, _, _ := StartValidation(tiles)

	// Validate the result using validateTiles
	legal := validateTiles(result)

	if !legal {
		t.Errorf("Expected tiles to be valid but found conflicts")
	}
}
