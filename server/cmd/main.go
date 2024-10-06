package main

import (
	_ "embed"
	"encoding/json"
	"log/slog"
	"net/http"
	"settlea/api"
)

type Config struct {
	AllowedOrigins []string `json:"allowed_origins"`
	Port           int      `json:"port"`
}

var config Config

//go:embed config/config.json
var configFile []byte

func loadConfig() error {

	return json.Unmarshal(configFile, &config)
}

func main() {

	err := loadConfig()
	if err != nil {
		slog.Error("Error loading config: " + err.Error())
		return
	}

	router := api.NewRouter()

	slog.Info("Server started on port 8080")
	err = http.ListenAndServe(":8080", router)
	if err != nil {
		slog.Error("Error starting server: " + err.Error())
	}
}
