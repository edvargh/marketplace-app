import faker from 'faker';

export const userFactory = (overrides = {}) => {
  return {
    id: faker.datatype.number(),
    fullName: faker.name.findName(),
    email: faker.internet.email(),
    phoneNumber: faker.phone.phoneNumber(),
    role: 'user',
    preferredLanguage: faker.random.arrayElement(['english', 'norwegian']),
    ...overrides, 
  };
};
