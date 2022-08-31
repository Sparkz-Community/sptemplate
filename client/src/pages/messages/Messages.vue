<template>
  <dashboard-layout :dashboard-side-menu-links="messageLinks"
                    @clicked-link="onSelectLink">
    <template #side-menu-top>
      <q-btn class="q-mb-md q-mt-xs fill-width"
             rounded
             size="md"
             icon="fas fa-pencil-alt"
             :outline="$q.dark.mode"
             label="Compose"
             @click="showInbox = true; msgToEdit = undefined;" />
    </template>
    <template #page-toolbar>
      <div>
        <div>
          <q-input outlined
                   v-model="filter.words"
                   dense
                   :placeholder="searchPlaceholder"
                   @focus="onFilterInput">
            <template #prepend>
              <q-btn style="margin-left:-0.5rem;"
                     round
                     flat
                     dense
                     size="md"
                     icon="search" />
            </template>
          </q-input>
        </div>
        <q-slide-transition>
          <div v-if="showFilters" class="gt-xs row justify-between no-wrap">
            <div class="row q-gutter-sm q-my-sm no-wrap filter-scroll-area">
              <q-chip dark
                      @click="toggleSelected(filter)"
                      :selected="selectedFilters.some(f => f.label === filter.label)"
                      rounded
                      size="sm"
                      v-for="filter in filterOptions"
                      :key="filter.label"
                      :color="filter.color"
                      :icon="filter.icon">
              </q-chip>
            </div>
            <div class="row q-gutter-sm items-center no-wrap" style="float:right;">
              <q-btn flat
                     icon="filter"
                     label="add filter"
                     aria-label="Add Filter"
                     @click="showAddFilters = true" />
              <q-btn flat
                     dense
                     icon="close"
                     aria-label="Close Filters"
                     @click="closeFilters" />
            </div>
          </div>
        </q-slide-transition>
      </div>
    </template>

    <template #close-drawer-btn>
      <transition v-if="showFilters && !$q.screen.xs"
                  appear
                  enter-active-class="animated fadeOut"
                  leave-active-class="animated fadeIn">
        <span />
      </transition>
    </template>

    <template #page-content>
      <q-slide-transition>
        <q-card flat
                square
                v-if="showAddFilters"
                class="q-pa-md"
                style="margin-top: -2rem; margin-right:-1rem; margin-left: -0.4rem;">

          <div class="row q-gutter-sm items-center">
            <accounts-filter label="From:"
                             hint="Search senders by name or email"
                             v-model="filter.from" />
          </div>
          <div class="row q-gutter-sm items-center justify-end">
            <accounts-filter label="To:"
                             hint="Search recipients by name or email"
                             v-model="filter.to" />

          </div>
          <div class="row q-gutter-sm items-center justify-end">
            <q-input hint="Search by subject" label="Subject:" v-model="query.subject.$regex" style="flex: 1;" dense />
          </div>
          <div class="row q-gutter-sm items-center justify-end">
            <q-input hint="Body includes" label="Has Words:" v-model="query.body.$regex" style="flex: 1;" dense />
          </div>
          <div class="row q-gutter-sm items-center justify-end">
            <q-input hint="Body does not include" label="Has Words:" v-model="filter.nowords" style="flex: 1;" dense />
          </div>
          <div class="row q-gutter-sm items-center justify-between">
            <date-piker label="From Date" v-model="filter.fromDate" dense style="width: 100%" />
            <date-piker label="To Date" v-model="filter.toDate" dense style="width: 100%" />
          </div>
          <div class="row q-gutter-sm items-center justify-between q-py-md">
            <q-checkbox class="text-caption"
                        style="margin-left:-0.1rem;"
                        v-model="filter.hasAttachment"
                        :true-value="true"
                        label="Has attachment(s)" />
            <div :class="`row q-gutter-md ${$q.screen.xs ? 'justify-between': 'justify-end'}`">
              <q-btn class="gt-xs" flat label="Save filter" no-caps @click="saveFilter" />
              <q-btn color="primary" label="Search" no-caps @click="filterMessages" />
            </div>
          </div>
        </q-card>
      </q-slide-transition>

      <div class="content-area" :style="showAddFilters ? 'z-index:-1' : 'z-index:0'">

        <table-template flat
                        square
                        v-bind="attrs"
                        row-key="_id"
                        :rows="messages"
                        :selection="messages.length > 0 ? 'multiple' : 'single'"
                        v-model:selected="selected"
                        :columns="columns"
                        rows-per-page-label="Messages Per Page"
                        v-model:pagination="pagination"
                        @request="setPagination"
                        :grid="($q.screen.sm || $q.screen.xs)"
                        table-class="cursor-pointer"
                        @row-click="onOpenMessage"
                        :open-add-form="openMessageProps.openMessage"
                        :loading="isFindMessagesPending">

          <template #no-data>
            No messages in {{ capitalize(link) }}
          </template>

          <template v-if="link !== 'outbox'" #body-cell-from="props">
            <q-td key="from">
              <div class="flex row items-center">
                <!--<q-avatar v-if="$lget(props,['row','_fastjoin',props.col.name,'avatar','raw','file'])">-->
                <!--  <q-img :src="$lget(props,['row','_fastjoin',props.col.name,'avatar','raw','file'])" />-->
                <!--</q-avatar>-->
                <div class="q-my-xs q-mr-xl row items-center">
                  <random-avatar size="lg"
                                 :user="$lget(props, ['row', '_fastjoin', 'from'])"
                                 :menu="false"
                                 class="q-mr-sm" />
                  <p class="tableText tableName">{{ $lget(props, ['row', '_fastjoin', 'from', 'name']) }}</p>
                </div>
                <q-badge v-if="$lget(activeAccount, 'unseenMessages', []).includes($lget(props, '_id'))"
                         id="newBadge"
                         class="q-ml-sm"
                         align="middle">
                  New!
                </q-badge>
              </div>
            </q-td>
          </template>

          <template v-else #body-cell-to="props">
            <q-td key="to" :props="props">
              <div v-if="$lget(props, ['row', 'to']).length > 0"
                   class="q-my-xs q-mr-xl row items-center">
                <vue-group-avatar
                  :avatars="$lget(props, ['row', '_fastjoin', 'to'], [])
                    .map(acc => $lget(acc, ['avatar', 'raw', 'file']))"
                  :max="2" />
                <!--{{ $lget(props, ['_fastjoin', 'to']).map(acc => $lget(acc, ['avatar', 'raw', 'file'])) }}-->
              </div>

              <!--<div v-else class="q-my-xs q-mr-xl row items-center">-->
              <div class="q-my-xs q-mr-xl row items-center">
                <!--<q-avatar v-if="$lget(props,['_fastjoin',props.col.name,'avatar','raw','file'])">-->
                <!--  <q-img :src="$lget(props,['_fastjoin',props.col.name,'avatar','raw','file'])" />-->
                <!--</q-avatar>-->
                <random-avatar size="lg"
                               :user="$lget(props, ['row', '_fastjoin', 'to'])"
                               :menu="false" />
                <p class="tableText tableName">{{ $lget(props, ['row', '_fastjoin', 'to', 'name']) }}</p>
              </div>
            </q-td>
          </template>

          <template #body-cell-subject="props">
            <q-td key="subject">
              <div style="max-width: 16rem;" class="ellipsis text-caption">
                <p class="tableText tableSubject">{{ $lget(props, ['row', 'subject']) }}</p>
              </div>
            </q-td>
          </template>

          <template #body-cell-body="props">
            <q-td key="body">
              <div style="max-width: 16rem;" class="ellipsis text-caption">
                <p class="tableText tableBody">{{ $lget(props, ['row', 'body']) }}</p>
              </div>
            </q-td>
          </template>

          <template #body-cell-actions>
            <q-td>
              <q-btn icon-right="delete"
                     no-caps
                     flat
                     dense
                     @click.stop="openDeleteConfirm(props.row)" />
            </q-td>
          </template>

          <template v-if="($q.screen.sm || $q.screen.xs)" #item="props">
            <q-item clickable v-ripple style="min-width:100%" @click="onOpenMessage($event, props.row)">
              <q-item-section top avatar>
                <div v-if="link === 'inbox'">
                  <random-avatar size="lg"
                                 :user="$lget(props, ['row', '_fastjoin', 'from'])"
                                 :menu="false" />
                </div>
                <div v-if="link === 'outbox'">

                  <div v-if="$lget(props, ['row', '_fastjoin', 'to']).length">
                    <vue-group-avatar :avatars="$lget(props, ['row', '_fastjoin', 'to'])
                                          .map(acc => $lget(acc, ['avatar', 'raw', 'file']))"
                                      :max="2" />
                  </div>

                  <div v-else>
                    <!--<q-avatar v-if="$lget(props,['row','_fastjoin','to','avatar','raw','file'])">-->
                    <!--  <q-img :src="$lget(props,['row','_fastjoin','to','avatar','raw','file'])" />-->
                    <!--</q-avatar>-->
                    <random-avatar size="lg"
                                   :user="$lget(props, ['row', '_fastjoin', 'to'])"
                                   :menu="false" />
                    <!--<p>{{ $lget(props, ['row', '_fastjoin', 'to', 'name']) }}</p>-->
                  </div>
                </div>
              </q-item-section>

              <q-item-section>
                <q-item-label lines="1">{{ $lget(props.row, 'subject') }}</q-item-label>
                <q-item-label caption lines="2">
                  <div v-html="$lget(props.row, 'body')" class="ellipsis text-caption" />
                </q-item-label>
              </q-item-section>

              <q-item-section side top>
                <q-btn icon-right="delete"
                       no-caps
                       flat
                       dense
                       @click.stop="openDeleteConfirm(props.row)" />
              </q-item-section>
            </q-item>
            <q-separator style="width: 100%" />
          </template>

          <view-message :openMessageProps="openMessageProps"
                        :msgToEdit="msgToEdit"
          >
          </view-message>

          <template v-for="(_, slot) of $slots" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope" />
          </template>

        </table-template>
      </div>
    </template>
  </dashboard-layout>
