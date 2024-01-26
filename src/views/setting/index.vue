<template>
  <el-drawer :modal-class="{ 'is-pc': isPC(), 'setting-drawer': true }" v-model="drawer" title="设置" size="100%" :before-close="handleClose" class="word-main-page-setting">
    <div class="demo-collapse">
      <el-collapse v-model="activeCollapse" @change="setSymbol">
        <el-collapse-item name="3">
          <template #title>
            基础设置<el-icon class="header-icon" title="仅支持json数据">
              <info-filled />
            </el-icon>
          </template>
          <SelectBook :validate="validateSymbol" :alreadySetBasic="alreadySetBasic"
            @alreadySetBasicHandle="alreadySetBasicHandle" />
        </el-collapse-item>
        <el-collapse-item name="7">
          <template #title>
            课本词典资源下载<el-icon class="header-icon" title="点击链接跳转">
              <info-filled />
            </el-icon>
          </template>
          <DownloadResourceVue />
        </el-collapse-item>
        <el-collapse-item name="2">
          <template #title>
            数据上传<el-icon class="header-icon" title="仅支持json数据">
              <info-filled />
            </el-icon>
          </template>
          <UploadBook />
        </el-collapse-item>
        <el-collapse-item name="6">
          <template #title>
            基础数据览表<el-icon class="header-icon">
              <info-filled />
            </el-icon>
          </template>
          <ShowBasicInfo />
        </el-collapse-item>
        <el-collapse-item name="5">
          <template #title>
            详情数据览表<el-icon class="header-icon">
              <info-filled />
            </el-icon>
          </template>
          <ShowDescInfo />
        </el-collapse-item>
        <el-collapse-item name="1">
          <template #title>
            设备信息<el-icon class="header-icon">
              <info-filled name="1" />
            </el-icon>
          </template>
          <j-device :isCurrent="currentCollapse.includes('1')" />
        </el-collapse-item>
        <el-collapse-item name="22">
          <template #title>
            应用导航<el-icon class="header-icon" title="">
              <info-filled />
            </el-icon>
          </template>
          <div v-for="route in routes" :key="route.id" @click="$router.push({ name: route.name })">
            <el-link type="primary">{{ route.meta?.title }}</el-link>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </el-drawer>
</template>

<script setup>
import { reactive, ref, onMounted, computed, toRaw } from "vue";
import { ElMessageBox, ElDescriptions, ElDescriptionsItem } from "element-plus";
import { RouterLink } from "vue-router";
import {
  InfoFilled,
  Iphone,
  Location,
  OfficeBuilding,
  Tickets,
  User,
} from "@element-plus/icons-vue";

import { routes } from "../../router/index";

import JDevice from "../../components/device.vue";
import UploadBook from "./uploadBook.vue";
import DownloadResourceVue from "./downloadResource.vue";
import SelectBook from "./selectBook.vue";
import ShowDescInfo from "./showDescInfo.vue";
import ShowBasicInfo from "./showBasicInfo.vue";

import { isPC } from "../../utils/common";

let activeCollapse = ref(["2", "3", "5", "6"]);
let currentCollapse = ref([]);

let alreadySetBasic = ref(false);
let validateSymbol = ref(Date.now());

let props = defineProps({
  visible: {
    type: Boolean,
  },
});

let drawer = computed({
  get() {
    return props.visible;
  },
  set() { },
});

function alreadySetBasicHandle(val) {
  alreadySetBasic.value = val.isSetBasic;
  emit("handleDrawer", {
    drawer: false,
    changed: val.changed,
  });
}

function setSymbol(val) {
  currentCollapse.value = val;
}

let emit = defineEmits(["handleDrawer"]);

function handleClose(done) {
  validateSymbol.value = Date.now();
  if (!alreadySetBasic.value) {
    return false;
  }
}
</script>

<style scoped lang="scss">
:global(.setting-drawer.is-pc) {
  max-width: 520px;
}
:deep(.el-collapse-item__header) {
  font-size: 1em;
}

:global(.el-drawer.word-main-page-setting) {
  color: red;

}

:global(.el-drawer.word-main-page-setting .el-drawer__header) {
  margin: 0;
  padding: 3px var(--el-drawer-padding-primary);
  background: #f7f7f7;
}

:global(.el-drawer.word-main-page-setting .el-drawer__body) {
  margin: 0;
  padding-top: 0px;
}

</style>
