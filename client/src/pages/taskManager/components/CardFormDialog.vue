<template>
  <div id="cardFormDialog">
    <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
              :position="dialog_position"
              :full-height="dialog_position === 'right'" :seamless="dialog_position === 'right'">
      <q-layout view="Lhh LpR Lff" container :class="$q.dark.mode ? 'bg-dark' : 'bg-white'"
                :style="(dialog_position === 'right' ? `width: ${$q.screen.width < 420 ? $q.screen.width - 10 : 400}px;` : '') + ' overflow: visible !important;'">
        <q-header class="bg-primary">
          <q-toolbar>
            <q-btn flat
                   round
                   dense
                   :icon="dialog_position !== 'right' ? 'fas fa-thumbtack' : 'fas fa-expand-alt'"
                   @click="dialog_position = dialog_position === 'right' ? 'standard' : 'right' "/>
            <q-btn flat
                   round
                   dense
                   :icon="card_comment_drawer ? 'fas fa-comment-slash' : 'fas fa-comment'"
                   @click="card_comment_drawer = !card_comment_drawer"/>
            <q-toolbar-title>{{
                form_data._id ? `Card ${$lget(form_data, 'name')} ${$lget(form_data, 'parent') ? `of ${$lget(parentCard, 'name')}` : ''}` : 'Create Card'
              }}
            </q-toolbar-title>
            <q-btn flat v-close-popup round dense icon="close"/>
          </q-toolbar>
        </q-header>

        <q-drawer bordered v-model="card_comment_drawer"
                  :width="$q.screen.width < 420 ? $q.screen.width - 25 : 350" content-class="shadow-1"
                  class="comment-drawer" :breakpoint="100" persistent overlay>
          <q-page-sticky position="top-right" :offset="[5, -45]" style="z-index: 100;">
            <q-btn @click="card_comment_drawer = false" flat dense round icon="close" class=""></q-btn>
          </q-page-sticky>

          <div class="comment-wrapper q-pb-xl" v-if="card !== undefined">
            <div class="no-comments" v-if="$lget(form_data, 'comments', []).length === 0">Be the first to add a
              comment
            </div>
            <template
              v-else
              v-for="(comment, idx) in $lget(form_data, 'comments',[])"
              :key="idx"
            >
              <div
                :id="'comment' + idx"
                class="comment row justify-between"
                @click="toggleComment(idx, $event)"
              >
                <q-item v-if="comment._fastjoin" class="q-mb-sm">
                  <q-item-section avatar>
                    <q-avatar size="md">
                      <q-img
                        :src="$lget(comment, ['_fastjoin','createdBy','avatar','raw','file'],
                        'https://images.vexels.com/media/users/3/145908/preview2/52eabf633ca6414e60a7677b0b917d92-male-avatar-maker.jpg')"
                      />
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-bold">{{
                        $lget(comment, ['_fastjoin', 'createdBy', 'name'], '')
                      }}
                    </q-item-label>
                    <q-item-label caption class="text-caption text-xxs">
                      {{ $lget(comment, ['_fastjoin', 'createdBy', 'email'], '') }}
                    </q-item-label>
                    <q-item-label class="q-mt-sm text-sm" >{{comment.comment}}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-else class="q-mb-sm full-width">
                  <q-item-section avatar>
                    <q-skeleton type="QAvatar"/>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>
                      <q-skeleton type="text" width="35%"/>
                    </q-item-label>
                    <q-item-label caption>
                      <q-skeleton type="text" width="70%"/>
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <div class="q-mt-xl q-mr-none">
                  <q-fab
                    label-position="top"
                    external-label
                    color="primary"
                    icon="keyboard_arrow_left"
                    direction="left"
                    padding="xs"
                    @click.stop>
                    <q-fab-action @click.stop="openEditComment(comment)" padding="5px" external-label color="primary"
                                  icon="create"/>
                    <q-fab-action padding="5px" external-label color="orange" @click.stop="deleteComment(comment)"
                                  icon="delete"/>
                  </q-fab>
                </div>
              </div>
            </template>
          </div>
          <div class="input-wrapper">
