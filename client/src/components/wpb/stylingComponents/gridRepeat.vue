<template>
  <div class="column q-my-sm">
    <div v-for="(type, idx) in [pulledValuesCol, pulledValuesRow]" :key="idx">
      <div class="column" style="width: 100%">
        <div class="flex justify-between" style="align-items: end">
          <p v-if="type === pulledValuesCol">Column Repeat</p>
          <p v-else>Row Repeat</p>
          <q-btn @click="clearRepeat(type)" icon="close" size="sm" flat round
                 :disabled="disableToggle || (type === pulledValuesCol && !$lget(element, 'styles.grid-template-columns') || type === pulledValuesRow && !$lget(element, 'styles.grid-template-rows'))"/>
        </div>
        <div style="width: 90%; display: flex; flex-direction: row; align-items: center">
          <select v-model="type.repeat"
                  style="font-size: 14px; height: 25px; width: 100%"
                  @change="type === pulledValuesCol ? buildColRepeat() : buildRowRepeat()"
                  class="q-mb-md">
            <option>auto-fit</option>
            <option>auto-fill</option>
          </select>
        </div>
      </div>
      <div class="column" style="width: 100%;">
        <p v-if="type === pulledValuesCol">Column Minimum Size</p>
        <p v-else>Row Minimum Size</p>
        <grid-size-input v-model="type.min"
                         @update:modelValue="type === pulledValuesCol ? buildColRepeat() : buildRowRepeat()"></grid-size-input>
        <p v-if="type === pulledValuesCol">Column Maximum Size</p>
        <p v-else>Row Maximum Size</p>
        <grid-size-input v-model="type.max"
                         @update:modelValue="type === pulledValuesCol ? buildColRepeat() : buildRowRepeat()"></grid-size-input>
      </div>
      <q-separator v-if="type === pulledValuesCol" class="q-my-md"/>
    </div>
  </div>
</template>

<script>
  import GridSizeInput from 'components/wpb/stylingComponents/gridSizeInput';

  export default {
    name: 'gridRepeat',
    components: {
      GridSizeInput,
    },
    props: {
      element: Object,
      disableToggle: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        pulledValuesCol: {
          repeat: '',
          min: '',
          max: '',
        },
        pulledValuesRow: {
          repeat: '',
          min: '',
          max: '',
        },
      };
    },
    watch: {
      element: {
        immediate: true,
        deep: true,
        handler(newVal) {
          this.regexPull(this.$lget(newVal, 'styles.grid-template-columns', ''), 'column');
          this.regexPull(this.$lget(newVal, 'styles.grid-template-rows', ''), 'row');
        },
      },
    },
    methods: {
      buildColRepeat() {
        console.log('this is pulledValuesCol: ', this.pulledValuesCol);
        this.$emit('stylesUpdate', {
          path: 'styles.grid-template-columns',
          value: `repeat(${this.$lget(this.pulledValuesCol, 'repeat', 'auto-fit')}, minmax(${this.$lget(this.pulledValuesCol, 'min', '100px')}, ${this.$lget(this.pulledValuesCol, 'max', '1fr')}))`,
        });
      },
      buildRowRepeat() {
        this.$emit('stylesUpdate', {
          path: 'styles.grid-template-rows',
          value: `repeat(${this.$lget(this.pulledValuesRow, 'repeat', 'auto-fit')}, minmax(${this.$lget(this.pulledValuesRow, 'min', '100px')}, ${this.$lget(this.pulledValuesRow, 'max', '1fr')}))`,
        });
      },
      regexPull(string, type) {
        let reg3 = /repeat\((?<repeat>.*),\s*minmax\((?<min>.*),\s*(?<max>.*)\)\)/;
        if (reg3.test(string)) {
          let d = reg3.exec(string);
          if (type === 'column') {
            this.pulledValuesCol = d.groups;
          } else {
            this.pulledValuesRow = d.groups;
          }
        }
      },
      clearRepeat(val) {
        if (val === this.pulledValuesCol) {
          this.$emit('stylesUpdate', {
            path: 'styles.grid-template-columns',
            value: '$unset',
          });
          this.pulledValuesCol = {
            repeat: '',
            min: '',
            max: '',
          };
        } else {
          this.$emit('stylesUpdate', {
            path: 'styles.grid-template-rows',
            value: '$unset',
          });
          this.pulledValuesRow = {
            repeat: '',
            min: '',
            max: '',
          };
        }
      },
    },
  };
</script>

<style scoped>
  p {
    color: #848484;
    padding: 0;
    margin: 0;
  }

  select {
    border: 0;
    outline: 0;
    background-color: #f2f2f2;
  }

  input {
    border: 0;
    outline: 0;
    background-color: #f2f2f2;
  }
</style>
