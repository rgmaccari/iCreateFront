import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-paper';

interface PageHeaderProps {
    title: string;
    onBack: () => void;
    onSave?: () => void;
    onTitleChange?: (newTitle: string) => void;
    showSaveButton?: boolean;
    isEditingTitle?: boolean;
    onEditTitlePress?: () => void;
    onEditTitleBlur?: () => void;
}

export default function PageHeader(props: PageHeaderProps) {
    const showSave = props.showSaveButton && props.onSave;

    return (
        <View style={styles.header}>
            {/* Botão Voltar */}
            <TouchableOpacity onPress={props.onBack} style={styles.headerButton}>
                <FontAwesome name="arrow-left" size={20} color="#9191d8ff" />
            </TouchableOpacity>

            {/* Título - SEMPRE CENTRALIZADO */}
            <View style={styles.titleContainer}>
                {props.isEditingTitle && props.onTitleChange ? (
                    <TextInput
                        mode="flat"
                        value={props.title}
                        onChangeText={props.onTitleChange}
                        onBlur={props.onEditTitleBlur}
                        onSubmitEditing={props.onEditTitleBlur}
                        autoFocus
                        dense
                        style={styles.titleInput}
                    />
                ) : (
                    <TouchableOpacity onPress={props.onEditTitlePress}>
                        <Text numberOfLines={1} style={styles.titleText}>
                            {props.title || "Sem título"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Botão Salvar ou Espaço Vazio */}
            <View style={styles.headerButton}>
                {showSave && (
                    <TouchableOpacity onPress={props.onSave}>
                        <FontAwesome name="check" size={20} color="#9191d8ff" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 6,
        marginBottom: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#9191d8ff'

    },
    headerButton: {
        width: 40, // Largura fiza
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#362946',
        textAlign: 'center',
    },
    titleInput: {
        backgroundColor: 'transparent',
        height: 40,
        paddingHorizontal: 0,
        textAlign: 'center',
        width: '100%',
    },
});