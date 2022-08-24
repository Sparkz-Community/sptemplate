<template>
  <div  class="q-pa-md row items-start justify-center q-gutter-md">

    <q-card v-if="boardTemplate" class="my-card" flat bordered style="max-width: 875px; position: relative;">
      <q-btn @click="$router.push('/board-templates')" icon="fas fa-arrow-left" flat color="secondary" style="position: absolute; top:0; left:0; z-index: 1;"/>
      <q-img v-if="$lget(boardTemplate,['banner','raw','file'],'')"   :src="$lget(boardTemplate,['banner','raw','file'],'')" />
      <q-card-section v-else :style="`min-height: 300px; background-color: ${$lget(boardTemplate, 'color.hexa', 'teal')};`">

      </q-card-section>

      <q-card-section>
        <q-item>
          <q-item-section top avatar>
            <q-avatar rounded>
              <q-img :src="$lget(boardTemplate,['_fastjoin','owner','avatar','raw','file'],'')" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="ellipsis">{{ $lget(boardTemplate, ['name'], '') }}</q-item-label>
            <q-item-label caption>
              <span>BY: </span><span>{{$lget(boardTemplate,['_fastjoin','owner','name'],'')}}</span>
            </q-item-label>
          </q-item-section>

          <q-item-section side top>
            <div  class="row q-gutter-sm">
              <q-btn
                icon="add"
                :label="$lget(boardTemplate,'lists',[]).length? 'Task': 'Lists'" v-if="$lget($activeAccount,'_id') === $lget(boardTemplate,['owner'])"
                @click.stop="$router.push(`${boardTemplate._id}/board-template-lists`).catch((err) => {throw new Error(`board-template.vue -> template -> q-card -> @click.stop -> boardTemplate: ${err}.`);})"
                @touchstart.stop="$router.push(`${boardTemplate._id}/board-template-lists`).catch((err) => {throw new Error(`board-template-lists.vue -> template -> q-card -> @touchstart.stop -> cards: ${err}.`);})"
              />
              <q-btn icon="share" label="Share"/>
              <q-btn
                color="primary"
                label="Use Template"
                @click.stop="$router.push(`${boardTemplate._id}/board-template-lists`).catch((err) => {throw new Error(`board-template.vue -> template -> q-card -> @click.stop -> boardTemplate: ${err}.`);})"
                @touchstart.stop="$router.push(`${boardTemplate._id}/board-template-lists`).catch((err) => {throw new Error(`board-template-lists.vue -> template -> q-card -> @touchstart.stop -> cards: ${err}.`);})"
              />

            </div>
          </q-item-section>
        </q-item>
      </q-card-section>

      <q-card-section>
        <q-item-label class="text-h6 text-primary text-bold">
          Description:
        </q-item-label>
        <div v-html="$lget(boardTemplate,['description'])"/>
      </q-card-section>

      <q-card-actions v-if="boardTemplate.lists.length">
        <q-item-label class="text-h6 text-primary text-bold  q-mx-sm">
          Preview
        </q-item-label>

        <q-space />

        <q-btn
          color="primary"
          fab
          flat
          dense
          :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          @click="expanded = !expanded"
        />
      </q-card-actions>

      <q-slide-transition>
        <div v-if="boardTemplate.lists.length" v-show="expanded" class="row space-between">
        </div>
      </q-slide-transition>

      <q-card-actions v-if="relatedBoardTemplates.length">
        <q-item-label class="text-h6 text-primary text-bold  q-mx-sm">
          Related Templates
        </q-item-label>

        <q-space />

        <q-btn
          color="primary"
          fab
          flat
          dense
          :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          @click="expanded = !expanded"
        />
      </q-card-actions>

      <q-slide-transition>
        <div v-if="relatedBoardTemplates.length" v-show="expanded" class="row space-between q-mt-none">
          <q-card
            v-for="template in relatedBoardTemplates"
            style="max-width: 30%; min-width: 260px;height: 100%; cursor: pointer; margin:15px;" :key="template._id"
            @click.stop="$router.push({name: 'boardTemplate', params: {id: template._id}}).catch((err) => {throw new Error(`board-template.vue -> template -> q-card -> @click.stop -> boardTemplate: ${err}.`);})"
            @touchstart.stop="$router.push({name: 'boardTemplate', params: {id: template._id}}).catch((err) => {throw new Error(`board-template-lists.vue -> template -> q-card -> @touchstart.stop -> cards: ${err}.`);})"
          >


            <div v-if="$lget(template,['banner','raw','file'],'')">
              <q-img  :src="$lget(template,['banner','raw','file'],'')" style="height: 100px;" :key="template._id"/>
            </div>
            <div v-else :style="`height: 100px; background-color: ${$lget(template, 'color.hexa', 'teal')};`"/>

            <q-card-section>
              <q-btn
                round
                color="white"
                class="absolute"
                style="top: 0; right: 12px; transform: translateY(-50%); padding:0"
              >
                <q-avatar>

                  <img
                    :src="$lget(template,['_fastjoin','owner','avatar','raw','file'],'')"
                    alt=""/>
                </q-avatar>
              </q-btn>

              <q-item-label class="q-my-sm" style="max-width: 80%">
                {{ $lget(template,'name','') }}
              </q-item-label>
              <div class="text-caption text-grey ellipsis" v-html="$lget(template,'description','') " style="max-width: 98%; min-height: 120px;"/>
            </q-card-section>

            <q-card-actions >
              <q-btn flat round icon="share" label="324"/>
              <q-btn flat icon="fas fa-eye" label="656" />
            </q-card-actions>
          </q-card>
        </div>
      </q-slide-transition>

    </q-card>
  </div>
</template>

<script>
  import {mapActions} from 'pinia';
  import useBoardTemplates from 'stores/services/board-templates';

  export default {
    name: 'board-template',
    data() {
      return {
        boardTemplate: undefined,
        expanded: true,
        expandPreview: true,
        relatedBoardTemplates: [],
      };
    },
    async created() {
      const {id} = this.$route.params;

      this.boardTemplate = await  this.getTemplate(id,{
        'board-templates_fJoinHookResolversQuery':{
          owner: true
        }
      });
      console.log(this.boardTemplate);
      let relatedBoardTemplates = await  this.findTemplates({
        query: {
          _id: {
            $ne: id
          },
          category: this.$lget(this.boardTemplate,['category'],'')
        },
        'board-templates_fJoinHookResolversQuery':{
          owner: true
        }
      });
      this.relatedBoardTemplates = this.$lget(relatedBoardTemplates, 'data', []);
    },
    methods: {
      ...mapActions(useBoardTemplates, {
        getTemplate: 'get',
        findTemplates: 'find',
      }),
    },
  };
</script>

<style scoped>

</style>
