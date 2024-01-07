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

import { useBookStore } from "../stores/books";
import useTableStore from "../stores/table";
import { storeToRefs } from "pinia";

import moment from "moment";

import { clearNotify, setNotify } from "../utils/element-plus";
import { funDownloadByJson } from "../utils/generateFile";

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

function getTodayDate() {
  return moment().format("YYYY-MM-DD");
}

export function useVoca() {
  let useBook = useBookStore();
  let { getDBTable, getDBTableData } = useTableStore();

  // 今日学习数据
  let todayStudyWordsTable = ref(null);
  let todayStudyWords = ref(null);

  let couldStudyWordNameList = ref(null);

  // 获取书本学习的范围数据表
  let rangeTable = ref();
  let rangeWords = ref(null);

  let table = ref();

  // 获取已学习过的单词的数据表
  let studyTable = ref();

  let studyWords = ref(null);

  const fullscreenLoading = ref(true);

  let isReloadBookItem = ref(true)

  let isMorethanTodayPlan = ref(false)

  let { basicData } = storeToRefs(useBook);

  const drawer = ref(false);

  let bookItem = ref(null);

  let bookItemBeforeSearch = ref(null)

  let isWordNotInDict = ref(false)

  watch(
    [() => basicData.value.currentBook, () => basicData.value.currentRange, () => basicData.value.studyMode, () => basicData.value.studyCount],
    () => {
      console.log('hhhhh')
      initDataInFirstLoad();
    }
  );

  watchEffect(async () => {
    // 非首次加载，就不进行下列操作
    // 因为单词获取的方式：首次加载获取、点击获取
    if (!isReloadBookItem.value) {
      return false
    }
    // 当数据源表、今日学习数据、历史学习数据、范围数据 均有值时，才会进行计算，否则终止
    if (todayStudyWords.value && studyWords.value && rangeWords.value && table.value) {
      couldStudyWordNameList.value = await getCouldStudyWords()
      console.log('进来了？', couldStudyWordNameList.value.length)


      bookItem.value = await showVocabularyCard(true);
      fullscreenLoading.value = false;
      isReloadBookItem.value = false
    }
  })

  function getDataFromDB(getDBFn, getDBFnArgs, ref, operation) {
    return getDBFn(...getDBFnArgs).then(data => {
      if (operation === 'setValue') {
        ref.value = data
        console.log(rangeWords.value?.length, studyWords.value?.length, todayStudyWords.value?.length, '范围，历史，今日')
      }
      return data
    })
  }

  function getDataFromDBList() {
    // 加载所有相关表
    // 学习过的数据表
    getDataFromDB(getDBTable, ["studied-voca", "++id, n, date"], studyTable).then(d => {
      console.log('学习过的数据表')
      studyTable.value = d
      getDataFromDB(getDBTableData, [studyTable, ["n"]], studyWords, 'setValue')
    })

    // 今日数据表
    getDataFromDB(getDBTable, ["today-studied-voca", "++id"], todayStudyWordsTable).then(d => {
      console.log('今日数据表' , d)
      todayStudyWordsTable.value = d
      getDBTableData(todayStudyWordsTable, false, true).then(dd => {
        console.log(dd, '当前值就')
        getPureTodayStudyWords(dd)
      })
    })

    // 总数据表
    getDataFromDB(getDBTable, [basicData.value.currentBook, ""], table).then(d => table.value = d)

    // 范围表
    getDataFromDB(getDBTable, [basicData.value.currentRange, ""], rangeTable).then(d => {
      rangeTable.value = d
      console.log('范围表')
      getDataFromDB(getDBTableData, [rangeTable, ["n"]], rangeWords, 'setValue')
    })
  }

  async function initDataInFirstLoad() {
    // fullscreenLoading.value = true;
    let isRequired = isRequiredField(basicData);

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

    getDataFromDBList()
  }

  watch(() => basicData.value.studyMode, (n, o) => {
    if (!drawer.value) {
      return false
    }
    let moreThanPlan = moreThanPlanFn()
    if (!moreThanPlan && basicData.value.studyMode === 'study') {
      couldStudyWordNameList.value = toRaw(studyWords.value)
    }
  })

  function moreThanPlanFn() {
    let moreThanPlan = todayStudyWords.value.length >= basicData.value.studyCount
    console.log(todayStudyWords.value.length , basicData.value.studyCount, '比较，切换count')

    if (basicData.value.studyMode === 'study' && moreThanPlan) {
      if (!isWordNotInDict.value) {
        couldStudyWordNameList.value = toRaw(todayStudyWords.value)
      } else {
        isWordNotInDict.value = false
      }
      !isMorethanTodayPlan.value && setNotify(
        "今日单词计划已完成，已备份数据到本地，将开启今日学习复习模式！",
        "success",
        "恭喜"
      );
      isMorethanTodayPlan.value = true
    }

    if (!moreThanPlan && basicData.value.studyMode === 'study') {
      couldStudyWordNameList.value = toRaw(studyWords.value)
      isMorethanTodayPlan.value = false
    }

    return moreThanPlan
  }

  // 获取能够展示单词卡片的索引
  async function getCouldStudyWords() {
    let studyWordsData = [];
    let moreThanPlan = moreThanPlanFn()
    console.log(basicData.value.studyCount, todayStudyWords.value.length, '总，今')
    

    // 查看是否是复习过去的单词模式
    if (basicData.value.studyMode === "review-past") {
      studyWordsData = toRaw(studyWords.value);
      console.log('查看是否是复习过去的单词模式')
    }

    // 超过今天计划，则自动开启（今日学习）复习模式
    if (basicData.value.studyMode === "study" && moreThanPlan) {
      studyWordsData = toRaw(todayStudyWords.value);
      console.log('超过今天计划，则自动开启（今日学习）复习模式')
    }

    // 仅学习模式
    if (basicData.value.studyMode === "study" && !moreThanPlan) {
      studyWordsData = await table.value
        .filter(
          (word) =>
            !studyWords.value.includes(word.n) &&
            rangeWords.value.includes(word.n)
        )
        .toArray();
      studyWordsData = studyWordsData.map((word) => word.n);
      studyWordsData = studyWordsData.filter(
        (word) => !todayStudyWords.value.includes(word)
      );
      console.log('仅学习模式')
    }
    console.log(studyWordsData.length, '能够学习的单词')
    // 获取过滤后的可学习/复习的单词索引
    return studyWordsData;
  }

  // 展示单词卡片
  async function showVocabularyCard(isForward) {
    let random = generateRandom(isForward);
    // 根据标识在总数据表中获取该标识对应的数据
    console.log(random, couldStudyWordNameList.value[random], couldStudyWordNameList.value.length, 'randoim')
    let vocabularycard = await table.value.get({
      n: couldStudyWordNameList.value[random],
    });
    if (!vocabularycard) {
      // 当前单词在词典中未找到，将过滤掉所有找不到的单词，重新获取下一个
      setNotify('由于单词【' + couldStudyWordNameList.value[random]+ '】在词典中找不到，将跳转到下一个单词...', 'warning')
      let d = await table.value.toArray()
      d = d.map(dn => dn.n)
      couldStudyWordNameList.value = couldStudyWordNameList.value.filter(c => {
        return d.includes(c)
      })
      isWordNotInDict.value = true
      console.log(couldStudyWordNameList.value.length)

      clearNotify()

      return await showVocabularyCard(isForward)
    }
    return vocabularycard;
  }

  function generateRandom(isForward) {
    let random = 0;
    let moreThanPlan = moreThanPlanFn()
    let range = couldStudyWordNameList.value.length;
    console.log(couldStudyWordNameList.value.length, moreThanPlan, '生成随机数,是否超过')

    if (basicData.value.studyMode === "study" && !moreThanPlan) {
      random = Math.floor(Math.random() * range);
    }

    if (basicData.value.studyMode === "review-past" || moreThanPlan) {
      let lastVocabulary = bookItem.value?.n;
      let findIndex = couldStudyWordNameList.value.findIndex(
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



  function getPureTodayStudyWords(data) {
    // 看是否是今日学习单词，如果不是，则清空今日单词库
    let isToday = getTodayDate();
    let hasNotTodayWords = (data || []).some((word) => {
      return word.date !== isToday;
    });

    if (hasNotTodayWords) {
      todayStudyWordsTable.value.orderBy().delete().then(() => {
        todayStudyWords.value = []
      })
    } else {
      todayStudyWords.value = data.map(w => w.n)
    }
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

    isReloadBookItem.value = true
  }

  async function getDataTest(isForward = true) {
    putStudiedVocabulary(toRaw(bookItem.value));
    
    showVocabularyCard(isForward).then(d => bookItem.value = d);
    fullscreenLoading.value = false;
  }

  async function getSearchText(e, lastVal) {
    // 防止重复请求
    if (lastVal.n.trim() === e.target.innerText.trim()) {
      return false
    }

    let vocabularycard = await table.value.get({
      n: e.target.innerText.trim(),
    });
    if (!vocabularycard) {
      setNotify("未查询到相关内容");
      // 复原之前的单词拼写
      bookItem.value = { ...toRaw(lastVal), n: lastVal.n + ' ' }
      return false;
    }
    bookItem.value = vocabularycard;
    bookItemBeforeSearch.value = toRaw(lastVal)
  }

  async function putStudiedVocabulary(data) {
    let date = getTodayDate();

    let moreThanPlan = moreThanPlanFn()
    console.log(todayStudyWords.value.includes(data.n))

    // 超过计划，但该单词不包括在内时，不存储
    if (moreThanPlan && !todayStudyWords.value.includes(data.n)) {
      return false
    }

    if (basicData.value.studyMode === 'study' && !moreThanPlan && !todayStudyWords.value.includes(data.n)) {
      todayStudyWords.value.push(bookItem.value.n)
      console.log(todayStudyWords.value.length, '到今天')
    }

    // 此番是防止单词本、课本切换导致数据id不匹配的操作
    studyTable.value.get({ n: data.n }).then(findPutData => {
      let putData = {
        ...findPutData,
        n: findPutData?.n ? findPutData.n : data.n,
        date: date,
        count: findPutData?.count ? findPutData.count + 1 : 1,
      };

      if (basicData.value.studyMode === "study") {
        todayStudyWordsTable.value.bulkPut([putData])
      }

      studyTable.value.bulkPut([putData]);
    })
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
