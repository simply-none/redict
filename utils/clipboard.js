// 写入剪切板
function writeTextToClipboard (val) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(JSON.stringify(val));
  }
}