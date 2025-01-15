import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../components/AuthContext';

const HomeScreen = ({ navigation }) => {
  const { logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text>Welcome to the Home Screen!</Text>
      <Button title="Logout" onPress={() => {
        logout();
        navigation.navigate('Login');
      }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
});

export default HomeScreen;