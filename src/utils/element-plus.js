import { ElNotification } from "element-plus";

export function setNotify(msg, type, title) {
  ElNotification({
    type: type || "error",
    title: title || "提示",
    message: msg,
    duration: type !== 'error' ? 3000 : 5000,
    position: "bottom-right",
  });
}

export function clearNotify() {
  ElNotification.closeAll()
}