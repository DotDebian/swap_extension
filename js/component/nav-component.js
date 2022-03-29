Vue.component('nav-component', {
    props: ['title', 'user', 'url'],
    template: `
        <div>
            <nav class="light-blue darken-4">
                <div class="nav-wrapper">
                  <a href="" class="brand-logo"><i class="material-icons">star</i>{{title}}</a>
                  <ul class="right hide-on-med-and-down">
                    <li><a href="https://shopify-scraper.com/" target="_blank"><i class="material-icons right">link</i>Shopify Scraper</a></li>
                    <li><a :href="'collections.html?url=' + url" title="go to collections"><i class="material-icons right">list</i>Collections</a></li>
                    <li><a :href="'products.html?url=' + url" title="go to products"><i class="material-icons right">loyalty</i>Products</a></li>

                    <li v-if="!user.subscribe">
                        <a class="btn materialize-red animate__animated animate__bounce" v-on:click.prevent="subscribe()">
                            <i class="material-icons left">star</i>Upgrade to get more features<i class="material-icons right">star</i>
                        </a>
                    </li>
                    <li v-if="!user.id"><a href="#loginModal" class="modal-trigger" title="login"><i class="material-icons right">login</i>Sign in</a></li>
                    <li v-if="!user.id"><a href="#registerModal" class="modal-trigger" title="register"><i class="material-icons right">account_circle</i>Sign up</a></li>
                    <li v-if="user.id"><a href="#" v-on:click.prevent="logout()" title="logout"><i class="material-icons right">logout</i>Logout</a></li>
                  </ul>
                </div>
            </nav>
                      
            <div id="loginModal" class="modal">
                <div class="modal-content">
                    <i class="material-icons modal-close right">close</i>
                    <login-component v-on:login="login"></login-component>
                </div>
            </div>
            
            <div id="registerModal" class="modal">
                <div class="modal-content">
                    <i class="material-icons modal-close right">close</i>
                    <register-component v-on:register="register"></register-component>
                </div>
            </div>
        </div>
    `,
    methods: {
        logout() {
            this.$emit('logout')
        },
        subscribe() {
            this.$emit('subscribe')
        },
        login(user) {
            this.$emit('login', user)
        },
          register(user) {
            this.$emit('register', user)
        }
    }
});