<!--            <q-editor class="comment-rich-editor"
                      v-model="commentInputVal"
                      :definitions="{
                                      upload: {
                                        tip: 'Upload an image',
                                        icon: 'photo',
                                        handler: insertImg
                                      },
                                      save: {
                                        tip: 'Add comment',
                                        icon: 'send',
                                        handler: addComment,
                                        color: 'blue',
                                      }
                                    }"
                      :toolbar="[...arguments, ['upload', 'save']]"/>-->
          </div>
        </q-drawer>

        <q-page-container>
          <q-page class="q-pa-sm">
            <form-generator v-model="form_data" :fields="fields">
              <template v-slot:option="scope">
                <q-item :scope="scope" >
                  <q-item-section avatar>
                    <q-avatar v-if="scope.image">
                      <q-img src="https://cdn.quasar.dev/img/avatar.png"/>
                    </q-avatar>
                    <q-avatar v-else color="primary" text-color="white">
                      {{
                        option_label(scope.opt) === 'Unknown' ? scope.opt.email.charAt(0).toUpperCase() : option_label(scope.opt).charAt(0).toUpperCase()
                      }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <!--<q-item-label v-html="scope.opt.name" />-->
                    <q-item-label>
                      {{option_label(scope.opt)}}
                    </q-item-label>
                    <q-item-label caption>{{ scope.opt.email }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </form-generator>
            <tag-picker adding v-model="form_data.tags" serviceIn="cards"></tag-picker>
            <div class="q-my-md">
              <!--              <q-select-->
              <!--                multiple-->
              <!--                :options="people.data"-->
              <!--                option-label="name"-->
              <!--                option-value="_id"-->
              <!--                v-model="additionalOwners"-->
              <!--                label="Add Owners"-->
              <!--                use-chips-->
              <!--                stack-label-->
              <!--                filled-->
              <!--              >-->

              <!--              </q-select>-->
            </div>
            <div class="q-my-md" style="min-height: 100%; position: relative;">

              <!--              <draggable-tree v-model="sortedChildrenCards"
                                            @change="handleDragCard"
                                            class="card-drag"
                                            v-bind="{
                                              attrs: {
                                                maxDepth: 1,
                                                group: 'card',
                                                childrenProp: ' ',
                                              }
                                            }"
                            >
                              <template slot-scope="{ item: card }">
                                <card-card
                                  :card="card"
                                  :list="list"
                                  @delete-card="deleteCardFromParent"
                                  @open-edit-dialog="openEditChildCardDialog"
                                />
                              </template>
                            </draggable-tree>-->
              <!--              <add-card :list="list" :parent-card="card" label="Add SubCard" @add-card="addSubCardToCard"/>-->
              <card-form-dialog
                v-model="openFormDialog"
                :card="cardToEdit"
                :list="list"
                @save-card="editCardOnList"
              />
            </div>
          </q-page>
        </q-page-container>

        <q-footer :class="$q.dark.mode ? 'bg-dark' : 'bg-white'" bordered>
          <q-toolbar class="row justify-between">
            <q-btn :disabled="!form_data.name" color="primary" @click="$emit('save-card', form_data)">Save</q-btn>
            <q-btn :disabled="!form_data.name" color="negative" @click="$emit('delete-card', form_data)">Delete</q-btn>
          </q-toolbar>
        </q-footer>
      </q-layout>
    </q-dialog>

    <q-dialog v-model="prompt" persistent>
      <q-card style="min-width: 250px">
        <q-card-section>
          <div class="text-h6">Edit comment</div>
        </q-card-section>

        <q-card-section class="q-pt-none edit-comment-popup">
          <q-editor v-if="commentToEdit" class="edit-comment-form" v-model="commentToEdit.comment"
                    :definitions="{
                                      upload: {
                                        tip: 'Upload an image',
                                        icon: 'photo',
                                        handler: insertImg
                                      },
                                      save: {
                                        tip: 'Add comment',
                                        icon: 'send',
                                        handler: addComment,
                                        color: 'blue',
                                      }
                                    }"
                    :toolbar="[...toolbar, ['fullscreen']]"/>
          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Cancel" v-close-popup/>
            <q-btn flat label="Save" @click="saveEditComment"/>
          </q-card-actions>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
