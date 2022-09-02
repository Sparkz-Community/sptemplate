<template>
  <div class="q-pa-sm" :style="{'min-height': '100vh', ...titleCssVars}">
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

      <container
        id="ListsList"
        group-name="cols"
        tag="div"
        orientation="horizontal"
        :get-child-payload="getChildPayload"
        style="border-spacing: 1rem; "
        @drop="onDrop"
        class="h-full flex overflow-x-auto gap-8  p-8"

      >
        <template v-for="column in scene.children" :key="column.id">
          <q-card v-if="column.id===0"
                  :class="['list-card cursor-pointer column align-center justify-center', $q.dark.mode ? 'bg-grey-9' : 'bg-grey-5']"
                  style="max-height: 100px"
                  @click.stop="handleOpenListDialog(column.data)"
                  @touchstart.stop="handleOpenListDialog(column.data)">
            <q-card-section class="flex flex-center" style="height: 100%; width: 100%">
              <q-icon name="add"/>
              New List
            </q-card-section>
          </q-card>
          <draggable v-else>
            <q-card
              :class="['list-card', 'shadow-8', $q.dark.mode ? 'bg-grey-9' : 'bg-grey-3',`nestable-item-${column.id}`]"
              style="position: relative;">
              <q-toolbar
                :style="`background-color: ${$lget(column.data, 'color.hexa', 'grey')}; color: ${textColor(column.data)}; border-bottom-right-radius: 0; border-bottom-left-radius: 0;`">
                <q-toolbar-title @dblclick="handlePopupShow(column.data)">
                  {{ $lget(column, ['data', 'name']) }}
                  <q-popup-edit v-if="column.id!==modelValue._id"
                                :ref="el => { popups[column.id] = el }"
                                v-model="column.data.name"
                                :validate="val => $lget(val,'length') > 0"
                                @save="handleSaveList({...column.data, name: $event})"
                                @before-show="handlePopup(column.id)"
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

                <action-fab v-if="column.id!==modelValue._id" :item="column.data" @hide="hideList(column.data)"
                            @edit="handleOpenListDialog(column.data)"
                            @delete="handleDeleteList(column.data)"></action-fab>
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
                                  @click.stop="hideList(column.data)"
                                  @touchstart.stop="hideList(column.data)"/>
                  </q-fab>
                </div>

              </q-toolbar>
              <q-card-section style="max-height: 78vh; min-height:5rem" class="scroll q-pa-sm">

                <container
                  class="flex-grow overflow-y-auto overflow-x-hidden"
                  orientation="vertical"
                  group-name="col-items"
                  :shouldAcceptDrop="(e, payload) =>  (e.groupName === 'col-items' && !payload.loading)"
                  :get-child-payload="getCardPayload(column.id)"
                  :drop-placeholder="{ className:`q-mx-sm q-my-xs rounded-borders drop-placeholder-style`,animationDuration: '200', showOnTop: true }"

                  drag-class="bg-primary dark:bg-primary text-white drag-style"
                  drop-class="drop-style"
                  @drop="(e) => onCardDrop(column.data, e)"
                >
                  <draggable v-for="child in column.children" :key="child.id">
                    <card
                      :card="child.data"
                      :list="column.data"
                      :board="modelValue"
                      @delete-card="$emit('delete-card',$event)"
                      @save-card="$emit('save-card',$event)"
                      @restore-from-recycle="$emit('restore-from-recycle',$event)"
                    />
                  </draggable>
                </container>

              </q-card-section>
              <add-card-form-container
                v-if="modelValue._id !== column.id"
                label="Card"
                :list="column.data"
                style="position: sticky; bottom: 0;"
                v-bind="$attrs"
              >
                <template v-for="(_, name) in $slots" #[name]="slotData">
                  <slot :name="name" :slotData="slotData"/>
                </template>
              </add-card-form-container>
            </q-card>
          </draggable>
        </template>
      </container>
      <!--      <pre> {{ scene.children.map(i => i.data) }}</pre>-->
      <!--      <pre>{{ $lget(modelValue, 'lists', []).map(i => ({name: i.name, cards: $lget(i, '_fastjoin.cards')})) }}</pre>-->
    </div>

    <list-form-dialog
      :initial-value="itemToEdit"
      v-model="openListDialog"
      @save-list="handleSaveList"
      @delete-list="handleDeleteList"
      @close="openListDialog=false"
      :max-order="maxOrder"
    />
    <!--    <card-form-dialog
          v-model="openEditDialog"
          :card="cardToEdit.card"
          :list="cardToEdit.list"
          @save-card="$emit('save-card',{card:$event,close:close})"
          @delete-card="$emit('delete-card',{card:$event,close:close})"
        />-->
  </div>
