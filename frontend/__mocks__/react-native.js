export const Platform = {
  OS: 'ios',
  select: (obj) => obj.ios || obj.default,
};
export const useColorScheme = () => 'light';
export const StyleSheet = {
  create: (styles) => styles,
};
export const View = 'View';
export const Text = 'Text';
export const TouchableOpacity = 'TouchableOpacity';
export const TextInput = 'TextInput';
export const ActivityIndicator = 'ActivityIndicator';
export const FlatList = 'FlatList';
export const ScrollView = 'ScrollView';
export const RefreshControl = 'RefreshControl';
export const Switch = 'Switch';
export const Alert = { alert: jest.fn() };

