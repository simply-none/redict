import {
  reactive,
  ref,
  onMounted,
  computed,
  toValue,
  toRaw,
  watch,
  watchEffect,
  unref,
} from "vue";
import { storeToRefs } from "pinia";

import { useBookStore } from "../stores/books";
import { useWordStore } from "../stores/words";
import { useWordOriginStore } from "../stores/wordOrigin";

import { clearNotify, setNotify } from "../utils/element-plus";
import { getTodayDate, isValueInRequiredFields } from "../utils/common";

export function useWordItem() {
  let useBook = useBookStore();
  let useWord = useWordStore();
  let useWordOrigin = useWordOriginStore()

  const fullscreenLoading = ref(true);

  let isReloadBookItem = ref(true);

  let { basicData } = storeToRefs(useBook);

  let {
    todayWords,
    historyWords,
    bookWords,
    dictWords,
    willStudyWords,
    isMorethanTodayPlan,
  } = storeToRefs(useWord);
  let {
    setAllTypedWords,
    setWillStudyWords,
    getDataFromTable,
    bulkPutDataToTable,
    delWordInWillStudyWords,
  } = useWord;
  let {wordOriginLink } = storeToRefs(useWordOrigin)

  const drawer = ref(false);

  let bookItem = ref(null);

  let bookItemBeforeSearch = ref(null);

  let isWordNotInDict = ref(false);

  initDataInFirstLoad();

  setAllTypedWords();

  watch(drawer, () => {
    if (drawer.value) {
      return false;
    }
    console.log("进入了这里？");
    initDataInFirstLoad();
  });

  watch(isMorethanTodayPlan, (n, o) => {
    if (n) {
      console.log(n, o, 'hhhhh')
      setNotify(
        "今日单词计划已完成，已备份数据到本地，将开启今日学习复习模式！",
        "success",
        "恭喜"
      );
    }
  });

  watch(willStudyWords, async (n, o) => {
    if (!n) {
      return false;
    }
    if (!isReloadBookItem) {
      return false;
    }

    console.log(n?.length, o?.length, "将要学习");
    console.log("进来了？", n.length, willStudyWords.value.length);

    bookItem.value = await showVocabularyCard(true);
    fullscreenLoading.value = false;
    isReloadBookItem.value = false;
  });

  async function initDataInFirstLoad() {
    const required = ["currentBook", "currentRange", "studyMode", "studyCount"];
    let isRequired = isValueInRequiredFields(unref(basicData), required);
    console.log(isRequired, "sfs");

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
  }

  // 展示单词卡片
  async function showVocabularyCard(isForward) {
    let random = generateRandom(isForward);
    // 根据标识在总数据表中获取该标识对应的数据
    console.log(
      random,
      willStudyWords.value[random],
      willStudyWords.value.length,
      "randoim"
    );
    if (!willStudyWords.value[random]) {
      drawer.value = true;
      return true;
    }

    let vocabularycard = await getDataFromTable("dict", {
      n: willStudyWords.value[random],
    });
    if (!vocabularycard) {
      // 当前单词在词典中未找到，将过滤掉所有找不到的单词，重新获取下一个
      setNotify(
        "由于单词【" +
          willStudyWords.value[random] +
          "】在词典中找不到，将跳转到下一个单词...",
        "warning"
      );
    }
    return vocabularycard;
  }

  function generateRandom(isForward) {
    let random = 0;

    let range = willStudyWords.value.length;
    console.log(
      willStudyWords.value.length,
      isMorethanTodayPlan.value,
      "生成随机数,是否超过"
    );

    if (basicData.value.studyMode === "study" && !isMorethanTodayPlan.value) {
      random = Math.floor(Math.random() * range);
    }

    if (
      basicData.value.studyMode === "review-past" ||
      isMorethanTodayPlan.value
    ) {
      let lastVocabulary = bookItem.value?.n;
      let findIndex = willStudyWords.value.findIndex(
        (name) => lastVocabulary === name
      );

      if (findIndex !== -1) {
        random = findIndex + 1 === range ? 0 : findIndex + 1;

        // 后退
        if (!isForward) {
          random = findIndex === 0 ? range - 1 : findIndex - 1;
        }
      }
    }
    return random;
  }

  async function handleDrawer(payload) {
    drawer.value = payload.drawer;
    if (payload.drawer) {
      return false;
    }
    if (!basicData.value.currentBook || !basicData.value.currentRange) {
      return false;
    }
    if (!payload.changed) {
      return false;
    }
  }

  async function getDataTest(isForward = true) {
    putStudiedVocabulary(toRaw(bookItem.value));

    // throw 12;

    showVocabularyCard(isForward).then((d) => (bookItem.value = d));
    fullscreenLoading.value = false;
  }

  async function getSearchText(e, lastVal) {
    let searchText = e.target.innerText.trim()
    // 防止重复请求
    if (lastVal.n.trim() === searchText) {
      return false;
    }

    let vocabularycard = await getDataFromTable("dict", {
      n: searchText,
    });
    if (!vocabularycard) {
      setNotify("未查询到相关内容，2s后将跳转到外部网站查询");
      setTimeout(() => {
        open(wordOriginLink.value + searchText, '_blank')
      }, 1000);

      // 复原之前的单词拼写
      bookItem.value = { ...toRaw(lastVal), n: lastVal.n + " " };
      return false;
    }
    bookItem.value = vocabularycard;
    bookItemBeforeSearch.value = toRaw(lastVal);
  }

  async function putStudiedVocabulary(data) {
    let date = getTodayDate();

    console.log(
      isMorethanTodayPlan.value,
      todayWords.value.includes(data.n),
      "超过计划，今日是否学过"
    );

    // 此番是防止单词本、课本切换导致数据id不匹配的操作
    getDataFromTable("history", { n: data.n }).then((originData) => {
      console.log("获取数据", originData);
      originData = originData || {};
      console.log("获取数据", originData);
      let putData = {
        ...originData,
        n: originData?.n ? originData.n : data.n,
        date: originData.date || date,
        lastDate: date,
        // 感觉count不能衡量熟悉程度，故用lastDate取代
        count: originData?.count ? originData.count + 1 : 1,
      };
      console.log("获取数据", originData);

      if (basicData.value.studyMode === "study" && !isMorethanTodayPlan.value) {
        console.log(putData, "hhhh");
        bulkPutDataToTable("today", [putData]);
      }

      bulkPutDataToTable("history", [putData]);
    });
  }

  return {
    bookItem,
    bookItemBeforeSearch,
    fullscreenLoading,
    drawer,
    handleDrawer,
    getDataTest,
    getSearchText,
  };
}
