export const createFilter = ({
  categoryIds = [],
  priceMin = '',
  priceMax = '',
  distanceKm = '',
  latitude = null,
  longitude = null
} = {}) => ({
  categoryIds,
  priceMin,
  priceMax,
  distanceKm,
  latitude,
  longitude
})


export const createCompleteFilter = () => createFilter({
  categoryIds: [1, 2, 3],
  priceMin: '10',
  priceMax: '100',
  distanceKm: '5',
  latitude: 59.9139,
  longitude: 10.7522
})


export const createLocationFilter = () => createFilter({
  distanceKm: '10',
  latitude: 59.9139,
  longitude: 10.7522
})


export const createPriceFilter = () => createFilter({
  priceMin: '50',
  priceMax: '500'
})


export const createCategoryFilter = (ids = [1, 2, 3]) => createFilter({
  categoryIds: ids
})