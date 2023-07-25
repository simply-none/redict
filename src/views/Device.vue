<template>
  <el-descriptions class="margin-top" :column="2" :size="size" border>
    <el-descriptions-item
      v-for="[key, value] in Object.entries(device)"
      :key="key"
    >
      <template #label>
        <div class="cell-item">
          <el-icon :style="iconStyle">
            <user />
          </el-icon>
          {{ key }}
        </div>
      </template>
      {{ value }}
    </el-descriptions-item>
  </el-descriptions>
</template>

<script setup>
import { reactive, ref, onMounted, computed,watch } from "vue";
import { ElDescriptions, ElDescriptionsItem } from 'element-plus'
import { useDeviceInfo } from "../hooks/useDeviceInfo";

import {
  InfoFilled,
  Iphone,
  Location,
  OfficeBuilding,
  Tickets,
  User,
} from "@element-plus/icons-vue";

let props = defineProps({
  isCurrent: {
    type: Boolean,
    default: () => false
  }
})

const { getDeviceInfo } = useDeviceInfo();
let device = ref({});
const size = ref("");
const iconStyle = computed(() => {
  const marginMap = {
    large: "8px",
    default: "6px",
    small: "4px",
  };
  return {
    marginRight: marginMap[size.value] || marginMap.default,
  };
});


watch(() => props.isCurrent, async (n, o) => {
  
  let isDevice = Object.keys(device.value)
  if (isDevice.length > 0) {
    return false
  }
  if (!n) {
    return false
  }
  device.value = (await getDeviceInfo());
})

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
</style>
