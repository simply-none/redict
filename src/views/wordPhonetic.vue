<template>
  <!-- 音标 -->
  <div class="voca-card-voca-phonetic">
      <template v-for="phonetic in bookItem?.p" :key="phonetic.id">
        <span
          @click.stop="getFayin(phonetic.t || 'default')"
          class="voca-card-voca-phonetic-item"
          >{{ phonetic.t }}</span
        >
        <span
          @click.stop="getFayin(phonetic.t || 'default')"
          class="voca-card-voca-phonetic-item"
          >{{ phonetic.p }}</span
        >
        <audio
          preload="none"
          :ref="(el) => (fayinList[phonetic.t || 'default'] = el)"
        >
          <source :title="phonetic.a" type="audio/mpeg" :src="phonetic.a" />
        </audio>
      </template>
    </div>
</template>

<script setup>
import { ref, reactive, watchEffect, watch } from "vue";
import { setNotify } from "../utils/element-plus";
let fayinList = reactive({});

defineProps({
  bookItem: {
    type: Object
  }
})

function getFayin(uk) {
  const refuk = fayinList[uk];
  if (!refuk) {
    setNotify("当前单词没有音源");
    return false;
  }
  refuk.load();
  setTimeout(() => {
    refuk.play();
  }, 1000);
}
</script>

<style scoped lang="scss">
.left {
  width: 100%;
}
.voca-card {
  &-voca-phonetic {
    &-item {
      font-size: 1em;
      font-weight: 900;
      display: inline-block;
      cursor: pointer;
      color: #666;
      &:nth-child(2) {
        margin: 0 1em 0 0;
      }
    }
  }
}
</style>
