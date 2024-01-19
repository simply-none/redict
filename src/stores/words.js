import {
  ref,
  computed,
  watch,
  reactive,
  unref,
  toRaw,
  toRefs,
  watchEffect,
} from "vue";
import { defineStore, storeToRefs } from "pinia";

import useTableStore from "./table";
import { useBookStore } from "./books";

import { delBFromA, filterBFromA, getTodayDate } from "../utils/common";

// 本store，用处在于获取、设置基础信息数据
export const useWordStore = defineStore("word", () => {
  let { getDBTable } = useTableStore();
  let useBook = useBookStore();
  let { basicData } = storeToRefs(useBook);

  let todayWords = ref();
  let historyWords = ref();
  let bookWords = ref();
  let dictWords = ref();

  let todayTable = ref();
  let historyTable = ref();
  let bookTable = ref();
  let dictTable = ref();

  let willStudyWords = ref();

  let notStudyWords = ref();

  let isMorethanTodayPlan = computed(() => {
    console.log("ismore");
    return todayWords.value?.length >= basicData.value?.studyCount;
  });

  let isWordsInEveryTable = computed(() => {
    console.log("suan 1");
    return (
      dictWords.value &&
      bookWords.value &&
      historyWords.value &&
      todayWords.value
    );
  });

  // 监听basicData.value.studyMode, isMorethanTodayPlay, 以及四大words的变更，仅在应用初始化时监听，之后取消监听
  let isStopInitWatch = ref(false);
  let stopInitWatch = watchEffect(() => {
    console.log('进来')
    setWillStudyWords();
  });

  // 监听basicData.value.studyMode, isMorethanTodayPlay, 以及2大words的变更，仅在stopInitWatch取消监听后，才开始执行对应的程序
  watch(
    [
      () => dictWords.value,
      () => bookWords.value,
      () => isMorethanTodayPlan.value,
      () => basicData.value.studyMode,
    ],
    () => {
      console.log("stopInitWatch已经取消", isStopInitWatch.value);
      // 在stopInitWatch取消监听后执行
      if (!isStopInitWatch.value) {
        return false;
      }
      console.log("stopInitWatch已经取消");
      setWillStudyWords();
    }
  );

  console.log(stopInitWatch, "111千万");

  watch(willStudyWords, (n, o) => {
    if (n) {
      console.log(willStudyWords.value?.length, 'hhhhhhhhh')
      stopInitWatch && stopInitWatch();
      isStopInitWatch.value = true;
    }
  });

  watch(
    () => basicData.value.currentBook,
    (n, o) => {
      if (!n) {
        return false;
      }
      console.log(n, o, "当前的单词书");
      setDictWords();
    }
  );

  watch(
    () => basicData.value.currentRange,
    (n, o) => {
      if (!n) {
        return false;
      }
      console.log(n, o, "当前的词典");
      setBookWords();
    }
  );

  watch([dictWords, bookWords], (n, o) => {
    if (!n[0] || !n[1]) {
      return false;
    }
    console.log("监听not");
    setNotStudyWords();
  });

  function setNotStudyWords() {
    notStudyWords.value = delBFromA(bookWords.value, dictWords.value);
  }

  // 设置将要学习的单词：此处监听
  function setWillStudyWords() {
    if (!isWordsInEveryTable.value) {
      return false;
    }
    console.log("suan 2");
    console.log("设置将要学习的单词:setWillStudyWords");
    console.log(dictWords.value.length, bookWords.value.length, "词典，书");
    console.log(isMorethanTodayPlan.value, "hhhhhhhhhhhhhhhhhhhhh");

    // 查看是否是复习过去的单词模式
    if (basicData.value.studyMode === "review-past") {
      setWillStudyWordsInReviewPastMode();
      console.log("查看是否是复习过去的单词模式");
      return true;
    }

    // 超过今天计划，则自动开启（今日学习）复习模式
    if (basicData.value.studyMode === "study" && isMorethanTodayPlan.value) {
      setWillStudyWordsInReviewTodayMode();
      console.log("超过今天计划，则自动开启（今日学习）复习模式");
      return true;
    }

    setWillStudyWordsInStudyMode();
    console.log("超过今天计划，则自动开启（今日学习）复习模式");
  }

  // 设置将要学习的单词：在复习模式
  function setWillStudyWordsInReviewPastMode() {
    willStudyWords.value = toRaw(historyWords.value);
  }

  // 设置将要学习的单词：在学习模式
  function setWillStudyWordsInStudyMode() {
    let studyWordsData = [];
    console.time("xuex1");
    studyWordsData = filterBFromA(bookWords.value, dictWords.value);

    if (studyWordsData.length === 0) {
      alert("需要切换单词本或者词典源");
      return [];
    }
    console.log(studyWordsData.length, "能够学习的单词n2");

    studyWordsData = delBFromA(studyWordsData, historyWords.value);
    console.log(studyWordsData.length, "能够学习的单词n22");

    studyWordsData = delBFromA(studyWordsData, todayWords.value);
    console.timeEnd("xuex1");
    console.log(studyWordsData.length, "能够学习的单词n222");
    if (studyWordsData.length === 0) {
      alert("你已经学完了当前单词本的所有内容");
    }

    willStudyWords.value = studyWordsData;
  }

  // 设置将要学习的单词：在复习今日单词模式
  function setWillStudyWordsInReviewTodayMode() {
    willStudyWords.value = toRaw(todayWords.value);
  }

  // 总数据表
  async function setDictWords() {
    console.log("获取总数居");
    getTableFromDB(basicData.value.currentBook, dictTable).then((d) => {
      getDataFromDB(dictTable, dictWords);
    });
  }

  // 范围表
  async function setBookWords() {
    console.log("获取总数居");
    getTableFromDB(basicData.value.currentRange, bookTable).then((d) => {
      getDataFromDB(bookTable, bookWords);
    });
  }

  // 学习过的数据表
  async function setHistoryWords() {
    getTableFromDB("studied-voca", historyTable).then((d) => {
      getDataFromDB(historyTable, historyWords);
    });
  }

  // 今日数据表
  async function setTodayWords() {
    getTableFromDB("today-studied-voca", todayTable).then((d) => {
      // 就没有获取某几个属性的对象集合，keys只能获取单个
      todayTable.value
        .orderBy("date")
        .toArray()
        .then((dd) => {
          console.log("今日数据", dd);
          getPureTodayWords(dd);
        });
    });
  }

  // 加载所有相关表
  async function setAllTypedWords() {
    setDictWords();
    setBookWords();
    setHistoryWords();
    setTodayWords();
  }

  // 获取database table对象
  function getTableFromDB(name, tableRef) {
    return getDBTable(name).then((data) => {
      tableRef.value = data;
      return data;
    });
  }

  // 获取获取database table对象 数据集合 数组
  function getDataFromDB(tableRef, dataRef) {
    let table = unref(tableRef);
    table
      .orderBy("n")
      .keys()
      .then((dd) => {
        let data = (dd || [])
          .filter((w) => w)
          .map((w) => (w || "").toLowerCase());
        data.sort((a, b) => (a > b ? 1 : -1));
        dataRef.value = data;
        console.log(dataRef.value.length, "getData.............", table);
      });
  }

  function getPureTodayWords(data) {
    // 看是否是今日学习单词，如果不是，则清空今日单词库
    let isToday = getTodayDate();
    let hasNotTodayWords = (data || []).some((word) => {
      return word.date !== isToday;
    });

    if (hasNotTodayWords) {
      todayTable.value
        .orderBy()
        .delete()
        .then(() => {
          todayWords.value = [];
          console.log(data, "今日数据表", todayWords.value);
        });
    } else {
      let tsWords = (data || [])
        .filter((w) => w)
        .map((w) => w.n.toLowerCase() || "");
      tsWords.sort((a, b) => (a > b ? 1 : -1));
      todayWords.value = tsWords;
      console.log(data, "今日数据表", todayWords.value);
    }
  }

  // 在特定的table获取特定的集合
  function getPageFromTalbe(type, offset, limit) {
    if (type === "today") {
      return getPageFromSomeTable(todayTable, offset, limit);
    }
    if (type === "history") {
      return getPageFromSomeTable(historyTable, offset, limit);
    }
    if (type === "book") {
      return getPageFromSomeTable(bookTable, offset, limit);
    }
    if (type === "dict") {
      return getPageFromSomeTable(dictTable, offset, limit).then((d) => {
        console.log(d, "阿布");
        return d;
      });
    }
    return [];
  }

  // 分页获取数据：从table中
  function getPageFromSomeTable(table, offset, limit) {
    console.log(table.value?.name, "getPageFromSomeTable");
    if (!table.value) {
      return Promise.resolve([])
    }
    return table.value
      .offset(offset)
      .limit(limit)
      .toArray()
      .then((d) => {
        console.log(d, "阿布");
        return d;
      });
  }

  // 通过id获取数据：从table中
  function getDataFromTable(type, item) {
    if (type === "today") {
      return getDataFromSomeTable(todayTable, item);
    }
    if (type === "history") {
      return getDataFromSomeTable(historyTable, item);
    }
    if (type === "book") {
      return getDataFromSomeTable(bookTable, item);
    }
    if (type === "dict") {
      return getDataFromSomeTable(dictTable, item);
    }
    return [];
  }

  function getDataFromSomeTable(table, item) {
    return table.value.get(item);
  }

  // 通过id删除数据：在historyTable中
  function delDataByIdInHistoryTable(data, index) {
    return historyTable.value
      .where("id")
      .equals(data.id)
      .delete()
      .then(() => {
        historyWords.value.splice(index, 1);
      });
  }

  function filterSameItemInWords(wordsRef, data) {
    let nData = data.map((w) => w.n);
    let allWords = wordsRef.value.concat(nData);
    allWords = Array.from(new Set(allWords));
    console.log("更新");
    wordsRef.value = allWords;
  }

  // 通过bulkPut添加数据到table中
  function bulkPutDataToTable(type, data) {
    console.log("来这里", type);
    if (type === "today") {
      console.log("来这里");
      return bulkPutDataToSomeTable(todayTable, data).then(() => {
        filterSameItemInWords(todayWords, data);
      });
    }
    if (type === "history") {
      return bulkPutDataToSomeTable(historyTable, data).then(() => {
        filterSameItemInWords(historyWords, data);
      });
    }
    if (type === "book") {
      return bulkPutDataToSomeTable(bookTable, data).then(() => {
        filterSameItemInWords(bookWords, data);
      });
    }
    if (type === "dict") {
      return bulkPutDataToSomeTable(dictTable, data).then(() => {
        filterSameItemInWords(dictWords, data);
      });
    }
    return [];
  }

  function bulkPutDataToSomeTable(table, data) {
    return table.value.bulkPut(data);
  }

  function delWordInWillStudyWords(word) {
    let index = willStudyWords.value.findIndex((w) => w === word);
    if (index === -1) {
      return false;
    }
    willStudyWords.value.splice(index, 1);
  }

  return {
    isMorethanTodayPlan,
    todayWords,
    historyWords,
    bookWords,
    dictWords,
    willStudyWords,
    notStudyWords,
    setTodayWords,
    setHistoryWords,
    setBookWords,
    setDictWords,
    setAllTypedWords,
    setWillStudyWords,
    setNotStudyWords,
    getPageFromTalbe,
    getDataFromTable,
    bulkPutDataToTable,
    delDataByIdInHistoryTable,
    delWordInWillStudyWords,
  };
});
