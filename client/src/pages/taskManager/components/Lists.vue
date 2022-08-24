<template>
  <div class="q-pa-sm" id="ListsList" :style="{'min-height': '100vh', ...titleCssVars}">
    <div class="flex justify-between flex q-pr-lg">
      <div v-if="item && layout === 'Card view'" class="card-view-nav">
        <q-btn @click="goBack" icon="fas fa-arrow-left" flat color="secondary"/>
        <slot name="update-name">

        </slot>
        <transition-group name="slide">
          <span @click="unHideList(hidden, idx)" :key="hidden.order" v-for="(hidden, idx) in toHide">
            <q-btn round
                   :style="{backgroundColor: $lget(hidden.color, 'hex', '#808080'), color: $lget(hidden.color, 'hex', false) ? $isHexDark(hidden.color.hex) ? 'white' : 'black' : 'white'}"
                   size="sm" :icon="$lget(hidden,'_id')===item._id?'fas fa-recycle':'open_in_full'" class="span">
              <q-badge
                :style="{backgroundColor: $lget(hidden.color, 'hex', '#808080'), color: $lget(hidden.color, 'hex', false) ? $isHexDark(hidden.color.hex) ? 'white' : 'black' : 'white'}"
                floating rounded>{{ $lget(hidden, ['cards'], []).length }}</q-badge>
            </q-btn>
            <q-tooltip>
              Show "{{ hidden.name }}"
            </q-tooltip>
          </span>
        </transition-group>
      </div>
      <q-item-label v-if="!item" class="text-h3  self-center">
        {{ $lget(item, ['name'], '') }}
      </q-item-label>


      <div>
        <slot name="left-control" :item="item">

        </slot>
      </div>
    </div>

    <div v-if="layout === 'Card view'" style="position: relative; flex: 1;">
    </div>
    <list-form-dialog
      :initial-value="itemToEdit"
      v-model="openItemDialog"
      @save-list="handleSaveItem"
    />
  </div>
</template>

<script setup>
  import ListFormDialog from 'pages/taskManager/components/ListFormDialog';
  import {computed, defineEmits, defineProps, inject, reactive, ref, watch} from 'vue';
  import {useCssVars} from '@sparkz-community/common-client-lib';
  import {storeToRefs} from 'pinia/dist/pinia';
  import {useRouter} from 'vue-router/dist/vue-router';
  import {useQuasar} from 'quasar';

  const $q = useQuasar();
  const $router = useRouter();
  const $lget = inject('$lget');
  const $lorderBy = inject('$lorderBy');

  const props = defineProps({
    item: {
      type: Object,
      required: true,
    },
  });
  console.log({props});
  const $emit = defineEmits({
    'update-item': (item) => {
      if (item) {
        return true;
      } else {
        console.warn('Invalid submit event payload!');
        return false;
      }
    },
  });

  const cssVarStore = useCssVars();
  const {$isHexDark} = storeToRefs(cssVarStore);

  let itemToEdit = reactive({});
  let openItemDialog = ref(false);
  let layout = ref('Card view');
  let toHide = ref([]);
  let tempToHide = ref([]);
  let lists = ref([]);

  watch(() => props.item,
        (newVal) => {
          lists.value = $lorderBy($lget(newVal, 'lists', []).concat([{_id: undefined}]), [
            'order',
            'createdAt',
          ], ['asc', 'asc', 'asc']);
        },
        {immediate: true, deep: true},
  );

  watch(() => lists.value,
        (newVal, oldVal) => {
          if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
            const hiddenListId = toHide.value.map(item => $lget(item, '_id'));
            newVal.forEach(item => {
              if ($lget(item, 'hidden') && !hiddenListId.includes($lget(item, '_id'))) {
                toHide.value.push(item);
                let elements = document.getElementsByClassName(`nestable-item-${$lget(item, '_id')}`)[0];
                elements.classList.add('hiding-anim');
                elements.style.display = 'none';
                elements.classList.remove('hiding-anim');
              }
            });
          }
        },
        {deep: true, immediate: true},
  );

  watch(() => toHide.value,
        (newVal) => {
          if (JSON.stringify(newVal) !== JSON.stringify(tempToHide.value)) {
            toHide.value = this.$lorderBy(newVal, ['order', 'createdAt'], ['asc', 'asc']);
            const hiddenListId = newVal.map(item => $lget(item, '_id'));
            const lists = [...lists.filter(list => !!list._id)].map(function (item) {
              item.hidden = hiddenListId.includes(item._id);
              return item;
            });
            $emit('update-item', {lists});
          }
          tempToHide.value = Array.from(newVal);
        },
        {immediate: true},
  );


  const titleCssVars = computed(() => ({
    '--title-bg-color': $q.dark.mode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.16)',
    '--dark-bg-color': $q.dark.mode ? 'var(--q-color-dark)' : '#fff',
  }));

  // function editName(item) {
  //   const lists = [...lists.value.filter(list => !!list._id)].map(function (list) {
  //     if (list._id === item._id) {
  //       list = item;
  //     }
  //     return list;
  //   });
  //   $emit('update-item', {lists});
  // }

  function  goBack() {
    $router.go(-1);
  }

  async function unHideList(list, idx) {
    toHide.value.splice(idx, 1);
    let elements = document.getElementsByClassName(`nestable-item-${list._id}`)[0];
    elements.classList.add('showing-anim');
    elements.style.display = 'block';
    setTimeout(() => {
      elements.classList.remove('showing-anim');
    }, 500);
  }

  function handleSaveItem() {

  }
</script>

<style scoped lang="scss" src="./lists.scss">

</style>
