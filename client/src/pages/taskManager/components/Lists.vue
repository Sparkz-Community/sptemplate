<template>
  <div class="q-pa-sm" id="ListsList" :style="{'min-height': '100vh', ...titleCssVars}">
    <div class="flex justify-between flex q-pr-lg">
      <div v-if="modelValue && layout === 'Card view'" class="card-view-nav">
        <q-btn @click="goBack" icon="fas fa-arrow-left" flat color="secondary"/>
        <slot name="update-name">

        </slot>
        <transition-group name="slide">
          <span @click="unHideList(hidden, idx)" :key="hidden.order" v-for="(hidden, idx) in toHide">
            <q-btn round
                   :style="{backgroundColor: $lget(hidden.color, 'hex', '#808080'), color: $lget(hidden.color, 'hex', false) ? $isHexDark(hidden.color.hex) ? 'white' : 'black' : 'white'}"
                   size="sm" :icon="$lget(hidden,'_id')===modelValue._id?'fas fa-recycle':'open_in_full'" class="span">
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
      <q-item-label v-if="!modelValue" class="text-h3  self-center">
        {{ $lget(modelValue, ['name'], '') }}
      </q-item-label>


      <div>
        <div class="row justify-around ">
          <slot name="left-control" v-bind="{modelValue}">

          </slot>
        </div>

      </div>
    </div>

    <div v-if="layout === 'Card view'" style="position: relative; flex: 1;">
      <container v-if="lists" orientation="horizontal" behaviour="contain" :get-child-payload="getChildPayload" style="border-spacing: 1rem; " @drop="onDrop">
        <template v-for="list in lists" :key="list._id">
          <q-card v-if="!list._id"
                  :class="['list-card cursor-pointer column align-center justify-center', $q.dark.mode ? 'bg-grey-9' : 'bg-grey-5']"
                  @click.stop="handleOpenListDialog(list)"
                  @touchstart.stop="handleOpenListDialog(list)">
            <q-card-section class="flex flex-center" style="height: 100%; width: 100%">
              <q-icon name="add"/>
              New List
            </q-card-section>
          </q-card>
          <draggable v-else :tag="{value: 'tr', props: {class: 'cursor-pointer'}}">
            <q-card :class="['list-card', 'shadow-8', $q.dark.mode ? 'bg-grey-9' : 'bg-grey-3',`nestable-item-${list._id}`]"
                    style="position: relative;">
              <q-toolbar
                :style="`background-color: ${$lget(list, 'color.hexa', 'grey')}; color: ${textColor(list)}; border-bottom-right-radius: 0; border-bottom-left-radius: 0;`">
                <q-toolbar-title @dblclick="handlePopupShow(list._id)">
                  {{ list.name }}
                  <q-popup-edit v-if="$lget(list,'_id')!==modelValue._id"
                                :ref="el => { popups[list._id] = el }"
                                v-model="list.name"
                                :validate="val => val.length > 0"
                                @save="editName(list)"
                                @before-show="handlePopup(list._id)"
                                @hide="popupShow = false"
                                v-slot="scope"
                  >

                      <q-input
                        v-model="scope.value"
                        :model-value="scope.value"
                        autofocus
                        dense
                        hint="List Name"
                        :rules="[val => scope.validate(val) || 'More than 0 chars required']">
                        <template v-slot:after>
                          <q-btn flat dense color="negative" icon="cancel" @click.stop="scope.cancel"/>
                          <q-btn flat dense color="positive" icon="check_circle" @click.stop="scope.set"
                                 :disable="scope.validate(scope.value) === false || scope.initialValue === scope.value"
                          />
                        </template>
                      </q-input>

                  </q-popup-edit>
                </q-toolbar-title>

                <action-fab v-if="$lget(list,'_id')!==modelValue._id" :item="list" @hide="hideList(list)" @edit="handleOpenListDialog(list)" @delete="handleDeleteList(list)"></action-fab>
                <div v-else id="actionFab">
                  <q-fab v-model="fab"
                         @touchstart.stop="fab = !fab"
                         vertical-actions-align="left"
                         padding="xs"
                         icon="more_vert"
                         direction="down"
                         flat>
                    <q-fab-action padding="3px"
                                  external-label
                                  color="primary"
                                  icon="visibility_off"
                                  label="Hide"
                                  @click.stop="hideList(list)"
                                  @touchstart.stop="hideList(list)" />
                  </q-fab>
                </div>

              </q-toolbar>
            </q-card>
          </draggable>
        </template>
      </container>

    </div>
    <list-form-dialog
      :initial-value="itemToEdit"
      v-model="openListDialog"
      @save-list="handleSaveList"
      @close="openListDialog=false"
    />
  </div>
</template>

