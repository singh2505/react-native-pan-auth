// LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:5000/login', {
                email,
                password,
            });

            if (response.data.message) {
                Alert.alert('Success', response.data.message);
                // Store JWT token in AsyncStorage or Context
                navigation.navigate('Home');
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text>Email:</Text>
            <TextInput
                style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
            />
            <Text>Password:</Text>
            <TextInput
                style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Enter your password"
            />
            <Button title="Login" onPress={handleLogin} />
        </View>
    );
};

export default LoginScreen;
