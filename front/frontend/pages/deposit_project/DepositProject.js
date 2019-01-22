const LangMixin = require('../../../common/mixins/LangMixin');
const FormMixin = require('../../../common/mixins/FormMixin');
const FormCleanerMixin = require('../../../common/mixins/FormCleanerMixin');

const APIRoutes = require('../../../common/api/routes');
const Messages = require('../../../common/api/messages');

module.exports = {
    mixins: [LangMixin, FormMixin, FormCleanerMixin],
    data() {
        return {
            state: {
                sinks: {
                    creations: {
                        project: 'project_creation',
                    },
                    reads: {
                        user_forms: 'user_forms_read',
                    },
                },
                paths: {
                    creations: {
                        project: APIRoutes.entity('project', 'POST'),
                    },
                    reads: {
                        user_forms: APIRoutes.entity('form', 'POST', true),
                    },
                },
                statuses: {
                    creations: {
                        project: 'nc',
                    },
                },
            },
        };
    },
    methods: {
        save(entity) {
            this.$store.dispatch('create', {
                form: this.state.sinks.creations[entity],
                path: this.state.paths.creations[entity],
                body: this.fcontent(this.state.sinks.creations[entity]),
            });
        },
        show_error(sink) {
            if (sink === this.state.sinks.creations.project) {
                this.state.statuses.creations.project = 'nok';
            }
            setTimeout(() => {
                this.state.statuses.creations.project = 'nc';
            }, 10000);
        },
        show_success(sink) {
            if (sink === this.state.sinks.creations.project) {
                this.state.statuses.creations.project = 'ok';
            }
            setTimeout(() => {
                this.state.statuses.creations.project = 'nc';
            }, 3000);
        },
    },
    computed: {
        user_forms() {
            const content = this.fcontent(this.state.sinks.reads.user_forms);
            if (!(content instanceof Array) || content.length === 0) {
                return () => [];
            }
            return (f) => {
                const r = content.filter(c => c.name === f);
                if (r.length > 0) {
                    return r[0];
                }
                return [];
            };
        },
    },
    mounted() {
        this.$store.commit(Messages.INITIALIZE, {
            form: this.state.sinks.reads.user_forms,
            keep_content: false,
        });

        this.$store.dispatch('search', {
            form: this.state.sinks.reads.user_forms,
            path: this.state.paths.reads.user_forms,
            body: {
                where: {
                    name: ['project_form'],
                },
                population: ['fields.subform', 'fields.datasource'],
            },
        });
    },
};
