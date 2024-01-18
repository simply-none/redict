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

import moment from "moment";
import { delBFromA, filterBFromA } from "../utils/common";

// 本store，用处在于获取、设置基础信息数据
export const useWordStore = defineStore("word", () => {
  let { getDBTable, getDBTableData } = useTableStore();
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

  let willStudyWords = computed(() => {
    let studyWordsData = [];
    console.time("xuex1");
    studyWordsData = filterBFromA(rangeWords.value, dictWords.value);
    console.log(studyWordsData.length, "能够学习的单词n");

    studyWordsData = delBFromA(studyWordsData, studyWords.value);
    console.log(studyWordsData.length, "能够学习的单词n22");

    studyWordsData = delBFromA(studyWordsData, todayStudyWords.value);
    console.timeEnd("xuex1");
    
    return studyWordsData
  });

  // 总数据表
  async function setDictWords() {
    getTableFromDB(basicData.value.currentBook, dictTable).then((d) => {
      getDataFromDB(dictTable, dictWords);
    });
  }

  // 范围表
  async function setHistoryWords() {
    getTableFromDB(basicData.value.currentRange, bookTable).then((d) => {
      getDataFromDB(bookTable, bookWords);
    });
  }

  // 学习过的数据表
  async function setBookWords() {
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
    getDictWords();
    getBookWords();
    getHistoryWords();
    getTodayWords();
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

  function getTodayDate() {
    return moment().format("YYYY-MM-DD");
  }

  return {
    todayWords,
    historyWords,
    bookWords,
    dictWords,
    willStudyWords,
    setTodayWords,
    setHistoryWords,
    setBookWords,
    setDictWords,
    setAllTypedWords,
  };
});
