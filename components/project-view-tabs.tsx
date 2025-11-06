// components/project-view-tabs.tsx
import { ClipboardList, FileText, LayoutDashboard } from "lucide-react-native"; // ícones modernos
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type ProjectViewMode = "document" | "board" | "form";

interface ProjectViewModeProps {
  currentView: ProjectViewMode;
  onViewChange: (view: ProjectViewMode) => void;
}

const ProjectViewMode: React.FC<ProjectViewModeProps> = (
  props: ProjectViewModeProps
) => {
  //Cada item
  const tabs = [
    { id: "document" as ProjectViewMode, label: "Documento", icon: FileText },
    { id: "board" as ProjectViewMode, label: "Board", icon: LayoutDashboard },
    { id: "form" as ProjectViewMode, label: "Arquivos", icon: ClipboardList },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {/*Para cada tab, aplica em loop*/}
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = props.currentView === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => props.onViewChange(tab.id)} //Ao clicar na Tab, aciona a alteração no Estado recebendo um id ('board', 'form'...)
            >
              <Icon
                size={18}
                color={isActive ? "#362946" : "#888"}
                style={{ marginBottom: 4 }}
              />
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tabBar: {
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#362946",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#362946",
    fontWeight: "bold",
  },
});

export default ProjectViewMode;
