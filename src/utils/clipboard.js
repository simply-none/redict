// 写入剪切板
export function writeTextToClipboard(val) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(JSON.stringify(val));
  }
}
