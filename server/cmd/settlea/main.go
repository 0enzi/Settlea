package main

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"settlea/pkg/chat"
	base_game "settlea/pkg/game/base"
)

type Config struct {
	AllowedOrigins []string `json:"allowed_origins"`
}

var config Config

func loadConfig(filename string) error {
	// Get the absolute path to the config file
	absPath, err := filepath.Abs(filename)
	if err != nil {
		return err
	}

	data, err := os.ReadFile(absPath) // Use os.ReadFile instead of ioutil
	if err != nil {
		return err
	}

	return json.Unmarshal(data, &config)
}

type BoardResponse struct {
	Tiles      []*base_game.Tile `json:"tiles"`
	Iterations int               `json:"iterations"`
	Duration   string            `json:"duration"`
}

func main() {
	err := loadConfig("config/config.json") // Update the path to your config file
	if err != nil {
		slog.Error("Error loading config: " + err.Error())
		return
	}

	http.HandleFunc("/ws/chat", chat.HandleConnections)
	http.HandleFunc("/game/generate-base-board", generateNewBoard)

	go chat.HandleMessages()

	slog.Info("Server started on port 8080")
	err = http.ListenAndServe(":8080", nil)
	if err != nil {
		slog.Error("Error starting server: " + err.Error())
	}
}

func generateNewBoard(w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	allowed := false
	for _, allowedOrigin := range config.AllowedOrigins {
		if origin == allowedOrigin {
			allowed = true
			break
		}
	}

	if allowed {
		w.Header().Set("Access-Control-Allow-Origin", origin)
	}

	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	normalSizeBoard := base_game.GenerateHexagonMap(2)
	result, iterations, duration := base_game.StartValidation(normalSizeBoard)

	tileSlice := make([]*base_game.Tile, 0, len(result))
	for tile := range result {
		tileSlice = append(tileSlice, tile)
	}

	response := BoardResponse{
		Tiles:      tileSlice,
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
