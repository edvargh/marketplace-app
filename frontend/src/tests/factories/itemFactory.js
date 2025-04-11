import faker from 'faker';

export const itemFactory = (overrides = {}) => {
  return {
    id: faker.datatype.uuid(),
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price()),
    status: 'For Sale',
    categoryId: faker.datatype.uuid(),
    images: Array(Math.floor(Math.random() * 3) + 1).fill().map(() => ({
      url: faker.image.imageUrl(), 
      id: faker.datatype.uuid()
    })),
    latitude: parseFloat((faker.datatype.number({ min: -90, max: 90 }) + Math.random()).toFixed(6)),  
    longitude: parseFloat((faker.datatype.number({ min: -180, max: 180 }) + Math.random()).toFixed(6)), 
    isFavorite: faker.datatype.boolean(),
    ...overrides,
  };
};
