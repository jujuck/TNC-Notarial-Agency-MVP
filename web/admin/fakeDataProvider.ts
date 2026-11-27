import type { DataProvider } from 'react-admin';

const emptyList = { data: [], total: 0 };

function notImplemented(method: string): Promise<never> {
  return Promise.reject(
    new Error(`${method} n'est pas implémenté dans la démonstration : aucune donnée métier.`),
  );
}

/**
 * Stub minimal : permet de monter React Admin sans resource ni appel API.
 * Aucune méthode ne contacte `/api`.
 */
export const fakeDataProvider: DataProvider = {
  getList: () => Promise.resolve(emptyList),
  getOne: () => notImplemented('getOne'),
  getMany: () => Promise.resolve({ data: [] }),
  getManyReference: () => Promise.resolve(emptyList),
  create: () => notImplemented('create'),
  update: () => notImplemented('update'),
  updateMany: () => Promise.resolve({ data: [] }),
  delete: () => notImplemented('delete'),
  deleteMany: () => Promise.resolve({ data: [] }),
};
