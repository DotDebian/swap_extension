Vue.component('subscribe-component', {
    template: `
        <div class="subscribe-component animate__animated animate__rubberBand">
            <span>This feature only for premium user.&nbsp;</span> 
            <button class="btn waves-effect materialize-red" v-on:click.prevent="subscribe()">
                <i class="material-icons left">touch_app</i>
                Upgrade Now
            </button>
            <a href="#" class="white-text">
               <i class="material-icons right close" v-on:click.prevent="close()">close</i>
            </a>
        </div>
    `,
    methods: {
        subscribe() {
            this.$emit('subscribe')
        },
        close() {
            this.$emit('close')
        }
    }
});