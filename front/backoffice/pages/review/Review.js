const Utils = require('../../../common/utils/utils');
const Messages = require('../../../common/api/messages');
const APIRoutes = require('../../../common/api/routes');
const ReaderMixin = require('../../../common/mixins/ReaderMixin');
const LangMixin = require('../../../common/mixins/LangMixin');
const FiltersMixin = require('../../../common/mixins/FiltersMixin');
const OAMixin = require('../../../common/mixins/ObjectAccessMixin');
const FormCleanerMixin = require('../../../common/mixins/FormCleanerMixin');
const RemoveMixin = require('../../../common/mixins/RemoveMixin');
const BrowserUtils = require('../../../common/utils/browser');
const Queries = require('../../../common/specs/queries');
const SortLists = require('../../../common/specs/sorts');

const PublicationImport = require('./subcomponents/PublicationImport.vue');

module.exports = {
    mixins: [ReaderMixin, LangMixin, FiltersMixin, FormCleanerMixin, OAMixin, RemoveMixin],
    components: {
        PublicationImport,
    },
    data() {
        return {
            state: {
                checked_rows: [],
                itemsPerPage: 1000,
                itemsPerRow: 1,
                show_import_modal: false,
                paths: {
                    reads: {
                        publication: APIRoutes.entity('publication', 'POST', true),
                        typology: APIRoutes.entity('typology', 'POST', true),
                        laboratory: APIRoutes.entity('laboratory', 'POST', true),
                    },
                },
                sinks: {
                    reads: {
                        publication: 'publication_read',
                        typology: 'typology_read',
                        laboratory: 'laboratory_read',
                    },
                    creations: {
                        search: 'search_creation_publication',
                    },
                },
                my_entity: 'publication',
                columns: {
                    'denormalization.type.label': {
                        visible: true,
                        force: true,
                        title: 'l_p_type',
                    },
                    subtype: {
                        visible: false,
                        force: false,
                        title: 'l_p_subtype',
                    },
                    'denormalization.authors._id.fullname': {
                        visible: true,
                        force: false,
                        title: 'l_p_author',
                        lang: 'other',
                    },
                    'title.content': {
                        visible: true,
                        force: false,
                        title: 'l_p_title',
                    },
                    'dates.publication': {
                        visible: true,
                        force: false,
                        title: 'l_p_year',
                    },
                    status: {
                        visible: true,
                        force: false,
                        title: 'l_p_status',
                    },
                    'denormalization.journal': {
                        visible: false,
                        force: false,
                        title: 'l_p_journal',
                    },
                    'denormalization.conference': {
                        visible: false,
                        force: false,
                        title: 'l_p_conference',
                    },
                    'dates.update': {
                        visible: true,
                        force: false,
                        title: 'l_p_update',
                    },
                    files: {
                        visible: true,
                        force: false,
                        title: 'l_p_file',
                        lang: 'other',
                    },
                    'denormalization.depositor.lastname.raw': {
                        visible: true,
                        force: false,
                        title: 'l_p_depositor',
                    },
                    depositor: {
                        visible: true,
                        force: true,
                        title: 'l_p_action',
                        lang: 'other',
                    },
                    'denormalization.reviewer.lastname.raw': {
                        visible: true,
                        force: false,
                        title: 'l_p_reviewer',
                    },
                    'system.stats.views': {
                        visible: false,
                        force: false,
                        title: 'l_p_view',
                        lang: 'other',
                    },
                    'system.stats.downloads': {
                        visible: false,
                        force: false,
                        title: 'l_p_download',
                        lang: 'other',
                    },
                    'dates.deposit': {
                        visible: false,
                        force: false,
                        title: 'l_p_deposit',
                    },
                    'diffusion.rights.exports.nowhere': {
                        visible: false,
                        force: false,
                        title: 'l_p_rights_nowhere',
                    },
                    'diffusion.rights.exports.hal': {
                        visible: false,
                        force: false,
                        title: 'l_p_rights_hal',
                    },
                    'denormalization.diffusion.research_teams': {
                        visible: false,
                        force: false,
                        title: 'l_p_research_teams',
                    },
                },
            },
        };
    },
    methods: {
        get_info(content, path) {
            const val = Utils.find_value_with_path(content, path.split('.'));
            if (val || val === false) {
                return val;
            }
            return '';
        },
        get_array_info(content, path, sub_path) {
            let results = '';
            const val = Utils.find_object_with_path(content, path.split('.'));

            if (val) {
                const split_path = path.split('.');
                const last_key = split_path[split_path.length - 1];
                const deep_val = val[last_key];
                const list_values = [];
                deep_val.forEach((my_val) => {
                    const new_val = Utils.find_value_with_path(my_val, sub_path.split('.'));
                    list_values.push(new_val);
                });

                if (path.split('.')[path.split('.').length - 1] === 'research_teams') {
                    list_values.forEach((value, key) => {
                        const content_research_team = this.fcontent(this.state.sinks.reads.laboratory);
                        if (content_research_team && content_research_team instanceof Array) {
                            const my_research_team = content_research_team.find(research_team => research_team.name === value);
                            if (my_research_team) {
                                list_values[key] = my_research_team.acronym;
                            }
                        }
                    });
                }


                if (list_values.length > 0) {
                    list_values.sort();
                    list_values.forEach((value) => {
                        if (results.length === 0) {
                            results += value;
                        } else {
                            results += `, ${value}`;
                        }
                    });
                }
            }
            return results;
        },
        on_column_update(obj) {
            this.state.columns[obj.key].visible = obj.checked;
        },
        get_multi_download_link(item) {
            if (item.files.length === 0) {
                return null;
            }

            const names = item.files.reduce((arr, f) => {
                arr.push(f.name);
                return arr;
            }, []);

            const filenames = item.files.reduce((arr, f) => {
                arr.push(f.url);
                return arr;
            }, []);

            return APIRoutes.multi_download('publication', item._id, names, filenames);
        },
        get_bulk_link() {
            const checkRows = this.state.checked_rows;

            if (checkRows.length === 0) {
                return '#';
            }

            const host = BrowserUtils.getURLHost(window.location);
            const argument = checkRows.reduce(((obj, row, index) => {
                if (index === 0) {
                    return `${obj}publications=${row._id}&types=${row.type}`;
                }
                return `${obj}&publications=${row._id}&types=${row.type}`;
            }), '');
            return `${host}/bulk?${argument}`;
        },
        find_subtype(info) {
            if (Object.keys(this.typology).length === 0) {
                return '';
            }

            const type = info.type;
            const subtype = info.subtype;
            const typo = this.typology[type];
            const result = typo.children.find(t => t.name === subtype);

            return result ? result.label : '';
        },
        on_checked_rows_update(obj) {
            this.$set(this.state, 'checked_rows', obj.checkedRows);
        },
    },
    mounted() {
        this.$store.dispatch('search', {
            form: this.state.sinks.reads.typology,
            path: this.state.paths.reads.typology,
            body: {
                size: 10000,
            },
        });

        this.$store.dispatch('search', {
            form: this.state.sinks.reads.laboratory,
            path: this.state.paths.reads.laboratory,
            body: {
                size: 10000,
            },
        });
    },
    watch: {
    },
    computed: {
        host() {
            return BrowserUtils.getURLHost(window.location);
        },
        search_query() {
            return JSON.stringify(Queries.publication_search);
        },
        sort_list() {
            return SortLists.publication_validation_sorts;
        },
        typology() {
            const content = this.mcontent(this.state.sinks.reads.typology);

            return content.reduce((obj, c) => {
                obj[c._id] = c;
                return obj;
            }, {});
        },
    },
};
