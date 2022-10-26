import path from 'node:path'

export const fixture = (...paths: string[]) => {
  return path.resolve(__dirname, '__fixtures__', ...paths)
}

export const artisan = () => {
  return fixture('laravel', 'artisan.js')
}
