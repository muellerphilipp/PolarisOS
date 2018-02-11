const LangMixin = require('../../../common/mixins/LangMixin');
const APIRoutes = require('../../../common/api/routes');
const FormMixin = require('../../../common/mixins/FormMixin');

const Discovery = require('./subcomponents/Discovery.vue');
const LastDeposits = require('./subcomponents/LastDeposits.vue');
const Search = require('./subcomponents/Search.vue');
const BrowsingList = require('../../lists/browse');

module.exports = {
    mixins: [LangMixin, FormMixin],
    data() {
        return {
            state: {
                forms: {
                    psink: 'publication_sink',
                },
                pread_path: APIRoutes.entity('publication', 'POST', true),
            },
        };
    },
    components: {
        LastDeposits,
        Discovery,
        Search,
    },
    methods: {

    },
    mounted() {
        this.$store.dispatch('search', {
            form: this.state.forms.psink,
            path: this.state.pread_path,
            body: {
                size: 3,
                population: ['authors._id', 'journal'],
            },
        });
    },
    computed: {
        content() {
            return this.fcontent(this.state.forms.psink);
        },
        items() {
            if (this.content && this.content instanceof Array && this.content.length > 0) {
                const items = this.content.map((c) => {
                    const title = c.title && c.title.content ? c.title.content : '';
                    const authors = c.authors ? c.authors.map(a => a._id.fullname) : [];
                    const journal = c.journal ? c.journal.name : '';
                    return { html: `${authors.join(', ')}. <b>${title}</b>. ${journal}.`, _id: c._id };
                });
                return items;
            }
            return [];
        },
        navs() {
            return BrowsingList;
        },
    },
};
