<template>
  <div class="eD-outer">
    <el-dialog v-model="visible" :show-close="false" class="eD" :class="{ 'is-pc': isPC() }" :append-to-body="false">
      <template #header="{ close, titleId, titleClass }">
        <div class="eD-header" :class="titleClass">

        </div>
      </template>
      <div class="eD-header">
        {{ (errorList || [])?.length }}条错误信息
      </div>

      <div class="eD-error">

        <p class="eD-error-item" v-for="(error,index) in errorList" :key="error.id">
        <div class="eD-error-title">{{index + 1}}.{{ error?.msg }}</div>
        <div class="eD-error-stack">{{ error?.stack }}</div>
        </p>
      </div>
      <template #footer>
        <span class="eD-footer">
          <el-button @click="copyErrorInfo">复制</el-button>
          <el-button type="primary" @click="toggleVisible(false)">
            关闭
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { ElButton, ElDialog } from "element-plus";
import { CircleCloseFilled } from "@element-plus/icons-vue";
import { storeToRefs } from 'pinia'

import { useErrorStore } from "../stores/error";
import { isPC } from "../utils/common";

console.log(isPC(), 'isPCccc')

let useError = useErrorStore()
let { errorList } = storeToRefs(useError)
let { clearError } = useError

let visible = computed(() => !!errorList.value)

watch(errorList, (n, o) => {
  console.log(n, '当前的错误')
  if (n) {
    n.forEach(e => {
      console.log(e)
    })
  }
})

function copyErrorInfo() {
  console.log('复制成功')
}

function toggleVisible() {
  clearError()
}
</script>

<style scoped lang="scss">
.eD-outer {
  :deep(.el-overlay-dialog) {
    overflow: hidden;
  }
}

:deep(.eD) {
  top: 0;
  bottom: 0;
  margin: auto 10%;
  position: absolute;
  width: 80%;
  height: 80%;
  overflow: hidden;

  &.is-pc {
    margin: auto calc((100% - 760px) / 2);
    width: 760px;
  }

  @media (max-width: 960px) {
    margin: auto 10% !important;
    width: 80% !important;
  }

  .el-dialog__header {
    padding: 0;
  }

  .el-dialog__body {
    width: 100%;
    height: calc(100% - 72px);
    overflow: hidden;
    padding: 20px 20px 0 20px;
    margin-bottom: 20px;
  }

  .el-dialog__footer {
    text-align: center;
    padding-top: 0;
  }
}

.eD {
  margin: 0 auto;
  height: 80%;
  top: 10%;
  bottom: 10%;
  padding: 0;
  color: red;
  &-header {
    margin-bottom: 10px;
    text-align: center;
    font-size: 1.5em;
    font-weight: 900;
}
}

.eD-error {
  height: calc(100% - 42px);
    overflow: auto;
  &-item {
    &+& {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 3px solid #ebebeb; 
    }
  }

  &-title {
    font-weight: 900;
  }

  &-stack {
    word-wrap: break-word;
  }
}
</style>
