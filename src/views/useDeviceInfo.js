import { ref, reactive, watch, computed } from 'vue'

import Device from '@skillnull/device-js'

/**
 * @description 获取设备信息
 */
export  function useDeviceInfo () {
  let getDeviceInfo = async () => {
    const res = await Device.Info().then(data => {
      return data
    }).catch(() => {
      return {}
    })
    return res
  }
  return {
    getDeviceInfo
  }
}