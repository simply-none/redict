import {
  reactive,
  ref,
  onMounted,
  computed,
  toRaw,
  watch,
  watchEffect,
  unref,
} from "vue";
import { ElNotification, ElMessage, ElLoading } from "element-plus";

import { useBookStore } from "../stores/books";
import useDBStore from "../stores/db";
import { storeToRefs } from "pinia";

import moment from "moment";

import { setNotify } from "../utils/element-plus";

export function useVoca() {
  let useBook = useBookStore();
  let useDB = useDBStore();

  // 今日学习数据
  let todayStudyWordsTable = ref();
  let todayStudyWords = ref();

  let couldStudyWordsName = ref([]);

  // 获取书本学习的范围数据表
  let rangeTable = ref();
  let rangeWords = ref([]);

  let table = ref();

  // 获取已学习过的单词的数据表
  let studyTalbe = ref();

  let studyWords = ref([]);

  let reviewMode = ref(false);

  const fullscreenLoading = ref(true);

  let centerDialogVisible = ref(false);

  let {
    todayStudyVocabulary,
    basicData,
  } = storeToRefs(useBook);

  let { getTable, addTable } = useDB;

  const drawer = ref(false);

  let bookItem = ref(null);

  watch(
    basicData,
    () => {
      console.log("进来");
      getData();
    },
    {
      deep: true,
      // immediate: true
    }
  );

  // 改造start
  async function getData() {
    // 学习过的数据表
    studyTalbe.value = await getDatabaseTable("studied-voca", "++id, n, date");
    console.log(basicData.value, "测试basicData");
    // fullscreenLoading.value = true;
    let isRequired = isRequiredField(basicData);
    console.log(isRequired, "fs");
    if (!isRequired) {
      setNotify("请完成基础设置后再试");
      drawer.value = true;
      fullscreenLoading.value = false;
      return false;
    }
    let message =
      "你当前正处于" +
      basicData.value.studyMode +
      "模式" +
      "，范围值：" +
      basicData.value.currentRange +
      "，当前课本：" +
      basicData.value.currentBook;
    setNotify(message, "success");
    console.log(isRequired, "是否含有必须字段");

    // 加载所有相关表
    // 今日数据表
    todayStudyWordsTable.value = await getDatabaseTable(
      "today-studied-voca",
      "++id"
    );

    // 总数据表
    table.value = await getDatabaseTable(basicData.value.currentBook, "");
    // 范围表
    rangeTable.value = await getDatabaseTable(basicData.value.currentRange, "");

    // 后续操作...
    todayStudyWords.value = await getTypeData(todayStudyWordsTable);
    rangeWords.value = await getTypeFilterData(rangeTable);
    studyWords.value = await getTypeFilterData(studyTalbe);

    await getTodayStudyWords();

    couldStudyWordsName.value = await getCouldStudyWords(true);

    if (table.value) {
      bookItem.value = await showVocabularyCard();
      fullscreenLoading.value = false;
    }

    reviewMode.value = moreThanTodayPlan();
  }

  function isRequiredField(obj) {
    obj = unref(obj);
    if (!obj) {
      return false;
    }
    const required = ["currentBook", "currentRange", "studyMode", "studyCount"];
    return required.every((field) => {
      return obj[field];
    });
  }

  // 改造end

  // onMounted生命周期放顶部，不然控制台一大堆警告

  // 今日是否已学习了50个单词，学习了就自动开启复习模式
  function moreThanTodayPlan() {
    if (reviewMode.value) {
      return true;
    }
    if (basicData.value.studyMode !== "study") {
      return true;
    }
    if (todayStudyVocabulary.value.length >= basicData.value.studyCount) {
      // 弹出学习提示框（完成50个）
      // startReviewMode(true)
      setNotify("今日单词计划已完成，将开启复习模式！", "success", "恭喜");
      reviewMode.value = true;
      return true;
    }
    return false;
  }

  // 获取能够展示单词卡片的索引
  async function getCouldStudyWords(isInit = false) {
    if (!basicData.value.currentBook || !basicData.value.currentRange) {
      return [];
    }

    let studyWordsData = [];
    // 查看是否是复习过去的单词模式
    console.log(basicData.value.studyMode, "复习模式");
    if (basicData.value.studyMode === "review-past") {
      studyWordsData = toRaw(studyWords.value);
    }

    let moreThanPlan = moreThanTodayPlan();

    // 超过今天计划，则自动开启复习模式
    if (basicData.value.studyMode === "study" && moreThanPlan) {
      studyWordsData = toRaw(todayStudyVocabulary.value);
    }
    if (basicData.value.studyMode === "study" && !moreThanPlan) {
      // 第一次初始化，则从表中读取
      if (isInit) {
        studyWordsData = await table.value
          .filter(
            (word) =>
              !studyWords.value.includes(word.n) &&
              rangeWords.value.includes(word.n)
          )
          .toArray();
        studyWordsData = studyWordsData.map((word) => word.n);
      }
      // 非第一次初始化，直接过滤
      if (!isInit) {
        studyWordsData = couldStudyWordsName.value.filter(
          (word) => !todayStudyVocabulary.value.includes(word)
        );
      }
    }
    // 获取过滤后的可学习/复习的单词索引
    return studyWordsData;
  }

  // 展示单词卡片
  async function showVocabularyCard() {
    couldStudyWordsName.value = await getCouldStudyWords();
    let len = couldStudyWordsName.value.length;

    if (len === 0) {
      setNotify(
        `当前模式${basicData.value.studyMode}下，没有能够学习的单词，请切换模式！`
      );
      drawer.value = true;
      return false;
    }

    let random = generateRandom(len);

    // 根据标识在总数据表中获取该标识对应的数据
    let vocabularycard = await table.value.get({
      n: couldStudyWordsName.value[random],
    });
    return vocabularycard;
  }

  function generateRandom(range) {
    let moreThanPlan = moreThanTodayPlan();
    let random = 0;

    if (basicData.value.studyMode === "study" && !moreThanPlan) {
      random = Math.floor(Math.random() * range);
    }

    if (basicData.value.studyMode === "review-past" || moreThanPlan) {
      let lastVocabulary = bookItem.value?.n;
      let findIndex = couldStudyWordsName.value.findIndex(
        (name) => lastVocabulary === name
      );

      if (findIndex !== -1) {
        random = findIndex + 1 === range ? 0 : findIndex + 1;
      }
    }
    return random;
  }

  async function getTypeData(table) {
    return await table.value.toArray();
  }

  async function getTypeFilterData(table) {
    let words = await getTypeData(table);
    return words.map((word) => word.n);
  }

  function getTodayDate() {
    return moment().format("YYYY-MM-DD");
  }

  async function getTodayStudyWords() {
    // 看是否是今日学习单词，如果不是，则清空今日单词库
    let isToday = getTodayDate();
    let hasNotTodayWords = (todayStudyWords.value || []).some((word) => {
      console.log(word, isToday);
      return word.date !== isToday;
    });
    if (hasNotTodayWords) {
      await todayStudyWordsTable.value.orderBy().delete();
    }

    todayStudyWords.value = await getTypeFilterData(todayStudyWordsTable);

    // 将数据库中今日学习单词，合并到当前的状态管理对象中
    todayStudyVocabulary.value = [
      ...new Set(todayStudyVocabulary.value.concat(todayStudyWords.value)),
    ];
  }

  // 获取数据表，无则创建表
  async function getDatabaseTable(tableName, tableSchema) {
    let loadTable = getTable(tableName);
    if (!loadTable) {
      await addTable(tableName, tableSchema);
      loadTable = getTable(tableName);
    }
    return loadTable;
  }

  function startReviewMode(visible) {
    centerDialogVisible.value = visible;
  }

  async function handleDrawer(payload) {
    drawer.value = payload.drawer;
    if (payload.drawer) {
      return false;
    }
    if (!basicData.value.currentBook || !basicData.value.currentRange) {
      return false;
    }
    table.value = await getDatabaseTable(basicData.value.currentBook, "");
    rangeTable.value = await getDatabaseTable(basicData.value.currentRange, "");
    rangeWords.value = await getTypeFilterData(rangeTable);
    fullscreenLoading.value = true;
    couldStudyWordsName.value = await getCouldStudyWords(true);

    if (table.value) {
      bookItem.value = await showVocabularyCard();
      fullscreenLoading.value = false;
    }
  }

  async function getDataTest() {
    bookItem.value = await showVocabularyCard("update");
    fullscreenLoading.value = false;
    putStudiedVocabulary(toRaw(bookItem.value));
  }

  async function putStudiedVocabulary(data) {
    let date = getTodayDate();

    let findPutData = await studyTalbe.value.get({ n: data.n });

    let putData = {
      ...findPutData,
      id: data.id,
      n: data.n,
      date: date,
      count: findPutData?.count ? findPutData.count + 1 : 1,
    };
    if (basicData.value.studyMode === "study") {
      todayStudyVocabulary.value.push(putData.n);
      todayStudyWordsTable.value.put(putData);
    }

    studyTalbe.value.put(putData);
  }

  return {
    bookItem,
    fullscreenLoading,
    drawer,
    handleDrawer,
    centerDialogVisible,
    getDataTest,
  };
}
