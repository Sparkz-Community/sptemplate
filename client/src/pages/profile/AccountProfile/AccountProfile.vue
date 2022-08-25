<template>
  <q-page>
    <account-profile-component :model-value="{account}" square router-mixin-run />
<!--    <account-profile-component :value="{account}" square router-mixin-run />-->
    <q-img src="~assets/AccountProfilePlaceholder.png"/>
  </q-page>
</template>

<script>
  import {mapActions, mapState} from 'pinia';
  import Accounts from 'stores/services/accounts';
  import Auth from 'stores/store.auth';
  import AccountProfileComponent from '@sparkz-community/common-client-lib/src/components/profile/AccountProfile';

  export default {
    name: 'AccountProfile',
    components: {
      AccountProfileComponent,
    },
    mounted() {
      this.$watch('stateAccount', async () => {
        await this.setAccount();
      }, {
        immediate: true,
        deep: true,
      });
    },
    data() {
      return {
        tab: null,
        account: {},
      };
    },
    computed: {
      ...mapState(Auth, {
        stateAccount: 'activeAccount',
      }),
      ...mapState(Accounts, {
        getStateAccounts: 'get',
      }),
    },
    methods: {
      ...mapActions(Accounts, {
        getDbAccounts: 'get',
      }),
      tabClick(tab) {
        if (tab === this.tab) {
          this.tab = null;
        }
      },
      async setAccount() {
        let id = this.$route.params.id || this.stateAccount._id;
        let account = this.getStateAccounts(id);
        if (!account) {
          account = await this.getDbAccounts(id);
        }
        console.log('this is account before clone: ', account);
        this.account = account.clone();
        console.log('this is account after clone: ', account);
      },
    },
  };
</script>

<style scoped lang="scss" src="./_AccountProfile.scss">

</style>
