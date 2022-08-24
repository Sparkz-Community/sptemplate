<template>
  <q-page id="ReferForm" class="q-pa-xl">
    <q-card class="q-pa-lg" style="width: 700px; margin: auto">
      <!--      after form is submitted, hide the stuff below and replace it with a checkmark and a link to the home page-->
      <!--      if !formFields.length, show something that says invalid form and has a link to the home page-->
      <div v-if="isGetPending" class="flex justify-center items-center q-pa-xl">
        <q-spinner size="3em"/>
      </div>
      <div v-else-if="!fields.length">
        <h2 class="q-ma-none q-mb-lg text-center text-negative" style="font-weight: 500">
          :(
        </h2>
        <h3 class="text-center text-negative q-mt-sm q-mb-lg" style="font-weight: 500">
          This form is invalid
        </h3>
        <q-card-actions class="justify-center">
          <q-btn class="q-px-md"
                 rounded
                 color="primary"
                 label="Go to Home"
                 @click="$router.push({name: 'home'})"/>
        </q-card-actions>
      </div>
      <div v-else-if="formSubmitted">
        <div class="flex justify-center items-center">
          <q-icon name="mdi-check-circle" size="100px" class="text-positive"/>
        </div>
        <h3 class="text-center text-positive q-mt-sm q-mb-lg" style="font-weight: 500">
          Form submitted
        </h3>
        <q-card-actions class="justify-center">
          <q-btn class="q-px-md"
                 rounded
                 color="primary"
                 label="Go to Home"
                 @click="$router.push({name: 'home'})"/>
        </q-card-actions>
      </div>
      <div v-else>
        <form-generator v-if="fields.length" v-model="formData" :fields="fields" useQform
                        v-model:valid="valid"></form-generator>
        <q-card-actions class="justify-center">
          <q-btn :disable="!valid"
                 :loading="isPatchPending"
                 class="q-px-md"
                 rounded
                 color="primary"
                 label="Submit Form"
                 @click="submitForm"/>
        </q-card-actions>
      </div>
    </q-card>
  </q-page>
</template>

<script>
  import {mapActions, mapState} from 'pinia';

  import useForms from '../../stores/services/forms';

  export default {
    name: 'ReferForm',
    data() {
      return {
        formData: {},
        valid: false,
        fields: [],
        formSubmitted: false,
      };
    },
    mounted() {
      this.getForm(this.$lget(this.$route, 'query.formId', ''))
        .then(res => {
          this.fields = res.fields;
        });
    },
    computed: {
      ...mapState(useForms, {
        isGetPending: (state) => state.pendingById.Model.get || false,
        isPatchPending: 'isPatchPending',
      }),
    },
    methods: {
      ...mapActions(useForms, {
        getForm: 'get',
        patchForm: 'patch',
      }),

      submitForm() {
        // patch the form's responses array with formData
        this.patchForm(this.$lget(this.$route, 'query.formId', ''), {
          $addToSet: {
            responses: this.formData,
          },
        }).then(() => {
          this.$q.notify({
            type: 'positive',
            message: 'Response submitted!',
            timeout: 10000,
            actions: [
              {
                icon: 'close',
                color: 'white',
                handler: () => {
                },
              },
            ],
          });
          this.formSubmitted = true;
        });
      },
    },
  };
</script>

<style scoped>

</style>
