<template>
  <q-card flat class="q-pa-sm">
    <q-card-section class="cardSection">
      <div class="q-pa-sm" style="width: 100%; display: flex; flex-direction: column; justify-content: flex-start">
        <div class="justify-start">
          <p style="padding: 0; margin: 0">Font</p>
        </div>
        <div style="width: 100%">
          <font-picker :api-key="fontKey"
                       @change="setFont"
                       :active-font="$lget(element, 'styles.font-family', 'Open Sans')"
                       class="apply-font"
                       style="width: 100%;background: #F2F2F2;" :options="{}" id="fontPicker">

          </font-picker>
        </div>
      </div>
    </q-card-section>
    <q-card-section class="cardSection">
      <div class="row q-pa-sm">

        <div class="column" style="width: 50%">
          <div>
            <p>Font Size</p>
          </div>
          <div style="width: 90%; display: flex; flex-direction: row; align-items: center; background-color: #f2f2f2">
            <q-input style="width: 100%;"
                   type="number"
                   min="0"
                   :disabled="disableCheck($lget(element, 'styles.font-size', '0px'))"
                   :model-value="separateValues($lget(element, 'styles.font-size', '0px'))"
                   @update:model-value="emitDebounce($event.target.value + pullUnit($lget(element, 'styles.font-size', '0px')), 'styles.font-size')"/>
            <q-select style="font-size: 14px; border: 0; outline: 0; height: 25px;"
                    :model-value="pullUnit($lget(element, 'styles.font-size', '0px'))"
                    @change="emitCheck(element, $event.target.value, 'styles.font-size')">
              <!--$emit('stylesUpdate', { path: 'styles.font-size', value: separateValues($lget(element, 'styles.font-size', '0px')) + $event.target.value})-->
              <q-tooltip>
                Select Unit
              </q-tooltip>
              <option v-for="unit in fontSizeUnits" :key="unit" :value="unit">{{ unit }}</option>
            </q-select>
          </div>
        </div>

        <q-space/>

        <div class="column" style="width: 50%">
          <div>
            <p>Spacing</p>
          </div>
          <div style="width: 90%; display: flex; flex-direction: row; align-items: center; background-color: #f2f2f2">
            <q-input style="width: 100%"
                   type="number"
                   min="0"
                   :disabled="disableCheck($lget(element, 'styles.letter-spacing', '0px'))"
                   :model-value="separateValues($lget(element, 'styles.letter-spacing', '0px'))"
                   @update:model-value="emitDebounce($event.target.value + pullUnit($lget(element, 'styles.letter-spacing', '0px')), 'styles.letter-spacing')"/>
            <q-select style="font-size: 14px; border: 0; outline: 0; height: 25px"
                    :model-value="pullUnit($lget(element, 'styles.letter-spacing', '0px'))"
                    @change="emitCheck(element, $event.target.value, 'styles.letter-spacing'); disableCheck($event.target.value)">
              <!--$emit('stylesUpdate', { path: 'styles.letter-spacing', value: separateValues($lget(element, 'styles.letter-spacing', '0px')) + $event.target.value});-->
              <q-tooltip>
                Select Unit
              </q-tooltip>
              <option v-for="unit in fontSizeUnits" :key="unit" :value="unit">{{ unit }}</option>
            </q-select>
          </div>
        </div>

      </div>
    </q-card-section>
    <q-card-section class="cardSection">
      <div class="q-pa-sm" style="width: 100%; display: flex; flex-direction: column; justify-content: flex-start">
        <div class="justify-start">
          <p style="padding: 0; margin: 0">Font Weight</p>
        </div>
        <div style="width: 100%">
          <q-select
            style="width: 100%; height: 25px; padding: 0; margin: 0; background-color: #f2f2f2; outline: 0; border: 0;"
            :model-value="$lget(element, 'styles.font-weight', 'normal')"
            @change="$emit('stylesUpdate', { path: 'styles.font-weight', value: $event.target.value })">
            <option v-for="unit in fontWeightOptions" :key="unit" :value="unit">{{ unit }}</option>
          </q-select>
        </div>
      </div>
    </q-card-section>
    <q-card-section class="cardSection">
      <div class="q-pa-sm justify-center justify-between row" style="width: 100%">
        <div style="width: 50%; display: flex; flex-direction: row"
             class="row q-mb-md">
          <div>
            <p style="padding: 0; margin: 0;">Line Height</p>
          </div>
          <div
            style="width: 90%; height: 25px; display: flex; flex-direction: row; align-items: center; background-color: #f2f2f2">
            <q-input style="width: 100%;"
                   type="number"
                   min="0"
                   :disabled="disableCheck($lget(element, 'styles.line-height', '0px'))"
                   :model-value="separateValues($lget(element, 'styles.line-height', '0px'))"
                   @update:model-value="emitDebounce($event.target.value + pullUnit($lget(element, 'styles.line-height', '0px')), 'styles.line-height')"/>
            <q-select style="font-size: 14px; border: 0; outline: 0; height: 25px;"
                    :model-value="pullUnit($lget(element, 'styles.line-height', '0px'))"
                    @change="emitCheck(element, $event.target.value, 'styles.line-height'); disableCheck($event.target.value)">
              <!--$emit('stylesUpdate', { path: 'styles.line-height', value: separateValues($lget(element, 'styles.line-height', '0px')) + $event.target.value })-->
              <q-tooltip>
                Select Unit
              </q-tooltip>
              <option v-for="unit in fontSizeUnits" :key="unit" :value="unit">{{ unit }}</option>
            </q-select>
          </div>
        </div>
        <div style="width: 50%; display: flex; flex-direction: row;"
             class="row q-mb-md">
          <div class="justify-start" style="width: 70%">
            <p style="padding: 0; margin: 0">Font Color</p>
          </div>
          <div>
            <q-input input-style="padding: 0; margin: 0;"
                     square
                     filled
                     borderless
                     style="padding: 0; margin: 0"
                     dense
                     :model-value="$lget(element, 'styles.color', '#000000')"
                     readonly>
              <template v-slot:append>
                <q-btn size="xs"
                       round
                       :style="`background-color: ${$lget(element, 'styles.color', '#000000')}`"
                       @click="colorDialog = !colorDialog"/>
              </template>
            </q-input>
          </div>
        </div>
      </div>
      <q-card-section v-if="colorDialog">
        <ColorPicker :model-value="$lget(element, 'styles.color', 'rgba( 0, 0, 0, 1)')"
                     @colorPicker="$emit('stylesUpdate', { path: 'styles.color', value: $event })"/>
      </q-card-section>
    </q-card-section>
    <q-card-section class="cardSection">
      <div class="q-pa-sm" style="width: 100%">
        <div class="flex justify-between">
          <p class="q-mb-sm" style="padding: 0; margin: 0">Text Align</p>
          <q-btn icon="clear" size="xs" @click="$emit('stylesUpdate', { path: 'styles.text-align', value: '$unset' })" round flat>
            <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">Clear</q-tooltip>
          </q-btn>
        </div>
        <q-btn-toggle spread
                      dense
                      flat
                      :model-value="$lget(element, 'styles.text-align', 'left')"
                      @update:model-value="$emit('stylesUpdate', { path: 'styles.text-align', value: $event })"
                      style="background-color: #F2F2F2;"
                      :options="[
                        {slot: 'one', value: 'left'},
                        {slot: 'two', value: 'center'},
                        {slot: 'three', value: 'right'},
                        // {slot: 'four', value: '$unset'}
                      ]">
          <template v-slot:one>
            <div style="width: 33%">
              <q-icon name="format_align_left">
                <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
                  Align Left
                </q-tooltip>
              </q-icon>
            </div>
          </template>
          <template v-slot:two>
            <div style="width: 33%">
              <q-icon name="format_align_center">
                <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
                  Align Center
                </q-tooltip>
              </q-icon>
            </div>
          </template>
          <template v-slot:three>
            <div style="width: 33%">
              <q-icon name="format_align_right">
                <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
                  Align Right
                </q-tooltip>
              </q-icon>
            </div>
          </template>
