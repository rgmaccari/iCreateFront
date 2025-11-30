import { useState } from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface InputFieldProps {
  placeholder: string;
  buttonLabel: string;
  onPress?: (value: string) => void;
  type: KeyboardTypeOptions;
  value?: string; //opcional para controle externo
  onChangeText?: (text: string) => void; //opcional para filtro em tempo real
}

export default function InputField(props: InputFieldProps) {
  const { placeholder, buttonLabel, onPress, value, onChangeText, type } = props;
  const [internalValue, setInternalValue] = useState('');

  const currentValue = value !== undefined ? value : internalValue;

  const handleChangeText = (text: string) => {
    if (onChangeText) {
      onChangeText(text); //Deixa o pae controlar
    } else {
      setInternalValue(text); //ou controla internamente
    }
  };

  const handlePress = () => {
    if (currentValue.trim() !== '' && onPress) {
      onPress(currentValue.trim());
      if (value === undefined) setInternalValue('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={currentValue}
        placeholder={placeholder}
        onChangeText={handleChangeText}
        autoCapitalize="none"
        keyboardType={type}
      />
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 10,
    width: '90%',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#362946',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
