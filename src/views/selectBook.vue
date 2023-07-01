<template>
  <el-form
    ref="ruleFormRef"
    :model="ruleForm"
    status-icon
    :rules="rules"
    label-width="9em"
    label-position="left"
    class="demo-ruleForm"
  >
    <el-form-item label="选择书本" prop="pass">
      <el-select @change="setCurrentBook" v-model="value" clearable placeholder="Select">
        <el-option
          v-for="item in bookList"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>
<script setup>
import { ref, reactive, onMounted, toValue, toRaw, watch, computed } from "vue";

// import { createDB } from "./database";

import { useDeviceInfo } from "./useDeviceInfo";

import { useBookStore } from "../stores/books";
import { storeToRefs } from "pinia";

let useBook = useBookStore()

let { books, currentBook } = storeToRefs(useBook);
let { updateCurrentBook } = useBook

let bookList = computed(() => {
  return Object.keys(books.value)
})

const ruleFormRef = ref();


let value = computed({
  get () {
    return currentBook.value
  },
  set () {}
})

console.log(currentBook.value, bookList.value, value.value, '称得上')


function setCurrentBook (val) {
  console.log(val)
  updateCurrentBook(val)

}

const checkAge = (rule, value, callback) => {
  if (!value) {
    return callback(new Error("Please input the age"));
  }
  setTimeout(() => {
    if (!Number.isInteger(value)) {
      callback(new Error("Please input digits"));
    } else {
      if (value < 18) {
        callback(new Error("Age must be greater than 18"));
      } else {
        callback();
      }
    }
  }, 1000);
};

const validateTableSchema = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("数据库表结构为空"));
    return false;
  }
  try {
    let content = value.split(", ");
    let isPrimaryKey = content.some((key) => /^\+\+[a-zA-Z]/.test(key));
    if (!isPrimaryKey) {
      callback(new Error("数据库表没有索引键"));
      return false;
    }
    callback();
  } catch {
    callback(new Error("数据库表结构验证失败"));
  }
};
const validateTableName = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("数据库表名为空"));
  } else {
    callback();
  }
};

const ruleForm = reactive({
  tableName: "",
  tableSchema: "",
  tableInitData: [],
  age: "",
});

const rules = reactive({
  tableSchema: [{ validator: validateTableSchema, trigger: "blur" }],
  tableName: [{ validator: validateTableName, trigger: "blur" }],
  age: [{ validator: checkAge, trigger: "blur" }],
});

let data = ref();

const { getDeviceInfo } = useDeviceInfo();

onMounted(async () => {
  console.log(getDeviceInfo(), "getDeviceInfo");
  data.value = (await getDeviceInfo()).deviceType;
  // DBObj = await createDB("test");
});
</script>
