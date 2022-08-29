<template>
  <q-card flat class="justify-center justify-between row q-pa-sm" style="width: 100%">
    <div class="full-width flex justify-evenly">
      <span class="text-weight-regular"
            style="font-size: 17px;">Current {{ name }} Color</span>
      <q-avatar size="30px"
                style="border: 1px solid black;"
                :style="{background: hex}"
                class="cursor-pointer"
                @click="changeColor = !changeColor"></q-avatar>
    </div>
    <div style="width: 100%;display: flex; justify-content: center; flex-direction: column;"
         class="flex flex-center q-mt-sm"
         v-if="changeColor">
      <q-select :options="options"
                v-model="selectedOption"
                @update:modelValue="startEmit($event, 'select')"
                outlined
                class="q-my-sm"/>
      <ColorPicker :modelValue="$lget(element, path, defaultColor)"
                   @colorPicker="startEmit($event, 'hex')"/>
    </div>
  </q-card>
</template>

<script>
  //consider making it so that when you are changing the background color of one element, and then select another element, the current background color editer closes.
  import ColorPicker from './colorPicker';

  export default {
    name: 'color',
    components: {
      ColorPicker,
    },
    props: {
      element: Object,
      path: String,
      name: String,
    },
    mounted() {
      console.log('this is mounted');
    },
    data() {
      return {
        hex: null,
        colorDialog: false,
        options: ['$unset', 'inherit', 'initial', 'transparent', 'unset', 'revert'],
        selectedOption: null,
        changeColor: false,
        defaultColor: 'rgba( 255, 255, 255, 1)',
      };
    },
    watch: {
      element: {
        immediate: true,
        deep: true,
        handler(newVal) {
          if (newVal) {
            let bgColor = this.$lget(newVal, this.path, this.defaultColor);
            if (bgColor) {
              if (this.options.includes(bgColor)) {
                this.selectedOption = bgColor;
              } else {
                if (this.options.length > 8) {
                  //add logic to make sure necessary ooptions are not removed
                  this.options.splice(this.options.length - 3, 1);
                }
                this.options.push(bgColor);
                this.selectedOption = bgColor;
                this.hex = bgColor;
              }
            }
          }
        },
      },
    },
    methods: {
      startEmit(val) {
        // startEmit(val, input) {
        //   if (input === 'hex' && this.options.length > 5) {
        //     this.options.pop();
        //     this.options.push(val);
        //   } else {
        //     this.options.push(val);
        //   }
        if ((!this.options.includes(val) || (val === '$unset' && !this.options.includes(this.defaultColor))) && this.options.length > 8) {
          this.options.splice(this.options.length - 3, 1);
        }
        this.$emit('stylesUpdate', {path: this.path, value: val});
      },
    },
  };
</script>

<style scoped>

</style>
