<template>
  <div
    style="width: 100%;"
    class="q-px-md"
  >
    <q-input v-model="card.name" dense type="textarea" filled autogrow autofocus style="width: 100%;"/>
    <div class="row justify-center full-width q-ma-md">
      <q-btn
        class="full-width"
        icon="add"
        dense color="primary"
        :disable="disableSaveCard"
        @click.stop="save" @touchstart.stop="save"
      >
        Save
      </q-btn>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'AddTemplateCardForm',
    emits:['create-card'],
    data() {
      return {
        disableSaveCard: true,
        showForm: false,
        card: {},
      };
    },
    watch: {
      card: {
        immediate: true,
        deep: true,
        handler(newVal) {
          this.disableSaveCard = !this.$lget(newVal,'name');
        },
      },
    },
    methods: {
      save() {
        this.$emit('create-card',{card: this.card});
      }
    }
  };
</script>

<style scoped>

</style>
