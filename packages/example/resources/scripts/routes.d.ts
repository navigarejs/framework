import '@navigare/core'

declare module '@navigare/core' {
  export interface Routes {
    'sanctum.csrf-cookie': {
      uri: 'sanctum/csrf-cookie'
      methods: ['GET', 'HEAD']
      wheres: []
      name: 'sanctum.csrf-cookie'
      domain: null
      bindings: []
      components: []
    }
    'ignition.healthCheck': {
      uri: '_ignition/health-check'
      methods: ['GET', 'HEAD']
      wheres: []
      name: 'ignition.healthCheck'
      domain: null
      bindings: []
      components: []
    }
    'ignition.executeSolution': {
      uri: '_ignition/execute-solution'
      methods: ['POST']
      wheres: []
      name: 'ignition.executeSolution'
      domain: null
      bindings: []
      components: []
    }
    'ignition.updateConfig': {
      uri: '_ignition/update-config'
      methods: ['POST']
      wheres: []
      name: 'ignition.updateConfig'
      domain: null
      bindings: []
      components: []
    }
    root: {
      uri: '/'
      methods: ['GET', 'HEAD']
      wheres: []
      name: 'root'
      domain: null
      bindings: []
      components: []
    }
    'vue.root': {
      uri: 'vue'
      methods: ['GET', 'HEAD']
      wheres: []
      name: 'vue.root'
      domain: null
      bindings: []
      components: []
    }
    'vue.home': {
      uri: 'vue/home/{name?}'
      methods: ['GET', 'HEAD']
      wheres: []
      name: 'vue.home'
      domain: null
      bindings: {
        name: true
      }
      components: []
    }
    'vue.redirect': {
      uri: 'vue/redirect'
      methods: ['GET', 'HEAD']
      wheres: []
      name: 'vue.redirect'
      domain: null
      bindings: []
      components: []
    }
    'vue.modal': {
      uri: 'vue/modal'
      methods: ['GET', 'HEAD']
      wheres: []
      name: 'vue.modal'
      domain: null
      bindings: []
      components: []
    }
    'vue.second-modal': {
      uri: 'vue/second-modal'
      methods: ['GET', 'HEAD']
      wheres: []
      name: 'vue.second-modal'
      domain: null
      bindings: []
      components: []
    }
    'vue.nested.index': {
      uri: 'vue/nested'
      methods: ['GET', 'HEAD']
      wheres: []
      name: 'vue.nested.index'
      domain: null
      bindings: []
      components: []
    }
    'vue.nested.details': {
      uri: 'vue/nested/details/{id}'
      methods: ['GET', 'HEAD']
      wheres: []
      name: 'vue.nested.details'
      domain: null
      bindings: {
        id: true
      }
      components: []
    }
    'vue.long': {
      uri: 'vue/long'
      methods: ['GET', 'HEAD']
      wheres: []
      name: 'vue.long'
      domain: null
      bindings: []
      components: []
    }
    'vue.form': {
      uri: 'vue/form'
      methods: ['GET', 'HEAD']
      wheres: []
      name: 'vue.form'
      domain: null
      bindings: []
      components: []
    }
    'vue.form.submit': {
      uri: 'vue/form'
      methods: ['POST']
      wheres: []
      name: 'vue.form.submit'
      domain: null
      bindings: []
      components: []
    }
  }
}
