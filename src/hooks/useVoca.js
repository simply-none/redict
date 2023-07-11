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
import { storeToRefs } from "pinia";

import moment from "moment";

export function useVoca() {
  // 今日学习数据

  let useBook = useBookStore();

  let databaseTableList = reactive({});

  // 今日学习数据
  let todayStudyWordsTable = ref();
  let todayStudyWords = ref();

  let couldStudyIndexData = ref([]);

  // 展示的单词卡片数据
  let vocabularyCardInitData = ref({});

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

  let fayinList = reactive({});

  let {
    todayStudyVocabulary,
    showVocabularyItem,
    currentBook,
    currentRange,
    dbInstance,
    studyMode,
    studyCount,
    basicData,
  } = storeToRefs(useBook);

  let { updateBasicInfo } = useBook;
  // let { getTable } = useBook

  const drawer = ref(false);

  let bookItem = ref(null);

  watch(() => basicData.value, getData, {
    immediate: true,
  });

  // 改造start
  async function getData() {
    console.log(basicData.value, "测试basicData");
    let isRequired = isRequiredField(basicData);
    if (!isRequired) {
      setNotify("请完成基础设置后再试");
      return false;
    }
    let message =
      "你当前正处于" +
      studyMode.value +
      "模式" +
      "，范围值：" +
      currentRange.value +
      "，当前课本：" +
      currentBook.value;
    setNotify(message, "success");
    console.log(isRequired, "是否含有必须字段");

    // 加载所有相关表
    // 今日数据表
    todayStudyWordsTable.value = await getDatabaseTable(
      "today-studied-voca",
      "++id"
    );
    // 学习过的数据表
    studyTalbe.value = await getDatabaseTable("studied-voca", "++id, n, date");
    // 总数据表 
    table.value = await getDatabaseTable(currentBook.value, "");
    // 范围表
    rangeTable.value = await getDatabaseTable(currentRange.value, '');

    // 后续操作...
    console.log(todayStudyWordsTable, studyTalbe, table, rangeTable, 'tables')

    await initTodayStudyWordComp()

    await initStudyWordComp()

    reviewMode.value = moreThanTodayPlan();
  }

  function isRequiredField(obj) {
    obj = unref(obj);
    if (!obj) {
      return false;
    }
    const required = ["currentBook", "currentRange", "studyMode", "studyCount"];
    return required.every((field) => {
      console.log(obj[field]);
      return obj[field];
    });
  }

  // 改造end

  // onMounted生命周期放顶部，不然控制台一大堆警告

  watchEffect(() => {
    console.log(
      currentBook.value,
      currentRange.value,
      showVocabularyItem.value,
      studyMode.value,
      studyCount.value,
      "测试"
    );
  });

  // 今日是否已学习了50个单词，学习了就自动开启复习模式
  function moreThanTodayPlan() {
    if (reviewMode.value) {
      return true;
    }
    if (studyMode.value !== "study") {
      return true;
    }
    if (todayStudyVocabulary.value.length >= studyCount.value) {
      // 弹出学习提示框（完成50个）
      // startReviewMode(true)
      setNotify("今日单词计划已完成，将开启复习模式！", "success", "恭喜");
      reviewMode.value = true;
      return true;
    }
    return false;
  }

  // 获取能够展示单词卡片的索引
  async function getCouldStudyIndexData() {
    if (!currentBook.value || !currentRange.value) {
      return [];
    }
    // 获取范围数据
    rangeWords.value = await getRangeWords();

    let studyIndexData = [];

    // 查看是否是复习过去的单词模式
    console.log(studyMode.value, "复习模式");
    if (studyMode.value === "review-past") {
      studyWords.value = await studyTalbe.value.toArray();
      studyIndexData = toRaw(studyWords.value);
      studyIndexData = studyIndexData.map((word) => word.n);
      return studyIndexData;
    }

    // 超过今天计划，则自动开启复习模式
    if (moreThanTodayPlan()) {
      studyIndexData = await table.value
        .filter((word) => todayStudyVocabulary.value.includes(word.n))
        .toArray();
    } else {
      // 否则继续学习生词
      studyIndexData = await table.value
        .filter((word) => !studyWords.value.includes(word.n))
        .toArray();
      // 学习的生词，必须是在范围数据内的
      studyIndexData = studyIndexData.filter((word) =>
        rangeWords.value.includes(word.n)
      );
    }
    // 获取过滤后的可学习/复习的单词索引
    studyIndexData = studyIndexData.map((word) => word.n);

    return studyIndexData;
  }

  // 展示单词卡片
  async function showVocabularyCard(update) {
    // table.value = dbInstance.value.getTable(currentBook.value);
    let moreThanPlan = moreThanTodayPlan();
    // 这里就只对数据进行过滤，不读数据表了
    if (studyMode.value === "review-past") {
      studyWords.value = await studyTalbe.value.toArray();
      console.log("复习模式", studyWords.value.length);
      couldStudyIndexData.value = toRaw(studyWords.value || []).map(
        (word) => word.n
      );
    } else {
      if (moreThanPlan) {
        couldStudyIndexData.value = toRaw(todayStudyVocabulary.value);
        couldStudyIndexData.value = [...new Set(couldStudyIndexData.value)];
      } else {
        couldStudyIndexData.value = couldStudyIndexData.value.filter(
          (word) => !todayStudyVocabulary.value.includes(word)
        );
      }
    }

    if (couldStudyIndexData.value.length === 0) {
      setNotify(
        `当前模式${studyMode.value}下，没有能够学习的单词，请切换模式！`
      );
      drawer.value = true;
      return false;
    }

    let random = Math.floor(Math.random() * couldStudyIndexData.value.length);

    if (studyMode.value === "review-past" || moreThanPlan) {
      let lastVocabulary = bookItem.value?.n;
      if (!lastVocabulary) {
        random = 0;
      }
      let findIndex = couldStudyIndexData.value.findIndex(
        (name) => bookItem.value?.n === name
      );
      let len = couldStudyIndexData.value.length;
      if (findIndex === -1) {
        random = 0;
      } else {
        random = findIndex + 1 === len ? 0 : findIndex + 1;
      }
    }

    // 根据标识在总数据表中获取该标识对应的数据
    let vocabularycard = await table.value.get({
      n: couldStudyIndexData.value[random],
    });
    return vocabularycard;
  }

  // 获取范围数据
  async function getRangeWords() {
    let rangeWords = [];

    // 范围数据
    rangeWords = await rangeTable.value.toArray();
    rangeWords = rangeWords.map((word) => word.n);

    return rangeWords;
  }

  async function initStudyWordComp() {
    // 已学习数据
    studyWords.value = await studyTalbe.value.toArray();
    studyWords.value = studyWords.value.map((word) => word.n);

    couldStudyIndexData.value = await getCouldStudyIndexData();

    if (table.value) {
      vocabularyCardInitData.value = await showVocabularyCard();
    }
  }

  async function initTodayStudyWordComp() {
    todayStudyWords.value = await todayStudyWordsTable.value.toArray();

    // 看是否是今日学习单词，如果不是，则清空今日单词库
    let isToday = moment().format("YYYY-MM-DD");
    if (todayStudyWords.value.length > 0) {
      let getWords = todayStudyWords.value[0];
      if (isToday !== getWords.date) {
        await todayStudyWordsTable.value.orderBy().delete();
      }
    }

    todayStudyWords.value = await todayStudyWordsTable.value.toArray();

    todayStudyWords.value = todayStudyWords.value.map((word) => word.n);

    // 将数据库中今日学习单词，合并到当前的状态管理对象中
    todayStudyVocabulary.value = [
      ...new Set(todayStudyVocabulary.value.concat(todayStudyWords.value)),
    ];
  }

  // 获取数据表，无则创建表
  async function getDatabaseTable(tableName, tableSchema) {
    if (databaseTableList[tableName]) {
      return databaseTableList[tableName];
    }
    let loadTable = dbInstance.value.getTable(tableName);
    if (!loadTable) {
      await dbInstance.value.addTable(tableName, tableSchema);
      loadTable = dbInstance.value.getTable(tableName);
    }
    databaseTableList[tableName] = loadTable;
    return loadTable;
  }

  function sleep(time) {
    return new Promise((resolve) => {
      return setTimeout(() => {
        console.log("休眠中...");
        resolve();
      }, time);
    });
  }

  function setNotify(msg, type, title) {
    ElNotification({
      type: type || "error",
      title: title || "提示",
      message: msg,
      duration: 5000,
      position: "bottom-right",
    });
  }


  watch(
    () => vocabularyCardInitData.value,
    async (n, o) => {
      if (!n) {
        return false;
      }
      fullscreenLoading.value = false;
      if (!bookItem.value || !Object.keys(bookItem.value).length) {
        bookItem.value = n;
      }
    }
  );

  function startReviewMode(visible) {
    centerDialogVisible.value = visible;
  }

  

  async function handleDrawer(payload) {
    drawer.value = payload.drawer;
    if (!payload.drawer) {
      // table.value = dbInstance.value.getTable(currentBook.value);
      couldStudyIndexData.value = await getCouldStudyIndexData();

      if (table.value) {
        vocabularyCardInitData.value = await showVocabularyCard();
      }
    }
  }

  async function getDataTest() {
    bookItem.value = await showVocabularyCard("update");
    fullscreenLoading.value = false;
    putStudiedVocabulary(toRaw(bookItem.value));
  }

  async function putStudiedVocabulary(data) {
    
    let date = moment().format("YYYY-MM-DD");

    let findPutData = await studyTalbe.value.get({ n: data.n });

    let putData = {
      ...findPutData,
      id: data.id,
      n: data.n,
      date: date,
      count: findPutData?.count ? findPutData.count + 1 : 1,
    };
    if (studyMode.value === "study") {
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
