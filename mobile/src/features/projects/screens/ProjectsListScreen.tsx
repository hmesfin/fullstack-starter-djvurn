/**
 * ProjectsListScreen - Session 9.2 Implementation (GREEN phase - TDD)
 * FlatList + search + filters + FAB
 */

import React, { useEffect, useState } from 'react'
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native'
import { Text, FAB, Searchbar } from 'react-native-paper'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { ProjectsStackParamList } from '@/navigation/types'
import type { Project } from '@/api/types.gen'
import { useProjects } from '@/features/projects/hooks/useProjects'
import { useProjectsStore } from '@/features/projects/stores/projectsStore'
import { ProjectCard } from '@/features/projects/components/ProjectCard'

type Props = NativeStackScreenProps<ProjectsStackParamList, 'ProjectsList'>

export function ProjectsListScreen({ navigation }: Props): React.ReactElement {
  const { data: projects, isLoading, refetch } = useProjects()
  const filteredProjects = useProjectsStore((state) => state.filteredProjects)
  const filters = useProjectsStore((state) => state.filters)
  const setFilters = useProjectsStore((state) => state.setFilters)
  const setProjects = useProjectsStore((state) => state.setProjects)

  const [refreshing, setRefreshing] = useState(false)

  // Sync projects from API to local store
  useEffect(() => {
    if (projects) {
      setProjects(projects)
    }
  }, [projects, setProjects])

  const handleSearch = (query: string): void => {
    setFilters({ search: query })
  }

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const handleProjectPress = (project: Project): void => {
    navigation.navigate('ProjectDetail', { projectUuid: project.uuid })
  }

  const handleCreateProject = (): void => {
    navigation.navigate('ProjectForm', {})
  }

  const renderProject = ({ item }: { item: Project }): React.ReactElement => {
    return <ProjectCard project={item} onPress={handleProjectPress} />
  }

  const renderEmpty = (): React.ReactElement => (
    <View style={styles.emptyContainer}>
      <Text variant="titleLarge" style={styles.emptyTitle}>
        No Projects Found
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        {filters.search || filters.status || filters.priority
          ? 'Try adjusting your search or filters'
          : 'Create your first project to get started'}
      </Text>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <Searchbar
        placeholder="Search projects..."
        value={filters.search}
        onChangeText={handleSearch}
        style={styles.searchBar}
        testID="projects-search-bar"
      />

      {/* Projects List */}
      <FlatList
        data={filteredProjects}
        renderItem={renderProject}
        keyExtractor={(item) => item.uuid}
        ListEmptyComponent={renderEmpty}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.listContent}
        testID="projects-list"
      />

      {/* FAB for creating new project */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateProject}
        testID="projects-fab"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 80, // Space for FAB
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
})
