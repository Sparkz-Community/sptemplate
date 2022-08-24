<template>
  <div id="Refer">
    <q-spinner-cube class="absolute-center"
                    color="primary"
                    size="6em"/>
  </div>
</template>

<script>
  import {mapActions} from 'pinia';

  import useReferLinks from '../../stores/services/refer-links';

  export default {
    name: 'Refer',
    mounted() {
      this.getReferLink(this.$lget(this.$route, 'query.referlink', ''))
        .then(async (res) => {
          // only patch if user doesn't already have the id in local storage
          if (!localStorage.referLinkId || localStorage.referLinkId !== this.$lget(res, '_id')) {
            await res.patch({
              data: {
                $inc: {
                  interactionCount: 1,
                },
              },
            });
          }

          localStorage.referLinkId = this.$lget(res, '_id'); // localStorage or sessionStorage?

          if (this.$lget(res, 'usedFor') === 'form') {
            await this.$router.push({
              name: 'refer-form',
              query: {formId: this.$lget(res, 'form')},
            });
          } else if (this.$lget(res, 'usedFor') === 'page') {
            await this.$router.push({name: this.$lget(res, 'routeName', '')});
          }
        });
    },
    methods: {
      ...mapActions(useReferLinks, {
        getReferLink: 'get',
      }),
    },
  };
</script>

<style scoped>

</style>
