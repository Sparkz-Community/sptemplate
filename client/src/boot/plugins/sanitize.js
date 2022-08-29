import {boot} from 'quasar/wrappers';
import VueSanitize from 'boot/plugins/vueSanitize';

export default boot(({app}) => {
  const sanitize = app.mixin({
    methods: {
      sanitize(event, opts) {
        let options = Object.assign({}, VueSanitize.defaults);
        options.allowedTags = [...VueSanitize.defaults.allowedTags,
          ...JSON.parse(JSON.stringify(this.$lget(opts, 'allowedTags', [])))];

        return this.$sanitize(event, {...VueSanitize.defaults, ...options});
      },
    },
  });

  app.use(sanitize);
});
