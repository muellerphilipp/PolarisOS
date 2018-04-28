const Messages = require('../../../../common/api/messages');
const APIRoutes = require('../../../../common/api/routes');
const LangMixin = require('../../../../common/mixins/LangMixin');
const FormMixin = require('../../../../common/mixins/FormMixin');
const PaginationSearchMixin = require('../../../../common/mixins/PaginationSearchMixin');
const FormCleanerMixin = require('../../../../common/mixins/FormCleanerMixin');
const Auth = require('../../../../common/utils/auth');
const Handlebars = require('../../../../../app/modules/utils/templating');

const Toastr = require('toastr');
const Results = require('./Results.vue');

module.exports = {
    mixins: [LangMixin, FormMixin, PaginationSearchMixin, FormCleanerMixin],
    props: {
    },
    components: {
        Results,
    },
    data() {
        return {
            state: {
                loggedIn: false,
                export_type: '',
                export_subtype: null,
                select_all_to_export: false,
                sinks: {
                    reads: {
                        export: 'exporter_read',
                    },
                },
            },
        };
    },
    methods: {
        export_format(format, subtype) {
            this.state.export_type = format;
            this.state.export_subtype = subtype;

            this.$store.commit(Messages.COLLECT, {
                form: this.state.sinks.reads.export,
            });
        },
        select_export_csl(value) {
            if (value) {
                this.export_format('csl', value.value);
            }
        },
        send_information(sink) {
            if (sink === this.state.sinks.reads.export) {
                this.run_export(sink);
            } else if (sink === this.searchSink) {
                /* this.$store.commit(Messages.INITIALIZE, {
                    form: this.state.sinks.reads.export,
                    keep_content: false,
                });*/
                this.add_extra_filters(sink, 'pos_aggregate', '*');
                this.run_search(sink);
            }
        },
        run_export(sink) {
            const content = this.fcontent(sink);
            const ids = this.$lodash.reduce(content, (arr, val, key) => {
                if (val) {
                    arr.push(key);
                }
                return arr;
            }, []);

            if (ids.length === 0) {
                Toastr.error(this.lang('l_please_select_export'));
            } else {
                this.$store.dispatch('download', {
                    path: APIRoutes.export(),
                    body: {
                        ids,
                        type: this.state.export_type || null,
                        subtype: this.state.export_subtype || null,
                    },
                });
            }
        },
    },
    watch: {
        current_state_export(s) {
            this.dispatch(s, this, this.state.sinks.reads.export);
        },
        select_all_to_export(s) {
            this.state.select_all_to_export = s;
            if (s) {
                const obj = this.content.reduce((o, info) => {
                    o[info._id] = true;
                    return o;
                }, {});
                this.$store.commit(Messages.TRANSFERT_INTO_FORM, {
                    form: this.state.sinks.reads.export,
                    body: obj,
                });
            } else {
                this.$store.commit(Messages.TRANSFERT_INTO_FORM, {
                    form: this.state.sinks.reads.export,
                    body: undefined, // Force to remove content
                });
            }
        },
    },
    computed: {
        content() {
            const content = this.fcontent(this.resultSink);
            if (!(content instanceof Array)) {
                return [];
            }

            const tpl = '{{#people_join authors}}{{#if mswId}}<a href="/a/{{mswId}}/profile">{{fullName}}</a>{{else}}{{fullName}}{{/if}}{{/people_join}}, {{moment date=dates.publication format="YYYY"}}. {{titles.0.value}}.';
            return content.map((c) => {
                const masterDates = c.dates.filter(d => d.dateType === 'masterDate');
                if (masterDates.length > 0) {
                    c._dates = {
                        publication: parseInt(masterDates[0].date),
                    };
                } else {
                    c._dates = {
                        publication: 0,
                    };
                }

                c.authors = c.contributors.filter(contrib => contrib.role === 'Author');
                c.authors = c.authors.map((a) => {
                    const ids = a.contributorIds.filter(cid => cid.type === 'msw');
                    a.mswId = ids.length === 0 ? null : ids[0].value;
                    return a;
                });
                c.html = this.hlang(Handlebars.compile(tpl)(c));
                return c;
            });
        },
        select_all_to_export() {
            return this.state.select_all_to_export;
        },
        total() {
            const form = this.fform(this.resultSink);
            return form.total || 0;
        },
        current_state_export() {
            return this.fstate(this.state.sinks.reads.export);
        },
        user() {
            return Auth.user();
        },
        csl_export_styles() {
            return [
                { label: 'APA', value: 'apa' },
                { label: 'Vancouver', value: 'vancouver' },
                { label: 'Harvard (1)', value: 'havard1' },
                { label: 'Population', value: 'population' },
                { label: 'Chicago', value: 'chicago' },
                { label: 'Springer Humanities', value: 'springer-humanities' },
                { label: 'ISO-690', value: 'iso690' },
                { label: 'HCERES', value: 'ined-hceres' },
            ];
        },
        export_data() {
            return [
                { label: this.lang('f_export_bibtex'), value: 'bibtex' },
                { label: this.lang('f_export_ris'), value: 'ris' },
                { label: this.lang('f_export_csv'), value: 'csv' },
            ];
        },
    },
    beforeMount() {
        Auth.loggedIn('publication', ['c', 'u']).then((ok) => {
            this.state.loggedIn = ok;
        }).catch(err => console.error(err));
    },
};
