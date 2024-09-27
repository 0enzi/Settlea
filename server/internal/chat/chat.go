package chat

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Client struct {
	conn *websocket.Conn
	mu   sync.Mutex
}

var clients = make(map[*Client]string)
var broadcast = make(chan Message)
var onlineUsers = make([]string, 0)

type Message struct {
	Room     string   `json:"room"`
	Username string   `json:"username"`
	Message  string   `json:"message"`
	Type     string   `json:"type"`            // used to differentiate between chat, ping, or other types of messages
	Users    []string `json:"users,omitempty"` // user list for broadcasting
}

func HandleConnections(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	client := &Client{conn: conn}
	defer func() {
		// handle user disc
		username := clients[client]
		if username != "" {
			delete(clients, client)
			removeUser(username)
			fmt.Printf("%s disconnected\n", username)

			response := Message{Type: "leave", Username: username, Message: fmt.Sprintf("%s has left the room.", username)}
			broadcast <- response

			updateUserList()
		}
		client.conn.Close()
	}()

	var username string
	clients[client] = "" // initialize the client with an empty username

	for {
		var msg Message

		err := client.conn.ReadJSON(&msg)
		if err != nil {
			fmt.Println("Error reading JSON: ", err)
			break // Break the loop when there's an error (like a disconnect)
		}

		if msg.Type == "join" {

			username = msg.Username
			clients[client] = username
			fmt.Printf("%s joined %s\n", username, msg.Room)

			// broadcast the join event to all clients
			response := Message{Type: "join", Username: username, Room: msg.Room, Message: fmt.Sprintf("%s has joined the room.", username)}
			broadcast <- response

			addUser(username)
			updateUserList()

		} else if msg.Type == "leave" {
			// When a user leaves, remove their username and update the list of users
			delete(clients, client)
			removeUser(username)
			fmt.Printf("%s left %s\n", username, msg.Room)

			// Broadcast the leave event to all clients
			response := Message{Type: "leave", Username: username, Room: msg.Room, Message: fmt.Sprintf("%s has left the room.", username)}
			broadcast <- response

			removeUser(username)

		} else if msg.Type == "ping" {
			// respond to ping message
			response := Message{Type: "pong"}
			client.writeJSON(response)

		} else if msg.Type == "chat" {
			// handle chat messages
			broadcast <- msg

		} else {
			// handle normal chat messages
			// todo: save to db
			fmt.Printf("wth %s\n", msg.Message)
		}
	}
}

// threadsafe write to ws connection
func (client *Client) writeJSON(msg Message) error {
	client.mu.Lock()
	defer client.mu.Unlock()
	return client.conn.WriteJSON(msg)
}

func HandleMessages() {
	for msg := range broadcast {
		// broadcast message to all clients
		for client := range clients {
			err := client.writeJSON(msg)
			if err != nil {
				fmt.Println("Error: ", err)
				client.conn.Close()
				delete(clients, client)
			}
		}
	}
}

func updateUserList() {
	userListMsg := Message{
		Type:  "userlist",
		Users: onlineUsers,
	}
	for client := range clients {
		client.writeJSON(userListMsg)
	}
}

func addUser(username string) {
	for _, user := range onlineUsers {
		if user == username {
			return // user already existss
		}
	}
	onlineUsers = append(onlineUsers, username)
}

func removeUser(username string) {
	for i, user := range onlineUsers {
		if user == username {
			onlineUsers = append(onlineUsers[:i], onlineUsers[i+1:]...)
			break
		}
	}
}
