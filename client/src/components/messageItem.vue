<template>
  <div>
    <div>
      <img src="/assets/icons/profile_icon.svg" alt="" srcset="" /> |
      {{ author }} | {{ message }}
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "MessageItem",
  props: {
    author: {
      type: String,
      default: "Author",
    },
    message: {
      type: String,
      default: "Message",
    },
  },
};
</script>
