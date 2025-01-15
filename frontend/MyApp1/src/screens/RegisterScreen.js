// RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, Alert } from 'react-native';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';

const RegisterScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [panCard, setPanCard] = useState(null);

    const selectPanCard = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.assets && response.assets.length > 0) {
                setPanCard(response.assets[0]);
            }
        });
    };

    const handleRegister = async () => {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('mobileNumber', mobileNumber);
        formData.append('panCard', {
            uri: panCard.uri,
            type: panCard.type,
            name: panCard.fileName
        });

        try {
            const response = await axios.post('http://localhost:5000/upload-pan', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.message) {
                Alert.alert('Success', response.data.message);
                navigation.navigate('Login');
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
            <Text>Mobile Number:</Text>
            <TextInput
                style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="numeric"
                placeholder="Enter your mobile number"
            />
            <Button title="Select PAN Card" onPress={selectPanCard} />
            {panCard && <Image source={{ uri: panCard.uri }} style={{ width: 200, height: 200, marginTop: 10 }} />}
            <Button title="Register" onPress={handleRegister} />
        </View>
    );
};

export default RegisterScreen;
