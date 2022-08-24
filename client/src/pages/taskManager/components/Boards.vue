<template>
  <div class="q-pa-md">
    <Container @drop="onDrop" orientation="horizontal" behaviour="contain" :get-child-payload="getChildPayload"
               style="max-width: 90vw; position: relative">
      <template v-for="item in sortedItems" :key="$lget(item,'_id')">
        <q-card
          v-if="!$lget(item,'_id')"
          :class="['board-card cursor-pointer', $q.dark.mode ? 'bg-grey-9' : 'bg-grey-5']"
          @click.stop="handelOpenItemDialog(item)"
          @touchstart.stop="handelOpenItemDialog(item)">
          <q-card-section class="flex flex-center" style="height: 100%; width: 100%">
            <q-icon name="add"/>
            New Board
          </q-card-section>

          <q-dialog v-model="openItemDialog" position="right">
            <q-layout view="Lhh lpR fff" container :class="$q.dark.mode ? 'bg-dark' : 'bg-white'" style="width: 350px">
              <q-header class="bg-primary">
                <q-toolbar>
                  <q-toolbar-title>{{ formData['_id'] ? 'Edit' : 'New' }} Board</q-toolbar-title>
                  <q-btn flat v-close-popup round dense icon="close"/>
                </q-toolbar>
              </q-header>

              <q-page-container>
                <q-page class="q-pa-sm">
                  <form-generator v-model="formData" :fields="formFields"></form-generator>

                </q-page>
              </q-page-container>

              <q-footer :class="$q.dark.mode ? 'bg-dark' : 'bg-white'" bordered>
                <q-toolbar>
                  <q-btn color="primary" @click="handleSaveItem">Save</q-btn>
                  <q-space v-if="formData['_id']"></q-space>
                  <q-btn v-if="formData['_id']" color="negative" @click="handleDeleteItem(formData)">Delete</q-btn>
                </q-toolbar>
              </q-footer>
            </q-layout>
          </q-dialog>
        </q-card>
        <Draggable v-else :tag="{value: 'tr', props: {class: 'cursor-pointer'}}">
          <q-card class="board-card q-mx-sm" @click="$emit('go-to-item',item)">

            <q-img
              :src="$lget(item, ['banner', 'raw', 'file'], '')"
              :style="`background-color: ${$lget(item, 'color.hexa', 'teal')}; height: 100%; width: 100%;`"
              native-context-menu
            >
              <div class="text-subtitle2 absolute-top text-center">
                {{ item.name }}
              </div>
            </q-img>
            <q-btn round style="position: absolute; top: 15px; left: 5px; z-index:10;">
              <q-avatar>

                <img
                  :src="$lget(item,['_fastjoin','creator','avatar','raw','file'],'https://www.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png')"
                  alt=""/>
              </q-avatar>
            </q-btn>
            <q-btn @click.stop="handelOpenItemDialog(item)"
                   @touchstart.stop="handelOpenItemDialog(item)"
                   round
                   color="secondary"
                   icon="fas fa-pen"
                   style="position: absolute; bottom: 10px; right: 10px;"/>
          </q-card>

        </Draggable>
      </template>
    </Container>
  </div>
</template>

