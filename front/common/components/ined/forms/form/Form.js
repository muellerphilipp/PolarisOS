const Vue = require('vue');
const Messages = require('../../../../api/messages');
const APIRoutes = require('../../../../api/routes');
const EventHub = require('../../../../store/event_hub');
const FormMixin = require('../../../../mixins/FormMixin');

module.exports = {
    mixins: [FormMixin],
    props: {
        name: { default: 'default_form' },
        hasButtons: { default: true, type: Boolean },
        post_path: { type: String, required: true },
        put_path: { type: String, required: true },
        get_path: { type: String, required: true },
        get_form: { type: String, required: true },
        showErrors: { type: Boolean, default: true },
        mode: { type: String, default: 'default' },
        no_reinitialize_after_success: { type: Boolean, default: false },
    },
    data() {
        return {
            state: {
                mode: this.mode,
            },
        };
    },
    methods: {
        submit(e) {
            e.preventDefault();
            this.$store.commit(Messages.COLLECT, {
                form: this.name,
            });
        },
        cancel(e) {
            e.preventDefault();
            this.$store.commit(Messages.INITIALIZE, { form: this.name });
        },
        send_information() {
            if (this.path === '') {
                return;
            }

            this.$store.dispatch(this.dispatch_method, {
                path: this.path,
                rpath: this.get_path,
                rform: this.get_form,
                form: this.name,
                body: this.content,
            });
        },
        show_success() {
            if (this.state.method !== 'validate' || this.no_reinitialize_after_success) {
                setTimeout(() => {
                    this.$store.commit(Messages.INITIALIZE, {
                        form: this.name,
                    });
                }, 5000);
            }
        },
    },
    beforeMount() {
        EventHub.$on('form-click-on-submit', this.submit);
        EventHub.$on('form-click-on-cancel', this.cancel);
    },

    beforeDestroy() {
        EventHub.$off('form-click-on-submit');
        EventHub.$off('form-click-on-cancel');
        this.$store.commit(Messages.REMOVE_FORM, { form: this.name });
    },

    computed: {
        mode_text() {
            switch (this.state.mode) {
            case 'update':
                return this.lang('b_modify');
            case 'validate':
            case 'vupdate':
                return this.lang('b_validate');
            default:
            case 'default':
                return this.lang('b_save');
            }
        },
        path() {
            switch (this.state.mode) {
            case 'vupdate':
            case 'update':
                return this.put_path;
            case 'validate':
            case 'default':
            default:
                return this.post_path;
            }
        },
        dispatch_method() {
            switch (this.state.mode) {
            case 'update':
                return 'update';
            case 'validate':
            case 'vupdate':
                return 'validate';
            default:
            case 'default':
                return 'create';
            }
        },
        current_state() {
            return this.fstate(this.name);
        },
        error() {
            if (this.name in this.$store.state.forms) {
                const form = this.$store.state.forms[this.name];
                return form.error;
            }
            return { };
        },
        content() {
            if (this.name in this.$store.state.forms) {
                const form = this.$store.state.forms[this.name];
                return form.content;
            }
            return {};
        },
        success() {
            if (this.name in this.$store.state.forms) {
                const form = this.$store.state.forms[this.name];
                return form.success;
            }
            return '';
        },
    },

    watch: {
        content(n) {
            if (n instanceof Object && '_id' in n && n._id != null && n._id !== '') {
                if (this.mode === 'validate') {
                    this.state.mode = 'vupdate';
                } else {
                    this.state.mode = 'update';
                }
            } else {
                this.state.mode = this.mode;
            }
        },
        success(n) {
        },
        current_state(s) {
            this.dispatch(s, this);
        },
        mode(nm) {
            this.state.mode = nm;
        },
    },
};
