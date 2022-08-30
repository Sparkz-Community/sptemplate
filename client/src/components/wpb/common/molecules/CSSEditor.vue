<template>
  <div class="vs-code">
    <div class="tabs-wrapper">
      <div style="display: flex; align-items: center;">
        <!--        <draggable class="tabs-wrapper" v-model="stylesheets" @end="dragDrop">-->
        <div style="height: 23px;" @click="selectTab(tab)" @dblclick.stop="startEditing(idx, tab)"
             :class="tab._id === activeTab._id ? 'tab' : 'tab tab-inactive'" v-for="(tab, idx) of stylesheets"
             :key="idx">
          <div>{{ tab.name }}</div>
          <span @click.stop="openRemoveDio(tab)" class="close">x</span>
        </div>
        <!--        </draggable>-->
        <div @click="addTabDio = true"
             style="margin-left: 11px; font-size: 1.35em; color: white; cursor: pointer;">+
        </div>
      </div>
      <div style="display: flex;">
        <q-icon @click="saveCss()" name="save" class="maximize-editor">
          <q-tooltip>
            Save css
          </q-tooltip>
        </q-icon>
        <q-icon @click="maximizeScreen" v-if="height !== '100vh'" name="open_in_full" class="maximize-editor">
          <q-tooltip>Maximize Editor</q-tooltip>
        </q-icon>
        <q-icon @click="$emit('changeHeight', '45vh')" v-else name="height" class="maximize-editor">
          <q-tooltip>Default height</q-tooltip>
        </q-icon>
        <q-icon @click="$emit('changeHeight', '33px')" name="minimize"
                class="minimize-editor">
          <q-tooltip>
            Minimize Editor
          </q-tooltip>
        </q-icon>
        <q-icon name="close" class="close-editor" @click="closeEditor">
          <q-tooltip>
            Close Editor
          </q-tooltip>
        </q-icon>
      </div>
    </div>

    <div id="vs" :style="{opacity: stylesheets.length > 0 ? '1' : '0', height: '100vh', overflow: 'hidden'}"></div>

    <div class="no-stylesheets"
         :style="{opacity: stylesheets.length > 0 ? '0' : '1', display: stylesheets.length > 0 ? 'none' : 'block'}">
      No stylesheets created
    </div>
    <!--    <div class="no-tab" v-else style="height: 36vh; background-color: black;">-->
    <!--      No file selected-->
    <!--    </div>-->

    <!--    <div v-if="styleSheets.length === 0" style="height: 800px; width: 100vw; background-color: #1E1E1E; display: flex; align-items: center;justify-content: center;">-->
    <!--    <div style="color: white; font-size: 2.5em; font-weight: 250;">Create a new stylesheet to edit styles</div> -->
    <!--    </div>-->
    <q-dialog v-model="confirmClose">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="code" color="primary" text-color="white"/>
          <span class="q-ml-sm" style="font-size: 1.2em;">You might have unsaved changes, confirm close?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="red" v-close-popup/>
          <q-btn flat label="Close and save" color="primary" v-close-popup @click="closeAndSave"/>
          <q-btn flat label="Close without saving" color="primary" v-close-popup @click="$emit('closeEditor')"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="addTabDio">
      <q-card>
        <q-card-section>
          <span class="q-ml-sm" style="font-size: 1.2em;">Enter the name for your stylesheet</span>
          <q-input v-model="editorName" label="Enter name"/>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn @click="editorName = ''" flat label="Cancel" color="red" v-close-popup/>
          <q-btn @click="createTab" flat label="Create stylesheet" color="primary" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="editTabDio">
      <q-card>
        <q-card-section>
          <span class="q-ml-sm" style="font-size: 1.2em;">Edit stylesheet name</span>
          <q-input v-model="editingTab.name" label="Edit name"/>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup color="red"/>
          <q-btn flat label="Save name" @click="editNameSave" v-close-popup color="secondary"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="removeStylesheetDio">
      <q-card>
        <q-card-section>
          <span class="q-ml-sm"
                style="font-size: 1.2em;">Are you sure you wish to delete this {{ stylesheetToDelete.name }}?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup color="secondary"/>
          <q-btn flat label="Confirm delete" @click="removeTab(stylesheetToDelete)" v-close-popup color="red"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
  import {computed, ref, toRef, watch} from 'vue';
  import {useQuasar} from 'quasar';

  import loader from '@monaco-editor/loader';
  // import draggable from 'vuedraggable';

  import useWpbStylesheets from 'stores/services/wpb-stylesheets';

  export default {
    name: 'CssEditor',
    components: {
      // draggable,
    },
    props: {
      height: {
        type: String,
        required: false,
      },
      projectId: {
        type: String,
        required: true,
      },
      pageId: {
        type: String,
        required: true,
      },
    },
    emits: ['changeHeight', 'closeEditor'],
    setup(props, {emit}) {
      const $q = useQuasar();

      const projectId = toRef(props, 'projectId');
      const pageId = toRef(props, 'pageId');

      const wpbStylesheetsStore = useWpbStylesheets();

      let editor = null;
      const cssString = ref('');
      const activeTab = ref({});
      const editingTab = ref({});
      const stylesheetToDelete = ref({});
      const removeStylesheetDio = ref(false);
      const confirmClose = ref(false);
      const addTabDio = ref(false);
      const editTabDio = ref(false);
      const editorName = ref('');
      const editingTabName = ref('');

      watch(projectId, (newVal) => {
        if (newVal) {
          wpbStylesheetsStore.find({query: {projects: projectId.value}}).then(res => {
            // console.log('loadStylesheets > res', res);
            if (res.data.length > 0) {
              activeTab.value = res.data[0];
              cssString.value = res.data[0].cssString;
            }
            loader.init().then(monaco => {
              editor = monaco.editor.create(document.getElementById('vs'), {
                value: cssString.value,
                language: 'scss',
                theme: 'vs-dark',
                fontSize: 13,
              });
              editor.getModel().updateOptions({tabSize: 4});
              // if (this.styleSheets.length >= 1) {
              //   this.saveCss(false);
              // } else {
              //   this.saveCss(true);
              // }
              editor.getModel().setValue(cssString.value);
            })
              .catch((err) => {
                console.error('loader.init()', err);
              });
          })
            .catch((err) => {
              console.error('loadStylesheets', err);
            });
        }
      }, {
        deep: true,
        immediate: true,
      });

      const stylesheets = computed(() => {
        if (!projectId.value) return [];
        return wpbStylesheetsStore.findInStore({query: {projects: projectId.value}}).data;
      });

      function openRemoveDio(tab) {
        removeStylesheetDio.value = true;
        stylesheetToDelete.value = tab;
      }

      function editNameSave() {
        // console.log(editingTab);
        wpbStylesheetsStore.patch(editingTab.value._id, {
          name: editingTab.value.name,
        });
      }

      function maximizeScreen() {
        emit('changeHeight', '100vh');
      }

      async function closeAndSave() {
        let hasError = await saveCss(true);
        if (!hasError) {
          emit('closeEditor');
        }
      }

      function closeEditor() {
        if (activeTab.value.cssString !== editor.getValue()) {
          confirmClose.value = true;
        } else {
          emit('closeEditor');
        }
      }

      function startEditing(idx, tab) {
        editingTab.value = Object.assign({}, tab);
        editTabDio.value = true;
      }

      function saveTabEdit(idx) {
        if (editingTabName.value.length === 0) {
          stylesheets.value[idx].name = 'TAB' + idx;
        } else {
          stylesheets.value[idx].name = editingTabName.value;
        }
        editingTabName.value = '';
        stylesheets.value[idx].editing = false;
      }

      function removeTab(tab) {
        if (!tab._id) return;
        wpbStylesheetsStore.remove(tab._id, {'$stylesheetUpdatePage': pageId.value}).then(() => {
          $q.notify({
            color: 'positive',
            message: 'Stylesheet deleted',
            timeout: 3000,
          });
          if (stylesheets.value.length > 0) {
            selectTab(stylesheets.value[0]);
          }
        }).catch(err => {
          console.error(err);
          $q.notify({
            color: 'negative',
            message: err.message,
          });
        });
      }

      async function selectTab(tab) {
        if (activeTab.value && (editor.getValue() !== activeTab.value.cssString)) {
          let hasError = await saveCss(true);
          if (!hasError) {
            activeTab.value = tab;
            cssString.value = activeTab.value.cssString;
            editor.getModel().setValue(cssString.value);
          }
        } else {
          activeTab.value = tab;
          cssString.value = activeTab.value.cssString;
          editor.getModel().setValue(cssString.value);
        }
      }

      function createTab() {
        let tab = {
          name: editorName.value,
          cssString: '',
          rules: [],
          projects: [projectId.value],
          order: stylesheets.value.length,
        };

        wpbStylesheetsStore.create(tab, {'$stylesheetUpdatePage': pageId.value})
          .then(res => {
            selectTab(res);
            editorName.value = '';
          })
          .catch(err => {
            $q.notify({
              message: err.message,
              color: 'negative',
            });
          });
      }

      async function saveCss(returnVal = false) {
        let cssStr = editor.getValue();
        if (cssStr.includes('@supports') || cssStr.includes('@page')) {
          $q.notify({
            color: 'negative',
            message: 'You may not include @page or @supports selectors, please remove before saving',
          });
          if (returnVal === true) return true;
        } else {
          return await wpbStylesheetsStore.patch(
            activeTab.value._id,
            {cssString: editor.getValue()},
            {'$stylesheetUpdatePage': pageId.value},
          )
            .then(() => {
              $q.notify({
                message: 'Stylesheet changes saved',
                color: 'positive',
              });
              if (returnVal === true) return false;
            })
            .catch(err => {
              console.log(err);
            });
        }
      }

      return {
        activeTab,
        editingTab,
        stylesheetToDelete,
        removeStylesheetDio,
        confirmClose,
        addTabDio,
        editTabDio,
        editorName,
        stylesheets,
        openRemoveDio,
        editNameSave,
        maximizeScreen,
        closeAndSave,
        closeEditor,
        startEditing,
        saveTabEdit,
        removeTab,
        selectTab,
        createTab,
        saveCss,
      };
    },
    // created() {
    //   setInterval(() => {
    //     console.log(this.editor.getModel());
    //   }, 2000);
    //   window.addEventListener('keydown', (event) => {
    //     if (event.key === 'Meta' && Object.keys(this.activeTab).length >= 1) {
    //       event.preventDefault();
    //       event.stopImmediatePropagation();
    //       this.saveCss(false);
    //     } else if (event.key === 'Meta') {
    //       event.preventDefault();
    //       alert('Must have open file before saving');
    //     }
    //   });
    // },
  };
