package ws

import (
	"encoding/json"
	"log"
)

const (
	// wsserver actions
	PingAction       = "ping"
	CreateRoomAction = "create_room"
	JoinRoomAction   = "join_room"
	LeaveRoomAction  = "leave_room"
	UserJoinAction   = "user_join"
	UserLeaveAction  = "user_leave"

	// chat
	SendMessageAction = "send_message"

	// game
	StartGameAction = "start_game"
	SendGameAction  = "send_game"
)

type Message struct {
	Action string  `json:"action"`
	Data   string  `json:"data"`
	Target *Room   `json:"target"`
	Sender *Client `json:"sender"`
}

func (message *Message) encode() []byte {
	json, err := json.Marshal(message)
	if err != nil {
		log.Println(err)
	}

	return json
}
