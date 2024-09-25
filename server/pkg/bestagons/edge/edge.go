package edge

type Edge struct {
	q         int
	r         int
	direction string
}

const (
	NorthEast = "NE"
	NorthWest = "NW"
	West      = "W"
)

func NewEdge(q, r int, dir string) *Edge {
	return &Edge{q: q, r: r, direction: dir}
}

func (e Edge) IsValid() bool {
	return e.direction == NorthEast || e.direction == NorthWest || e.direction == West
}
