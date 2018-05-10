const _ = require('lodash');

const LangMixin = require('../../../common/mixins/LangMixin');
const APIRoutes = require('../../../common/api/routes');
const FormMixin = require('../../../common/mixins/FormMixin');
const FormCleanerMixin = require('../../../common/mixins/FormCleanerMixin');
const QueryMixin = require('../../../common/mixins/QueryMixin');
const BrowserUtils = require('../../../common/utils/browser');
const Queries = require('../../../common/specs/queries');

const BrowsingList = require('../../lists/browse');
const Category = require('./subcomponents/Category.vue');
const SearchResults = require('./subcomponents/SearchResults.vue');


module.exports = {
    mixins: [LangMixin, FormMixin, QueryMixin, FormCleanerMixin],
    components: {
        Category,
        SearchResults,
    },
    data() {
        return {
            state: {
                filters: [],
                sinks: {
                    creations: {
                        search: 'publication_browse_search',
                    },
                    reads: {
                        publication: 'publication_read',
                        menu: 'menu_read',
                    },
                },
                paths: {
                    reads: {
                        publication: APIRoutes.entity('publication', 'POST', true),
                        menu: APIRoutes.entity('menu', 'POST', true),
                    },
                },
                active_results: false,
            },
        };
    },
    methods: {
    },
    computed: {
        navs() {
            const content = this.fcontent(this.state.sinks.reads.menu);
            if (!content || !(content instanceof Array) || content.length === 0) {
                return [];
            }
            const idx = _.findIndex(content[0].elements, elt => elt.name === 'f_nav_browse');
            if (idx === -1) {
                return [];
            }
            const elt = content[0].elements[idx];
            return elt.submenus.map((celt) => {
                const params = BrowserUtils.getQueryParams(celt.query);
                return {
                    text: celt.name,
                    query: celt.query,
                    type: params.b,
                };
            });
        },
        current_nav() {
            const query = this.state.query;
            if (query.b && this.navs.length > 0) {
                const i = _.findIndex(this.navs, n => n.type === query.b);
                if (i > -1) {
                    return this.navs[i];
                }
                return {};
            }
            return {};
        },
        search_query() {
            return JSON.stringify(Queries.published_publication_search);
        },
        default_query() {
            return JSON.stringify({ $and: [Queries.no_other_version, Queries.published] });
        },
    },
    mounted() {
        this.$store.dispatch('search', {
            form: this.state.sinks.reads.menu,
            path: this.state.paths.reads.menu,
            body: {
                size: 1,
                where: {
                    'menu.elements.name': 'f_nav_browse',
                },
            },
        });
    },
};
