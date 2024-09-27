package routes

import (
	"settlea/internal/chat"

	"github.com/gorilla/mux"
)

func RegisterChatRoutes(router *mux.Router) {
	router.HandleFunc("/ws/chat", chat.HandleConnections).Methods("GET")

}
