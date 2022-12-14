<template>
  <q-expansion-item v-if="item.children"
                    :icon="item.icon"
                    :label="item.title"
                    :caption="item.caption"
                    :default-opened="defaultOpen(item)"
                    expand-separator
                    :content-inset-level=".1"
                    :class="`menuitem-ei-${item.id} ` + itemClass"
                    :active-class="itemActiveClass"
                    @click="onClick"
                    @show="onShow"
                    @hide="onHide">
    <q-tooltip anchor="top right" self="center middle" :target="`.menuitem-ei-${item.id} i`">
      {{ item.title }}
    </q-tooltip>
    <menu-list-item v-for="childItem in item.children" v-bind:key="childItem.id" :item="childItem"
                    :active-class="itemActiveClass"/>
  </q-expansion-item>
  <q-item v-else
          clickable
          v-ripple
          v-bind:key="item.path"
          :to="item.to ? item.to : {name: item.name}"
          exact
          :class="itemClass"
          :active-class="itemActiveClass">
    <q-item-section avatar>
      <!-- Workaround for badge, if desired to show when menus is collapsed
      <div class="relative-position" style="width:25px;margin-left:2px">
        <q-icon :name="item.icon" size="24px">
        </q-icon>
        <q-badge v-if="item.badge && !collapsed" :label="item.badge" floating/>
      </div>-->
      <q-icon v-if="item.icon" :name="item.icon"></q-icon>
      <q-tooltip anchor="top right" self="center middle">
        {{ item.title }}
      </q-tooltip>
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ item.title }}</q-item-label>
      <q-item-label v-if="item.caption" caption>{{ item.caption }}</q-item-label>
    </q-item-section>

    <q-item-section v-if="hasSide" side :top="isSideTop">
      <q-badge v-if="item.badge" :color="item.badgeColor || 'primary'" :label="item.badge"/>
      <q-item-label v-if="item.sideCaption" caption>{{ item.sideCaption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
  export default {
    name: 'MenuListItem',
    props: {
      item: {
        type: Object,
        default: null,
      },
      collapsed: {
        type: Boolean,
        default: true,
      },
      activeClass: {
        type: String,
        default: '',
      },
    },
    emits: [
      'expansionItemClick',
      'itemExpanded',
      'itemCollapsed',
    ],
    data: function () {
      return {};
    },
    computed: {
      itemClass: function () {
        return this.item.class ? this.item.class : '';
      },
      itemActiveClass: function () {
        return this.item.activeClass ? this.item.activeClass : this.activeClass;
      },
      hasSide: function () {
        return 'badge' in this.item || 'sideCaption' in this.item;
      },
      isSideTop: function () {
        return 'caption' in this.item || 'sideCaption' in this.item;
      },
    },
    methods: {
      defaultOpen(item) {
        let self = this;
        let children = [item];
        (function getAllChildren(child) {
          if (self.$lget(child, 'children', []).length) {
            children.push(...child.children);
            child.children.forEach(nChild => {
              getAllChildren(nChild);
            });
          }
        })(item);

        return children.some(child => {
          return self.$lget(child, 'path') ? (self.$router.resolve(child).href === self.$router.resolve(this.$route).href) : false;
        });
      },
      onClick(evt) {
        this.$emit('expansionItemClick', evt);
      },
      onShow(evt) {
        this.$emit('itemExpanded', evt);
      },
      onHide(evt) {
        this.$emit('itemCollapsed', evt);
      },
    },
  };
</script>
