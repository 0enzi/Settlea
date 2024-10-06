package ws

import (
	"fmt"
	"log"
	"settlea/pkg/uid"
)

var welcomeMsg = "%s has joined the room"

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
			log.Println("BROOO")
			log.Println(room.GetRoomSize(), len(room.clients))
			for client := range room.clients {
				client.send <- msg.encode()
				log.Printf("Sending message to client %s", client.ID)
			}

		case client := <-room.register:
			log.Println("Registering client", client.ID)
			log.Println(room.GetRoomSize(), len(room.clients))

			room.notifyClientJoined(client)
			room.clients[client] = true
			log.Printf("%v size", room.GetRoomSize())

			// TODO check if room is full and enter spectator mode

		case client := <-room.unregister:
			delete(client.rooms, room)
			delete(room.clients, client)
			close(client.send)

		}
	}
}

func (room *Room) notifyClientJoined(client *Client) {
	if client == nil {
		log.Println("Client is nil")
		return
	}

	clientName := client.Name

	if clientName == "" {
		clientName = client.ID
	}

	msg := &Message{
		Action: SendMessageAction,
		Target: room,
		Data:   fmt.Sprintf(welcomeMsg, clientName),
	}

	log.Println(client.ID, "joined room", room.ID)
	for client := range room.clients {
		client.send <- msg.encode()
	}

}
