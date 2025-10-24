// components/project-view-tabs.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type ProjectViewMode = 'document' | 'board' | 'form';

interface ProjectViewModeProps {
    currentView: ProjectViewMode;
    onViewChange: (view: ProjectViewMode) => void;
}

const ProjectViewMode: React.FC<ProjectViewModeProps> = (props: ProjectViewModeProps) => {
    //Cada item
    const tabs = [
        { id: 'document' as ProjectViewMode, label: 'Documento', icon: '📄' },
        { id: 'board' as ProjectViewMode, label: 'Board', icon: '🎯' },
        { id: 'form' as ProjectViewMode, label: 'Formulário', icon: '📝' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                {/*Para cada tab, aplica em loop*/}
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.tab,
                            props.currentView === tab.id && styles.activeTab, {/*Pega das props*/ }
                        ]}
                        onPress={() => props.onViewChange(tab.id)} //Ao clicar na Tab, aciona a alteração no Estado recebendo um id ('board', 'form'...)
                    >
                        <Text style={styles.tabIcon}>{tab.icon}</Text>
                        <Text style={[
                            styles.tabText,
                            props.currentView === tab.id && styles.activeTabText, {/*Pega das props*/ }
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tabBar: {
        flexDirection: 'row',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#362946',
    },
    tabIcon: {
        fontSize: 16,
        marginBottom: 4,
    },
    tabText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666',
    },
    activeTabText: {
        color: '#362946',
        fontWeight: 'bold',
    },
});

export default ProjectViewMode;