Vue.component('register-component', {
    template: `
        <form> 
            <h4 class="center-align">Register form</h4>
            <div class="row" v-if="errors[0]">
                <div class="col s12">
                    <div class="card-panel materialize-red">{{errors[0]}}</div>
                </div>
            </div>
            <div class="row">
                 <div class="input-field col s6">
                      <i class="material-icons prefix">account_circle</i>
                      <input type="text" v-model="user.firstName" :class="{invalid: errors?.firstName}" placeholder="First name" required>
                      <span class="helper-text" :data-error="errors?.firstName"></span>
                </div>   
                
                 <div class="input-field col s6">
                    <input type="text" v-model="user.lastName" :class="{invalid: errors?.lastName}" placeholder="Last name" required>           
                    <span class="helper-text" :data-error="errors?.lastName"></span>
                </div>   
            </div>
            
            <div class="row">
                 <div class="input-field col s12">
                      <i class="material-icons prefix">email</i>
                      <input type="email" v-model="user.email" :class="{invalid: errors?.email}" placeholder="Email" required>           
                      <span class="helper-text" :data-error="errors?.email"></span>
                </div>          
            </div>
            
            <div class="row">
                <div class="input-field col s12">
                      <i class="material-icons prefix">lock</i>
                      <input type="password" v-model="user.password"  :class="{invalid: errors?.password}" placeholder="Password" required>
                      <span class="helper-text" :data-error="errors?.password"></span>
                </div> 
            </div>
            <div class="center-align">                   
                <button class="btn light-blue darken-4" v-on:click.prevent="register()" 
                    :disabled="loading">
                    <i class="material-icons right">send</i>Register
                </button>                   
            </div>
        </form>
    `,
    data() {
       return {
           user: {
               firstName: '',
               lastName: '',
               email: '',
               password: '',
           },
           errors: {},
           loading: false
       }
    },
    methods: {
        async register() {
            this.loading = true;
            try {
                await Service.api.register(this.user);
                this.$emit('register', this.user)
            } catch (e) {
                this.errors = e
                M.toast({html: '❌ Registration fail !!!'});
            }
            this.loading = false;
        }
    }
})