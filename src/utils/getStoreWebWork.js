/**
 * web work的用法
 * 在a文件中引入当前文件
 * 
 * import Worker from './current.js?worker'
 * 
 * let worker = new Worker()
 * 
 * worker.addEventListener('message', (e) => {
 *  // 处理从current.js中获取的内容
 * })
 * 
 * worker.postMessage(data)
 */

// current.js
self.addEventListener('message', e => {
  const { nBookData, nRangeData } = (e.data)

  let tempRange = nBookData.map((w) => w.n.toLowerCase());
  tempRange = nRangeData
    .filter((w) => tempRange.includes(w.n.toLowerCase()))
    .map((w) => w.n.toLowerCase());

  let rangeNotInBookData = nRangeData.filter(
    (w) => !tempRange.includes(w.n.toLowerCase())
  );
  self.postMessage(JSON.stringify({rangeNotInBookData, couldDataLen: (tempRange || []).length}))
})
