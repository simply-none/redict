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
