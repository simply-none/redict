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
    <el-form-item label="上传数据类型" prop="type">
      <el-radio-group v-model="ruleForm.type">
        <el-radio :label="'range'">范围</el-radio>
        <el-radio :label="'book'">课本</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="选取书本数据" prop="pass">
      <el-upload
        ref="uploadRef"
        :disabled="!ruleForm.type"
        :on-change="beforeUpload"
        class="upload-demo"
        :auto-upload="false"
        :before-upload="beforeUpload"
        :show-file-list="false"
        @click="handleStart"
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
      <el-input v-model="ruleForm.tableName" autocomplete="off" />
    </el-form-item>
    <el-form-item label="数据库表结构设计" prop="tableSchema">
      <el-input v-model="ruleForm.tableSchema" autocomplete="off" />
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        :loading="saveLoading"
        @click="localSaveData(ruleFormRef)"
        >{{ saveField }}</el-button
      >
      <el-button @click="resetForm(ruleFormRef)">取消</el-button>
    </el-form-item>
  </el-form>
</template>
<script setup>
import { ElNotification } from "element-plus";
import { ref, reactive, watch, onMounted, computed, toValue, toRaw } from "vue";
import { setNotify } from "../utils/element-plus";
import useDBStore from "../stores/db";

let useDB = useDBStore();
let { getTable, addTable } = useDB;

const ruleFormRef = ref();

let saveField = ref("等待中");
let saveLoading = ref(true);

let tablename = ref("");
let uploadRef = ref();

const ruleForm = reactive({
  tableName: "",
  tableSchema: "",
  type: "",
  tableInitData: [],
});

const rules = reactive({
  type: [{ required: true, trigger: "change", message: "请选择上传类型" }],
  tableSchema: [{ validator: validateTableSchema, trigger: "blur" }],
  tableName: [{ validator: validateTableName, trigger: "blur" }],
});

function validateTableSchema  (rule, value, callback) {
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
function validateTableName (rule, value, callback) {
  if (value === "") {
    callback(new Error("数据库表名为空"));
  } else {
    callback();
  }
};

function localSaveData (formEl) {
  console.log(ruleForm, "数据");
  if (!formEl) return;
  saveField.value = "数据处理中";
  saveLoading.value = true;
  formEl.validate(async (valid) => {
    if (!valid) {
      console.log("error submit!");
      return false;
    } else {
      let bookTableName = ruleForm.tableName;
      await addTable(bookTableName, ruleForm.tableSchema);

      putData(bookTableName, toRaw(ruleForm.tableInitData));
      formEl.resetFields();
      saveField.value = "等待中";
      saveLoading.value = true;
    }
  });
};

function resetForm (formEl) {
  if (!formEl) return;
  formEl.resetFields();
};


function handleStart(e) {
  console.log(e);
  if (!ruleForm.type) {
    setNotify("请先选择上传文件类型", "warning", "警告");
    e.preventDefault();
    return false;
  }
}

function putData(tableName, data) {
  let t = tablename.value;
  let table = getTable(tableName);

  // 若已经有该数据，则清空后上传
  if (table) {
    table.clear();
  }

  console.log(table, tableName, data);
  table &&
    table
      .bulkPut(data)
      .then(() => {
        setNotify("文件数据已保存！", "success");
      })
      .catch((err) => {
        setNotify("保存失败，请稍后再试！", "error", "错误");
      });
}


function beforeUpload(uploadfile, uploadfiles) {
  console.log(uploadfile, uploadfiles);
  let tableName = uploadfile?.name ?? "";
  tableName = tableName.split(".")[0];
  if (uploadfile?.raw?.type !== "application/json") {
    setNotify("当前上传文件非json格式", "warning", "警告");
    return false;
  }
  var reader = new FileReader();
  // 读取文件中的内容，执行读文件函数，设置编码格式。
  reader.readAsText(uploadfile?.raw, "UTF-8");
  // 读取文件，得到文件内容。
  reader.onload = function (e) {
    var content = e?.target?.result;
    let initData = [];
    let schema = {};
    if (!content) {
      return false;
    }
    try {
      content = JSON.parse(content);
      let validateContent = Object.values(content).some((item, index) => {
        if (index === 0) {
          schema = item;
        }
        initData.push(item);
        if (ruleForm.type === "book") {
          return Object.prototype.toString.call(item) !== "[object Object]";
        }
        if (ruleForm.type === "range") {
          return Object.prototype.toString.call(item) !== "[object String]";
        }
        return true;
      });
      if (validateContent) {
        setNotify("内容数据格式错误", "warning", "警告");
        return false;
      }
      // 处理数据
      saveField.value = "保存";
      saveLoading.value = false;
      let schemaItems = "++id, " + Object.keys(schema).join(", ");
      if (ruleForm.type === "range") {
        initData = initData.map((word) => {
          return {
            n: word,
          };
        });
        schemaItems = "++id, n";
      }
      ruleForm.tableSchema = schemaItems;
      ruleForm.tableInitData = initData;
      if (ruleForm.type === "range") {
        ruleForm.tableName = "range-" + tableName;
      } else {
        ruleForm.tableName = "book-" + tableName;
      }
    } catch {
      setNotify("内容数据格式错误", "warning", "警告");
    }
    console.log();
  };
  return true;
}
</script>
