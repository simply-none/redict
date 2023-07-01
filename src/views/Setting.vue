<template>
  <el-drawer v-model="drawer" title="设置" size="100%" :before-close="handleClose">
    <div class="demo-collapse">
      <el-collapse accordion>
        <el-collapse-item name="1">
          <template #title>
            设备信息<el-icon class="header-icon">
              <info-filled />
            </el-icon>
          </template>
          <j-device/>
        </el-collapse-item>
        <el-collapse-item name="2">
          <template #title>
            数据上传<el-icon class="header-icon" title="仅支持json数据">
              <info-filled />
            </el-icon>
          </template>
          <UploadBook/>
        </el-collapse-item>
        <el-collapse-item name="3">
          <template #title>
            选择课本<el-icon class="header-icon" title="仅支持json数据">
              <info-filled />
            </el-icon>
          </template>
          <SelectBook/>
        </el-collapse-item>
      </el-collapse>
    </div>
  </el-drawer>
</template>

<script setup>
import { reactive, ref, onMounted, computed, toRaw } from "vue";
import { ElMessageBox, ElDescriptions, ElDescriptionsItem } from "element-plus";
import {RouterLink} from 'vue-router'
import JDevice from './Device.vue'
import UploadBook from './uploadBook.vue'
import SelectBook from './selectBook.vue'
import { routes } from '../router/index'
import {
  InfoFilled,
  Iphone,
  Location,
  OfficeBuilding,
  Tickets,
  User,
} from "@element-plus/icons-vue";



import { useBookStore } from "../stores/books";
import { storeToRefs } from "pinia";

let props = defineProps({
  visible: {
    type: Boolean
  }
})

let drawer = computed({
  get () {
    return props.visible
  },
  set () {}
})

let emit = defineEmits(['handleDrawer'])

function handleClose () {
  emit('handleDrawer', false)
}

let useBook = useBookStore()
let { currentBook, dbInstance } = storeToRefs(useBook);
// let { getTable } = useBook

let bookItem = ref()
</script>

<style scoped>
.el-descriptions {
  margin-top: 20px;
}
.cell-item {
  display: flex;
  align-items: center;
}
.margin-top {
  margin-top: 20px;
}

.my-label {
  background: var(--el-color-success-light-9);
}
.my-content {
  background: var(--el-color-danger-light-9);
}

.getDataTest {
  width: 100%;
  height: 100px;
  border: 1px solid red;

}
</style>
