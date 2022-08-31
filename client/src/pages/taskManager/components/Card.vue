<template>
  <q-card style="width: 100%; margin: 5px 2px 5px 2px;"
          :class="card.priority ? (card.priority === 'low' ? 'card-bg-yellow' : (card.priority === 'medium' ? 'card-bg-orange' : card.priority === 'high' ? 'card-bg-red' : 'card-bg-darkred')) : 'card-bg-gray'">
    <q-card-section
      :class="`flex ${$lget(card, 'owners', []).length > 0 ? 'q-pb-none' : ''}`"
      style="align-items: center;"
    >
      <span style="position: absolute; top: 0; left: 5px; font-size: 10pt;">
        <q-icon v-clipboard:copy="card.name"
                v-clipboard:success="clipboardSuccessHandler"
                v-clipboard:error="clipboardErrorHandler"
                name="far fa-copy"
                size="xs"
                class="hover-copy"
                @touchstart.stop="handleCopyMobile(card._id)"></q-icon>
          <q-badge v-if="$lget(activeAccount, 'unseenTasks', []).includes(card._id)"
                   id="newBadge"
                   class="q-ml-sm"
                   align="middle">
            <q-intersection @visibility="markAsSeen">new!</q-intersection>
          </q-badge>
      </span>
      <span style="position: absolute; top: 0; left: 25px; font-size: 10pt;"
            v-if="$lget(card, 'children.length', 0) > 0">
        <q-icon
          name="fas fa-code-branch"
          size="xs"
          class="hover-copy"
          @click="showChild = !showChild"
        >
          <q-tooltip>
            Has {{ $lget(card, 'children.length', '') }} SubTasks
          </q-tooltip>
          </q-icon>
      </span>
      <div style="position: absolute; top: 0; right: 0;" v-if="!$lget(card,'completed',false)">
        <div v-if="$lget(list,'_id') !== $lget(board,'_id')">
          <q-btn size="sm" flat round icon="edit" @click.stop="openEditDialog(card)"
                 @touchstart.stop="openEditDialog(card)"></q-btn>
          <q-btn size="sm" flat round icon="fas fa-trash" @click.stop="$emit('delete-card', {list,card, close})"
                 @touchstart.stop="$emit('delete-card', {list,card, close})"></q-btn>
        </div>
        <div v-else>
          <q-btn hint="restore" size="sm" flat round icon="fas fa-undo" @click.stop="$emit('restore-from-recycle',{list,card,close})"
                 @touchstart.stop="$emit('restore-from-recycle',{list,card,close})"/>
          <q-btn hint="delete for good" size="sm" flat round icon="fas fa-trash" @click.stop="$emit('delete-card',{list,card,close})"
                 @touchstart.stop="$emit('delete-card',{list,card,close})"/>
        </div>
      </div>
      <span @dblclick="handlePopupShow">
        <span style="font-size: 13pt; margin-left: -10px">{{ card.name }}
          <q-icon v-if="$lget(card,'completed')" name="check" color="positive">
          </q-icon>
          <br>
          <p v-if="$lget(card,'completedAt')">Completed at: {{ date.formatDate($lget(card,'completedAt'), 'MM-DD-YYYY') }}
            <q-btn
              v-if="$lget(card,'completedAt')" icon="more_vert" flat dense>
              <q-menu>
                <q-item clickable v-close-popup dense @click="boardDialog=true">Send to another board</q-item>
              </q-menu>
            </q-btn>
          </p>
        </span>
        <q-popup-edit ref="popup"
                      v-model="edit_card.name"
                      :validate="val => val.length > 0"
                      @save="$emit('save-card',{list, card: edit_card, close, ...arguments})"
                      @before-show="handlePopup"
                      @hide="popup_show = false">
          <template v-slot="{ initialValue, value, validate, set, cancel }">
            <q-input
              autofocus
              dense
              v-model="edit_card.name"
              hint="Card Name"
              :rules="[val => validate(value) || 'More than 0 chars required']">
              <template v-slot:after>
                <q-btn flat dense color="negative" icon="cancel" @click.stop="cancel"/>
                <q-btn flat dense color="positive" icon="check_circle" @click.stop="set"
                       :disable="validate(value) === false || initialValue === value"/>
              </template>
            </q-input>
          </template>
        </q-popup-edit>
      </span>
      <q-space></q-space>
    </q-card-section>
    <q-card-section v-if="$lget(card, '_fastjoin.owners', []).length > 0" class="q-pa-none" style="text-align: right">
      <template>
        <q-chip v-for="(owner, index) in $lget(card, '_fastjoin.owners', [])" :key="index" size="sm">
          <q-avatar v-if="$lget(owner, 'image')" size="sm">
            <img :src="$lget(owner, 'image', 'https://cdn.quasar.dev/img/boy-avatar.png')">
          </q-avatar>
          <q-avatar v-else size="sm" color="primary" text-color="white">
            {{ (owner.name || owner.email).charAt(0).toUpperCase() }}
          </q-avatar>
          {{ owner.name || owner.email }}
        </q-chip>
      </template>
    </q-card-section>
    <q-card-section v-if="$lget(card, 'children.length', 0) > 0 && showChild" class="q-pa-none">
      <transition name="slide-fade">
        <div class="cursor-pointer">
          <div v-for="(childCard,index) in card.children" :key="index" class="q-ml-sm q-my-xs">

            <card
              :board="board"
              :card="childCard"
              :list="list"
              @delete-card="deleteCardFromParent"
            />
          </div>
        </div>
      </transition>
    </q-card-section>

    <card-form-dialog
      v-model="openFormDialog"
      :card="cardToEdit"
      :list="list"
      @save-card="$emit('save-card', {list,card:$event, close})"
      @delete-card="$emit('delete-card',{list,card: $event, close})"
    />

