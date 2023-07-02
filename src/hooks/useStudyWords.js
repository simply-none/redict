import { ref, reactive, watch, onMounted, computed, toRaw } from 'vue'
import {
  ElNotification,
} from "element-plus";

import { useBookStore } from "../stores/books";
import { storeToRefs } from "pinia";

import { useDatabaseTable } from './useDatabaseTable'

import { useTodayStudyWords } from './useTodayStudyWords'

export function useStudyWords() {

  let { getDatabaseTable } = useDatabaseTable()
  let { todayStudyVocabulary } = useTodayStudyWords()
  let useBook = useBookStore();

  let { showVocabularyItem, currentBook, currentRange, dbInstance, studyMode, studyCount } = storeToRefs(useBook);

  let couldStudyIndexData = ref([]);

  // 展示的单词卡片数据
  let vocabularyCardInitData = ref({})

  // 获取书本学习的范围数据表
  let range = ref();
  let rangeWords = ref([])

  let table = ref();

  // 获取已学习过的单词的数据表
  let studyTalbe = ref();

  let studyWords = ref([]);

  let reviewMode = ref(false)

  // 今日是否已学习了50个单词，学习了就自动开启复习模式
  function moreThanTodayPlan() {
    if (reviewMode.value) {
      return true
    }
    if (todayStudyVocabulary.value.length >= studyCount.value) {
      // 弹出学习提示框（完成50个）
      // startReviewMode(true)
      ElNotification({
        type: "success",
        title: "恭喜",
        message: "今日单词计划已完成，将开启复习模式！",
        position: "bottom-right",
      });
      reviewMode.value = true
      return true;
    }
    return false;
  }

  // 获取能够展示单词卡片的索引
  async function getCouldStudyIndexData() {
    if (!currentBook.value || !currentRange.value) {
      return []
    }
    // 获取范围数据
    rangeWords.value = await getRangeWords()

    let studyIndexData = []

    // 查看是否是复习过去的单词模式
    console.log(studyMode.value, '复习模式')
    if (studyMode.value === 'review-past') {
      studyIndexData = await studyTalbe.value
        .filter((word) => !studyWords.value.includes(word.id))
        .toArray();
      studyIndexData = studyIndexData.map((word) => word.id);
      return studyIndexData
    }

    // 超过今天计划，则自动开启复习模式
    if (moreThanTodayPlan()) {
      studyIndexData = await table.value
        .filter((word) => todayStudyVocabulary.value.includes(word.id))
        .toArray();
    } else {
      // 否则继续学习生词
      studyIndexData = await table.value
        .filter((word) => !studyWords.value.includes(word.id))
        .toArray();
      // 学习的生词，必须是在范围数据内的
      studyIndexData = studyIndexData.filter(word => rangeWords.value.includes(word.n))
    }
    // 获取过滤后的可学习/复习的单词索引
    studyIndexData = studyIndexData.map((word) => word.id);

    console.log('会不会来这里，是个谜', studyIndexData.length)

    return studyIndexData
  }

  // 展示单词卡片
  async function showVocabularyCard(update) {
    table.value = dbInstance.value.getTable(currentBook.value);
    console.log(JSON.parse(JSON.stringify(todayStudyVocabulary.value)), todayStudyVocabulary.value.length, '今日学习单词数据')
    console.log(JSON.parse(JSON.stringify(couldStudyIndexData.value)), couldStudyIndexData.value.length, '能够学习的单词数据')
    // 这里就只对数据进行过滤，不读数据表了
    if (studyMode.value === 'review-past') {
      couldStudyIndexData.value = toRaw(studyWords.value)
    } else {
      if (moreThanTodayPlan()) {

        couldStudyIndexData.value = toRaw(todayStudyVocabulary.value)
        couldStudyIndexData.value = [...new Set(couldStudyIndexData.value)]

        console.log(couldStudyIndexData.value.length, '添加里面就')

      } else {
        couldStudyIndexData.value = couldStudyIndexData.value.filter(
          (word) => !todayStudyVocabulary.value.includes(word)
        );
      }
    }


    let random = Math.floor(Math.random() * couldStudyIndexData.value.length);

    console.log(table.value, '展示卡片', couldStudyIndexData.value.length, random, couldStudyIndexData.value[random])
    let vocabularycard = await table.value.get(couldStudyIndexData.value[random]);
    return vocabularycard
  }

  // 获取范围数据
  async function getRangeWords() {
    let rangeWords = []
    // 范围数据表
    range.value = dbInstance.value.getTable(currentRange.value);

    // 范围数据
    rangeWords = await range.value.toArray()
    rangeWords = rangeWords.map(word => word.n)

    return rangeWords
  }

  async function initStudyWordComp() {
    console.log('组合式函数组件')
    // 加载已学习的数据表
    studyTalbe.value = await getDatabaseTable("studied-voca", "++id, n, date");

    // 已学习数据
    studyWords.value = await studyTalbe.value.toArray();
    studyWords.value = studyWords.value.map((word) => word.id);
    console.log(studyWords.value.length, "以学习");

    // 全部单词的数据表
    table.value = dbInstance.value.getTable(currentBook.value);

    couldStudyIndexData.value = await getCouldStudyIndexData()

    if (table.value) {
      console.log('来啦这列吗')
      vocabularyCardInitData.value = await showVocabularyCard()
    }
    console.log('来啦这列吗')
  }

  // onMounted(async () => {
  //   console.log('组合式函数组件')
  //   // 加载已学习的数据表
  //   studyTalbe.value = await getDatabaseTable("studied-voca", "++id, n, date");

  //   // 已学习数据
  //   studyWords.value = await studyTalbe.value.toArray();
  //   studyWords.value = studyWords.value.map((word) => word.id);
  //   console.log(studyWords.value.length, "以学习");

  //   // 全部单词的数据表
  //   table.value = dbInstance.value.getTable(currentBook.value);

  //   couldStudyIndexData.value = await getCouldStudyIndexData()

  //   if (table.value) {
  //     console.log('来啦这列吗')
  //     vocabularyCardInitData.value = await showVocabularyCard()
  //   }
  //   console.log('来啦这列吗')
  // });

  watch([() => currentBook.value, () => currentRange.value], async ([nb, nr]) => {
    couldStudyIndexData.value = await getCouldStudyIndexData()

    table.value = dbInstance.value.getTable(currentBook.value);

    if (table.value) {
      vocabularyCardInitData.value = await showVocabularyCard()
    }

    console.log('来啦这列吗')
  })

  return {
    initStudyWordComp,
    moreThanTodayPlan,
    showVocabularyCard,
    vocabularyCardInitData
  }
}
