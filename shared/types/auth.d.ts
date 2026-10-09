declare module '#auth-utils' {
  interface User {
    id: number
    username: string
    displayName: string
    roles: Array<'ADMIN' | 'USER'>
    passwordVersion: number
  }
}

export {}