<script setup>
  import {useFindPaginate} from '@sparkz-community/common-client-lib';
  import {computed, inject, ref, watch} from 'vue';
  // import {models} from 'feathers-pinia';
  import {Container, Draggable} from 'vue3-smooth-dnd';
  import {QSpinnerFacebook, useQuasar} from 'quasar';
  import useColorStore from 'stores/services/colors';
  import {storeToRefs} from 'pinia';

  const $lget = inject('$lget');
  const $q = useQuasar();

  const props = defineProps({
    infinite: Boolean,
    qid: String,
    model: {
      type: Object,
      required: true,
    },
    params: {
      type: Object, default() {
        return {};
      },
    },
    query: {
      type: Object, default() {
        return {};
      },
    },
  });

  const $emit = defineEmits({
    // Validate submit event
    goToItem: (item) => {
      if (item) {
        return true;
      } else {
        console.warn('Invalid submit event payload!');
        return false;
      }
    }
  });

  let openItemDialog = ref(false);
  let formData = ref({});
  const sortedItems = ref([]);

  const colorsStore = useColorStore();

  const {softAutomn} = storeToRefs(colorsStore);

  const query = computed(() => ({
    ...props.query,
  }));
  const params = computed(() => ({
    debounce: 2000,
    ...props.params,
  }));

  const {items} = useFindPaginate({
    model: props.model,
    qid: $lget(props, 'qid', 'items'),
    infinite: $lget(props, 'infinite', true),
    query,
    params,
  });


  const formFields = computed(() => ([
    {
      fieldType: 'TextInput',
      path: 'name',
      attrs: {
        label: 'Name',
        filled: true,
        clearable: true,
        'clear-icon': 'close',
        required: true,
        dense: true,
      },
      'div-attrs': {
        class: 'col-12',
      },
    },
    {
      fieldType: 'NumberInput',
      path: 'order',
      attrs: {
        min: 1,
        center: true,
        dense: true,
        max: items.value.length + 1,
      },
      'div-attrs': {
        class: 'col-12',
      },
    },
    {
      fieldType: 'SelectInput',
      path: 'category',
      attrs: {
        label: 'Category',
        'hide-selected': false,
        'fill-input': false,
        multiple: false,
        dense: true,
        'dropdown-icon': 'fas fa-chevron-down',
        // 'emit-value': true,
        // 'map-options': true,
        // 'option-value': '_id',
        // 'option-label': 'name',
        // 'use-chips': true,
        'bottom-slots': true,
        options: [
          'Task',
          'Question',
          'Research',
          'Other',
          'Lead',
          'Business',
          'Design',
          'Education',
          'Project Management',
          'Engineering',
        ],
        required: true,
      },
      'div-attrs': {
        class: 'col-12',
      },
    },
    {
      fieldType: 'SelectInput',
      path: 'visibility',
      attrs: {
        label: 'Visibility',
        'hide-selected': false,
        'fill-input': false,
        multiple: false,
        dense: true,
        'dropdown-icon': 'fas fa-chevron-down',
        // 'emit-value': true,
        // 'map-options': true,
        // 'option-value': '_id',
        // 'option-label': 'name',
        // 'use-chips': true,
        'bottom-slots': true,
        options: ['public', 'private', 'domain', 'environment'],
        required: true,
      },
      'div-attrs': {
        class: 'col-12',
      },
    },
    {
      fieldType: 'EditorInput',
      path: 'description',
      label: 'Description',
      attrs: {
        toolbar: [
          [
            {
              icon: $q.iconSet.editor.formatting,
              options: [
                'bold',
                'italic',
                'strike',
                'underline',
              ],
            },
          ],
          [
            {
              icon: $q.iconSet.editor.heading,
              fixedLabel: true,
              list: 'no-icons',
              options: [
                'h4',
                'h5',
                'h6',
                'p',
                'code',
                'unordered',
                'ordered',
              ],
            },
          ],
          [
            {
              icon: $q.iconSet.editor.align,
              fixedLabel: true,
              options: ['left', 'center', 'right', 'justify'],
            },
          ],
          [
            {
              icon: $q.iconSet.uploader.upload,
              options: ['insert_img', 'insert_video_url'],
            },
          ],
          [
            {
              icon: 'handyman',
              fixedLabel: true,
              options: ['undo', 'redo', 'removeFormat', 'hr', 'link', 'viewsource'],
            },
          ],
          ['fullscreen'],
        ],
      },
      dense: true,
    },
    //   // TODO: softAutomn is currently coming from a pinia state called "colors", do we want to get that from a feathers service some day?
    {
      fieldType: 'ColorPicker',
      path: 'color',
      label: 'Color',
      attrs: {
        palette: softAutomn,
        dense: true,
      },
    },
    // {
    //   fieldType: 'ImageSelect',
    //   path: 'banner',
    //   attrs: {
    //     stylePanelLayout: null,
    //     imageCropAspectRatio: null,
    //   },
    //   'label-attrs': {
    //     'v-text': 'Banner Image',
    //     style: 'font-size: 20px; margin-top: -5px',
    //   },
    //   'div-attrs': {
    //     class: 'col-12 q-my-lg',
    //   },
    // },
  ]));

  watch(items, (newVal) => {
    console.log('kk: ',{newVal});
    const new_btn_index = newVal.findIndex(item => !$lget(item, '_id'));
    if (new_btn_index === -1) {
      sortedItems.value = [{_id: 0}].concat(...newVal).sort((a, b) => a.order - b.order);
    }
  }, {deep: true, immediate: true});

  watch(sortedItems, (newVal) => {
    console.log('dd: ',{newVal});
    const new_btn_index = newVal.findIndex(item => !$lget(item, '_id'));
    if (new_btn_index === -1) {
      sortedItems.value = [{_id: 0}].concat(newVal);
    }
  }, {deep: true, immediate: true});


  function handelOpenItemDialog(value) {
    formData.value = $lget(value, '_id') ? value : new props.model({order: ($lget(items, ['value', 'length'], 0) + 1)});
    openItemDialog.value = true;
  }

  function getChildPayload(index) {
    if (index > 0) {
      return items.value.find(item => item.order === index);
    }
    return items.value.at(index);
  }

  function refreshItems() {
    const {data} = props.model.findInStore();
    console.log(data);
    sortedItems.value = [{_id: 0},...data];
  }

  async function onDrop(dragResult) {
    const {removedIndex, addedIndex, payload} = dragResult;
    if (removedIndex !== null && !!addedIndex) {

      if (removedIndex > addedIndex) {
        $q.loading.show({
          spinner: QSpinnerFacebook,
          spinnerColor: $lget(payload, 'color.hexa', 'teal'),
          spinnerSize: 140,
          message: `moving ${payload.name}.`,
        });
        await Promise.all([
          payload.save({
            ...props.params,
            data: {
              order: addedIndex,
            },
          }),
          items.value.filter(item => $lget(item, '_id') !== $lget(payload, '_id'))
            .filter(item => (item.order < removedIndex && item.order >= addedIndex))
            .map(item => item.save({
              ...props.params,
              data: {
                order: (item.order + 1),
              },

            })),
        ]);
        $q.loading.hide();
        openItemDialog.value = false;
      }

      if (removedIndex < addedIndex) {
        $q.loading.show({
          spinner: QSpinnerFacebook,
          spinnerColor: $lget(payload, 'color.hexa', 'teal'),
          spinnerSize: 140,
          message: `moving ${payload.name}.`,
        });
        await Promise.all([
          payload.save({
            ...props.params,
            data: {
              order: addedIndex,
            },
          }),
          items.value.filter(item => $lget(item, '_id') !== $lget(payload, '_id'))
            .filter(item => (item.order > removedIndex && item.order <= addedIndex))
            .map(item => item.save({
              ...props.params,
              data: {
                order: (item.order - 1),
              },
            })),
        ]);
        $q.loading.hide();
        openItemDialog.value = false;
      }

    }
  }


  async function handleSaveItem() {
    try {
      const oldItem = items.value.find(item => $lget(item, '_id') === $lget(formData, ['value', '_id']));
      const toSave = new props.model(formData.value);
      if (oldItem) {
        // do a patch
        if (oldItem.order > toSave.order) {
          console.log('moved left');
          $q.loading.show({
            spinner: QSpinnerFacebook,
            spinnerColor: $lget(toSave, 'color.hexa', 'teal'),
            spinnerSize: 140,
            message: `updating ${toSave.name}.`,
          });
          await Promise.all([
            toSave.save({
              ...props.params,
            }),
            items.value.filter(item => $lget(item, '_id') !== $lget(toSave, '_id'))
              .filter(item => (item.order < oldItem.order && item.order >= toSave.order))
              .map(item => item.save({
                ...props.params,
                data: {
                  order: (item.order + 1),
                },

              })),
          ]);
          refreshItems();
          $q.loading.hide();
          openItemDialog.value = false;
        } else if (oldItem.order < toSave.order) {
          console.log('moved right');
          $q.loading.show({
            spinner: QSpinnerFacebook,
            spinnerColor: $lget(toSave, 'color.hexa', 'teal'),
            spinnerSize: 140,
            message: `updating ${toSave.name}.`,
          });
          await Promise.all([
            toSave.save({
              ...props.params,
            }),
            items.value.filter(item => $lget(item, '_id') !== $lget(toSave, '_id'))
              .filter(item => (item.order > oldItem.order && item.order <= toSave.order))
              .map(item => item.save({
                ...props.params,
                data: {
                  order: (item.order - 1),
                },

              })),
          ]);
          refreshItems();
          $q.loading.hide();
          openItemDialog.value = false;
        } else {
          $q.loading.show({
            spinner: QSpinnerFacebook,
            spinnerColor: $lget(toSave, 'color.hexa', 'teal'),
            spinnerSize: 140,
            message: `saving ${toSave.name}.`,
          });
          await toSave.save({
            ...props.params,
          });
          refreshItems();
          $q.loading.hide();
          openItemDialog.value = false;
        }

      } else {
        if ($lget(formData, ['value', 'order']) > items.value.length) {
          $q.loading.show({
            spinner: QSpinnerFacebook,
            spinnerColor: $lget(toSave, 'color.hexa', 'teal'),
            spinnerSize: 140,
            message: `adding ${toSave.name}.`,
          });
          await toSave.save({...props.params});
          refreshItems();
          $q.loading.hide();
          openItemDialog.value = false;
        } else {
          $q.loading.show({
            spinner: QSpinnerFacebook,
            spinnerColor: $lget(toSave, 'color.hexa', 'teal'),
            spinnerSize: 140,
            message: `adding ${toSave.name}.`,
          });
          await Promise.all([
            toSave.save({...props.params}),
            items.value.filter(item => item.order >= $lget(toSave, 'order'))
              .map(item => item.save({
                data: {
                  order: item.order + 1,
                },
                ...props.params,
              })),
          ]);
          refreshItems();
          $q.loading.hide();
          openItemDialog.value = false;
        }
      }
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: e.message,
        timeout: 30000,
        actions: [
          {
            icon: 'close', color: 'white', handler: () => {
              /* ... */
            },
          },
        ],
      });
    }
  }

  async function handleDeleteItem(item) {
    $q.dialog({
      title: 'Confirm',
      message: `Are you sure you want to remove "${item.name} ${name.replace('-', ' ')}"?`,
      ok: {
        push: true,
        color: 'negative',
      },
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      try {
        const toDelete = new props.model(item);
        $q.loading.show({
          spinner: QSpinnerFacebook,
          spinnerColor: $lget(toDelete, 'color.hexa', 'teal'),
          spinnerSize: 140,
          message: `deleting ${toDelete.name}.`,
        });
        await Promise.all([
          toDelete.remove(props.params),
          items.value.filter(item => $lget(item, '_id') !== $lget(toDelete, '_id'))
            .filter(obj => (obj.order > toDelete.order))
            .map(obj => obj.save({data: {order: (obj.order - 1)}})),
        ]);
        refreshItems();
        $q.loading.hide();
        openItemDialog.value = false;
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.message,
          timeout: 30000,
          actions: [
            {
              icon: 'close', color: 'white', handler: () => {
                /* ... */
              },
            },
          ],
        });
      }

    });
  }

</script>

<style scoped>

  .board-card {

    min-width: 250px;
    height: 250px;
  }

  .smooth-dnd-container {
    .grid {
      display: grid;
      padding: 0 55px 0 20px;
      grid-template-columns: repeat(auto-fit, 250px);
    //justify-content: center; //grid-template-rows: repeat(auto-fit, 200px); grid-column-gap: 15px;

    }
  }

</style>
