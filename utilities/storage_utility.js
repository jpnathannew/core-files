export const setToSessionStorage = (key, data) => {
    sessionStorage.setItem(key, JSON.stringify(data));
  };
  
  export const getFromSessionStorage = (key) => {
    if (sessionStorage.getItem(key)) {
      try {
        let data = JSON.parse(sessionStorage.getItem(key));
        return data;
      } catch (err) {
        return sessionStorage.getItem(key);
      }
    }
    return null;
  };
  
  export const removeSessionStorage = (key) => {
    sessionStorage.removeItem(key);
  };
  