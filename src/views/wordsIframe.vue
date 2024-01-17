<template>
  <iframe width="100%" height="100%" style="border: 0;" :src="wordOriginLink + encodeURI(word)" ref="iframeRef"></iframe>
  <hr />
</template>

<script setup>
import { nextTick, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useWordOriginStore } from "../stores/wordOrigin";

let props = defineProps({
  word: {
    type: String,
    default: () => 'upgrade'
  }
})

let iframeRef = ref();
let useWordOrigin = useWordOriginStore();
let { wordOriginLink, wordOriginList } = storeToRefs(useWordOrigin);
let { updateWordOriginLink } = useWordOrigin;

nextTick(() => {
  console.log(iframeRef, "ref");
});
</script>

<style lang="scss" scoped></style>
