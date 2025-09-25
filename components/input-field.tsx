import { useState } from "react";
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface InputFieldProps {
  placeholder: string;
  buttonLabel: string;
  onPress: (value: string) => void;
  type: KeyboardTypeOptions;
}

export default function InputField(props: InputFieldProps) {
  const { placeholder, buttonLabel, onPress } = props;
  const [value, setValue] = useState("");

  const handlePress = () => {
    if (value.trim() !== "") {
      onPress(value.trim());
      setValue(""); // limpa o campo após salvar
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        placeholder={placeholder}
        onChangeText={setValue}
        autoCapitalize="none"
        keyboardType={props.type}
      />
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 10,
    width: "90%",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#362946",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
