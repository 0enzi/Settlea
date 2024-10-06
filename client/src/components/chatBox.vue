<template>
  <div id="chat-container">
    <nav>
      <button
        class="nav-button"
        @click="activeTab = 'chat'"
        :class="{ active: activeTab === 'chat' }"
      >
        Chat
      </button>
      <button
        class="nav-button"
        @click="activeTab = 'log'"
        :class="{ active: activeTab === 'log' }"
      >
        Logs (10)
      </button>
    </nav>

    <!-- Wrapper for content and input -->
    <div class="chat-wrapper">
      <!-- Conditionally render based on the active tab -->
      <div v-if="activeTab === 'chat'" class="tab-content">
        <TabChat />
      </div>
      <div v-else-if="activeTab === 'log'" class="tab-content">
        <TabLog />
      </div>

      <!-- Chat input section appears only in the chat tab -->
      <div class="chat-input" v-if="activeTab === 'chat'">
        <input
          v-model="message"
          @keydown.enter="sendMessage"
          type="text"
          placeholder="Type a message..."
          class="input-text"
        />
        <button @click="sendMessage" class="send-button">Send</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from "vue";
import TabChat from "./TabChat.vue";
import TabLog from "./TabLog.vue";

export default {
  name: "ChatBox",
  components: {
    TabChat,
    TabLog,
  },
  setup() {
    const activeTab = ref("chat"); // 'chat' is the default tab
    const message = ref(""); // Message input value

    // Function to handle sending a message
    const sendMessage = () => {
      if (message.value.trim()) {
        console.log("Sending message:", message.value);
        message.value = ""; // Clear the input after sending
      }
    };

    return {
      activeTab,
      message,
      sendMessage,
    };
  },
};
</script>

<style scoped>
#chat-container {
  margin-top: 20px;
  border-left: 4px solid #183a37;
  border-top: 4px solid #183a37;
  border-right: 4px solid #183a37;
  border-radius: 10px 0px 0px 0px;
  background-color: #f8f2dc;
  width: 24%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 50vh; /* Set a height to enable scroll */
}

nav {
  display: flex;
  width: 100%;
}

.nav-button {
  width: 50%;
  padding: 10px;
  font-size: 20px;
  cursor: pointer;
  border: 0px;
  text-align: left;
  color: #183a37;
  transition: background-color 0.2s ease;
  font-family: "Londrina Solid", sans-serif;
  background-color: #f8f2dc;
  border-top-left-radius: 10px;
}

.nav-button:hover {
  background-color: #f5eccc;
}

.nav-button.active {
  background-color: #e9d690;
  border-bottom: 4px solid #183a37;
}

.nav-button.active:first-child {
  border-top-left-radius: 10px;
  border-right: 4px solid #183a37;
}

.nav-button.active:last-child {
  border-top-left-radius: 0%;
  border-left: 4px solid #183a37;
}

.chat-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1; /* Allow it to grow and fill the available space */
  overflow: hidden; /* Prevent overflow */
}

.tab-content {
  padding: 20px;
  background-color: #f8f2dc;
  font-family: "Outfit", sans-serif;
  height: 100%; /* Take full height */
  overflow-y: auto; /* Allow scrolling */
}

.chat-input {
  display: flex;
  padding: 1px;
  background-color: #f5eccc;
}

.input-text {
  font-family: "Outfit", sans-serif;
  width: 80%;
  margin-left: 5px;
  padding-left: 10px;
  border: none;
  font-size: 16px;
  outline: none;
  border-radius: 10px;
  border: 2px solid #183a37;
  color: #177e89;
}

.input-text::placeholder {
  color: #177e89;
}

.send-button {
  width: 20%;
  padding: 10px;
  margin-left: 5px;
  background-color: #183a37;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.send-button:hover {
  background-color: #145a50;
}
</style>
