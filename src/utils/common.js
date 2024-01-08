export function isEqualObj(obj1, obj2) {
  var o1 = obj1 instanceof Object;
  var o2 = obj2 instanceof Object;
  // 判断是不是对象
  if (!o1 || !o2) {
    return obj1 === obj2;
  }

  // 若比较的对象是数组，则对其排序后再进行比较
  if (isArray(obj1) && isArray(obj2)) {
    obj1 = JSON.parse(JSON.stringify(obj1)).sort()
    obj2 = JSON.parse(JSON.stringify(obj2)).sort()
  }

  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  }

  for (var o in obj1) {
    // 遍历对象 fon in 循环 o 为 对象的属性名，对对象属性进行遍历
    var t1 = obj1[o] instanceof Object;
    var t2 = obj2[o] instanceof Object;
    if (t1 && t2) {
      let isEqual = isEqualObj(obj1[o], obj2[o]);
      if (!isEqual) {
        return false
      }
    } else if (obj1[o] !== obj2[o]) {
      return false;
    }
  }
  return true;
}

export function sleep(time) {
  return new Promise((resolve) => {
    return setTimeout(() => {
      
      resolve();
    }, time);
  });
}

export function isArray (obj) {
  return Object.prototype.toString.call(obj) === '[object Array]'
}

export function isPC () {
  let mobile = ['iphone', 'android', 'harmony', 'mobile']
  let userAgent = window.navigator.userAgent.toLocaleLowerCase()

  let isMobile = mobile.some(agent => userAgent.includes(mobile))

  if (isMobile) {
    return false
  }
  else {
    return true
  }
}