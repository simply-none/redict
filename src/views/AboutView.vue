<template>
  <el-upload
    ref="uploadRef"
    :on-change="beforeUpload"
    class="upload-demo"
    action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
    :auto-upload="false"
    :before-upload="beforeUpload"
  >
    <template #trigger>
      <el-button type="primary">select file</el-button>
    </template>

    <el-button class="ml-3" type="success" @click="submitUpload">
      upload to server
    </el-button>

    <template #tip>
      <div class="el-upload__tip">
        jpg/png files with a size less than 500kb
      </div>
    </template>

    <pre>
      {{ a }}
    </pre>
  </el-upload>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import type { UploadInstance } from "element-plus";
import localforage from "localforage";

const uploadRef = ref<UploadInstance>();

let a = ref();

const submitUpload = () => {
  uploadRef.value!.submit();
};

function beforeUpload(uploadfile, uploadfiles) {
  console.log(uploadfile, uploadfiles);
  var reader = new FileReader();
  // 读取文件中的内容，执行读文件函数，设置编码格式。
  reader.readAsText(uploadfile?.raw, "UTF-8");
  // 读取文件，得到文件内容。
  reader.onload = function (e) {
    var content = e?.target?.result;
      localforage.config({
          name: uploadfile.name
      });

      localforage
      .setItem(Date.now(), content)
      .then(function (value) {
        console.log("cache...");
      })
      .catch(function (err) {
        // 当出错时，此处代码运行
        console.log(err);
      });

    
  };
  return true;
}
</script>
