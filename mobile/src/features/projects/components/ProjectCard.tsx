/**
 * ProjectCard Component (GREEN phase - TDD)
 * Displays individual project with badges
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Card, Text, Chip } from 'react-native-paper'
import type { Project } from '@/api/types.gen'
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from '@/constants/projects'

export interface ProjectCardProps {
  project: Project
  onPress: (project: Project) => void
}

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

export function ProjectCard({ project, onPress }: ProjectCardProps): React.ReactElement {
  const handlePress = (): void => {
    onPress(project)
  }

  const statusLabel = project.status ? STATUS_LABELS[project.status] : ''
  const statusColor = project.status ? STATUS_COLORS[project.status] : '#9e9e9e'

  const priorityLabel = project.priority ? PRIORITY_LABELS[project.priority] : ''
  const priorityColor = project.priority ? PRIORITY_COLORS[project.priority] : '#9e9e9e'

  return (
    <Card style={styles.card} onPress={handlePress} testID="project-card">
      <Card.Content>
        {/* Project Name */}
        <Text variant="titleMedium" style={styles.title} testID="project-card-title">
          {project.name}
        </Text>

        {/* Project Description */}
        {project.description && (
          <Text variant="bodyMedium" style={styles.description} testID="project-card-description">
            {project.description}
          </Text>
        )}

        {/* Badges Row */}
        <View style={styles.badgesRow}>
          {/* Status Badge */}
          {project.status && (
            <Chip
              style={[styles.badge, { backgroundColor: statusColor }]}
              textStyle={styles.badgeText}
              testID="project-card-status-badge"
            >
              {statusLabel}
            </Chip>
          )}

          {/* Priority Badge */}
          {project.priority && (
            <Chip
              style={[styles.badge, { backgroundColor: priorityColor }]}
              textStyle={styles.badgeText}
              testID="project-card-priority-badge"
            >
              {priorityLabel}
            </Chip>
          )}

          {/* Overdue Indicator */}
          {project.is_overdue && (
            <Chip
              style={[styles.badge, styles.overdueBadge]}
              textStyle={styles.badgeText}
              testID="project-card-overdue-badge"
            >
              Overdue
            </Chip>
          )}
        </View>

        {/* Due Date */}
        {project.due_date && (
          <Text variant="bodySmall" style={styles.dueDate} testID="project-card-due-date">
            Due: {formatDate(project.due_date)}
          </Text>
        )}
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    marginBottom: 12,
    opacity: 0.7,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 8,
  },
  badge: {
    height: 28,
  },
  badgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  overdueBadge: {
    backgroundColor: '#f44336',
  },
  dueDate: {
    opacity: 0.7,
  },
})
