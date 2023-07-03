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
      <el-radio-group v-model="ruleForm.studyMode" @change="setStudyMode">
        <el-radio :label="'review-past'">复习</el-radio>
        <el-radio :label="'study'">学习</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="单词学习个数" prop="studyCount">
      <el-radio-group v-model="ruleForm.studyCount" @change="setStudyCount">
        <el-radio :label="20" />
        <el-radio :label="30" />
        <el-radio :label="40" />
        <el-radio :label="50" />
        <el-radio :label="100" />
      </el-radio-group>
    </el-form-item>
    <el-form-item label="选择书本" prop="book">
      <el-select
        @change="setCurrentBook"
        v-model="ruleForm.book"
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
    <el-form-item label="选择范围" prop="range">
      <el-select
        @change="setCurrentRange"
        v-model="ruleForm.range"
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
    <el-form-item label="单词展示项" prop="showItem">
      <el-checkbox-group v-model="ruleForm.showItem" @change="setShowItem">
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
import { storeToRefs } from "pinia";

let useBook = useBookStore();

let props = defineProps({
  alreadySetBasic: {
    type: Boolean
  },
  validate: {
    type: Number
  }
})

let emit = defineEmits(['alreadySetBasicHandle'])

let {
  books,
  currentBook,
  showVocabularyItem,
  currentRange,
  studyMode,
  studyCount,
} = storeToRefs(useBook);
let {
  updateCurrentBook,
  updateStudyCount,
  updateStudyMode,
  updateCurrentRange,
  updateShowVocabularyItem,
} = useBook;

let bookList = computed(() => {
  return Object.keys(books.value).filter((book) => /^book-/.test(book));
});

let rangeList = computed(() => {
  return Object.keys(books.value).filter((book) => /^range-/.test(book));
});

const ruleFormRef = ref();

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

const ruleForm = reactive({
  book: "",
  range: "",
  showItem: [],
  studyMode: "study",
  studyCount: 30,
});

watch(() => props.validate, async () => {
  if (!ruleFormRef.value) return
  await ruleFormRef.value.validate((valid, fields) => {
    if (valid) {
      console.log('验证通过!')
      emit('alreadySetBasicHandle', true)
    } else {
      console.log('error submit!', fields)
    }
  })
})



// if (!studyMode.value) {
//   setStudyMode("study");
// }
// if (!studyCount.value) {
//   setStudyCount(30);
// }

ruleForm.book = computed({
  get() {
    return currentBook.value;
  },
  set() {},
});

ruleForm.showItem = computed({
  get() {
    return showVocabularyItem.value;
  },
  set() {},
});

ruleForm.range = computed({
  get() {
    return currentRange.value;
  },
  set() {},
});

ruleForm.studyMode = computed({
  get() {
    return studyMode.value;
  },
  set() {},
});

ruleForm.studyCount = computed({
  get() {
    return studyCount.value;
  },
  set() {},
});

function setCurrentBook(val) {
  console.log(val);
  updateCurrentBook(val);
}

function setCurrentRange(val) {
  console.log(val);
  updateCurrentRange(val);
}

function setStudyMode(val) {
  console.log(val);
  updateStudyMode(val);
}

function setStudyCount(val) {
  console.log(val);
  updateStudyCount(val);
}

function setShowItem(val) {
  console.log(val);
  updateShowVocabularyItem(val);
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

const validateStudyCount = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("单词学习个数不能为空"));
  } else {
    callback();
  }
};

const rules = reactive({
  book: [{ validator: validateBook, trigger: "blur" }],
  range: [{ validator: validateRange, trigger: "blur" }],
  studyMode: [{ validator: validateStudyMode, trigger: "blur" }],
  studyCount: [{ validator: validateStudyCount, trigger: "blur" }],
});

let data = ref();

onMounted(async () => {});
</script>
