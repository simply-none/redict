<template>
  <div class="down-resource">
    <el-table :data="tableData" border style="width: 100%">
    <el-table-column prop="name" label="名称" />
    <el-table-column prop="link" label="链接">
      <template #default="scope">
        <a :href="scope.row.link" target="_blank" >{{ scope.row.link }}</a>
      </template>
    </el-table-column>
    <el-table-column prop="psd" label="密码" />
  </el-table>
  </div>
</template>

<script setup>
const tableData = [
  {
    name: '单词课本',
    link: 'https://wwvq.lanzouj.com/iMJuz1ke60na',
    psd: '51bg',
  },
  {
    name: 'bing词典源（2万常用单词版）',
    link: 'https://wwvq.lanzouj.com/i33se1ke66eh',
    psd: '5kuv',
  }
]
</script>


<style lang="scss" scoped>

</style>