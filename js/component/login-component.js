Vue.component('login-component', {
    template: `
        <form> 
            <h4 class="center-align">Login form</h4>
            
            <div class="input-field">
                  <i class="material-icons prefix">account_circle</i>
                  <input type="email" v-model="user.email" class="validate" placeholder="Email" required>           
            </div>   
             
             <div class="input-field">
                  <i class="material-icons prefix">lock</i>
                  <input type="password" v-model="user.password" class="validate" placeholder="Password" required>           
            </div> 
            <div class="center-align">
                <button class="btn light-blue darken-4" v-on:click.prevent="login()" 
                    :disabled="loading">
                    <i class="material-icons right">send</i>Login
                </button>                   
            </div>
        </form>
    `,
    data() {
       return {
           user: {
               email: '',
               password: '',
           },
           loading: false
       }
    },
    methods: {
        async login() {
            this.loading = true;
            try {
                await Service.api.login(this.user.email, this.user.password);
                this.$emit('login', this.user)
            } catch (e) {
                M.toast({html: '❌ Login fail !!!'});
            }
            this.loading = false;
        }
    }
})