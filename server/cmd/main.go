package main

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"settlea/api"
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

func main() {
	err := loadConfig("config/config.json") // Update the path to your config file
	if err != nil {
		slog.Error("Error loading config: " + err.Error())
		return
	}

	// Create the router
	router := api.NewRouter()

	// Start the server
	slog.Info("Server started on port 8080")
	err = http.ListenAndServe(":8080", router) // Use the router for the server
	if err != nil {
		slog.Error("Error starting server: " + err.Error())
	}
}
