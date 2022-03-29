/**
 * Product manager
 *
 * @author Adama dodo cisse <adama.dodo.cisse@gmail.com>
 */
document.addEventListener('DOMContentLoaded', function () {

    const urlSearchParams = new URLSearchParams(location.search)
    const ENDPOINT = urlSearchParams.get('url')?.trim('/');
    const collection = urlSearchParams.get('collection')?.trim('/')
    const FILENAME = ENDPOINT?.replaceAll(/[^\w]/g, '_') + '.csv';

    new Vue({
        el: '#app',
        data: {
            products: [],
            freeProducts: [],
            limitPerPage: 5,
            page: 1,
            search: '',
            url: ENDPOINT,
            loading: false,
            user: {},
            collection: collection,
            subscriptionPopup: false
        },
        async created() {
            try {
                this.user = await Service.api.me();
            } catch (e) {
            }
            try {
                await this.loadFreeProducts();
            } catch (e) {}
            try {
                await this.loadProducts()
            } catch (e) {
            }
        },
        mounted() {
            var elems = document.querySelectorAll('.modal');
            M.Modal.init(elems, {});
        },
        computed: {
            exportButtonTitle() {
                const c = this.selectedProducts().length;
                return c > 0 ? 'EXPORT (' + c + ')' : 'EXPORT ALL'
            },
            selectedOrAllProducts() {
                const selectedProducts = this.selectedProducts();
                return selectedProducts.length > 0 ? selectedProducts : this.products;
            }
        },
        methods: {
            /**
             * Load Product from shopify
             *
             * @return {Promise<void>}
             */
            async loadProducts() {
                let page = 1;
                let next = true, url;
                if (collection && collection.length > 0) {
                    url = ENDPOINT + '/collections/' + collection + '/products.json?limit=250&page=';
                } else {
                    url = ENDPOINT + '/products.json?limit=250&page=';
                }

                this.products = [];

                this.loading = true;

                while (next) {
                    next = false;
                    try {
                        let response = await fetch(url + page).then(response => response.json())

                        if (response?.products?.length) {
                            this.products = [...this.products, ...response.products.map(p => {
                                p.checked = false
                                return p
                            })];
                            next = true;
                            page++;
                        }
                    } catch (e) {
                    }
                }

                this.loading = false;
            },
            async loadFreeProducts() {
                let page = 1;
                let next = true,
                    url = ENDPOINT + '/products.json?limit=160&page=1';

                this.freeProducts = [];

                try {
                    let response = await fetch(url).then(response => response.json())

                    if (response?.products?.length) {
                        this.freeProducts = [...this.freeProducts, ...response.products.map(p => {
                            p.checked = false
                            return p
                        })];
                        next = true;
                        page++;
                    }
                } catch (e) {}
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
             * Get current pagination
             *
             * @return {any[]}
             */
            pagination() {
                return this.paginationFilter().splice((this.getPage() - 1) * this.limitPerPage, this.limitPerPage)
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
             * Filter pagination
             *
             * @return {*[]}
             */
            paginationFilter() {
                return this.products
                    .slice()
                    .filter(product => {
                        return this.search.length < 2 || (product.title.match(
                            new RegExp('.*' + this.search + '.*', 'gi')
                        ))
                    })
            },
            selectedProducts() {
                return this.products.filter(product => product.checked)
            },
            /**
             * Export products to csv
             *
             * @param products
             * @param {boolean} control
             * @return {Promise<void>}
             */
            async processExportProducts(products, control = true) {
                if (control) {
                    try {
                        this.user = await Service.api.me();
                    } catch (e) {}

                    if (!this.user?.subscribe) {
                        this.showSubscriptionPopup();
                        return;
                    }
                }

                this.loading = true;

                await this.downloadProducts(products)

                this.loading = false;
            },
            /**
             * Export one product to csv
             *
             * @param product
             * @return {Promise<void>}
             */
            async processExportProduct(product) {
                await this.processExportProducts([product], true);
            },
            /**
             *
             * Download product to csv
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
             * Reset all product
             */
            reset() {
                for (const product of this.products) {
                    product.checked = false
                }
            },
            logout() {
                Service.api.logout().then(() => {
                    this.user = {}
                });
            },
            async login() {
                setTimeout(() => location.reload(), 1000);
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
                        M.toast({html: '❌ Please authenticate !!!'});
                    } else {
                        M.toast({html: '❌ Subscription fail !!!'});
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