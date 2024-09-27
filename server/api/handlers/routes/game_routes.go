package routes

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"

	base_game "settlea/internal/game/base"
	"settlea/internal/game/data"
	"settlea/pkg/bestagons/edge"
	"settlea/pkg/bestagons/vertex"
)

type BoardResponse struct {
	Tiles      []*data.Tile             `json:"tiles"`
	Vertices   []*vertex.Vertex         `json:"vertices"`
	Edges      []*edge.Edge             `json:"edges"`
	Ports      map[string]data.PortData `json:"ports"`
	Iterations int                      `json:"iterations"`
	Duration   string                   `json:"duration"`
}

func newGame(w http.ResponseWriter, r *http.Request) {
	handleCORS(w, r)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// init game
	new_game := base_game.Game{}
	initialised_game := new_game.InitGame(2, 2, 1, "base", map[string]data.PortData{})

	// get tiles, vertices, edges
	map_tiles := initialised_game.Board.Tiles
	map_vertices := initialised_game.Board.Vertices
	map_edges := initialised_game.Board.Edges

	// validate tiles & allocate
	_, iterations, duration := data.StartValidation(map_tiles)

	// gen random ports
	ports := data.GeneratePorts(9)

	// send everything to client
	response := BoardResponse{
		Tiles:      map_tiles.ToSlice(), // assuming this is now populated correctly
		Vertices:   map_vertices.ToSlice(),
		Edges:      map_edges.ToSlice(),
		Ports:      ports,
		Iterations: iterations,
		Duration:   duration.String(),
	}

	jsonData, err := json.MarshalIndent(response, "", "  ")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonData)
}

func handleCORS(w http.ResponseWriter, r *http.Request) {
	// Allow all origins (for simplicity); you can customize this based on your config
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

// RegisterGameRoutes registers game-related routes
func RegisterGameRoutes(router *mux.Router) {
	// Route for generating a new board
	router.HandleFunc("/game/generate-base-board", newGame).Methods("GET", "OPTIONS")
}
