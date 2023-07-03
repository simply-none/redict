<!-- 展示当日完成的单词列表 -->
<template>
  <h3 class="today-voca-head">{{ todayDate }}背诵单词，共计：{{ vocalist.length }}个</h3>
  <el-table :data="vocalist" max-height="250" style="width: 100%" border stripe>
    <el-table-column prop="index" label="序号" width="180">
      <template #default="scope">
        {{ scope.$index + 1 }}
      </template>
    </el-table-column>
    <el-table-column prop="n" label="单词" sortable/>
    <el-table-column prop="count" label="次数" sortable/>
  </el-table>

  <h3 class="today-voca-head">历史背诵单词，共计：{{ historyVocalist.length }}个</h3>
  <el-table :data="historyVocalist"  max-height="250" style="width: 100%" border stripe>
    <el-table-column prop="index" label="序号" width="180">
      <template #default="scope">
        {{ scope.$index + 1 }}
      </template>
    </el-table-column>
    <el-table-column prop="n" label="单词" sortable/>
    <el-table-column prop="count" label="次数" sortable/>
    <el-table-column prop="date" label="日期" sortable/>
  </el-table>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue";

import { useBookStore } from "../stores/books";
import { storeToRefs } from "pinia";

import moment from "moment";

let todayDate = ref(moment().format('YYYY年M月D日'))

let useBook = useBookStore();

let { dbInstance } = storeToRefs(useBook);

let todayTable = dbInstance.value.getTable("today-studied-voca");
let historyTable = dbInstance.value.getTable("studied-voca");

let vocalist = ref([]);
let historyVocalist = ref([])
const size = ref("");

getVocaList();

getHistoryVocaList()

async function getVocaList() {
  vocalist.value = await todayTable.toArray();
  console.log(vocalist.value);
}

async function getHistoryVocaList() {
  historyVocalist.value = await historyTable.toArray();
  console.log(historyVocalist.value);
}


</script>
<style lang="scss" scoped>
.today-voca {
  &-head {
    padding: 1em 0;
    font-weight: 600;
    color: #666;
  }
}
</style>
