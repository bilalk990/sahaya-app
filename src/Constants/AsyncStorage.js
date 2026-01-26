import AsyncStorage from '@react-native-async-storage/async-storage';

export const getLanguage = async () => {
  const language = await AsyncStorage.getItem('LANGUAGE');

  return language;
};

export const setLanguage = async lang => {
  return await AsyncStorage.setItem('LANGUAGE', lang)
    .then(res => res)
    .catch(e => e);
};
