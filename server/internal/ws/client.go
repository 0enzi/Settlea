package ws

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"settlea/pkg/uid"
	"time"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// allow from a list of domains
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		return origin == "http://127.0.0.1:5500"
	},
}

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	hub   *Hub
	rooms map[*Room]bool
	conn  *websocket.Conn
	send  chan []byte
	ID    string `json:"id"`
	Name  string `json:"name"`
}

func (client *Client) handleNewMessage(jsonMessage []byte) {
	var msg Message
	if err := json.Unmarshal(jsonMessage, &msg); err != nil {
		log.Println("Error unmarshalling message:", err)
		return
	}

	if msg.Sender != nil {
		client.Name = msg.Sender.Name
		// log.Println("Client Name: ", client.Name)
		log.Printf("Handling msg: \n Action -> %v; \n Data -> '%v'; \n Target -> %v; \n Sender -> %v",
			msg.Action, msg.Data, msg.Target.Name, msg.Sender.Name)
	} else {
		log.Printf("Sender is nil")
	}

	msg.Sender = client

	switch msg.Action {

	case JoinRoomAction:
		client.joinRoom(msg.Data)

	case LeaveRoomAction:
		client.leaveRoom(msg.Data)

	case SendMessageAction:
		client.sendMessage(msg)

	case PingAction:
		client.sendPong()

	default:
		break
	}
}

// actions
func (client *Client) joinRoom(roomID string) *Room {
	room := client.hub.findRoomByID(roomID)
	if roomID == "" {
		room = client.hub.createRoom(uid.GenerateUniqueID(15))
	}

	if room == nil {
		room = client.hub.createRoom(uid.GenerateUniqueID(15))
	}

	if !client.isInRoom(room) {
		client.rooms[room] = true
		room.register <- client
		client.notifyRoomJoined(room)
	}

	return room
}

func (client *Client) leaveRoom(roomID string) {
	room := client.hub.findRoomByID(roomID)
	if room != nil {
		delete(client.rooms, room)
		room.unregister <- client
		client.notifyRoomLeft(room)
	}
}

func (client *Client) sendMessage(message Message) {
	roomID := message.Target.GetID()

	if room := client.hub.findRoomByID(roomID); room != nil {
		room.broadcast <- &message
	}
}

func (client *Client) sendPong() {
	client.conn.WriteJSON(`{"type":"pong"}`)
}

func (client *Client) isInRoom(room *Room) bool {
	_, ok := client.rooms[room]
	return ok
}

func (client *Client) notifyRoomJoined(room *Room) {
	log.Printf("Client %s joined room %s", client.Name, room.GetID())
	message := &Message{
		Action: UserJoinAction,
		Data:   room.ID,
		Target: room,
		Sender: client,
	}

	client.send <- message.encode()
}

func (client *Client) notifyRoomLeft(room *Room) {
	log.Printf("Client %s left room %s", client.Name, room.GetID())
	message := &Message{
		Action: UserLeaveAction,
		Data:   room.ID,
		Target: room,
		Sender: client,
	}

	client.send <- message.encode()
}

// readPump pumps messages from the websocket connection to the hub.
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (client *Client) listen() {
	defer func() {
		client.hub.unregister <- client
		client.conn.Close()
	}()
	client.conn.SetReadLimit(maxMessageSize)
	client.conn.SetReadDeadline(time.Now().Add(pongWait))
	client.conn.SetPongHandler(func(string) error { client.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := client.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		message = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))
		// log.Printf("Received: %s", message)
		client.handleNewMessage(message)
		// client.hub.broadcast <- message
	}
}

// writePump pumps messages from the hub to the websocket connection.
//
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (client *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		client.conn.Close()
	}()
	for {
		select {
		case message, ok := <-client.send:
			client.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				client.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := client.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued chat messages to the current websocket message.
			n := len(client.send)
			for i := 0; i < n; i++ {
				w.Write(newline)
				w.Write(<-client.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			client.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := client.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// serveWs handles websocket requests from the peer.
func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256)}
	client.hub.register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	go client.listen()
}
