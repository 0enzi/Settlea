package base_game

import (
	"settlea/pkg/game/data"
)

// catan game
type Game struct {
	players      []data.Player
	seed         int
	discardLimit int
	vpsToWin     int
	board        data.SettleaMap
	ports        map[string]data.PortData
}
