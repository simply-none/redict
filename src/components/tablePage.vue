<template>
  <el-table :data="data" max-height="250" style="width: 100%" border stripe>
    <el-table-column prop="index" label="序号" width="60">
      <template #default="scope">
        {{ (current - 1) * tablePageSizeF + scope.$index + 1 }}
      </template>
    </el-table-column>
    <template v-for="item in items" :key="item.prop">
      <el-table-column :prop="item.prop" :label="item.label" sortable>
        <template #default="scope">
          <a
            v-if="$attrs.linkToBing && item.prop === 'n'"
            target="_blank"
            :href="
              wordOriginLink + encodeURI(scope.row.n)
            "
          >
            {{ scope.row.n }}
          </a>
          <div v-else>{{ scope.row[item.prop] }}</div>
        </template>
      </el-table-column>
    </template>

    <el-table-column
      label="操作"
      align="right"
      fixed="right"
      v-if="$attrs.showHandle"
    >
      <template #default="scope">
        <slot name="handle" :data="scope"></slot>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination
    small
    background
    layout="pager, sizes"
    :total="tableLen"
    class="mt-4"
    :page-sizes="[10, 20, 30, 50, 100]"
    v-model:page-size="tablePageSizeF"
    v-model:current-page="currentPage"
    :pager-count="5"
  />
</template>
<script>
export default {
  inheritAttrs: false,
};
</script>
<script setup>
import { ref, reactive, onMounted, watch, toRaw, computed } from "vue";
import { storeToRefs } from "pinia";

import { useWordOriginStore } from '../stores/wordOrigin'

let useWordOrigin = useWordOriginStore()
let { wordOriginLink } = storeToRefs(useWordOrigin)

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

let tablePageSizeF = ref(props.tablePageSize);

let currentPage = ref(1);

let current = ref(1);

let emit = defineEmits(["getData"]);

watch(currentPage, (n, o) => {
  console.log("hhh");
  current.value = n;
  emit("getData", n, tablePageSizeF.value);
});

watch(tablePageSizeF, (n, o) => {
  console.log("hhh");
  current.value = currentPage.value;
  emit("getData", currentPage.value, n);
});

function onCurrentChange(cur) {
  current.value = cur;
  emit("getData", cur);
}
</script>

<style lang="scss" scoped>
.el-pagination {
  padding: 6px 0 0 0;
}
</style>
