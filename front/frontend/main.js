const Vue = require('vue');
const Buefy = require('buefy');
const VueWysiwyg = require('vue-wysiwyg');
const RouterRenderer = require('../common/router');
const router = require('./router');
const store = require('../common/store');

const Loader = require('./components/loader/Loader.vue');
const Stepper = require('../common/components/ined/stepper/Stepper.vue');
const Input = require('../common/components/ined/forms/elements/input/Input.vue');
const Select = require('../common/components/ined/forms/elements/select/Select.vue');
const VariadicElement = require('../common/components/ined/forms/elements/variadic_element/VariadicElement.vue');
const Form = require('../common/components/ined/forms/form/Form.vue');
const DynamicForm = require('../common/components/ined/forms/dynamic_form/DynamicForm.vue');
const Paginator = require('../common/components/ined/paginator/Paginator.vue');
const Dropzone = require('../common/components/ined/forms/dropzone/Dropzone.vue');
const HierarchicalSelect = require('../common/components/ined/forms/elements/hierarchical_select/HierarchicalSelect.vue');
const Card = require('../common/components/ined/card/Card.vue');
const Widget = require('../common/components/ined/widget/Widget.vue');

const Indexer = require('../common/components/ined/indexer/Indexer.vue');

const HierarchicalStructure = require('../common/components/ined/forms/elements/hierarchical_structure/HierarchicalStructure.vue');

// Widgets
const SearchWidget = require('./components/themes/ined/widgets/search_widget/SearchWidget.vue');
const BrowseWidget = require('./components/themes/ined/widgets/browse_widget/BrowseWidget.vue');
const NavWidget = require('./components/themes/ined/widgets/nav_widget/NavWidget.vue');
const TextWidget = require('./components/themes/ined/widgets/text_widget/TextWidget.vue');
const ListWidget = require('./components/themes/ined/widgets/list_widget/ListWidget.vue');
const StatsWidget = require('./components/themes/ined/widgets/stats_widget/StatsWidget.vue');
const AlternativeWidget = require('./components/themes/ined/widgets/alternative_widget/AlternativeWidget.vue');
const MediaWidget = require('./components/themes/ined/widgets/media_widget/MediaWidget.vue');


const App = require('./pages/App.vue');

Vue.use(Buefy.default, {
    defaultIconPack: 'fa',
});

Vue.use(VueWysiwyg.default, {
    hideModules: { image: true },
});

Vue.component('loader', Loader);
Vue.component('stepper', Stepper);
Vue.component('fform', Form);
Vue.component('finput', Input);
Vue.component('fselect', Select);
Vue.component('fdropzone', Dropzone);
Vue.component('fhselect', HierarchicalSelect);
Vue.component('fvariadic-element', VariadicElement);
Vue.component('dynamic-form', DynamicForm);
Vue.component('indexer', Indexer);
Vue.component('paginator', Paginator);
Vue.component('hierarchical-structure', HierarchicalStructure);
Vue.component('card', Card);
Vue.component('widget', Widget);

// Widgets
Vue.component('widget-search', SearchWidget);
Vue.component('widget-browse', BrowseWidget);
Vue.component('widget-nav', NavWidget);
Vue.component('widget-text', TextWidget);
Vue.component('widget-list', ListWidget);
Vue.component('widget-stats', StatsWidget);
Vue.component('widget-alternative', AlternativeWidget);
Vue.component('widget-media', MediaWidget);


RouterRenderer.render_router('frontoffice').then((result) => {
    new Vue({
        el: '#app',
        store,
        router: router(result.routes),
        render: h => h(App, {
            props: {
                pages: result.pages,
            },
        }),
    });
})
.catch(err => console.error(err));
// rrouter.render_router('frontoffice').then(result => console.log(result)).catch(err => console.error(err));
