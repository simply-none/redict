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
    <el-form-item label="学习模式" prop="studyMode">
      <el-radio-group
        v-model="ruleForm.studyMode"
        @change="setBasicInfo($event, 'studyMode')"
      >
        <el-radio :label="'review-past'">复习</el-radio>
        <el-radio :label="'study'">学习</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="单词学习个数" prop="studyCount">
      <el-radio-group
        v-model="ruleForm.studyCount"
        @change="setBasicInfo($event, 'studyCount')"
      >
        <el-radio :label="count" v-for="count in studyCounts" :key="count" />
      </el-radio-group>
    </el-form-item>
    <el-form-item label="选择书本" prop="currentBook">
      <el-select
        @change="setBasicInfo($event, 'currentBook')"
        v-model="ruleForm.currentBook"
        clearable
        placeholder="Select"
      >
        <el-option
          v-for="item in bookList"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="选择范围" prop="currentRange">
      <el-select
        @change="setBasicInfo($event, 'currentRange')"
        v-model="ruleForm.currentRange"
        clearable
        placeholder="Select"
      >
        <el-option
          v-for="item in rangeList"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="展示模式" prop="showMode">
      <el-radio-group
        v-model="ruleForm.showMode"
        @change="setBasicInfo($event, 'showMode')"
      >
        <el-radio :label="'concise'">简洁</el-radio>
        <el-radio :label="'normal'">普通</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="单词展示项" prop="showVocabularyItem" v-if="ruleForm.showMode === 'normal'">
      <el-checkbox-group
        v-model="ruleForm.showVocabularyItem"
        @change="setBasicInfo($event, 'showVocabularyItem')"
      >
        <el-checkbox
          :label="item.name"
          border
          v-for="item in showVocabularyList"
          :key="item.label"
          >{{ item.label }}</el-checkbox
        >
      </el-checkbox-group>
    </el-form-item>
  </el-form>
</template>
<script setup>
import { ref, reactive, onMounted, toValue, toRaw, watch, computed } from "vue";

import { useBookStore } from "../stores/books";
import useDBStore from "../stores/db";
import { storeToRefs } from "pinia";

let useBook = useBookStore();
let useDB = useDBStore();

let props = defineProps({
  alreadySetBasic: {
    type: Boolean,
  },
  validate: {
    type: Number,
  },
});

let emit = defineEmits(["alreadySetBasicHandle"]);

let { basicData } = storeToRefs(useBook);
let { updateBasicInfo } = useBook;
let { schema } = storeToRefs(useDB);

let bookList = computed(() => {
  return Object.keys(schema.value).filter((book) => /^book-/.test(book));
});

let rangeList = computed(() => {
  return Object.keys(schema.value).filter((range) => /^range-/.test(range));
});

const ruleFormRef = ref();

let studyCounts = [10, 15, 20, 30, 50, 100];

let showVocabularyList = [
  {
    label: "单词变形",
    name: "t",
  },
  {
    label: "简要解释",
    name: "ps",
  },
  {
    label: "中英双解",
    name: "pd",
  },
  {
    label: "短语",
    name: "ph",
  },
  {
    label: "同义词辨析",
    name: "sy",
  },
  {
    label: "词语搭配",
    name: "col",
  },
  {
    label: "相关词汇",
    name: "oth",
  },
];

// 学习模式是否改变，改变时，需要刷新一下数据
let changed = ref(false);

const ruleForm = reactive(basicData.value);

watch(
  () => props.validate,
  async () => {
    if (!ruleFormRef.value) return;
    await ruleFormRef.value.validate((valid, fields) => {
      if (valid) {
        
        emit("alreadySetBasicHandle", {
          isSetBasic: true,
          changed: changed.value,
        });
        changed.value = false;
      } else {
        
      }
    });
  }
);

function setBasicInfo(val, field) {
  
  updateBasicInfo(field, val);
  let changedField = ["currentBook", "currentRange"];
  if (changedField.includes(field)) {
    changed.value = true;
  }
}

const validateBook = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("当前书本不能为空"));
  } else {
    callback();
  }
};

const validateRange = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("当前范围不能为空"));
  } else {
    callback();
  }
};

const validateStudyMode = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("学习模式不能为空"));
  } else {
    callback();
  }
};

const validateShowMode = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("展示模式不能为空"));
  } else {
    callback();
  }
};

const validateStudyCount = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("单词学习个数不能为空"));
  } else {
    callback();
  }
};

const rules = reactive({
  currentBook: [{ validator: validateBook, trigger: "blur" }],
  currentRange: [{ validator: validateRange, trigger: "blur" }],
  studyMode: [{ validator: validateStudyMode, trigger: "blur" }],
  showMode: [{ validator: validateShowMode, trigger: "blur" }],
  studyCount: [{ validator: validateStudyCount, trigger: "blur" }],
});
</script>
