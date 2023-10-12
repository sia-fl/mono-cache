export const splitKey = (key: string) => key.split('.');

export const keyCheck = (key: string) => {
  if (key.indexOf('.') === -1) {
    throw new Error('only support hash key, if you want to use string key, use kv cache');
  }
};
