<template>
  <div class="container">
    <div class="baseGame prevent-select">
      <ChatBox
        class="chat-box"
        :messages="messages"
        :send-message="sendMessage"
      />
      <StatusBox
        class="status-box"
        :connection-status="connectionStatus"
        :ping="ping"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Application } from "pixi.js";
import { init } from "../scripts/game";

import StatusBox from "./StatusBox.vue";
import ChatBox from "./ChatBox.vue";

import config from "@/config";
import { nanoid } from "nanoid";
import { MessageResponse } from "@/library/types";

export default {
  name: "BaseGame",
  data() {
    return {
      app: new Application(),
      connectionStatus: "Disconnected",
      ping: 0,
      username: "",
      lastPingTime: 0,
      wsConn: null as WebSocket | null,
      messages: [] as {
        author: string;
        message: string;
      }[],
    };
  },
  components: {
    ChatBox,
    StatusBox,
  },
  async mounted() {
    await init(this);
    this.connectWebsocket();
  },
  methods: {
    connectWebsocket() {
      const ws = new WebSocket(config.wsUrl + "ws");
      this.wsConn = ws;

      const username = localStorage.getItem("username");
      if (!username) {
        const randomUsername = nanoid();
        localStorage.setItem("username", randomUsername);
        this.username = randomUsername;
      }

      ws.onopen = () => {
        this.connectionStatus = "Connected";
        // console.log("Logged in as", this.username);

        const createRoomMessage = {
          action: "create_room",
          data: "testID",
          target: {
            id: "testID",
            name: "testID",
          },
          sender: {
            id: this.username,
            name: this.username,
          },
        };
        ws.send(JSON.stringify(createRoomMessage));

        // setInterval(() => {
        //   this.lastPingTime = Date.now();
        //   const pingMessage = {
        //     action: "ping",
        //     data: "",
        //     target: {
        //       id: "general",
        //       name: "general",
        //     },
        //     sender: {
        //       id: this.username,
        //       name: this.username,
        //     },
        //   };
        //   ws.send(JSON.stringify(pingMessage));
        // }, 5000);
      };

      ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      ws.onclose = () => {
        this.connectionStatus = "Disconnected";

        setTimeout(() => {
          this.connectWebsocket();
        }, 3000);
      };
    },
    sendMessage(message: string) {
      if (this.wsConn && this.wsConn.readyState === WebSocket.OPEN) {
        const chatMessage = {
          action: "send_message",
          data: message,
          target: {
            id: "testID",
            name: "testID",
          },
          sender: {
            id: this.username,
            name: this.username,
          },
        };
        this.wsConn.send(JSON.stringify(chatMessage));
        console.log("Message sent:", message);
      } else {
        console.warn("WebSocket is not connected.");
      }
    },

    handleMessage(data: string) {
      try {
        const message: MessageResponse = JSON.parse(data);
        const testRoom = {
          id: "testID",
          name: "testRoom",
        };
        let sendMessage;

        switch (message.action) {
          case "pong":
            this.ping = Date.now() - this.lastPingTime;
            console.log("pong!", message.data);
            break;
          case "send_message":
            console.log("Message received:", message.data);
            this.messages.push({
              author: message.sender.name,
              message: message.data,
            });
            break;
          case "create_room":
            sendMessage = {
              action: "join_room",
              data: testRoom.id,
              target: {
                ID: "testID",
                Name: "",
              },
              sender: {
                id: this.username,
                name: this.username,
              },
            };
            if (this.wsConn) {
              this.wsConn.send(JSON.stringify(sendMessage));
            }
            break;

          default:
            // console.warn("Unimplemented action", message.Action);
            console.log("unimplemented", message);
            break;
        }
      } catch (error) {
        console.error("Error parsing message", error);
      }
    },
  },
};
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* Prevent scrolling */
}

.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden; /* Lock content within the viewport */
}

.baseGame {
  background-color: #1199bb;
  width: 100vw;
  height: 100vh;
  position: relative;
}

.chat-box {
  height: 40%;
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 10;
}

.status-box {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
}

.prevent-select {
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
