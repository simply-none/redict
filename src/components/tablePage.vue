<template>
  <el-table :data="data" max-height="250" style="width: 100%" border stripe>
    <el-table-column prop="index" label="序号" width="180">
      <template #default="scope">
        {{ (current - 1) * tablePageSize + (scope.$index) + 1 }}
      </template>
    </el-table-column>
    <template v-for="item in items" :key="item.prop">
      <el-table-column :prop="item.prop" :label="item.label" sortable />
    </template>
  </el-table>
  <el-pagination
    small
    background
    layout="pager"
    :total="tableLen"
    class="mt-4"
    :page-size="tablePageSize"
    @current-change="onCurrentChange"
    :pager-count="5"
  />
</template>

<script setup>
import { ref, reactive, onMounted, watch, toRaw } from "vue";

let props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  tablePageSize: Number,
  tableLen: Number,
  items: {
    type: Array,
    default: () => [],
  },
});

let current = ref(1)

let emit = defineEmits(['getData'])

function onCurrentChange (cur) {
  current.value = cur
  emit('getData', cur)
}
</script>

<style lang="scss" scoped>
.el-pagination {
  padding: 6px 0 0 0;
}
</style>
