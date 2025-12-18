<script setup lang="ts">
import { ref } from "vue";
import modal from "merchant-sdk/vue";

const blurBg = ref(true);
const isVerified = ref(false);

modal.setConfig({
  onClose: (e) => {
    console.log("Modal closed", e);
    blurBg.value = false;
  },
  onSuccess: (e) => {
    console.log("Modal success", e);
    isVerified.value = true;
  },
});

const openModal = () => {
  if (!blurBg.value) blurBg.value = true;
  modal.init();
};
</script>

<template>
  <div className="wrapper tinder">
    <div v-if="blurBg" className="blur"></div>

    <div className="header-wrap tinder"></div>
    <div className="bg-wrapper tinder"></div>
  </div>

  <button @click="openModal" class="modal-btn">Launch Modal</button>
</template>

<style scoped>
.modal-btn {
  position: absolute;
  top: 5%;
  right: 5%;
  padding: 12px 24px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  z-index: 10;
}
</style>
