import domtoimage from "dom-to-image-more";

// 根据内容生成文件：使用blob
export function funDownloadByBlob (content, filename) {
  // 创建隐藏的可下载链接
  var eleLink = document.createElement("a");
  eleLink.download = filename;
  eleLink.style.display = "none";
  // 字符内容转变成blob地址
  var blob = new Blob([content]);
  eleLink.href = URL.createObjectURL(blob);
  // 触发点击
  document.body.appendChild(eleLink);
  eleLink.click();
  // 然后移除
  document.body.removeChild(eleLink);
}

export function funDownloadByBase64 (domImg, filename) {
  // 创建隐藏的可下载链接
  var eleLink = document.createElement('a');
  eleLink.download = filename;
  eleLink.style.display = 'none';
  // 图片转base64地址
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  var width = domImg.naturalWidth;
  var height = domImg.naturalHeight;
  context.drawImage(domImg, 0, 0);
  // 如果是PNG图片，则canvas.toDataURL('image/png')
  eleLink.href = canvas.toDataURL('image/jpeg');
  // 触发点击
  document.body.appendChild(eleLink);
  eleLink.click();
  // 然后移除
  document.body.removeChild(eleLink);
};

// 参考：https://www.npmjs.com/package/dom-to-image-more
// 生成图片，node为html node节点
export function generateImage(node, type = 'svg', name) {
  let t = type[0].toUpperCase() + (type.split('')).slice(1).join('').toLowerCase()
  console.log(t)
  domtoimage['to' + t](node)
    .then(function (dataUrl) {
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = dataUrl;
      a.download = (name || '下载 ' + Date.now())  + '.' + t
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    })
    .catch(function (error) {
      console.error("oops, something went wrong!", error);
    });
}