</template>

<script>
  import {capitalize, kebabize, singularize} from '@sparkz-community/common-client-lib/src/utils';
  import DashboardLayout from 'components/dashboards/DashboardLayout';
  import AccountsFilter from 'pages/messages/components/accounts-filter';
  import DatePiker from 'pages/messages/components/date-piker';
  // eslint-disable-next-line no-unused-vars
  import {routerMixin, useFindPaginate} from '@sparkz-community/common-client-lib';
  import TableTemplate
    from '@sparkz-community/common-client-lib/src/components/common/molecules/tables/TableTemplate.vue';
  import RandomAvatar from 'components/profile/RandomAvatar/RandomAvatar';
  import VueGroupAvatar from 'pages/messages/components/VueGroupAvatar/VueGroupAvatar';

  import useMessages from 'stores/services/messages';
  import {computed, inject, ref} from 'vue';
  import ViewMessage from 'pages/messages/components/viewMessage';

  export default {
    name: 'Messages',
    inheritAttrs: false,
    components: {
      ViewMessage,
      VueGroupAvatar,
      RandomAvatar,
      TableTemplate,
      DatePiker,
      AccountsFilter,
      DashboardLayout,
    },
    setup() {
      const $lget = inject('$lget');
      const $lmerge = inject('$lmerge');
      const activeAccount = inject('activeAccount');
      const messagesStore = useMessages();

      const filter = ref({
        words: '',
        fromDate: '',
        toDate: '',
        hasAttachment: false,
      });
      const link = ref('inbox');
      const selectedFilters = ref([]);
      const linkQuery = ref({
        _id: {
          $in: $lget(activeAccount, link.value, []),
        },
      });

      const selectedFilterQuery = computed(() => {
        let selectedFilterQuery = {};
        selectedFilters.value.map(selectedFilter => {
          $lmerge(selectedFilterQuery, $lget(selectedFilter, 'query', {}));
        });
        return selectedFilterQuery;
      });
      const searchBoxQuery = computed(() => {
        const words = $lget(filter.value, 'words');
        return {
          $or: [
            {
              subject:
                {
                  $regex: words,
                  $options: 'igm',
                },
            },
            {
              body:
                {
                  $regex: words,
                  $options: 'igm',
                },
            },
          ],
        };
      });

      const messagesQuery = computed(() => {
        return Object.assign(
          {},
          {
            $sort: {
              updatedAt: -1,
              status: 'new',
            },
          },
          linkQuery.value,
          selectedFilterQuery.value,
          searchBoxQuery.value,
        );
      });
      const messagesParams = computed(() => {
        return {
          // paginate: false,
          ['in-app-messages_fJoinHookResolversQuery']: {
            from: true,
            to: true,
          },
          replyResolversQuery: {
            replies: true,
          },
        };
      });

      const {
        items: messages,
        itemsCount: messagesTotal,
        pagination: messagesPagination,
        currentPage: messagesCurrentPage,
        isPending: isFindMessagesPending,
      } = useFindPaginate({
        model: messagesStore.Model,
        qid: ref('messages'),
        skip: ref(0),
        limit: ref(8),
        query: messagesQuery,
        params: messagesParams,
      });

      return {
        messages,
        messagesTotal,
        messagesPagination,
        messagesCurrentPage,
        isFindMessagesPending,
        messagesQuery,
        linkQuery,
        link,
        filter,
        searchBoxQuery,
        selectedFilters,
        selectedFilterQuery,
      };
    },
    mixins: [
      routerMixin({
        name: 'msgPaths',
        parseQuery(val, key) {
          if (['openMessage', 'linkQuery'].includes(key)) {
            return JSON.parse(val);
          } else {
            return val;
          }

        },
        query() {
          return {
            link: this.link,
            linkQuery: JSON.stringify(this.linkQuery),
            openMessage: this.openMessageProps.openMessage,
            openedMessageId: this.openMessageProps.openedMessageId,
          };
        },
        runWhen: this.runRouterMixin,
      }),
    ],
    inject: [
      'activeAccount',
    ],
    data() {
      const DAY_MS = 7 * 24 * 60 * 60 * 1000;
      return {
        selected: [],
        pagination: {
          sortBy: 'desc',
          descending: false,
          page: 1,
        },
        filterOptions: [
          {
            icon: 'fas fa-book-reader',
            label: 'Opened',
            color: 'green',
            query: {
              status: 'opened',
            },
          },
          {
            icon: 'fas fa-calendar',
            label: 'Las 7 days',
            color: 'red',
            query: {
              createdAt: {
                $gt: new Date().getTime() - DAY_MS,
              },
            },
          },
          {
            icon: 'attachment',
            label: 'Has attachment',
            color: 'orange',
            query: {
              attachments: {$ne: []},
            },
          },
        ],
        showFilters: false,
        showAddFilters: false,
        showInbox: false,
        runRouterMixin: false,
        // checkAll: false,
        // check1: false,
        // check2: false,
        // model: null,
        // options: [],
        // contacts,
        query: {
          subject:
            {
              $regex: '',
              $options: 'igm',
            },
          body:
            {
              $regex: '',
              $options: 'igm',
            },
        },
        openMessageProps: {
          openMessage: false,
          openedMessage: undefined,
          openedMessageId: undefined,
        },
        downloading: false,
        msgToEdit: undefined,
        isReply: false,
        dialogTitle: 'New Message',
      };
    },
    // beforeCreate() {
    //   this.onSelectLink(this.link);
    // },
    watch: {
      // link: {
      //   immediate: true,
      //   deep: true,
      //   handler(newVal) {
      //     if (newVal !== 'trash') {
      //       this.linkQuery = {
      //         _id: {
      //           $in: this.$lget(this.activeAccount, newVal, []),
      //         },
      //       };
      //     } else {
      //       this.linkQuery = {
      //         $and: [
      //           {
      //             _id: {
      //               $nin: this.$lget(this.activeAccount, 'outbox', [])
      //                 .concat(this.$lget(this.activeAccount, 'inbox', [])),
      //             },
      //           },
      //           {
      //             $or: [
      //               {from: this.$lget(this.activeAccount, '_id')},
      //               {to: this.$lget(this.activeAccount, '_id')},
      //             ],
      //           },
      //         ],
      //       };
      //     }
      //   },
      // },
      filter: {
        deep: true,
        handler(newValue) {
          if (newValue.fromDate) {
            // eslint-disable-next-line no-unused-vars
            const froUnixTimestamp = Math.floor(new Date(newValue.fromDate).getTime() / 1000);
            // console.log(froUnixTimestamp);
          }
          if (newValue.toDate) {
            // eslint-disable-next-line no-unused-vars
            const toUnixTimestamp = Math.floor(new Date(newValue.toDate).getTime() / 1000);
            // console.log(toUnixTimestamp);
          }
          if (newValue.hasAttachment) {
            this.$lset(this.query, 'attachments', {$ne: []});
          } else {
            this.$lunset(this.query, 'attachments');
          }
        },
      },
      // columns: {
      //   immediate: true,
      //   // eslint-disable-next-line no-unused-vars
      //   handler(newVal) {
      //     const cols = this.visibleColumns /*|| newVal*/;
      //     console.log(cols);
      //     // this.visibleColumns = ['actions', ...cols];
      //     this.visibleColumns = cols;
      //     console.log(this.visibleColumns);
      //   },
      // },
      // linkQuery: {
      //   immediate: true,
      //   deep: true,
      // },
      // messages: {
      //   immediate: true,
      //   handler(newVal) {
      //     if (!Array.isArray(newVal) || Array.isArray(newVal) && !newVal[0]) {
      //       this.columns = [];
      //     } else {
      //       const cols = Object.keys(newVal[0]).filter(column => {
      //         return column !== 'actions' && column !== '_fastjoin' && column !== 'updatedByHistory' && column !== '_id';
      //       });
      //       this.columns = cols.map(col => ({
      //         label: this.capitalize(this.kebabize(col).replace('-', ' ')),
      //         value: col,
      //       }));
      //       const id = this.$lget(this.$route, ['query', 'openMessageProps.openedMessageId']);
      //       this.openMessageProps.openedMessage = newVal.find(msg => msg._id === id);
      //     }
      //   },
      // },
      messagesTotal: {
        immediate: true,
        handler(newVal, oldVal) {
          if (newVal !== oldVal) {
            this.pagination.rowsPerPage = this.messagesPagination.$limit;
            this.pagination.rowsNumber = newVal;
          }
        },
      },
    },
    computed: {
      attrs() {
        let newVal = {...this.$attrs};
        return newVal;
      },
      columns() {
        if (this.link === 'outbox') {
          return [
            {
              name: 'to',
              label: 'To',
              field: 'to',
              align: 'left',
            },
            {
              name: 'subject',
              label: 'Subject',
              field: 'subject',
              align: 'left',
            },
            {
              name: 'body',
              label: 'Body',
              field: 'body',
              align: 'left',
            },
            {
              name: 'actions',
              label: 'Actions',
              field: '',
              align: 'right',
            },
          ];
        }
        return [
          {
            name: 'from',
            label: 'From',
            field: 'from',
            align: 'left',
          },
          {
            name: 'subject',
            label: 'Subject',
            field: 'subject',
            align: 'left',
          },
          {
            name: 'body',
            label: 'Body',
            field: 'body',
            align: 'left',
          },
          {
            name: 'actions',
            label: 'Actions',
            field: '',
            align: 'left',
          },
        ];
      },
      messageLinks() {
        // const newInbox = this.messages.filter(message => {
        //   return this.activeAccount.inbox.includes(message._id) && message.status === 'new'.length;
        // });

        const inbox = this.$lget(this.activeAccount, 'inbox', []).length;
        const outbox = this.$lget(this.activeAccount, 'outbox', []).length;
        return [
          {
            icon: 'fas fa-inbox',
            title: 'Inbox',
            path: 'inbox',
            caption: `${inbox} received`,
          },
          {
            icon: 'fas fa-paper-plane',
            title: 'Outbox',
            path: 'outbox',
            caption: `${outbox} sent`,
          },
          {
            icon: 'fas fa-trash-alt',
            title: 'Trash',
            path: 'trash',
          },
        ];
      },
      searchPlaceholder() {
        if (this.link === 'inbox') {
          return this.$q.screen.xs ? 'Search all' : 'Search all conversations';
        }
        const otherSearches = this.link.length > 6 ? '...' : this.link;
        return this.$q.screen.xs ? `Search ${otherSearches}` : `Search ${this.link}`;
      },
      selectAttrs() {
        return {
          'option-value': '_id',
          'option-label': 'name',
          dense: true,
          behavior: 'menu',
          'transition-show': 'fade-in',
          'transition-hide': 'fade-out',
          multiple: true,
          'options-dense': true,
          class: 'text-caption',
          'emit-value': true,
          'map-options': true,
          'options-cover': true,
        };
      },
    },
    methods: {
      capitalize, kebabize, singularize,
      onFilterInput() {
        this.showFilters = true;
        if (this.$q.screen.xs) {
          this.showAddFilters = true;
        }
      },
      toggleSelected(filter) {
        if (this.selectedFilters.some(f => f.label === filter.label)) {
          this.selectedFilters = this.selectedFilters.filter(f => f.label !== filter.label);
        } else {
          this.selectedFilters.push(filter);
        }
      },

      // selectedToAccounts(newVal) {
      //   console.log('selected: ', newVal);
      // },
      // selectedFroAccounts(newVal) {
      //   console.log('selected: ', newVal);
      // },
      closeFilters() {
        this.showAddFilters = false;
        this.showFilters = false;
      },
      filterMessages() {
        // TODO: search filter
        this.closeFilters();
      },
      saveFilter() {
        // TODO: create new message filter
        this.closeFilters();
      },
      handleSelected(value) {
        if (this.selected.some(item => item._id === this.$lget(value, '_id'))) {
          this.selected = this.selected.filter(item => item._id !== value._id);
        } else {
          this.selected.push(value);
        }

      },
      setPagination(newVal) {
        this.messagesPagination.$limit =
          newVal.pagination.rowsPerPage === 0 ? this['messagesTotal'] : newVal.pagination.rowsPerPage;
        this.messagesCurrentPage = newVal.pagination.page;
        this.pagination = newVal.pagination;

        if (newVal.pagination.sortBy) {
          this.sort = {[newVal.pagination.sortBy]: newVal.pagination.descending ? -1 : 1};
        } else {
          this.sort = {
            status: 'new',
            createdAt: -1,
          };
        }
      },
      onSelectLink(value) {
        this.link = value;
        this.openMessageProps.openMessage = false;
        this.openMessageProps.openedMessage = undefined;
        if (value !== 'trash') {
          this.linkQuery = {
            _id: {
              $in: this.$lget(this.activeAccount, value, []),
            },
          };
        } else {
          this.linkQuery = {
            $and: [
              {
                _id: {
                  $nin: this.$lget(this.activeAccount, 'outbox', [])
                    .concat(this.$lget(this.activeAccount, 'inbox', [])),
                },
              },
              {
                $or: [
                  {from: this.$lget(this.activeAccount, '_id')},
                  {to: this.$lget(this.activeAccount, '_id')},
                ],
              },
            ],
          };
        }
        this.runRouterMixin = true;
      },
      onOpenMessage(evt, row) {
        this.openMessageProps.openMessage = true;
        this.openMessageProps.openedMessageId = row._id;
        this.openMessageProps.openedMessage = row;
        if (this.$lget(this.activeAccount, 'unseenMessages', []).includes(row._id)) {
          this.activeAccount.patch({
            data: {
              $pull: {
                unseenMessages: row._id,
              },
            },
          }).then(() => {
            // console.log(`removed ${row.subject} from unseenTasks`);
          });
        }
      },
      async downloadItem(att) {
        try {
          const url = this.$lget(att, 'path', this.$lget(att, 'href'));
          const label = this.$lget(att, 'filename');
          const ext = label.split('.')[1];
          this.downloading = true;
          const response = await this.$axios.get(url, {responseType: 'blob'});

          const blob = new Blob([response.data], {type: `application/${ext}`});
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = label;
          link.click();
          URL.revokeObjectURL(link.href);
          this.downloading = false;
        } catch (e) {
          this.downloading = false;
          this.$q.notify({
            message: `Download failed: ${e.message}`,
            color: 'negative',
            textColor: 'white',
            icon: 'warning',
          });
        }
      },
      replyMsg() {
        this.msgToEdit = undefined;
        this.showInbox = true;
        this.isReply = true;
        this.dialogTitle = 'Reply';
        const isReply = this.isReply;
        const subject = this.$lget(this.openMessageProps.openedMessage, 'subject');
        const to = this.$lget(this.openMessageProps.openedMessage, ['_fastjoin', 'from', 'email']);
        const _id = this.$lget(this.openMessageProps.openedMessage, '_id');
        this.msgToEdit = {_id, to, subject, body: '', isReply};
      },
      closeDialog() {
        this.showInbox = false;
        this.isReply = false;
      },
      openDeleteConfirm(messageToDelete) {
        this.$q.dialog({
          title: 'Delete Message?',
          message: 'Are you sure you want to delete this message?',
          ok: {
            push: true,
            color: 'primary',
          },
          cancel: {
            color: 'negative',
            push: true,
            outline: true,
          },
          persistent: true,
        }).onOk(async () => {
          try {
            const {_id, from, to} = messageToDelete;
            // console.log('outbox: ', to, ': ', this.$lget(this.activeAccount, '_id'));
            // if you are the sender
            if (from === this.$lget(this.activeAccount, '_id')) {
              const messagesYouSent = this.$lget(this.activeAccount, 'outbox', []);
              // remove this  from the list of messages you sent
              const outbox = messagesYouSent.filter(id => (id !== _id));
              // console.log('outbox: ', outbox);
              await this.activeAccount.save({
                data: {outbox},
              });
              this.linkQuery = {
                _id: {
                  $in: outbox,
                },
              };
            } else if (to.includes(this.$lget(this.activeAccount, '_id'))) {
              // if you are the receiver
              const messagesYouReceived = this.$lget(this.activeAccount, 'inbox', []);
              // remove this  from the list of messages you sent
              const inbox = messagesYouReceived.filter(id => (id !== _id));
              // console.log('inbox: ', inbox);
              await this.activeAccount.save({
                data: {inbox},
              });
              this.linkQuery = {
                _id: {
                  $in: inbox,
                },
              };
            }
            this.messagesRefresh();

            this.$q.notify({
              type: 'positive',
              message: 'Message Deleted',
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
          } catch (err) {
            this.$q.notify({
              type: 'negative',
              message: err.message,
              timeout: 30000,
              actions: [
                {
                  icon: 'close',
                  color: 'white',
                  handler: () => {
                  },
                },
              ],
            });
          }

        });


      },
      sent() {
        this.showInbox = false;
        if (this.link !== 'trash') {
          this.linkQuery = {
            _id: {
              $in: this.$lget(this.activeAccount, [this.link], []),
            },
          };
        } else {
          this.linkQuery = {
            $and: [
              {
                _id: {
                  $nin: this.$lget(this.activeAccount, 'outbox', [])
                    .concat(this.$lget(this.activeAccount, 'inbox', [])),
                },
              },
              {
                $or: [
                  {from: this.$lget(this.activeAccount, '_id')},
                  {to: this.$lget(this.activeAccount, '_id')},
                ],
              },
            ],
          };
        }
        this.messagesRefresh();
      },
    },
  };
</script>

<style scoped lang="scss">
  .filter-scroll-area {
    float: left;
    width: 80%;
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: none;
    }

    .q-chip {
      flex: 0 0 auto;
    }
  }

  .content-area {
    position: absolute;
    top: 0;
    bottom: 2rem;
    width: 96%;
    overflow-x: hidden !important;
    margin-left: -0.4rem;
  }

  .tableText {
    margin: 0;
  }

  .tableSubject {
    font-size: 1.05rem;
    font-weight: 400;
  }

  .tableBody {
    opacity: .75;
  }
</style>
