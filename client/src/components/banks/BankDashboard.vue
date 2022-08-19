<template>
  <dashboard-layout :dashboard-side-menu-links="bankLinks" @clicked-link="activeLink=$event" :hide-drawer="hideDrawer">
    <template #side-menu-top>
      <q-btn
        no-caps
        color="primary"
        outline icon="add"
        label="Wallet"
        @click="showAddBusinessProfile"
      />
    </template>
    <template #page-toolbar>
      <div class="self-center" v-if="activeLink==='add'">
        <span class="gt-sm text-h4 self-center text-center">New Wallet</span>
        <span class="lt-md text-h6">New Wallet</span>
      </div>
    </template>
    <template #page-content>
      <add-wallet-form v-if="activeLink==='add'" :account="account" @close="activeLink=''"/>
    </template>
  </dashboard-layout>
</template>

<script>

  import DashboardLayout from 'components/dashboards/DashboardLayout';
  import AddWalletForm from '@sparkz-community/common-client-lib/src/components/banks/AddWalletForm';
  import {useFindPaginate} from '@sparkz-community/common-client-lib';
  import {computed, inject, ref} from 'vue';

  export default {
    name: 'bank-dashboard',
    components: {AddWalletForm, DashboardLayout},
    props: {
      account: {
        type: Object,
        required: true,
      },
    },

    setup(props) {
      const $lget = inject('$lget');
      const query = computed(()=>({
        account: $lget(props.account, '_id'),
      }));
      const params = computed(()=>({
        debounce: 500,
      }));
      const {items: wallets} = useFindPaginate({
        limit: ref(12),
        qid: ref('wallets'),
        query,
        params
      });
      return {
        wallets
      };
    },
    data() {
      return {
        activeLink: 'add',
        hideDrawer: false,
      };
    },
    mounted() {
      if (this.$q.screen.sm) {
        this.hideDrawer = true;
      }
    },
    computed: {
      bankLinks() {
        return this['wallets'].map(wallet => ({
          icon: 'fas fa-money-check-alt',
          title: this.$lget(wallet, ['tally_bank_business_profile', 'accountName']),
          path: this.$lget(wallet, ['_id']),
          caption: this.$lget(wallet, ['tally_bank_business_profile', 'availableBalance'], '5400 available'),
        }));
      },
    },
    methods: {
      showAddBusinessProfile() {
        this.activeLink = 'add';
        if (this.$q.screen.sm || this.$q.screen.xs) {
          this.hideDrawer = true;
        }
      },
    },
  };
</script>
