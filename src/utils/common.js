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

export function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]'
}

export function isPC() {
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

export function delBFromA(A, B) {
  A.sort((a, b) => a > b ? 1 : -1)
  B.sort((a, b) => a > b ? 1 : -1)

  A = Array.from(new Set(A));
  B = Array.from(new Set(B));

  const lengthA = A.length, lengthB = B.length;
  let indexA = 0, indexB = 0;
  const subtraction = [];
  // const subtractionB = [];
  while (indexA < lengthA && indexB < lengthB) {
    const itemA = A[indexA], itemB = B[indexB];
    if (itemA === itemB) {
      indexA++;
      indexB++;
    } else if (itemA < itemB) {
      if (itemA === 'a') console.log(itemA)
      // 保证加入元素的唯一性
      if (!subtraction.length || itemA !== subtraction[subtraction.length - 1]) {
        subtraction.push(itemA);
      }
      indexA++;
    } else {
      // if (!subtractionB.length || itemB !== subtractionB[subtractionB.length - 1]) {
      //   subtractionB.push(itemB);
      // }
      indexB++;
    }
  }
  if (indexA >= lengthA || indexB >= lengthB) {
    subtraction.push(...A.slice(indexA))
    // subtractionB.push(...B.slice(indexB))
  }
  return subtraction;
}

export function filterBFromA(A, B) {
  A.sort((a, b) => a > b ? 1 : -1)
  B.sort((a, b) => a > b ? 1 : -1)
  const lengthA = A.length, lengthB = B.length;
  let indexA = 0, indexB = 0;
  const intersection = [];
  while (indexA < lengthA && indexB < lengthB) {
    const itemA = A[indexA], itemB = B[indexB];
    if (itemA === itemB) {
      // 保证加入元素的唯一性
      if (!intersection.length || itemA !== intersection[intersection.length - 1]) {
        intersection.push(itemA);
      }
      indexA++;
      indexB++;
    } else if (itemA < itemB) {
      indexA++;
    } else {
      indexB++;
    }
  }
  return intersection;
}