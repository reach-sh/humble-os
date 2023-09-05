declare module 'lodash.sortby' {
  declare function sortBy<T>(
    array: T[],
    iteratee?: string | string[] | ((val: T) => any),
  ): T[]

  export = sortBy
}