<!--          <template v-slot:four>-->
<!--            <q-icon name="clear" class="text-red">-->
<!--              <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">-->
<!--                Clear-->
<!--              </q-tooltip>-->
<!--            </q-icon>-->
<!--          </template>-->
        </q-btn-toggle>
      </div>
    </q-card-section>
    <q-card-section class="cardSection">
      <div class="q-pa-sm" style="width: 100%">
        <div class="flex justify-between">
          <p class="q-mb-sm" style="padding: 0; margin: 0">Text Decoration</p>
          <q-btn icon="clear" size="xs" @click="$emit('stylesUpdate', { path: 'styles.text-decoration', value: '$unset' })" round flat>
            <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">Clear</q-tooltip>
          </q-btn>
        </div>
        <q-btn-toggle spread
                      dense
                      flat
                      :model-value="$lget(element, 'styles.text-decoration', 'none')"
                      @update:model-value="$emit('stylesUpdate', { path: 'styles.text-decoration', value: $event})"
                      style="background-color: #F2F2F2"
                      :options="[
                        {slot: 'one', value: 'none'},
                        {slot: 'two', value: 'underline'},
                        {slot: 'three', value: 'line-through'},
                        // {slot: 'four', value: '$unset'}
                      ]">
          <template v-slot:one>
            <div style="width: 33%">
              <q-icon name="clear">
                <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
                  None
                </q-tooltip>
              </q-icon>
            </div>
          </template>
          <template v-slot:two>
            <div style="width: 33%">
              <q-icon name="format_underlined">
                <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
                  Underline
                </q-tooltip>
              </q-icon>
            </div>
          </template>
          <template v-slot:three>
            <div style="width: 33%">
              <q-icon name="strikethrough_s">
                <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
                  Line Through
                </q-tooltip>
              </q-icon>
            </div>
          </template>