<!--
    <card-form-dialog
      v-model="openFormDialog"
      :card="cardToEdit"
      :list="list"
      @save-card="editCardOnList"
    />
-->

    <!--    Board Dialog  -->
    <q-dialog v-model="boardDialog">
<!--      <board-export :card="card"/>-->
    </q-dialog>
  </q-card>
</template>

<script setup>
  import {inject, ref, watch} from 'vue';
  import {useQuasar,  date} from 'quasar';
  import { copyText } from 'vue3-clipboard';
  import CardFormDialog from 'pages/taskManager/components/CardFormDialog';

  const $lget = inject('$lget');
  const activeAccount = inject('activeAccount');

  const $q = useQuasar();

  const props = defineProps({
    card: {
      type: Object,
      required: true,
    },
    list: {
      type: Object,
    },
    board: {
      type: Object,
    },
  });

  const $emit = defineEmits({
    'save-card': (item) => {
      if (item) {
        return true;
      } else {
        console.warn('Invalid save-card event payload!');
        return false;
      }
    },
    'edit-card': (item) => {
      if (item) {
        return true;
      } else {
        console.warn('Invalid edit-card event payload!');
        return false;
      }
    },
    'delete-card': (item) => {
      if (item.card) {
        return true;
      } else {
        console.warn('Invalid delete-card event payload!');
        return false;
      }
    },
    'restore-from-recycle': (item) => {
      if (item.card) {
        return true;
      } else {
        console.warn('Invalid restore-from-recycle event payload!');
        return false;
      }
    },

  });

  const showChild = ref(false);
  const popup_show = ref(false);
  const boardDialog = ref(false);
  const popup = ref(null);
  const edit_card = ref({});
  const openFormDialog = ref(false);
  const cardToEdit = ref({});
  const container = ref(null);

  watch(props.card,(newVal, oldVal) =>{
    if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
      if (edit_card.value) {
        edit_card.value = newVal;
        cardToEdit.value = newVal;
      }
    }
  },{immediate: true, deep: true});



  function clipboardSuccessHandler(e) {
    $q.notify({
      type: 'positive',
      message: `Successfully copied "${e.text}"`,
      timeout: 10000,
      actions: [
        {
          icon: 'close', color: 'white', handler: () => {
            /* ... */
          },
        },
      ],
    });
  }

  function clipboardErrorHandler(e) {
    $q.notify({
      type: 'negative',
      message: e,
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

  function handleCopyMobile(value) {
    copyText(value, container.value,function (e) {
      $q.notify({
        type: 'positive',
        message: `Successfully copied "${e}"`,
        timeout: 10000,
        actions: [
          {
            icon: 'close', color: 'white', handler: () => {
              /* ... */
            },
          },
        ],
      });
      console.log('Copied', e);
    }, function (e) {
      $q.notify({
        type: 'negative',
        message: 'Could not Copy. Try again!',
        timeout: 30000,
        actions: [
          {
            icon: 'close', color: 'white', handler: () => {
              /* ... */
            },
          },
        ],
      });
      console.log('not Copied', e);
    });
  }

  function markAsSeen(isVisible) {
    if (isVisible && $lget(activeAccount.value, 'unseenTasks', []).includes(props.card._id)) {
      console.log('pull id from unseenTasks arr');
      // maybe do some transition thing?
      // document.getElementById('newBadge').classList.add('remove-badge');
      // this.activeAccount.patch({
      //   data: {
      //     $pull: {
      //       unseenTasks: this.card._id,
      //     },
      //   },
      // }).then(() => {
      //   console.log(`removed ${this.card.name} from unseenTasks`);
      // });
    }
  }

  function handlePopupShow() {
    popup_show.value = true;
    popup.value.show();
  }

  function  handlePopup() {
    if (!popup_show.value) popup.value.hide();
  }

  function save(card) {
    $emit('save-card', {list: props.list,card, close});
    openFormDialog.value = false;
  }
  function deleteCardFromParent(card){
    edit_card.value.children = edit_card.value.children.filter(child => child._id === card._id);
    save(edit_card);
  }

  function  openEditDialog(card) {
    cardToEdit.value = card;
    openFormDialog.value = true;
  }

  function close() {
    openFormDialog.value = false;
  }
  // function editCardOnList(card){
  //   edit_card.value.children = edit_card.value.children.map(child => {
  //     if(child._id === card._id) {
  //       return card;
  //     }
  //     return child;
  //   });
  //   save(edit_card.value);
  // }

</script>

<style scoped lang="scss">
  .card-bg-yellow {
    border-top: 8px solid #ffe043;
  }

  .card-bg-orange {
    border-top: 8px solid #f1a329;
  }

  .card-bg-red {
    border-top: 8px solid #fc733c;
    /*border: 2px solid #fc733c;*/
  }

  .card-bg-darkred {
    /*border: 2px solid #b70000;*/
    border-top: 8px solid #b70000;
  }

  .card-bg-gray {
    border-top: 8px solid #BDBDBD;
  }

  .hover-copy {
    color: var(--q-color-primary);
    cursor: pointer;
  }

  .hover-copy:hover {
    color: var(--q-color-accent);
  }

  .slide-fade-enter-active {
    transition: all .3s ease;
  }

  .slide-fade-leave-active {
    transition: all .3s ease;
  }

  .slide-fade-enter, .slide-fade-leave-to
    /* .slide-fade-leave-active below version 2.1.8 */
  {
    transform: translateY(100px);
    opacity: 0;
  }
</style>
