package api

import (
	"settlea/api/handlers"
	"settlea/api/handlers/routes"

	// "settlea/api/routes"

	"github.com/gorilla/mux"
)

func NewRouter() *mux.Router {
	router := mux.NewRouter()

	// Apply CORS middleware globally
	router.Use(handlers.CORSMiddleware)
	routes.RegisterGameRoutes(router)
	routes.RegisterWSRoutes(router)

	return router
}