<!--          <template v-slot:four>-->
<!--            <q-icon name="clear" class="text-red">-->
<!--              <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">-->
<!--                Clear-->
<!--              </q-tooltip>-->
<!--            </q-icon>-->
<!--          </template>-->
        </q-btn-toggle>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
  import ColorPicker from './colorPicker';
  import FontPicker from 'components/formGeneratorCustom/FontPicker';

  const debounce = require('lodash.debounce');

  export default {
    name: 'font',
    components: {
      FontPicker,
      ColorPicker,
    },
    props: {
      element: Object,
    },
    mounted() {
      this.setUnits();
    },
    data() {
      return {
        fontUnits: ['px', '%', 'rem', 'em'],
        fontSizeUnits: ['$unset', 'px', 'rem', 'em', 'initial', 'inherit', 'unset', 'revert'],
        fontWeightOptions: ['$unset', 'lighter', 'normal', 'bold', 'bolder'],
        hex: '',
        colorDialog: false,
        fontKey: process.env.FONT_PICKER_KEY,
      };
    },
    computed: {
      computedColor() {
        return this.$lget(this.element, 'styles.color', '#000000');
      },
    },
    methods: {
      setFont($event) {
        this.activeFont = $event.family;
        this.$emit('stylesUpdate', {path: 'styles.font-family', value: $event.family});
      },
      setUnits() {
        this.hex = this.computedColor;
      },
      separateValues(val) {
        if (val) {
          if (val.includes('rem')) {
            return Number(val.substring(0, val.length - 3));
          } else if (val.includes('em') || val.includes('px')) {
            return Number(val.substring(0, val.length - 2));
          } else if (val.includes('initial')) {
            return '';
          } else if (val.includes('inherit')) {
            return '';
          } else if (val.includes('auto')) {
            return '';
          } else if (val.includes('revert')) {
            return '';
          } else if (val.includes('unset')) {
            return '';
          } else return Number(val.substring(0, val.length - 2));
        } else return null;
      },
      pullUnit(val) {
        if (val.includes('rem')) {
          return 'rem';
        } else if (val.includes('px')) {
          return 'px';
        } else if (val.includes('em')) {
          return 'em';
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
        } else if (val.includes('$unset')) {
          return '$unset';
        }
      },
      disableCheck(value) {
        if (value.includes('initial')) {
          return true;
        } else if (value.includes('inherit')) {
          return true;
        } else if (value.includes('auto')) {
          return true;
        } else if (value.includes('unset')) {
          return true;
        } else if (value.includes('revert')) {
          return true;
        }
        return false;
      },
      emitCheck(element, eventValue, path) {
        if (eventValue === 'initial' || eventValue === 'inherit' || eventValue === 'auto' || eventValue === 'unset' || eventValue === 'revert' || eventValue === '$unset') {
          this.$emit('stylesUpdate', {path: path, value: eventValue});
        } else {
          this.$emit('stylesUpdate', {
            path: path,
            value: (this.separateValues(this.$lget(element, path, '0px')) || 0) + eventValue,
          });
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
    margin: 0;
    padding: 0;
  }

  input {
    border: 0;
    outline: 0;
    background-color: #f2f2f2;
  }

  select {
    background-color: transparent;
  }

  .cardSection {
    padding: 0
  }

</style>
