package base_game

import (
	"settlea/internal/game/data"
)

// catan game
type Game struct {
	players []data.Player
	// seed         int
	discardLimit int
	vpsToWin     int
	board        data.SettleaMap
	ports        map[string]data.PortData
}

func (g *Game) NewGame(players_no int, discardLimit int, vpsToWin int, style string, ports map[string]data.PortData) *Game {
	players := make([]data.Player, players_no)
	settleaMap := &data.SettleaMap{}

	return &Game{
		players,
		discardLimit,
		vpsToWin,
		*settleaMap.NewMap(style),
		ports,
	}
}
