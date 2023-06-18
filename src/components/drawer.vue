<template>
  <el-drawer
    ref="drawerRef"
    v-model="showSelf"
    title="I have a nested form inside!"
    :before-close="handleClose"
    direction="ltr"
    class="demo-drawer"
  >
    <div class="demo-drawer__content">
      <el-form :model="form">
        <el-form-item label="Name" :label-width="formLabelWidth">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Area" :label-width="formLabelWidth">
          <el-select
            v-model="form.region"
            placeholder="Please select activity area"
          >
            <el-option label="Area1" value="shanghai" />
            <el-option label="Area2" value="beijing" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="demo-drawer__footer">
        <el-button @click="cancelForm">Cancel</el-button>
        <el-button type="primary"  @click="onClick">{{
          'Submit'
        }}</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { ElDrawer, ElMessageBox } from 'element-plus'

const props = defineProps(['show'])
const emit = defineEmits(['close'])

let showSelf = computed(() => props.show)

const formLabelWidth = ref('80px')
let timer

const form = reactive({
  name: '',
  region: '',
  date1: '',
  date2: '',
  delivery: false,
  type: [],
  resource: '',
  desc: '',
})


const drawerRef = ref()
const onClick = () => {
  drawerRef.value.close()
}

const handleClose = (done) => {
  drawerRef.value.close()
  emit('close')
}

const cancelForm = () => {
  loading.value = false
  dialog.value = false
  clearTimeout(timer)
}
</script>
