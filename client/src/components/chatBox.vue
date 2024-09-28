<template>
  <div>
    <div class="tab">
      <button
        class="tablinks"
        :class="{ active: activeTab === 'chat' }"
        @click="openTab('chat')"
      >
        Chat
      </button>
      <button
        class="tablinks"
        :class="{ active: activeTab === 'logs' }"
        @click="openTab('logs')"
      >
        Logs
      </button>
    </div>

    <div v-if="activeTab === 'chat'" class="tabcontent">
      <h3>Game Chat</h3>
      <div class="chat-window">
        <div
          v-for="message in chatMessages"
          :key="message.id"
          class="chat-message"
        >
          {{ message.text }}
        </div>
      </div>
      <input
        v-model="newChatMessage"
        @keyup.enter="sendChatMessage"
        placeholder="Type your message..."
      />
    </div>

    <div v-if="activeTab === 'logs'" class="tabcontent">
      <h3>Game Logs</h3>
      <div class="logs-window">
        <div v-for="log in gameLogs" :key="log.id" class="game-log">
          {{ log.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

interface ChatMessage {
  id: number;
  text: string;
}

interface GameLog {
  id: number;
  text: string;
}

export default defineComponent({
  name: "ChatBox",
  data() {
    return {
      activeTab: "chat" as string,
      newChatMessage: "" as string,
      chatMessages: [] as ChatMessage[], // Specify type for chatMessages
      gameLogs: [] as GameLog[], // Declare gameLogs
    };
  },
  methods: {
    openTab(tabName: string) {
      this.activeTab = tabName; // Set the active tab to the clicked tab
    },
    sendChatMessage() {
      if (this.newChatMessage.trim()) {
        const newMessage: ChatMessage = {
          id: Date.now(),
          text: this.newChatMessage,
        };
        this.chatMessages.push(newMessage); // Add new message to the chat
        this.newChatMessage = ""; // Clear input field
        console.log("send chat message:", newMessage);
      }
    },
    addLogEntry(logText: string) {
      const newLog: GameLog = { id: Date.now(), text: logText }; // Create new log entry
      this.gameLogs.push(newLog); // Add the new log entry
      console.log("add log entry:", logText);
    },
  },
});
</script>

<style>
.tab {
  overflow: hidden;
  border: 1px solid #ccc;
  background-color: #f1f1f1;
}

.tab button {
  background-color: inherit;
  float: left;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 14px 16px;
  transition: 0.3s;
}

.tab button:hover {
  background-color: #ddd;
}

.tab button.active {
  background-color: #ccc;
}

.tabcontent {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-top: none;
}

.chat-window,
.logs-window {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 10px;
}

.chat-message,
.game-log {
  margin: 5px 0;
}
</style>
