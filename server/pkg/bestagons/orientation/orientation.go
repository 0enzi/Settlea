package orientation

import "math"

const (
	PointyLayout = "pointy"
	FlatLayout   = "flat"
)

type Orientation struct {
	forwardMatrix [][]float64
	invMatrix     [][]float64
	startAngle    float64
}

func MakeOrientation(layoutType string) Orientation {
	switch layoutType {
	case PointyLayout:
		return Orientation{
			forwardMatrix: [][]float64{
				{math.Sqrt(3.0), math.Sqrt(3.0) / 2.0},
				{0.0, 3.0 / 2.0},
			},
			invMatrix: [][]float64{
				{math.Sqrt(3.0) / 3.0, -1.0 / 3.0},
				{0.0, 2.0 / 3.0},
			},
			startAngle: 0.5,
		}
	case FlatLayout:
		return Orientation{
			forwardMatrix: [][]float64{
				{3.0 / 2.0, 0.0},
				{math.Sqrt(3.0) / 2.0, math.Sqrt(3.0)},
			},
			invMatrix: [][]float64{
				{2.0 / 3.0, 0.0},
				{-1.0 / 3.0, math.Sqrt(3.0) / 3.0},
			},
			startAngle: 0.0,
		}
	default:
		panic("invalid layout type")
	}
}
