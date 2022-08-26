<template>
  <div class="column q-my-sm">
    <p>Grid Repeat</p>
    <div v-if="disableToggle" style="height: 40px; width: 56px;" class="flex justify-center items-center">
      <q-spinner/>
    </div>
    <div v-else style="height: 40px">
      <q-toggle
        :value="repeat"
        @input="changeGridTemplate"
        color="primary"
      />
    </div>
    <div id="Column&Row" v-if="!repeat">
      <div class="column" style="width: 100%">
        <div>
          <q-btn icon="add" size="sm" @click="addColumnOrRow('column')" class="q-my-sm text-white"
                 style="background: -webkit-linear-gradient(#0B63F6 , #003CC5)">Add Column
          </q-btn>
        </div>
        <div v-for="(column,index) in columns" :key="index"
             style="width: 100%; display: flex; flex-direction: row; align-items: center"
             class="q-my-sm inputBackground">
          <input
            style="width: 80%;height: 25px;"
            v-model="column.size"
            @input="calculateColumns"
            type="number"
            :min="0"
            :max="100"
            v-if="!disableCheck($lget(column, 'unit', ''))"
          />
          <select
            style="font-size: 14px; border: 0; outline: 0; height: 25px;width: 100%;"
            v-model="column.unit"
            @change="calculateColumns"
          >
            <q-tooltip>
              Select Unit
            </q-tooltip>
            <option v-for="unit in gridUnits" :key="unit">{{ unit }}</option>
          </select>
          <q-space/>
          <q-btn flat round size="sm" icon="close" @click.stop="removeColOrRow('column', index)"></q-btn>
        </div>
      </div>

      <q-space/>
      <div class="column" style="width: 100%">
        <div>
          <q-btn icon="add" size="sm" style="background: -webkit-linear-gradient(#0B63F6 , #003CC5)"
                 @click="addColumnOrRow('row')" class="q-my-sm text-white">Add Row
          </q-btn>
        </div>
        <div v-for="(row,index) in rows" :key="index"
             style="width: 100%; display: flex; flex-direction: row; align-items: center"
             class="q-my-sm inputBackground">
          <input
            style="width: 80%;height: 25px;"
            v-model="row.size"
            type="number"
            :min="0"
            @input="calculateRows"
            v-if="!disableCheck($lget(row, 'unit', ''))"
            :max="100"
          />
          <select
            :style="`font-size: 14px; border: 0; outline: 0; height: 25px; ${!disableCheck($lget(row, 'unit', '')) ? 'flex: 1' : ''}`"
            v-model="row.unit"
            @change="calculateRows"
          >
            <q-tooltip>
              Select Unit
            </q-tooltip>
            <option v-for="unit in gridUnits" :key="unit">{{ unit }}</option>
          </select>
          <q-space/>
          <q-btn flat round size="sm" icon="close" @click.stop="removeColOrRow('row', index)"></q-btn>
        </div>
      </div>
      <q-separator class="q-my-md"/>
    </div>
    <div v-else>
      <grid-repeat :element="element" :disableToggle="disableToggle" @stylesUpdate="disableToggle = true; $emit('stylesUpdate', {path: $event.path, value: $event.value})">

      </grid-repeat>
      <q-separator class="q-my-md"/>
    </div>

    <div class="column" style="width: 100%">
      <p>Grid Column Gap</p>
      <div style="width: 100%; display: flex; flex-direction: row; align-items: center" class="q-my-sm inputBackground">
        <input
          style="width: 100%"
          :value="separateValues($lget(element, 'styles.grid-column-gap', '0'))"
          @input="emitDebounce($event.target.value + pullUnit($lget(element, 'styles.grid-column-gap', '0')), 'styles.grid-column-gap')"
          type="number"
          :disabled="disableCheck($lget(element, 'styles.grid-column-gap', ''))"
          min="0"
          :max="checkMax(pullUnit($lget(element, 'styles.grid-column-gap', '%')))"
        />
        <select
          style="font-size: 14px; border: 0; outline: 0; height: 25px"
          :value="pullUnit($lget(element, 'styles.grid-column-gap', '0'))"
          @change="emitCheck(element, $event.target.value, 'styles.grid-column-gap')"
        >
          <q-tooltip>
            Select Unit
          </q-tooltip>
          <option v-for="unit in gapUnits" :key="unit" :value="unit">{{ unit }}</option>
        </select>
      </div>
    </div>
    <div class="column" style="width: 100%">
      <p>Grid Row Gap</p>
      <div style="width: 100%; display: flex; flex-direction: row; align-items: center" class="q-my-sm inputBackground">
        <input
          style="width: 100%"
          :value="separateValues($lget(element, 'styles.grid-row-gap', '0'))"
          @input="emitDebounce($event.target.value + pullUnit($lget(element, 'styles.grid-row-gap', '0')), 'styles.grid-row-gap')"
          type="number"
          :disabled="disableCheck($lget(element, 'styles.grid-row-gap', ''))"
          min="0"
          :max="checkMax(pullUnit($lget(element, 'styles.grid-row-gap', '%')))"
        />
        <select
          style="font-size: 14px; border: 0; outline: 0; height: 25px"
          :value="pullUnit($lget(element, 'styles.grid-row-gap', '0'))"
          @change="emitCheck(element, $event.target.value, 'styles.grid-row-gap')"
        >
          <q-tooltip>
            Select Unit
          </q-tooltip>
          <option v-for="unit in gapUnits" :key="unit" :value="unit">{{ unit }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
  import GridRepeat from 'components/stylingComponents/gridRepeat';

  const debounce = require('lodash.debounce');

  export default {
    name: 'gridFlex',
    components: {GridRepeat},
    props: {
      element: Object,
    },
    mounted() {
      let reg3 = /repeat\((?<repeat>.*),\s*minmax\((?<min>.*),\s*(?<max>.*)\)\)/;
      if (reg3.test(this.$lget(this.element, 'styles.grid-template-rows'))) {
        this.repeat = true;
      } else {
        if (this.$lget(this.element, 'styles.grid-template-rows', false)) {
          let splitRows = this.element.styles['grid-template-rows'].split(' ');
          splitRows.map((row) => {
            if (row !== '') {
              this.rows.push({size: this.separateValues(row), unit: this.pullUnit(row)});
            }
          });
        }
      }
      if (reg3.test(this.$lget(this.element, 'styles.grid-template-columns'))) {
        this.repeat = true;
      } else {
        if (this.$lget(this.element, 'styles.grid-template-columns', false)) {
          let splitColumns = this.element.styles['grid-template-columns'].split(' ');
          splitColumns.map((column) => {
            if (column !== '') {
              this.columns.push({size: this.separateValues(column), unit: this.pullUnit(column)});
            }
          });
        }
      }
    },

    data() {
      return {
        repeatUnits: ['px', 'fr', '%'],
        gapUnits: ['$unset', 'px', 'em', 'rem', '%', 'initial', 'inherit', 'auto', 'revert', 'normal', 'unset'],
        gridUnits: ['auto', 'fr', '%', 'px', 'initial', 'inherit', '$unset'],
        columns: [],
        rows: [],
        repeat: false,
        disableToggle: false,
      };
    },
    watch: {
      element: {
        immediate: true,
        deep: true,
        handler(newVal, oldVal) {
          if ((this.$lget(newVal, 'styles.grid-template-columns') !== this.$lget(oldVal, 'styles.grid-template-columns')) || ((this.$lget(newVal, 'styles.grid-template-rows') !== this.$lget(oldVal, 'styles.grid-template-rows')))) {
            this.disableToggle = false;
          }
        }
      }
    },
    methods: {
      changeGridTemplate() {
        if (this.$lget(this.element, 'styles.grid-template-columns') || this.$lget(this.element, 'styles.grid-template-rows')) {
          this.$q.dialog({
            title: 'Confirm',
            message: 'This action will clear current settings for columns and rows.',
            ok: {
              push: true,
              color: 'negative'
            },
            cancel: true,
            persistent: true
          }).onOk(() => {
            // if (val && (this.columns.length || this.rows.length)) {
            //   let reg3 = /repeat\((?<repeat>.*),\s*minmax\((?<min>.*),\s*(?<max>.*)\)\)/;
            // if (!reg3.test(this.$lget(this.element, 'styles.grid-template-columns'))) {
            if (this.$lget(this.element, 'styles.grid-template-columns')) {
              this.columns = [];
              this.calculateColumns();
            }
            // if (!reg3.test(this.$lget(this.element, 'styles.grid-template-rows'))) {
            if (this.$lget(this.element, 'styles.grid-template-rows')) {
              this.rows = [];
              this.calculateRows();
            }
            // }
            this.repeat = !this.repeat;
          });
        } else {
          this.repeat = !this.repeat;
        }
      },
      checkMax(unit) {
        if (unit === '%') {
          return 100;
        } else {
          return 999;
        }
      },
      removeColOrRow(type, index) {
        if (type === 'column') {
          this.columns.splice(index, 1);
          this.calculateColumns();
        } else {
          this.rows.splice(index, 1);
          this.calculateRows();
        }
      },
      emitCheck(elementData, eventValue, path) {
        if (eventValue === 'initial' || eventValue === 'inherit' || eventValue === 'auto' || eventValue === 'normal' || eventValue === 'unset' || eventValue === 'revert' || eventValue === '$unset') {
          this.$emit('stylesUpdate', {path: path, value: eventValue});
        } else {
          this.$emit('stylesUpdate', {
            path: path,
            value: (this.separateValues(this.$lget(elementData, path, '0%')) || 0) + eventValue,
          });
        }
      },
      disableCheck(value) {
        if (value.includes('initial')) {
          return true;
        } else if (value.includes('inherit')) {
          return true;
        } else if (value.includes('auto')) {
          return true;
        } else if (value.includes('normal')) {
          return true;
        } else if (value.includes('unset')) {
          return true;
        } else if (value.includes('revert')) {
          return true;
        } else return !!value.includes('global');
      },
      separateValues(value) {
        if (value) {
          if (value.includes('rem')) {
            return Number(value.substring(0, value.length - 3));
          } else if (value.includes('px') || value.includes('vw') || value.includes('vh') || value.includes('fr') || value.includes('em')) {
            return Number(value.substring(0, value.length - 2));
          } else if (value.includes('%')) {
            return Number(value.substring(0, value.length - 1));
          } else if (value.includes('initial')) {
            return '';
          } else if (value.includes('inherit')) {
            return '';
          } else if (value.includes('auto')) {
            return '';
          } else if (value.includes('normal')) {
            return '';
          } else if (value.includes('revert')) {
            return '';
          } else if (value.includes('unset')) {
            return '';
          } else return null;
        } else return null;
      },
      pullUnit(val) {
        if (val) {
          if (val.includes('px')) {
            return 'px';
          } else if (val.includes('em') && !val.includes('r')) {
            return 'em';
          } else if (val.includes('rem')) {
            return 'rem';
          } else if (val.includes('%')) {
            return '%';
          } else if (val.includes('vw')) {
            return 'vw';
          } else if (val.includes('vh')) {
            return 'vh';
          } else if (val.includes('initial')) {
            return 'initial';
          } else if (val.includes('inherit')) {
            return 'inherit';
          } else if (val.includes('auto')) {
            return 'auto';
          } else if (val.includes('unset') && !val.includes('$')) {
            return 'unset';
          } else if (val.includes('revert')) {
            return 'revert';
          } else if (val.includes('normal')) {
            return 'normal';
          } else if (val.includes('$unset')) {
            return '$unset';
          } else if (val.includes('fr')) {
            return 'fr';
          } else {
            return 'px';
          }
        } else return 'px';
      },
      calculateRows() {
        this.disableToggle = true;
        let gridTemplateRows = '';
        this.rows.map(row => {
          if (row.unit === 'auto' || row.unit === 'initial' || row.unit === 'inherit') {
            row.size = '';
            gridTemplateRows += row.unit + ' ';
          } else {
            let unit = row.size + row.unit + ' ';
            gridTemplateRows += unit;
          }
        });
        this.$emit('stylesUpdate', {
          path: 'styles.grid-template-rows',
          value: this.rows.length ? gridTemplateRows : '$unset',
        });
      },
      calculateColumns() {
        this.disableToggle = true;
        let gridTemplateColumns = '';
        this.columns.map(column => {
          if (column.unit === 'auto' || column.unit === 'initial' || column.unit === 'inherit') {
            column.size = '';
            gridTemplateColumns += column.unit + ' ';
          } else {
            let unit = column.size + column.unit + ' ';
            gridTemplateColumns += unit;
          }
        });
        this.$emit('stylesUpdate', {
          path: 'styles.grid-template-columns',
          value: this.columns.length ? gridTemplateColumns : '$unset',
        });
      },
      addColumnOrRow(type) {
        if (type === 'column') {
          this.columns.push({size: 1, unit: 'fr'});
          this.calculateColumns();
        } else {
          this.rows.push({size: 1, unit: 'fr'});
          this.calculateRows();
        }
      },
      emitDebounce: debounce(function (value, path) {
        this.$emit('stylesUpdate', {
          path,
          value,
        });
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

  .inputBackground {
    background-color: #f2f2f2;
  }
</style>
