package routes

import (
	"flag"
	"net/http"
	"settlea/internal/ws"

	"github.com/gorilla/mux"
)

var addr = flag.String("addr", ":8080", "http service address")

func RegisterWSRoutes(router *mux.Router) {
	flag.Parse()
	hub := ws.NewHub()
	go hub.MonitorClientsChannel()

	router.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		ws.ServeWs(hub, w, r)
	})

}
