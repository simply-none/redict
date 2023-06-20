<template>
  <el-button type="primary" style="margin-left: 16px" @click="drawer = true">
    open
  </el-button>

  <el-drawer v-model="drawer" title="设置" size="100%">
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
        <el-collapse-item title="Feedback" name="2">
          <div>
            Operation feedback: enable the users to clearly perceive their
            operations by style updates and interactive effects;
          </div>
          <div>
            Visual feedback: reflect current state by updating or rearranging
            elements of the page.
          </div>
        </el-collapse-item>
        <el-collapse-item title="Efficiency" name="3">
          <div>
            Simplify the process: keep operating process simple and intuitive;
          </div>
          <div>
            Definite and clear: enunciate your intentions clearly so that the
            users can quickly understand and make decisions;
          </div>
          <div>
            Easy to identify: the interface should be straightforward, which
            helps the users to identify and frees them from memorizing and
            recalling.
          </div>
        </el-collapse-item>
        <el-collapse-item title="Controllability" name="4">
          <div>
            Decision making: giving advices about operations is acceptable, but
            do not make decisions for the users;
          </div>
          <div>
            Controlled consequences: users should be granted the freedom to
            operate, including canceling, aborting or terminating current
            operation.
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </el-drawer>

  <el-descriptions title="路由" :column="1" border>
    <el-descriptions-item  v-for="route in routes" :key="route.path" label="route.name" label-align="right" align="center"
      ><router-link :to="route.path"><div>{{ route.path }}</div></router-link></el-descriptions-item
    >
  </el-descriptions>

  
</template>

<script setup>
import { reactive, ref, onMounted, computed } from "vue";
import { ElMessageBox, ElDescriptions, ElDescriptionsItem } from "element-plus";
import {RouterLink} from 'vue-router'
import JDevice from './Device.vue'
import { routes } from '../router/index'
import {
  InfoFilled,
  Iphone,
  Location,
  OfficeBuilding,
  Tickets,
  User,
} from "@element-plus/icons-vue";

const drawer = ref(false);

const allRoute = ref(routes)

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
</style>
