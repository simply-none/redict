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
    <el-form-item label="选取书本数据" prop="pass">
      <el-upload
        ref="uploadRef"
        :on-change="beforeUpload"
        class="upload-demo"
        :auto-upload="false"
        :before-upload="beforeUpload"
      >
        <template #trigger>
          <el-button type="primary">选择文件</el-button>
        </template>

        <template #tip>
          <div class="el-upload__tip">请上传数组对象格式的json文件</div>
        </template>
      </el-upload>
    </el-form-item>
    <el-form-item label="数据库表名" prop="tableName">
      <el-input
        v-model="ruleForm.tableName"
        autocomplete="off"
      />
    </el-form-item>
    <el-form-item label="数据库表结构设计" prop="tableSchema">
      <el-input
        v-model="ruleForm.tableSchema"
        autocomplete="off"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="localSaveData(ruleFormRef)"
        >本地保存</el-button
      >
      <el-button @click="resetForm(ruleFormRef)">取消</el-button>
    </el-form-item>
  </el-form>
</template>
<script setup>
import { ElNotification, } from "element-plus";
import { ref, reactive, onMounted, computed, toValue, toRaw } from "vue";

// import { createDB } from "../hooks/database";

import { useDeviceInfo } from "./useDeviceInfo";

import { useBookStore } from "../stores/books";
import { storeToRefs } from "pinia";

let useBook = useBookStore()
let { dbInstance } = storeToRefs(useBook);

const ruleFormRef = ref();

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
    return false
  }
  try {
    let content = value.split(', ')
    let isPrimaryKey = content.some(key => /^\+\+[a-zA-Z]/.test(key))
    if (!isPrimaryKey) {
      callback(new Error("数据库表没有索引键"));
      return false
    }
    callback()

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

const localSaveData = (formEl) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (!valid) {
      console.log("error submit!");
      return false;
    } else {
      let bookTableName = 'book-' + ruleForm.tableName
      await addTable(bookTableName, ruleForm.tableSchema)

      putData(bookTableName, toRaw(ruleForm.tableInitData))
    }
  });
};

const resetForm = (formEl) => {
  if (!formEl) return;
  formEl.resetFields();
};

let data = ref();

let schema = ref("");
let tablename = ref("");

const { getDeviceInfo } = useDeviceInfo();

onMounted(async () => {
  console.log(getDeviceInfo(), "getDeviceInfo");
  data.value = (await getDeviceInfo()).deviceType;
});

async function addTable(tableName, tableSchema) {
  // 必须等待表建完之后，才能handleT
  await dbInstance.value.addTable(tableName, tableSchema);
}

function putData (tableName, data) {
  let t = tablename.value;
  let table = dbInstance.value.getTable(tableName);
  console.log(table, tableName, data);
  table &&
    table.bulkPut(data);
}

const uploadRef = ref();

function beforeUpload(uploadfile, uploadfiles) {
  console.log(uploadfile, uploadfiles);
  let tableName = uploadfile?.name??''
  tableName = tableName.split('.')[0]
  if (uploadfile?.raw?.type !== "application/json") {
    ElNotification({
      title: "警告",
      message: "当前上传文件非json格式",
      type: "warning",
    });
    return false;
  }
  var reader = new FileReader();
  // 读取文件中的内容，执行读文件函数，设置编码格式。
  reader.readAsText(uploadfile?.raw, "UTF-8");
  // 读取文件，得到文件内容。
  reader.onload = function (e) {
    var content = e?.target?.result;
    let initData = []
    let schema = {}
    if (!content) {
      return false;
    }
    try {
      content = JSON.parse(content);
      let validateContent = Object.values(content).some(
        (item, index) => {
          if (index === 0) {
            schema = item
          }
          initData.push(item)
          return Object.prototype.toString.call(item) !== "[object Object]"
        }
      );
      if (validateContent) {
        ElNotification({
          title: "警告",
          message: "内容数据格式错误",
          type: "warning",
        });
        return false
      }
      // 处理数据
      let schemaItems = "++id, " + Object.keys(schema).join(', ')
      ruleForm.tableSchema = schemaItems
      ruleForm.tableInitData = initData
      ruleForm.tableName = tableName
    } catch {
      ElNotification({
        title: "警告",
        message: "内容数据格式错误",
        type: "warning",
      });
    }
    console.log();
  };
  return true;
}
</script>
../hooks/database