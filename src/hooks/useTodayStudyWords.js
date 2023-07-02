import { ref, reactive, watch, onMounted, computed } from 'vue'

import { useBookStore } from "../stores/books";
import { storeToRefs } from "pinia";

import { useDatabaseTable } from './useDatabaseTable'

import moment from "moment";

export function useTodayStudyWords() {
  let useBook = useBookStore();

  let { getDatabaseTable } = useDatabaseTable()

  let { todayStudyVocabulary } = storeToRefs(useBook);

  // 今日学习数据
  let todayStudyWordsTable = ref();
  let todayStudyWords = ref();

  async function initTodayStudyWordComp() {
    console.log('today组件')
    todayStudyWordsTable.value = await getDatabaseTable(
      "today-studied-voca",
      "++id"
    );
    todayStudyWords.value = await todayStudyWordsTable.value.toArray();

    console.log(getDatabaseTable, todayStudyWords, "错误");
    // 看是否是今日学习单词，如果不是，则清空今日单词库
    let isToday = moment().format("YYYY-MM-DD");
    if (todayStudyWords.value.length > 0) {
      let getWords = todayStudyWords.value[0];
      if (isToday !== getWords.date) {
        await todayStudyWordsTable.value.orderBy().delete();
      }
    }

    todayStudyWords.value = await todayStudyWordsTable.value.toArray();

    console.log(isToday, todayStudyWords.value.length, "今日学习单词-数据库");

    todayStudyWords.value = todayStudyWords.value.map((word) => word.id);

    // 将数据库中今日学习单词，合并到当前的状态管理对象中
    todayStudyVocabulary.value = [
      ...new Set(todayStudyVocabulary.value.concat(todayStudyWords.value)),
    ];
  }

  // onMounted(async () => {
  //   console.log('today组件')
  //   todayStudyWordsTable.value = await getDatabaseTable(
  //     "today-studied-voca",
  //     "++id"
  //   );
  //   todayStudyWords.value = await todayStudyWordsTable.value.toArray();

  //   console.log(getDatabaseTable, todayStudyWords, "错误");
  //   // 看是否是今日学习单词，如果不是，则清空今日单词库
  //   let isToday = moment().format("YYYY-MM-DD");
  //   if (todayStudyWords.value.length > 0) {
  //     let getWords = todayStudyWords.value[0];
  //     if (isToday !== getWords.date) {
  //       await todayStudyWordsTable.value.orderBy().delete();
  //     }
  //   }

  //   todayStudyWords.value = await todayStudyWordsTable.value.toArray();

  //   console.log(isToday, todayStudyWords.value.length, "今日学习单词-数据库");

  //   todayStudyWords.value = todayStudyWords.value.map((word) => word.id);

  //   // 将数据库中今日学习单词，合并到当前的状态管理对象中
  //   todayStudyVocabulary.value = [
  //     ...new Set(todayStudyVocabulary.value.concat(todayStudyWords.value)),
  //   ];
  // });

  return {
    initTodayStudyWordComp,
    todayStudyVocabulary,
  }
}
