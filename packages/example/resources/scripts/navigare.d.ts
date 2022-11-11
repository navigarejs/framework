import '@navigare/core'

declare module '@navigare/core' {
  export interface PageProperties {
    user: {
      id: string
      first_name: string
      last_name: string
    } | null
    breadcrumbs: {
      title: string
      url: string
    }[]
    flash: {
      success: string | null
      error: string | null
    }
  }
}
