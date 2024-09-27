package base_game

import (
	"settlea/internal/game/data"
)

// catan game
type Game struct {
	Players []data.Player
	// seed         int
	DiscardLimit int
	vpsToWin     int
	Board        *data.SettleaMap
	Ports        map[string]data.PortData
}

func (g *Game) InitGame(players_no int, discardLimit int, vpsToWin int, style string, ports map[string]data.PortData) *Game {
	players := make([]data.Player, players_no)
	settleaMap := &data.SettleaMap{}

	return &Game{
		players,
		discardLimit,
		vpsToWin,
		settleaMap.NewMap(style),
		ports,
	}
}
