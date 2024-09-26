package data

import (
	"settlea/pkg/bestagons/edge"
	"settlea/pkg/bestagons/vertex"
	"settlea/pkg/utils"
)

type SettleaMap struct {
	Tiles    utils.Set[Tile]
	Vertices utils.Set[vertex.Vertex]
	Edges    utils.Set[edge.Edge]
}
