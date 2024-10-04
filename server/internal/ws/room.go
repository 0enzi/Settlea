package ws

import (
	"log"
	"settlea/pkg/uid"
)

type Room struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	clients       map[*Client]bool
	broadcast     chan *Message
	gameBroadcast chan *Message
	register      chan *Client
	unregister    chan *Client
	// game GameState
	done chan bool
}

func NewRoom(id string) *Room {
	if id == "" {
		id = uid.GenerateUniqueID(15)
	}

	return &Room{
		ID:            id,
		Name:          "",
		clients:       make(map[*Client]bool),
		broadcast:     make(chan *Message),
		gameBroadcast: make(chan *Message),
		register:      make(chan *Client),
		unregister:    make(chan *Client),
		done:          make(chan bool),
	}
}
func (room *Room) GetRoomSize() int {
	return len(room.clients)
}

func (room *Room) GetID() string {
	return room.ID
}

func (room *Room) GetName() string {
	return room.Name
}

func (room *Room) RunRoom() {
	for {
		select {
		case <-room.done:
			log.Printf("Stopping room %s", room.ID)
			close(room.register)
			close(room.unregister)
			close(room.broadcast)
			return
		case msg := <-room.broadcast:
			for client := range room.clients {
				client.send <- msg.encode()
			}

		case client := <-room.register:
			log.Println("Registering client", client.ID)
			log.Println(room.GetRoomSize(), len(room.clients))

			// TODO check if room is full and enter spectator mode

		}
	}
}
