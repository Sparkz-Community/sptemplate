<template>
  <div class="q-py-md">
    <div class="row q-gutter-sm">

      <q-btn flat
             :size="($q.screen.sm || $q.screen.xs)? 'sm': '' "
             icon="fas fa-arrow-left"
             @click="openMessage = false" />
      <div :class="($q.screen.sm || $q.screen.xs)?'text-h6':'text-h4'">
        <q-item-label v-if="!openedMessage">
          <q-skeleton flat icon="fas fa-arrow-left" type="text" style="width: 100px;" />
        </q-item-label>
        <q-item-label v-else>{{ $lget(openedMessage, 'subject') }}</q-item-label>
      </div>
    </div>
    <q-item>
      <q-item-section top avatar>
        <q-skeleton flat icon="fas fa-arrow-left" v-if="!openedMessage" type="QAvatar" />
        <random-avatar v-else size="lg"
                       :user="$lget(openedMessage ,['_fastjoin','from'])"
                       :menu="false" />
      </q-item-section>

      <q-item-section>
        <q-item-label v-if="!openedMessage">
          <q-skeleton type="text" style="max-width: 100px;" />
        </q-item-label>
        <q-item-label v-else>{{ $lget(openedMessage, ['_fastjoin', 'from', 'name']) }}</q-item-label>
        <q-item-label caption v-if="!openedMessage">
          <q-skeleton type="text" style="max-width: 100px;" />
        </q-item-label>
        <q-item-label v-else caption>
          {{ $lget(openedMessage, ['_fastjoin', 'from', 'email']) }}
        </q-item-label>
      </q-item-section>

      <q-item-section side top>
        <q-chip v-if="$lget(openedMessage,'attachments',[]).length"
                icon="attachment"
                :label="$lget(openedMessage,'attachments',[]).length" />
      </q-item-section>
    </q-item>

    <div v-if="!openedMessage" class="q-pa-md">
      <q-skeleton height="100px" square />
    </div>
    <div v-else class="q-pa-md" v-html="$lget(openedMessage, 'body')" />
    <div class="q-px-md justify-start">
      <p class="q-mb-none text-bold">
        {{ $lget(openedMessage, ['_fastjoin', 'from', 'name']) }}
      </p>
      <p class="q-mb-none text-caption">
        {{ $lget(openedMessage, ['_fastjoin', 'from', 'phones', '0', 'number', 'national']) }}
      </p>
      <p class="q-mb-none text-caption">
        {{ $lget(openedMessage, ['_fastjoin', 'from', 'email']) }}
      </p>
    </div>

  </div>
  <div class="q-px-md" v-if="$lget(openedMessage,'attachments',[]).length">
    <p>
      {{ $lget(openedMessage, 'attachments', []).length }}
      {{ $lget(openedMessage, 'attachments', []).length > 1 ? 'Attachments' : 'Attachment' }}
    </p>
    <div class="row q-gutter-md">
      <q-card style="min-width: 10%"
              v-for="att in $lget(openedMessage,'attachments',[])"
              :key="$lget(att,'_id')">
        <q-img :src="$lget(att,'path',$lget(att,'href'))"
               basic>
          <div class="absolute-bottom text-subtitle2 text-center">
            <q-btn :disabled="downloading"
                   :loading="downloading"
                   icon="download"
                   @click="downloadItem(att)" />
          </div>
        </q-img>
      </q-card>
    </div>
  </div>

  <template v-if="$lget(openedMessage,['_fastjoin','replies'],[]).length">

    <div class="q-px-md"
         v-for="(reply, index) in $lget(openedMessage,['_fastjoin','replies'],[])"
         :key="index">
      <q-separator spaced />
      <q-item>
        <q-item-section top avatar>
          <random-avatar size="lg"
                         :user="$lget(reply ,'from')"
                         :menu="false" />
        </q-item-section>

        <q-item-section>
          <q-item-label>
            {{ $lget(reply, ['from', 'name']) }}
          </q-item-label>
          <q-item-label caption>
            {{ $lget(reply, ['from', 'email']) }}
          </q-item-label>
        </q-item-section>

        <q-item-section side top>
          <q-chip v-if="$lget(reply,'attachments',[]).length"
                  icon="attachment"
                  :label="$lget(reply,'attachments',[]).length" />
        </q-item-section>
      </q-item>
      <div class="q-py-md" v-html="$lget(reply, 'body')" />
      <div v-if="$lget(reply,'attachments',[]).length">
        <div class="row q-gutter-md">
          <q-card style="min-width: 10%"
                  v-for="att in $lget(reply,'attachments',[])"
                  :key="$lget(att,'_id')">
            <q-img :src="$lget(att,'path',$lget(att,'href'))"
                   basic>
              <div class="absolute-bottom text-subtitle2 text-center">
                <q-btn :disabled="downloading"
                       :loading="downloading"
                       icon="download"
                       @click="downloadItem(att)" />
              </div>
            </q-img>
          </q-card>
          <q-separator spaced />
        </div>
      </div>
    </div>
  </template>

  <div class="q-pa-md row justify-between">
    <div class=" q-gutter-xs">
      <q-btn size="sm"
             icon="fas fa-reply"
             no-caps
             outline
             rounded
             color="primary"
             label="Reply"
             @click="replyMsg" />
      <q-btn size="sm"
             icon-right="fas fa-share"
             no-caps
             outline
             rounded
             color="primary"
             label="Forward"
             @click="forwardMsg" />
    </div>
    <div>
      <q-btn flat size="sm" icon="delete" @click="openDeleteConfirm" />
    </div>

    <inbox-dialog v-model="showInbox" style="display: flex" :title="dialogTitle" @close="closeDialog">
      <inbox-form :message="msgToEdit" :is-reply="isReply" @sent="sent" />
    </inbox-dialog>
  </div>
</template>

<script>
  import { toRef } from 'vue';
  import InboxDialog from 'pages/messages/components/inbox-dialog';
  import InboxForm from 'pages/messages/components/inbox-form';
  import RandomAvatar from 'components/profile/RandomAvatar/RandomAvatar';

  export default {
    name: 'ViewMessage',
    components: {
      RandomAvatar,
      InboxForm,
      InboxDialog,
    },
    props: {
      openMessageProps: {
        type: Object,
        required: true,
      },
      msgToEdit: {

      },
    },
    setup(props) {
      // Props, injects, & imports
      const openMessage = toRef(props.openMessageProps, 'openMessage');
      const openedMessage = toRef(props.openMessageProps, 'openedMessage');
      const openedMessageId = toRef(props.openMessageProps, 'openedMessageId');

      // Functions
      function forwardMsg() {
        this.showInbox = true;
        this.msgToEdit = undefined;
        this.dialogTitle = 'Forward Message';
        const {subject, body, attachments} = this.openMessageProps.openedMessage;
        this.msgToEdit = {subject, body, attachments};
      };

      return {
        openMessage,
        openedMessage,
        openedMessageId,
      };
    },
  };
</script>

<style scoped lang="scss">

</style>
