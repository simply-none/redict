# 项目简介

## 功能简介

1. 支持符合需求的词典和单词本导入
2. 支持切换词典和单词本
3. 支持跳转到可选的词典源
4. 支持选择每日背诵单词个数
5. 支持切换学习、复习模式
6. 支持切换简单（仅发音和解释）、复杂模式
7. 支持选择需展示的单词解释项目
8. 支持左右侧双击、左右箭头键切换上一个、下一个单词
9. 支持单词查询
10. 支持查看该单词本可背诵的单词数量情况
11. 支持分页查看今日背诵、历史背诵、不可背诵的单词列表
12. 支持分页查看今日背诵、历史背诵、单词本、词典的单词详情列表

## 核心逻辑

### hooks/useVoca.js

定义：该hook是展示单词的主要功能逻辑

设计思路：

1. 确定触发单词更新的时机：首次加载、设置页面关闭时
2. 确定触发是否完成今日单词个数的时机：页面初始渲染、推送更新当前单词时、切换单词学习个数时

### filterBFromA、delBFromA（utils/common.js）

定义：该算法加快了对应数据获取的速度

使用场景：

1. filterBFromA：获取能够学习的单词origin = 单词本 in 词典
2. delBFromA：获取能够学习的单词 = 获取能够学习的单词origin - 已学过的单词 - 今日学习的单词

## 待做功能

需求🔶：监听用户退出网页事件，进行提示是否退出

需求🔶：分析用户每日背诵单词的个数、每个单词背诵的次数、每日复习的单词个数与次数

呈现：使用柱状图/折线图/日历热力图/日历坐标系的方式展示该用户所有日期的背诵/复习单词的行为数据，可一次只展示当周，当月每日的数据，或者是当年每月的数据，或者是所有的数据

需求🔶：按日期显示/查找用户背诵的单词，点进去之后展现该日单词列表（图表兼富文本），导出该日单词列表数据（html带样式格式导出图片）

需求🔶：查看单词背诵的次数（使用矩形树图）

需求🔶：呈现背诵达标率（使用仪表盘）

## 复盘

### 古早的复盘

定义：

- 利用vue的组合式api和生命周期钩子封装复用有状态逻辑的函数
- 函数参数可接收ref，和非ref值（unref：将ref变为非ref）
- 组合式函数采用`usePascalCase`的形式命名
- 组合式函数不仅是为了复用，也能让代码组织更加清晰。能够基于逻辑问题将组件代码拆分成更小的功能函数

注意：

- 组合式函数在`script setup`/`setup()`中应始终被同步调用，在某些场景下也可以在onMounted这些生命周期钩子中调用，这是为了让vue能够确定当前正在被执行的到底是哪个实例，只有确定了当前组件实例，才能：将生命周期钩子等api注册在当前的组件上，将计算属性和监听器注册到当前组件上，以便在组件卸载时停止监听，避免内存泄露
- script setup是唯一在调用await之后仍可调用组合式函数的地方，编译器会在异步操作之后自动恢复当前组件实例
- 组合式函数可接收一般变量和响应式变量（例如ref，可对响应式变量进行监听追踪）作为参数。最好在处理参数时对两者进行兼容，即处理响应式变量时，使用unref函数获取变量的值（响应式变量返回.value，否则原样返回）；同时若操作会根据响应式变量变化而变化，应该使用watch监听响应式变量，或者在watchEffect中调用unref解构响应式变量追踪其变化
- 推荐在组合式函数中始终返回一个包含多个ref的普通非响应式对象（即组合式函数返回`{ a: ref(xx), b: ref(xx) }`），这样在对象被解构时，对象属性仍能保持响应性，因为返回一个响应式对象在对象解构时会丢失和组合式函数内状态的响应性连接。若希望以对象属性的方式使用组合式函数中返回的状态，可以在调用组合式函数的时候使用reactive进行包裹（例如`reactive(useFn())`）
- 在组合式函数中执行相关操作时，应当在正确的生命周期中访问（比如访问dom，应该在挂载之后，即onMounted钩子中）；同时确保在onUnmounted中清除带来的某些操作（比如事件监听器）。
- 每一个调用组合式函数的组件实例会创建其独有的状态拷贝，组件实例之间不会互相影响。若想在组件中共享状态，可使用状态管理相关的知识点。
- 组合式函数可随意封装

### 古早的复盘2

1. 获取学习数据、获取总数据、获取范围数据、获取今日数据
2. 可学习数据 = （总数据 - 学习数据）in 范围数据
3. 单词卡，随机数

### 2024-01-18

今日重写该项目相关逻辑，发现之前还是对响应式api掌握的不到位，同时对第三方库Dexie.js有着十分重大的误解，没有真正掌握其相关api的用法，导致进展缓慢，以及逻辑纵横交错，十分难懂。

对于Dexie.js，其一，其是整个应用期间仅有一个实例，所以其实例必须放在hooks外部，以保持他的唯一性。同时，在创建了Dexie.js对象后，必须进行verson.stores方法的调用，不然后面读取不到任何的database table；而且每一次schema的更新，都必须调用该方法。

```javascript
let db = new Dexie('dbName')

// 更新version
db.open()
db.version(db.verno + 1).stores(schemaObj)
db.close()
```

关于Dexie.js库，重要的逻辑是，方法的返回值以及其链式调用。两个重要的概念，一个是table、一个是collection，一般情况下，会返回collection、promise，这个得在用时查看相关文档。对于几个常用的方法，在此列出：

- toArray
- limit：限制返回的数量
- keys：一般在orderBy调用，返回排序关键字的数组，不然返回primary key的数组
- orderBy：排序
- get：获取特定的元素集合
- filter
- offset：索引偏移
- count：获取集合的数量
- bulkPut：批量添加，索引相同则更新
- delete
- clear：清空表

对于陷进该库的陷阱，时间估计占用了开发时间的50%，在后续的研发中，还是应当注重一个库基本的用法。