<script setup>
  import ListFormDialog from 'pages/taskManager/components/ListFormDialog';
  import {computed, defineEmits, defineProps, inject, onBeforeUpdate, reactive, ref, watch} from 'vue';
  import {useCssVars} from '@sparkz-community/common-client-lib';
  // import {storeToRefs} from 'pinia/dist/pinia';
  import {useRouter} from 'vue-router/dist/vue-router';
  import {useQuasar} from 'quasar';
  import {Container, Draggable} from 'vue3-smooth-dnd';
  import ActionFab from 'pages/taskManager/components/ActionFab';
  import {getMaxOrder, moveItem} from 'pages/taskManager/utils';

  const $q = useQuasar();
  const $router = useRouter();
  const $lget = inject('$lget');
  const $lset = inject('$lset');
  const $lorderBy = inject('$lorderBy');
  const fab = ref(false);

  const props = defineProps({
    modelValue: {
      type: Object,
      required: true,
    },
  });

  const $emit = defineEmits({
    'update:modelValue': (item) => {
      if (item) {
        return true;
      } else {
        console.warn('Invalid submit event payload!');
        return false;
      }
    },
  });

  const cssVarStore = useCssVars();
  const {$isHexDark} = cssVarStore;

  let itemToEdit = reactive({});
  let openListDialog = ref(false);
  let layout = ref('Card view');
  let toHide = ref([]);
  let tempToHide = ref([]);
  let lists = ref([]);
  const popups = ref([]);
  const popupShow = ref(false);

  onBeforeUpdate(() => {
    popups.value = [];
  });

  watch(() => props.modelValue,
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
            toHide.value = $lorderBy(newVal, ['order', 'createdAt'], ['asc', 'asc']);
            const hiddenListId = newVal.map(item => $lget(item, '_id'));
            const lists = [...lists.filter(list => !!list._id)].map(function (item) {
              item.hidden = hiddenListId.includes(item._id);
              return item;
            });

            $emit('update:modelValue', {...props.modelValue,lists});
          }
          tempToHide.value = Array.from(newVal);
        },
        {immediate: true, deep: true},
  );


  const titleCssVars = computed(() => ({
    '--title-bg-color': $q.dark.mode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.16)',
    '--dark-bg-color': $q.dark.mode ? 'var(--q-color-dark)' : '#fff',
  }));

  function editName(itm) {

    const listsToEdit = [...lists.value.filter(list => !!$lget(list,'_id'))].map(function (list) {
      if ($lget(list,'_id') === itm._id) {
        list = itm;
      }
      return list;
    });

    $emit('update:modelValue', {...props.modelValue,lists:listsToEdit});
  }

  function goBack() {
    $router.go(-1);
  }

  function getChildPayload(index) {
    if(lists.value.length){
      return lists.value.at(index);
    }
  }

  function textColor(item) {
    return $isHexDark($lget(item, 'color.hexa', 'grey')) ? 'white' : 'black';
  }

  function handlePopup(listId) {
    if (!popupShow.value) popups.value[listId].hide();
  }

  function handlePopupShow(listId) {
    popupShow.value = true;
    popups.value[listId].show();
  }

  function handleOpenListDialog(listToEdit) {
    openListDialog.value = true;
    itemToEdit.value = listToEdit;
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

  async function hideList(list) {
    toHide.value.push(list);
    let elements = document.getElementsByClassName(`nestable-item-${list._id}`)[0];
    elements.classList.add('hiding-anim');
    setTimeout(() => {
      elements.style.display = 'none';
      elements.classList.remove('hiding-anim');
    }, 500);

  }

  function placeListOnItem(list, itemLists) {
    const order = $lget(list, ['order']);

    if (order) {
      const index = order - 1;
      itemLists.forEach((lst) => {
        if (lst.order >= order) {
          lst.order = lst.order + 1;
        }
      });
      itemLists.splice(index, 0, list);
    } else {
      let newOrder = $lget(itemLists,'length',1);
      if (itemLists.length) {
        newOrder = getMaxOrder(itemLists) + 1;
      }
      $lset(list, 'order', newOrder);
      itemLists.push(list);
    }
    return itemLists;
  }

  async function onDrop(dragResult) {
    const {removedIndex, addedIndex, payload} = dragResult;
    console.log({dragResult});
    if (removedIndex !== null && addedIndex!== null) {
      const removedOrder = removedIndex+1;
      const addedOrder = addedIndex+1;
      const itemLists =  moveItem(removedOrder,addedOrder,payload,lists.value);
      console.log({itemLists});
      $emit('update:modelValue', {...props.modelValue,lists: itemLists});
    }
  }

  function handleSaveList(list) {

    if (list._id) {
      let itemLists = [...lists.value.filter(lst => !!$lget(lst,'_id'))].map(lst => {
        if ($lget(lst,'_id') === list._id) {
          lst = list;
        }
        return lst;
      });
      const removedOrder = itemToEdit.value.order;
      const addedOrder = list.order;
      itemLists = moveItem(removedOrder,addedOrder,list,itemLists);
      $emit('update:modelValue', {...props.modelValue,lists: itemLists});
    } else {
      const itemLists = placeListOnItem(list, [...lists.value.filter(lst => !!$lget(lst,'_id'))]);
      console.log({itemLists});
      $emit('update:modelValue', {...props.modelValue,lists: itemLists});
    }
  }

  function  handleDeleteList(list) {
    $q.dialog({
      title: 'Confirm',
      message: `Are you sure you want to remove "${list.name}"?`,
      ok: {
        push: true,
        color: 'negative',
      },
      cancel: true,
      persistent: true,
    }).onOk(() => {

      const itemLists = [...lists.value.filter(lst => $lget(lst,'_id'))].filter(itm => $lget(itm,'_id') !== list._id).map(itm => {
        if ($lget(itm,'order') > list.order) {
          itm.order -= 1;
        }
        return itm;
      });
      $emit('update:modelValue', {...props.modelValue,lists:itemLists});
    });
  }

</script>

<style scoped lang="scss" src="./lists.scss">

</style>
