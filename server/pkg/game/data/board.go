package data

import (
	"settlea/pkg/bestagons/hex"
	"settlea/pkg/utils"
	"strconv"
	"time"
)

type Tile struct {
	hex.Hex
	Type    string
	Token   int
	Blocked bool
}

func (t *Tile) setToken(token int) {
	t.Token = token
}

func (t Tile) SetType(tileType string) Tile {
	t.Type = tileType
	return t
}

func (t Tile) SetBlocked(blocked bool) Tile {
	t.Blocked = blocked
	return t
}

type Board struct {
	Tiles utils.Set[Tile]
}

func NewBoard(N int) utils.Set[*Tile] {

	settleaMap := GenerateHexagonMap(N)
	// fmt.Println(settleaMap)

	// for i := -N;
	// return &Board{Tiles: tiles}

	return settleaMap
}

func GenerateHexagonMap(N int) utils.Set[*Tile] {
	tiles := utils.Set[*Tile]{}

	if N != 2 {
		panic("Not implemented")
	}

	resources := []string{}
	resources = append(resources, utils.Repeat("wood", 4)...)
	resources = append(resources, utils.Repeat("sheep", 4)...)
	resources = append(resources, utils.Repeat("wheat", 4)...)
	resources = append(resources, utils.Repeat("brick", 3)...)
	resources = append(resources, utils.Repeat("ore", 3)...)
	resources = append(resources, "desert")
	shuffledResources := utils.Shuffle(resources)

	for q := -N; q <= N; q++ {
		r1 := max(-N, -q-N)
		r2 := min(N, -q+N)

		for r := r1; r <= r2; r++ {
			// Popping the resource using slice manipulation
			resource := shuffledResources[len(shuffledResources)-1]          // Get the last resource
			shuffledResources = shuffledResources[:len(shuffledResources)-1] // Remove the last resource

			tile := &Tile{
				Hex:     hex.MakeHex(q, r),
				Type:    resource,
				Token:   0,
				Blocked: false,
			}
			tiles.Add(tile)
		}
	}
	return tiles
}

func StartValidation(tiles utils.Set[*Tile]) (utils.Set[*Tile], int, time.Duration) {
	legal := false
	iteration := 0
	startTime := time.Now()

	for !legal && iteration < 1000 {
		iteration++
		tokens := []string{"2"}
		tokens = append(tokens, utils.Repeat("3", 2)...)
		tokens = append(tokens, utils.Repeat("4", 2)...)
		tokens = append(tokens, utils.Repeat("5", 2)...)
		tokens = append(tokens, utils.Repeat("6", 2)...)
		tokens = append(tokens, utils.Repeat("8", 2)...)
		tokens = append(tokens, utils.Repeat("9", 2)...)
		tokens = append(tokens, utils.Repeat("10", 2)...)
		tokens = append(tokens, utils.Repeat("11", 2)...)
		tokens = append(tokens, "12")

		nonDesertCount := 0
		for tile := range tiles {
			if tile.Type != "desert" {
				nonDesertCount++
			}
		}

		if nonDesertCount != len(tokens) {
			panic("Mismatch between number of tokens and non-desert tiles, got " + strconv.Itoa(nonDesertCount) + " and " + strconv.Itoa(len(tokens)))
		}

		shuffledTokens := utils.Shuffle(tokens)
		for tile := range tiles {
			if tile.Type == "desert" {
				continue
			}

			// Using the simplified popping method
			token := shuffledTokens[len(shuffledTokens)-1]          // Get the last token
			shuffledTokens = shuffledTokens[:len(shuffledTokens)-1] // Remove the last token

			tokenInt, err := strconv.Atoi(token)
			if err != nil {
				panic("Invalid token conversion: " + err.Error())
			}
			tile.setToken(tokenInt)
		}

		legal = validateTiles(tiles)
	}

	duration := time.Since(startTime)
	return tiles, iteration, duration
}

func validateTiles(hex_map utils.Set[*Tile]) bool {
	// Convert set to a map for faster lookups
	hex_dict := make(map[hex.Hex]*Tile)
	for tile := range hex_map {
		hex_dict[tile.Hex] = tile
	}

	for tile := range hex_map {
		for i := 0; i < 6; i++ { // Fix the loop
			neighbour := tile.Hex.GetNeighbour(i)
			neighbor_tile, exists := hex_dict[neighbour]

			if exists {
				// Check if neighboring tokens are identical
				if tile.Token == neighbor_tile.Token {
					return false
				}
				// Check if the adjacent tokens are 6 and 8, which are not allowed to be neighbors
				if (tile.Token == 6 && neighbor_tile.Token == 8) || (tile.Token == 8 && neighbor_tile.Token == 6) {
					return false
				}
			}
		}
	}

	return true
}