</template>

<script setup>
  import ListFormDialog from 'pages/taskManager/components/ListFormDialog';
  import {computed, defineEmits, defineProps, inject, onBeforeUpdate, ref, watch} from 'vue';
  import {useCssVars} from '@sparkz-community/common-client-lib';
  // import {storeToRefs} from 'pinia/dist/pinia';
  import {useRouter} from 'vue-router/dist/vue-router';
  import {useQuasar} from 'quasar';
  import {Container, Draggable} from 'vue3-smooth-dnd';
  import ActionFab from 'pages/taskManager/components/ActionFab';
  import {getMaxOrder, moveItem} from 'pages/taskManager/utils';
  import AddCardFormContainer from 'pages/taskManager/components/AddCardFormContainer';
  import Card from 'pages/taskManager/components/Card';


  const $q = useQuasar();
  const $router = useRouter();
  const $lget = inject('$lget');
  // const $lset = inject('$lset');
  const $lorderBy = inject('$lorderBy');


  const props = defineProps({
    modelValue: {
      type: Object,
      required: true,
    },
    cardsPath: {
      type: String,
      required: true,
    },
  });

  const $emit = defineEmits({
    'update:modelValue': (item) => {
      if (item) {
        return true;
      } else {
        console.warn('Invalid update event payload!');
        return false;
      }
    },
    'add-list': (item) => {
      if (item) {
        return true;
      } else {
        console.warn('Invalid add-list payload!');
        return false;
      }
    },
    'get-card-payload': (item) => {
      if (item) {
        return true;
      } else {
        console.warn('Invalid get-card-payload event payload!');
        return false;
      }
    },
    'card-dropped': (item) => {
      if (item) {
        return true;
      } else {
        console.warn('Invalid on-card-drop event payload!');
        return false;
      }
    },
    'save-card': (item) => {
      if (item) {
        return true;
      } else {
        console.warn('Invalid on-card-drop event payload!');
        return false;
      }
    },
    'delete-card': (item) => {
      if (item) {
        return true;
      } else {
        console.warn('Invalid on-card-drop event payload!');
        return false;
      }
    },
    'restore-from-recycle': (item) => {
      if (item) {
        return true;
      } else {
        console.warn('Invalid on-card-drop event payload!');
        return false;
      }
    },

  });

  const cssVarStore = useCssVars();
  const {$isHexDark} = cssVarStore;

  let itemToEdit = ref({});
  let openListDialog = ref(false);
  let layout = ref('Card view');
  let toHide = ref([]);
  let tempToHide = ref([]);
  let lists = ref([]);
  const popups = ref([]);
  const columns = ref([]);
  const popupShow = ref(false);
  const fab = ref(false);
  const popupName = ref('');

  onBeforeUpdate(() => {
    popups.value = [];
    columns.value = [];
  });

  const cleanList = computed(() => lists.value.filter(lst => $lget(lst, '_id') !== 0));

  const maxOrder = computed(() => getMaxOrder(cleanList.value));

  const scene = computed(() => {
    return {
      type: 'container',
      props: {
        orientation: 'horizontal',
      },
      children: lists.value.map(list => ({
        id: $lget(list, '_id'),
        type: 'container',
        data: list,
        props: {
          orientation: 'vertical',
        },
        children:
          $lorderBy($lget(list, props.cardsPath, []), [
            card => {
              switch ($lget(card, 'priority')) {
                case 'critical': {
                  return 0;
                }
                case 'high': {
                  return 1;
                }
                case 'medium': {
                  return 2;
                }
                case 'low': {
                  return 4;
                }
                default: {
                  return 3;
                }
              }
            },
            'order',
            'createdAt',
          ], ['asc', 'asc', 'asc'])
            .map((card) => ({
              type: 'draggable',
              id: card._id,
              oldList: list,
              loading: false,
              data: card,
            })),
      })),
    };

  });

  watch(() => props.modelValue,
        (newVal) => {
          lists.value = $lorderBy($lget(newVal, 'lists', []).concat({_id: 0}), [
            'order',
            'createdAt',
          ], ['asc', 'asc', 'asc']);
        },
        {immediate: true, deep: true},
  );

  watch(() => lists.value,
        async (newVal, oldVal) => {
          if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {

            const hiddenListId = toHide.value.map(item => $lget(item, '_id'));
            for (const list of newVal.filter(lst => $lget(lst, '_id'))) {
              if (list && $lget(list, 'hidden') && !hiddenListId.includes($lget(list, '_id'))) {
                toHide.value.push(list);
                setTimeout(async () => {
                  let elements = document.getElementsByClassName(`nestable-item-${list._id}`)[0];
                  elements.classList.add('hiding-anim');
                  elements.style.display = 'none';
                  elements.classList.remove('hiding-anim');
                }, 0.1);
              }
            }
          }

        },
        {immediate: true, deep: true},
  );


  watch(() => toHide.value,
        (newVal) => {
          if (JSON.stringify(newVal) !== JSON.stringify(tempToHide.value)) {
            toHide.value = $lorderBy(newVal, ['order', 'createdAt'], ['asc', 'asc']);
            const hiddenListId = newVal.map(item => $lget(item, '_id'));
            const listsToEdit = cleanList.value.map(function (item) {
              item.hidden = hiddenListId.includes($lget(item, '_id'));
              return item;
            });
            // const list = newVal.find(lst => !tempToHide.value.map(itm => $lget(itm, '_id')).includes($lget(lst, '_id')));
            // if (!hiddenListId.includes($lget(list, '_id'))) {
            $emit('update:modelValue', {lists: listsToEdit});
            // }

          }
          tempToHide.value = Array.from(newVal);
        },
        {immediate: true, deep: true},
  );

  watch(() => itemToEdit.value, (newVal) => {
    popupName.value = $lget(newVal, 'name', '');
  }, {deep: true, immediate: true});


  const titleCssVars = computed(() => ({
    '--title-bg-color': $q.dark.mode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.16)',
    '--dark-bg-color': $q.dark.mode ? 'var(--q-color-dark)' : '#fff',
  }));


  function goBack() {
    $router.go(-1);
  }

  function getChildPayload(index) {
    if (cleanList.value.length) {
      return cleanList.value.at(index);
    }
  }

  function textColor(item) {
    return $isHexDark($lget(item, 'color.hexa', 'grey')) ? 'white' : 'black';
  }

  // function listColor(list) {
  //   return $lget(column.data, 'color.hexa', 'grey')
  // }

  function handlePopup(listId) {
    if (!popupShow.value) popups.value[listId].hide();
  }

  function handlePopupShow(list) {
    itemToEdit.value = list;
    popupShow.value = true;
    popups.value[list._id].show();
  }

  function handleOpenListDialog(list) {
    openListDialog.value = true;
    if ($lget(list, '_id')) {
      itemToEdit.value = list;
    } else {
      itemToEdit.value = {order: maxOrder.value};
    }
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

  async function onDrop(dragResult) {
    const {removedIndex, addedIndex, payload} = dragResult;
    if (removedIndex !== null && addedIndex !== null) {
      const removedOrder = removedIndex + 1;
      const addedOrder = (addedIndex + 1) < maxOrder.value ? (addedIndex + 1) : maxOrder.value - 1;
      moveItem(removedOrder, addedOrder, payload, cleanList.value);
      $emit('update:modelValue', {lists: $lget(props.modelValue, 'lists')});
    }
  }

  function handleSaveList(list) {

    if (list._id) {
      let itemLists = cleanList.value.map(lst => {
        if ($lget(lst, '_id') === list._id) {
          lst = list;
        }
        return lst;
      });
      const removedOrder = itemToEdit.value.order;
      const addedOrder = list.order;
      itemLists = moveItem(removedOrder, addedOrder, list, itemLists);

      $emit('update:modelValue', {...props.modelValue, lists: itemLists});
      openListDialog.value = false;
    } else {
      $emit('add-list', list);
      openListDialog.value = false;
    }
  }

  function handleDeleteList(list) {
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
      openListDialog.value = false;
      const itemLists = cleanList.value.filter(itm => $lget(itm, '_id') !== list._id).map(itm => {
        if ($lget(itm, 'order') > list.order) {
          itm.order -= 1;
        }
        return itm;
      });
      $emit('update:modelValue', {...props.modelValue, lists: itemLists});
    });
  }

  function getCardPayload(columnId) {
    return index => {
      return scene.value.children.filter(p => p.id === columnId)[0].children[index];
    };
  }

  function onCardDrop(list, dropResult) {
    if ($lget(dropResult, 'removedIndex') !== null || $lget(dropResult, 'addedIndex') !== null) {
      const {addedIndex, payload: {data, oldList}} = dropResult;
      const oldCard = $lget(oldList, props.cardsPath, []).find(crd => crd._id === data._id);
      if (oldCard) {
        const removedOrder = oldCard.order;
        const addedOrder = addedIndex + 1;
        $emit('card-dropped', {removedOrder, addedOrder, card: data, newList: list, oldList});
      }
    }
  }

  // function close (){
  //   openEditDialog.value = false;
  // }


</script>

<style scoped lang="scss" src="./lists.scss">


</style>
