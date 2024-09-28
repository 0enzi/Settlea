package grid

import (
	"settlea/pkg/bestagons/edge"
	"settlea/pkg/bestagons/hex"
	"settlea/pkg/bestagons/orientation"
	"settlea/pkg/bestagons/screen"
	"settlea/pkg/bestagons/vertex"
)

const SQRT_3_2 = 0.8660254037844386

type Layout struct {
	Orientation orientation.Orientation
	Size        screen.ScreenCoord
	Origin      screen.ScreenCoord
}

<<<<<<< Updated upstream
=======
func (l Layout) HexToPixel(h hex.Hex) screen.ScreenCoord {
	M := l.Orientation

	x := (M.ForwardMatrix[0][0]*float64(h.Q) + M.ForwardMatrix[0][1]*float64(h.R)) * float64(l.Size.X)
	y := (M.ForwardMatrix[1][0]*float64(h.Q) + M.ForwardMatrix[1][1]*float64(h.R)) * float64(l.Size.Y)

	return screen.MakeScreenCoord(x+float64(l.Origin.X), y+float64(l.Origin.Y))
}

/*
Point hex_to_pixel(Layout layout, Hex h) {
    const Orientation& M = layout.orientation;
    double x = (M.f0 * h.q + M.f1 * h.r) * layout.size.x;
    double y = (M.f2 * h.q + M.f3 * h.r) * layout.size.y;
    return Point(x + layout.origin.x, y + layout.origin.y);
}
*/

>>>>>>> Stashed changes
func (l Layout) VertexToPixel(v vertex.Vertex) screen.ScreenCoord {
	q, r, direction := float64(v.Q), float64(v.R), v.Direction

	x := l.Size.X * (q + r/2 + 1.0/2.0) / SQRT_3_2
	var y float64

	if direction == "S" {
		y = l.Size.Y * (r + (7.0 / 6.0))
	} else {
		y = l.Size.Y * (r - (1.0 / 6.0)) // Ensure negative handling
	}
	return screen.MakeScreenCoord(x, y)
}

func (l Layout) neighbours(h hex.Hex) []hex.Hex {
	return []hex.Hex{
		*hex.NewHex(h.Q, h.R-1),
		*hex.NewHex(h.Q+1, h.R-1),
		*hex.NewHex(h.Q+1, h.R),
		*hex.NewHex(h.Q, h.R+1),
		*hex.NewHex(h.Q-1, h.R+1),
		*hex.NewHex(h.Q-1, h.R),
	}
}

func (l Layout) Vertices(h hex.Hex) []vertex.Vertex {
	return []vertex.Vertex{
		*vertex.NewVertex(h.Q, h.R, vertex.North),
		*vertex.NewVertex(h.Q+1, h.R-1, vertex.South),
		*vertex.NewVertex(h.Q, h.R+1, vertex.North),
		*vertex.NewVertex(h.Q, h.R, vertex.South),
		*vertex.NewVertex(h.Q-1, h.R+1, vertex.North),
		*vertex.NewVertex(h.Q, h.R-1, vertex.South),
	}
}

func (l Layout) Edges(h hex.Hex) []edge.Edge {
	return []edge.Edge{
		*edge.NewEdge(h.Q, h.R, edge.NorthWest),
		*edge.NewEdge(h.Q, h.R, edge.NorthEast),
		*edge.NewEdge(h.Q+1, h.R, edge.West),
		*edge.NewEdge(h.Q, h.R+1, edge.NorthWest),
		*edge.NewEdge(h.Q-1, h.R+1, edge.NorthEast),
		*edge.NewEdge(h.Q, h.R, edge.West),
	}
}
