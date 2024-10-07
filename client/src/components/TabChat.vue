<template>
  <div>
    <div v-for="(msg, index) in messages" :key="index">
      <MessageItem :author="msg.author" :message="msg.message" />
    </div>
  </div>
</template>

<script>
import MessageItem from "./MessageItem.vue";

export default {
  name: "TabChat",
  components: { MessageItem },
  props: {
    messages: {
      type: Array,
      default: () => [],
    },
  },
};
</script>
