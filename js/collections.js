/**
 * Collection manager
 *
 * @author Adama dodo cisse <adama.dodo.cisse@gmail.com>
 */
document.addEventListener('DOMContentLoaded', function () {

    const urlSearchParams = new URLSearchParams(location.search)
    const ENDPOINT = urlSearchParams?.get('url')?.trim('/');
    const FILENAME = ENDPOINT?.replaceAll(/[^\w]/g, '_') + '.csv';

    new Vue({
        el: '#app',
        data: {
            collections: [],
            collectionsExportedProducts: {},
            limitPerPage: 5,
            page: 1,
            search: '',
            url: ENDPOINT,
            loading: false,
            user: {},
            progress: {
                loading: false,
                collection: '',
                progressCollections: 0,
                totalCollections: 0,
                totalProducts: 0,
            },
            subscriptionPopup: false
        },
        async created() {
            this.loading = true
            try {
                this.user = await Service.api.me();
            } catch (e) {
            }

            try {
                await this.loadCollections()
            } catch (e) {
            }

            this.loading = false
        },
        mounted() {
            var elems = document.querySelectorAll('.modal');
            M.Modal.init(elems, {});
        },
        computed: {
            exportButtonTitle() {
                const c = this.selectedCollections().length;
                return c > 0 ? 'EXPORT (' + c + ')' : 'EXPORT ALL'
            },
            selectedOrAllCollections() {
                const selectedCollections = this.selectedCollections();
                return selectedCollections.length > 0 ? selectedCollections : this.collections;
            }
        },
        methods: {
            /**
             * Load collection from Shopify
             *
             * @return {Promise<void>}
             */
            async loadCollections() {
                let page = 1;
                let next = true;
                let url = ENDPOINT + '/collections.json?limit=250&page=';

                while (next) {
                    next = false;
                    try {
                        let response = await fetch(url + page).then(response => response.json())

                        if (response?.collections?.length) {
                            this.collections = [...this.collections, ...response.collections.map(c => {
                                c.checked = false;
                                return c
                            })]
                            next = true;
                            page++;
                        }
                    } catch (e) {
                    }
                }
            },
            /**
             * Check if page is active
             *
             * @param page
             * @return {boolean}
             */
            isActivePage(page) {
                return page === this.getPage()
            },
            /**
             * Count pagination page
             *
             * @return {number}
             */
            pageCount() {
                return Math.ceil(this.paginationFilter().length / this.limitPerPage)
            },
            /**
             * Page range
             *
             * @return {[]}
             */
            pageRange() {
                const page = this.getPage()
                const start = Math.max(1, page - 5);
                const end = Math.min(this.pageCount(), page + 5);
                const range = [];

                for (let i = start; i <= end; i++) {
                    range.push(i);
                }

                return range;
            },
            setPage(page) {
                this.page = Math.min(this.pageCount(), page)
            },
            getPage() {
                return Math.min(this.pageCount(), this.page)
            },
            /**
             * set current pagination to previous
             */
            previousPage() {
                this.page = Math.max(1, this.getPage() - 1);
            },

            /**
             * set current pagination to next
             */
            nextPage() {
                this.page = Math.min(this.getPage() + 1, this.pageCount());
            },
            /**
             *
             * Pagination of current page
             *
             * @return {*[]}
             */
            pagination() {
                return this.paginationFilter().splice((this.getPage() - 1) * this.limitPerPage, this.limitPerPage)
            },
            /**
             * Pagination filter
             *
             * @return {*[]}
             */
            paginationFilter() {
                return this.collections
                    .slice()
                    .filter(collection => {
                        return this.search.length < 2 || (collection.title.match(
                            new RegExp('.*' + this.search + '.*', 'gi')
                        ))
                    })
            },
            selectedCollections() {
                return this.collections.filter((collection) => collection.checked);
            },
            /**
             * Export list collection
             *
             * @param collections
             * @return {Promise<void>}
             */
            async processExportCollections(collections = []) {

                try {
                    this.user = await Service.api.me();
                } catch (e) {
                }

                if (!this.user?.subscribe) {
                    this.showSubscriptionPopup();
                } else {
                    this.loading = true;
                    this.progress.loading = true;
                    let products = [];
                    this.progress.progressCollections = 0;
                    this.progress.totalCollections = collections.length;
                    this.progress.totalProducts = 0;

                    for (const collection of collections) {
                        this.progress.collection = collection.title
                        products = [...products, ...await this.getCollectionProducts(collection)]
                        this.progress.progressCollections += 1
                        this.progress.totalProducts = products.length
                    }

                    await this.downloadProducts(products)

                    this.loading = false;
                    this.progress.loading = false;
                }
            },
            /**
             * Export collection
             *
             * @param collection
             * @return {Promise<void>}
             */
            async processExportCollection(collection) {
                await this.processExportCollections([collection])
            },
            /**
             * Get collection products
             *
             * @param collection
             * @return {Promise<[]|*>}
             */
            async getCollectionProducts(collection) {
                if (this.collectionsExportedProducts[collection.handle]) {
                    return this.collectionsExportedProducts[collection.handle]
                }

                let page = 1;
                let next = true;
                let url = ENDPOINT + '/collections/' + collection.handle + '/products.json?limit=250&page=';
                let products = [];

                while (next) {
                    next = false;
                    try {
                        let response = await fetch(url + page).then(response => response.json())

                        if (response?.products?.length) {
                            products = [...products, ...response.products.map(p => {
                                p.collection = collection.handle
                                return p;
                            })]
                            next = true;
                            page++;
                        }
                    } catch (e) {
                    }
                }

                this.collectionsExportedProducts[collection.handle] = products

                return products
            },
            /**
             * Download products
             *
             * @param products
             * @return {Promise<void>}
             */
            async downloadProducts(products) {
                const values = [];

                for (const product of products) {
                    Service.productToCsvObject(product, values)
                }

                if (products.length > 0) {
                    const content = (new CSV()).convert(values);
                    (new Export()).csv(content, FILENAME);
                    M.toast({html: '✅ Export success !!!'});
                } else {
                    M.toast({html: '❌ Export fail !!!'});
                }
            },
            /**
             * Show product page
             *
             * @param collection
             */
            showProductPage(collection) {
                window.open(
                    location.origin + "/products.html?url=" + ENDPOINT + '&collection=' + collection.handle,
                    '_blank'
                );
            },
            reset() {
                for (const collection of this.collections) {
                    collection.checked = false
                }
            },
            logout() {
                Service.api.logout().then(() => {
                    this.user = {}
                });
            },
            async login() {
                try {
                    M.toast({html: '✅ Authentication success !!!'});
                    setTimeout(() => location.reload(), 1000);
                } catch (e) {
                    M.toast({html: '❌ Authentication fail !!!'});
                }
            },
            async register() {
                M.toast({html: '✅ Registration success !!!'});
                setTimeout(async () => {
                    try {
                        this.user = await Service.api.me()
                        window.open(Service.api.generateSubscribeUrl(this.user['id']), '_blanc');
                        location.reload()
                    } catch (e) {
                    }
                }, 1000);
            },
            async subscribe() {
                try {
                    this.user = await Service.api.me();
                    const url = Service.api.generateSubscribeUrl(this.user['id']);
                    window.open(url, '_blank')
                } catch (e) {
                    if (!this.user?.id) {
                        M.toast({html: 'You need to be logged in before becoming premium !!!', outDuration: 10000});
                    } else {
                        M.toast({html: '❌ Upgrade to pro fail !!!'});
                    }
                }
            },
            showSubscriptionPopup() {
                this.subscriptionPopup = true;
            },
            hideSubscriptionPopup() {
                this.subscriptionPopup = false;
            }
        }
    });
});