export const lsGetJSON = (itemId: string, defaultResult = false) => {
  const item = localStorage.getItem(itemId)
  if (item) {
    const parsedItem = JSON.parse(item)
    return parsedItem
  }
  return defaultResult
    ? {
        ETH: [],
        ALGO: [],
        CFX: [],
      }
    : null
}

export const lsSetJSON = (itemId: string, data: any) => {
  const itemForStorage = JSON.stringify(data)
  localStorage.setItem(itemId, itemForStorage)
}
