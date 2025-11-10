/**
 * ProjectDetailScreen - Session 9.4 Implementation (GREEN phase - TDD)
 * Display project details + edit/delete actions
 */

import React, { useEffect } from 'react'
import { View, ScrollView, StyleSheet, Alert } from 'react-native'
import { Text, Button, Chip, ActivityIndicator } from 'react-native-paper'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { ProjectsStackParamList } from '@/navigation/types'
import { useProject } from '@/features/projects/hooks/useProject'
import { useDeleteProject } from '@/features/projects/hooks/useProjectMutations'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_TEXT_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  PRIORITY_TEXT_COLORS,
} from '@/constants/projects'

type Props = NativeStackScreenProps<ProjectsStackParamList, 'ProjectDetail'>

/**
 * Format date string to readable format
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return ''

  const date = new Date(dateString)
  const month = date.toLocaleString('en-US', { month: 'short' })
  const day = date.getDate()
  const year = date.getFullYear()

  return `${month} ${day}, ${year}`
}

export function ProjectDetailScreen({ route, navigation }: Props): React.ReactElement {
  const { projectUuid } = route.params
  const { data: project, isLoading, isError, error } = useProject(projectUuid)
  const deleteProject = useDeleteProject()

  // Navigate back after successful delete
  useEffect(() => {
    if (deleteProject.isSuccess) {
      navigation.goBack()
    }
  }, [deleteProject.isSuccess, navigation])

  const handleEdit = (): void => {
    navigation.navigate('ProjectForm', { projectUuid })
  }

  const handleDelete = (): void => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteProject.mutate(projectUuid)
          },
        },
      ]
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" testID="project-detail-loading" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading project...
        </Text>
      </View>
    )
  }

  // Error state
  if (isError || !project) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="headlineSmall" style={styles.errorTitle}>
          Failed to Load Project
        </Text>
        <Text variant="bodyMedium" style={styles.errorMessage}>
          {error?.message || 'Failed to fetch project details'}
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
          Go Back
        </Button>
      </View>
    )
  }

  // Success state - display project details
  const statusLabel = project.status ? STATUS_LABELS[project.status] : ''
  const statusColor = project.status ? STATUS_COLORS[project.status] : '#9e9e9e'
  const statusTextColor = project.status ? STATUS_TEXT_COLORS[project.status] : '#ffffff'
  const priorityLabel = project.priority ? PRIORITY_LABELS[project.priority] : ''
  const priorityColor = project.priority ? PRIORITY_COLORS[project.priority] : '#9e9e9e'
  const priorityTextColor = project.priority ? PRIORITY_TEXT_COLORS[project.priority] : '#ffffff'

  return (
    <ScrollView style={styles.container} testID="project-detail-content">
      <View style={styles.content}>
        {/* Project Name */}
        <Text variant="headlineMedium" style={styles.title}>
          {project.name}
        </Text>

        {/* Badges Row */}
        <View style={styles.badgesRow}>
          {/* Status Badge */}
          {project.status && (
            <Chip
              style={[styles.badge, { backgroundColor: statusColor }]}
              textStyle={[styles.badgeText, { color: statusTextColor }]}
              testID="project-status-badge"
            >
              {statusLabel}
            </Chip>
          )}

          {/* Priority Badge */}
          {project.priority && (
            <Chip
              style={[styles.badge, { backgroundColor: priorityColor }]}
              textStyle={[styles.badgeText, { color: priorityTextColor }]}
              testID="project-priority-badge"
            >
              {priorityLabel}
            </Chip>
          )}

          {/* Overdue Indicator */}
          {project.is_overdue && (
            <Chip
              style={[styles.badge, styles.overdueBadge]}
              textStyle={styles.badgeText}
              testID="project-overdue-badge"
            >
              Overdue
            </Chip>
          )}
        </View>

        {/* Description */}
        {project.description && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Description
            </Text>
            <Text variant="bodyLarge" style={styles.description}>
              {project.description}
            </Text>
          </View>
        )}

        {/* Dates Section */}
        {(project.start_date || project.due_date) && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Timeline
            </Text>

            {project.start_date && (
              <View style={styles.dateRow}>
                <Text variant="bodyMedium" style={styles.dateLabel}>
                  Start Date:
                </Text>
                <Text variant="bodyMedium" testID="project-start-date">
                  {formatDate(project.start_date)}
                </Text>
              </View>
            )}

            {project.due_date && (
              <View style={styles.dateRow}>
                <Text variant="bodyMedium" style={styles.dateLabel}>
                  Due Date:
                </Text>
                <Text variant="bodyMedium" testID="project-due-date">
                  {formatDate(project.due_date)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Owner Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Owner
          </Text>
          <Text variant="bodyMedium">{project.owner_email}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleEdit}
            style={styles.button}
            testID="project-edit-button"
          >
            Edit Project
          </Button>
          <Button
            mode="outlined"
            onPress={handleDelete}
            style={styles.button}
            loading={deleteProject.isPending}
            disabled={deleteProject.isPending}
            testID="project-delete-button"
          >
            {deleteProject.isPending ? 'Deleting...' : 'Delete Project'}
          </Button>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  badge: {
    height: 32,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  overdueBadge: {
    backgroundColor: '#f44336',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    lineHeight: 24,
  },
  dateRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dateLabel: {
    fontWeight: '600',
    marginRight: 8,
    minWidth: 90,
  },
  actions: {
    marginTop: 16,
  },
  button: {
    marginVertical: 8,
  },
  loadingText: {
    marginTop: 16,
  },
  errorTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.7,
  },
})
