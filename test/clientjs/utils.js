export const createXHRmock = (obj) => {
  obj.open = jest.fn();
  obj.setRequestHeader = jest.fn();
  obj.send = jest.fn();

  window.XMLHttpRequest = jest.fn().mockImplementation(() => obj);
};
