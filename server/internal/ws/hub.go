package ws

import "log"

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	clients    map[*Client]bool
	rooms      map[*Room]bool
	broadcast  chan *Message
	register   chan *Client
	unregister chan *Client
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		rooms:      make(map[*Room]bool),
		broadcast:  make(chan *Message),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (hub *Hub) MonitorClientsChannel() {
	for {
		select {
		case message := <-hub.broadcast:
			for client := range hub.clients {
				client.send <- message.encode()
			}
		case client := <-hub.register:
			hub.clients[client] = true

		case client := <-hub.unregister:
			if ok := hub.clients[client]; ok {
				delete(hub.clients, client)
				// close(client.send)
			}
		}
	}
}

// func (h *Hub) Run() {
// 	for {
// 		select {
// 		case client := <-h.register:
// 			h.clients[client] = true
// 		case client := <-h.unregister:
// 			if _, ok := h.clients[client]; ok {
// 				delete(h.clients, client)
// 				close(client.send)
// 			}
// 		case message := <-h.broadcast:
// 			for client := range h.clients {
// 				select {
// 				case client.send <- message:
// 				default:
// 					close(client.send)
// 					delete(h.clients, client)
// 				}
// 			}
// 		}
// 	}
// }

func (h *Hub) findRoomByID(id string) *Room {
	var foundRoom *Room

	for room := range h.rooms {
		if room.GetID() == id {
			foundRoom = room
			break
		}
	}
	return foundRoom
}

func (hub *Hub) createRoom(id string) *Room {
	log.Println("Creating room", id)
	room := NewRoom(id)
	go room.RunRoom()
	hub.rooms[room] = true
	return room
}