</script>

<style scoped lang="scss">
  .tabs-wrapper {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    background-color: #5b5b5b;
    padding: 4px 4px 0 4px;
    width: auto;
  }

  .tab {
    background-color: #1F1F1F;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    color: white;
    font-size: 1.1em;
    margin-left: 3px;
    padding: 4px 35px 4px 6px;
    cursor: pointer;
    position: relative;

    input, button {
      font-size: .7em;
    }
  }

  .tab .close {
    position: absolute;
    right: 5px;
    top: 1px;
    font-size: .8em;
  }

  .tab-inactive {
    background-color: #484849;
    color: #afafaf;
  }

  .btn {
    margin: 15px;
    background-color: #1c1b1b;
    color: white;
    border: none;
    outline: none;
    font-size: 1em;
    font-family: sans-serif;
    padding: 8px 15px;
    border-radius: 15px;
    cursor: pointer;
  }

  .close-editor, .minimize-editor, .maximize-editor {
    color: white;
    font-size: 1.4em;
    cursor: pointer;
    margin: 0 6px;
    padding-bottom: 4px;
    transition: 0.2s all;
    /*border-radius: 10px;*/
    /*border-right: 1px solid white;*/
  }

  .minimize-editor {
    margin-top: -6px;
  }

  .disabled-max {
    color: grey;
    cursor: no-drop;
  }

  .no-stylesheets {
    position: absolute;
    top: 32px;
    padding-top: 140px;
    bottom: 0;
    font-size: 1.9em;
    color: white;
    background-color: #1E1E1E;
    text-align: center;
    right: 0;
    left: 0;
  }
</style>
