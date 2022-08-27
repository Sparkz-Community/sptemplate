<template>
  <q-card class="q-pa-sm">
    <q-card-section class="cardSection">
      <image-picker :element="elementData" @addImage="stylesUpdate({path: 'raw', value: $event.raw})"/>
    </q-card-section>
  </q-card>
</template>

<script>
  import {lodash} from '@sparkz-community/common-client-lib';
  const {$ldebounce} = lodash;

  import ImagePicker from './imagePicker';

  export default {
    name: 'imgSettings',
    components: {
      ImagePicker,
    },
    props: {
      element: Object,
    },
    data() {
      return {
        elementData: {},
      };
    },
    watch: {
      element: {
        immediate: true,
        deep: true,
        handler(newVal) {
          this.elementData = this.$lcloneDeep(newVal);
        },
      },
    },
    methods: {
      stylesUpdate: $ldebounce(function (value) {
        this.$emit('stylesUpdate', value);
      }, 370),
    },
  };
</script>

<style scoped>

  p {
    color: #848484;
    padding: 0;
    margin: 0;
  }

  input {
    border: 0;
    outline: 0;
    background-color: #f2f2f2;
  }

  select {
    border: 0;
    outline: 0;
    background-color: #f2f2f2;
  }

  .cardSection {
    padding: 0;
    margin-bottom: 16px;
  }
</style>