<script setup>
  import TagPicker from 'components/formGeneratorCustom/TagPicker';
  import CardFormDialog from 'pages/taskManager/components/CardFormDialog';
  import {computed, inject, ref, watch} from 'vue';
  import {useQuasar, Screen} from 'quasar';

  const $q = useQuasar();
  const $lget = inject('$lget');
  const $fingerprint = inject('$fingerprint');
  const $authUser= inject('$authUser');
  const $activeAccount= inject('$activeAccount');

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    card: {
      type: Object,
      required: true,
    },
    list: {
      type: Object,
    },
  });

  const $emit = defineEmits({
    'update:modelValue': (item) => {
      if (item) {
        return true;
      } else {
        console.warn('Invalid save-card event payload!');
        return false;
      }
    },
    'save-card': (item) => {
      if (item) {
        return true;
      } else {
        console.warn('Invalid save-card event payload!');
        return false;
      }
    },
    'delete-card': (item) => {
      if (item) {
        return true;
      } else {
        console.warn('Invalid save-card event payload!');
        return false;
      }
    },
  });

  const dialog_position = ref('right');
  const card_comment_drawer = ref(false);
  const form_data = ref({
    children: [],
    comments:[]
  });
  const childrenCards = ref([]);
  const commentToEdit = ref({
    _id: undefined
  });
  const commentInputVal = ref('');
  const openFormDialog = ref(false);
  const cardToEdit = ref({});
  const prompt = ref(false);

  const parentCard = computed(() => {
    if($lget(props.card,['parent'])){
      return props.list.cards.find(card => card._id === card.parent);
    }
    return {};
  });

  const fields = computed(() =>([
    {
      fieldType: 'TextInput',
      path: 'name',
      attrs: {
        label: 'name',
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
        'min-height': '4rem',
      },
    },
    // {
    //   fieldType: 'selectInput',
    //   path: 'owners',
    //   attrs: {
    //     multiple: true,
    //     filled: true,
    //     'hide-selected': false,
    //     'use-chips': true,
    //     'use-input': true,
    //     'input-debounce': 0,
    //     behavior: 'dialog',
    //     // 'option-value': '_id',
    //     label: 'Owners',
    //     'clear-icon': 'close',
    //     'map-options': true,
    //     'emit-value': true,
    //     options: [
    //       {label: 'caleb', value: '_id'}
    //     ]
    //   },
    //   'div-attrs': {
    //     class: 'col-12'
    //   }
    // },
    {
      fieldType: 'selectInput',
      path: 'priority',
      attrs: {
        label: 'Priority',
        'clear-icon': 'close',
        'map-options': true,
        'emit-value': true,
        options: [
          {label: 'Low', value: 'low'},
          {label: 'Medium', value: 'medium'},
          {label: 'High', value: 'high'},
          {label: 'Critical', value: 'critical'},
        ],
        dense: true,
      },
      'div-attrs': {
        class: 'col-12',
      },
    },
    {
      fieldType: 'selectInput',
      path: 'category',
      attrs: {
        label: 'Category',
        'clear-icon': 'close',
        'emit-value': true,
        options: [{label: 'Lead', value: 'lead'}, {
          label: 'Task',
          value: 'task',
        }, {label: 'Question', value: 'question'}, {label: 'Research', value: 'research'}, {
          label: 'Other',
          value: 'other',
        }],
        dense: true,
      },
      'div-attrs': {
        class: 'col-12',
      },
    },
  ]));

  watch(Screen, () => {
    if (props.modelValue) {
      handleCommentDrawerStyle();
    }
  }, {immediate: true, deep: true});

  watch(card_comment_drawer, () => {
    if (props.modelValue) {
      handleCommentDrawerStyle();
    }
  }, {immediate: true, deep: true});

  watch(props.card, (newVal, oldVal) => {
    console.log({newVal, oldVal});
    form_data.value = Object.assign({children: [], comments: []},newVal);
  }, {immediate: true, deep: true});

  watch(()=>form_data.value, (newVal) => {
    childrenCards.value = $lget(newVal,['children'],[]);
  }, {immediate: true, deep: true});

  function handleCommentDrawerStyle() {
    let drawers = document.querySelectorAll('.comment-drawer .q-drawer') || [];
    if (drawers.length && Screen.width > 755 && dialog_position.value === 'right') {
      drawers.forEach(drawer => drawer.style.marginLeft = '-350px');
    } else if (drawers.length && Screen.width > 1270 && dialog_position.value === 'standard') {
      drawers.forEach(drawer => drawer.style.marginLeft = '-350px');
    } else if (drawers.length !== 0) {
      drawers.forEach(drawer => drawer.style.marginLeft = '0px');
    }
  }

  function toggleComment(idx) {
    let el = document.querySelector(`#comment${idx}`);
    let elemHeight = el.scrollHeight + 5;
    if (el.classList.contains('expanded-comment')) {
      el.classList.remove('expanded-comment');
      el.animate([
        {height: `${elemHeight}px`},
        {height: '110px'},
      ], {
        duration: 300,
        easing: 'ease-in-out',
      });
      el.style.height = '110px';
      return;
    }
    el.animate([
      {height: '110px'},
      {height: `${elemHeight}px`},
    ], {
      duration: 300,
      easing: 'ease-in-out',
    });
    el.classList.add('expanded-comment');
    el.style.height = `${elemHeight}px`;
  }

  function openEditComment(comment) {
    commentToEdit.value = comment;
    prompt.value = true;
  }

  function deleteComment(commentObj) {
    form_data.value.comments =  form_data.value.comments.filter(comment => comment._id !== commentObj._id);
    $emit('save-card', form_data.value);
  }

  function addComment() {
    if (!commentInputVal.value) {
      console.log('empty strings not allowed');
      return;
    }
    form_data.value.comments.push({
      comment: commentInputVal.value,
      createdBy: {
        fingerprint: $lget($fingerprint, ['_id']),
        user: $lget($authUser, ['_id']),
        login: $lget($authUser, ['_fastjoin','logins','active','_id']),
        account: $lget($activeAccount, ['_id']),
      },
      updatedBy: {
        fingerprint: $lget($fingerprint, ['_id']),
        user: $lget($authUser, ['_id']),
        login: $lget($authUser, ['_fastjoin','logins','active','_id']),
        account: $lget($activeAccount, ['_id']),
      }
    });
    $emit('save-card', form_data.value);
    commentInputVal.value = '';
  }

  function insertImg() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.png, .jpg';
    let file;
    input.onchange = () => {
      const files = Array.from(input.files);
      file = files[0];
      const reader = new FileReader();
      let dataUrl = '';
      reader.onloadend = () => {
        dataUrl = reader.result;
        let html = `<q-img src="${dataUrl}" style="width: ${'100%'};" />`;
        commentInputVal.value += html;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  function  option_label(item) {
    return $lget(item, 'name', 'Unknown');
  }

  // function openEditDialog(card) {
  //   cardToEdit.value = card;
  //   openFormDialog.value = true;
  // }

  // function openEditChildCardDialog(child) {
  //   cardToEdit.value = child;
  //   openFormDialog.value = true;
  // }

  function editCardOnList(card){
    form_data.value.children = form_data.value.children.map(child => {
      if(child.name === card.name) {
        return card;
      }
      return child;
    });
    openFormDialog.value = false;
  }

  // function close() {
  //   openFormDialog.value = false;
  // }

  function saveEditComment() {
    form_data.value.comments.map(comment => {
      if(comment._id === commentToEdit.value._id) {
        return Object.assign(comment,commentToEdit.value, {
          updatedBy: {
            fingerprint: $lget($fingerprint, ['_id']),
            user: $lget($authUser, ['_id']),
            login: $lget($authUser, ['_fastjoin','logins','active','_id']),
            account: $lget($activeAccount, ['_id']),
          }
        });
      }
      return comment;
    });
    $emit('save-card', form_data.value);
    commentToEdit.value = undefined;
    prompt.value = false;
  }

</script>


<style scoped lang="scss">
  #cardFormDialog {

  }

  .comment-wrapper {
    position: relative;
  }

  .comment-rich-editor {
    height: 150px;
    overflow: scroll;
  }

  .input-wrapper {
    position: absolute;
    bottom: 0;
    width: 100%;
  }

  .comment {
    width: 100%;
    transition: 0.5s all;
    transform: scaleY(1);
    padding: 15px;
    border-bottom: 1px solid lightgray;
    color: #555;
    font-weight: 350;
    position: relative;
    height: 110px;
    overflow: hidden;
  }

  .comment:last-child {
    margin-bottom: 101px;
  }

  .comment:hover {
    background-color: #e0e0e0;
    cursor: pointer;
    //height: auto;
  }

  .comment .center {
    margin-left: 10px;
    width: 100%;
    margin-right: 15px;
  }

  .creator {
    color: #222;
    margin-left: 12px;
    font-weight: 400;
    font-size: 1.05em;
  }

  .comment .right .icon-actions-wrapper {
    display: flex;
    margin-top: 10px;
    font-size: 1.15em;
    justify-content: space-around;
  }

  .comment .right .icon-actions-wrapper i {
    transition: 0.2s all;
  }

  .fa-trash:hover {
    color: red;
  }

  .fa-pencil-alt:hover {
    color: #00aaf1;
  }

  .send-btn {
    text-align: right;
  }

  .actions-buttons-wrapper {
    z-index: 0;
    position: absolute;
    right: 7px;
    top: 10px;
  }

  .comment:first-child .actions-buttons-wrapper {
    top: 33px;
  }

  .no-comments {
    text-align: center;
    margin-top: 40px;
    font-size: 1.4em;
    font-weight: 350;
  }

  .comment-img {
    width: 20px;
  }

  .edit-comment-popup {

  }

  .edit-comment-form {
    max-height: 72vh !important;
    overflow: scroll;
  }

  .edit-comment-form::-webkit-scrollbar {
    display: none !important;
  }
</style>
