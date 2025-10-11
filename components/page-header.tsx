// components/page-header.tsx - VERSÃO FUNCTION DECLARATION
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
    return (
        <View style={styles.header}>
            {/*Botão Voltar*/}
            <TouchableOpacity onPress={props.onBack} style={styles.headerButton}>
                <FontAwesome name="arrow-left" size={20} color="#666" />
            </TouchableOpacity>

            {/*Título*/}
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

            {/*Botão Salvar*/}
            {props.showSaveButton && props.onSave && (
                <TouchableOpacity onPress={props.onSave} style={styles.headerButton}>
                    <FontAwesome name="save" size={20} color="#666" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 6,
    },
    headerButton: {
        padding: 8,
        minWidth: 40,
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    titleText: {
        fontSize: 14,
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