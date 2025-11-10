/**
 * ProjectFormScreen - Session 9.5 Implementation (GREEN phase - TDD)
 * Create/Edit project form with React Hook Form + Zod validation
 */

import React, { useEffect, useState } from 'react'
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native'
import { Text, TextInput, Button, ActivityIndicator, HelperText, Menu, Divider } from 'react-native-paper'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ProjectsStackParamList } from '@/navigation/types'
import { useProject } from '@/features/projects/hooks/useProject'
import { useCreateProject, useUpdateProject } from '@/features/projects/hooks/useProjectMutations'
import { projectCreateSchema, projectUpdateSchema, type ProjectCreateInput } from '@/schemas/project.schema'
import { STATUS_LABELS, PRIORITY_LABELS } from '@/constants/projects'

type Props = NativeStackScreenProps<ProjectsStackParamList, 'ProjectForm'>

/**
 * Form data type (same for create and update)
 */
type ProjectFormData = ProjectCreateInput

export function ProjectFormScreen({ route, navigation }: Props): React.ReactElement {
  const { projectUuid } = route.params || {}
  const isEditMode = !!projectUuid

  // Menu visibility state
  const [statusMenuVisible, setStatusMenuVisible] = useState(false)
  const [priorityMenuVisible, setPriorityMenuVisible] = useState(false)

  // Fetch project if in edit mode
  const { data: project, isLoading, isError, error } = useProject(projectUuid || '', {
    enabled: isEditMode,
  })

  // Mutations
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()

  // Form setup with Zod validation
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(isEditMode ? projectUpdateSchema : projectCreateSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'draft',
      priority: 2,
      start_date: null,
      due_date: null,
    },
  })

  // Pre-populate form in edit mode
  useEffect(() => {
    if (isEditMode && project) {
      reset({
        name: project.name,
        description: project.description || '',
        status: project.status,
        priority: project.priority,
        start_date: project.start_date,
        due_date: project.due_date,
      })
    }
  }, [isEditMode, project, reset])

  // Navigate back after successful create/update
  useEffect(() => {
    if (createProject.isSuccess || updateProject.isSuccess) {
      navigation.goBack()
    }
  }, [createProject.isSuccess, updateProject.isSuccess, navigation])

  // Form submission handler
  const onSubmit = (data: ProjectFormData): void => {
    if (isEditMode && projectUuid) {
      updateProject.mutate({ uuid: projectUuid, data })
    } else {
      createProject.mutate(data)
    }
  }

  // Loading state (only in edit mode)
  if (isEditMode && isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" testID="project-form-loading" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading project...
        </Text>
      </View>
    )
  }

  // Error state (only in edit mode)
  if (isEditMode && (isError || !project)) {
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

  // Determine if mutation is pending
  const isPending = createProject.isPending || updateProject.isPending

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Form Title */}
        <Text variant="headlineMedium" style={styles.title}>
          {isEditMode ? 'Edit Project' : 'Create Project'}
        </Text>

        {/* Name Field */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.fieldContainer}>
              <TextInput
                label="Project Name *"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                error={!!errors.name}
                testID="project-name-input"
              />
              {errors.name && (
                <HelperText type="error" visible={!!errors.name}>
                  {errors.name.message}
                </HelperText>
              )}
            </View>
          )}
        />

        {/* Description Field */}
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.fieldContainer}>
              <TextInput
                label="Description"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                multiline
                numberOfLines={4}
                error={!!errors.description}
                testID="project-description-input"
              />
              {errors.description && (
                <HelperText type="error" visible={!!errors.description}>
                  {errors.description.message}
                </HelperText>
              )}
            </View>
          )}
        />

        {/* Status Field */}
        <Controller
          control={control}
          name="status"
          render={({ field: { onChange, value } }) => (
            <View style={styles.fieldContainer}>
              <Menu
                visible={statusMenuVisible}
                onDismiss={() => setStatusMenuVisible(false)}
                anchor={
                  <Pressable onPress={() => setStatusMenuVisible(true)}>
                    <View pointerEvents="none">
                      <TextInput
                        label="Status"
                        value={value ? STATUS_LABELS[value] : STATUS_LABELS.draft}
                        mode="outlined"
                        editable={false}
                        right={<TextInput.Icon icon="menu-down" />}
                        error={!!errors.status}
                        testID="project-status-input"
                      />
                    </View>
                  </Pressable>
                }
              >
                <Menu.Item
                  onPress={() => {
                    onChange('draft')
                    setStatusMenuVisible(false)
                  }}
                  title="Draft"
                  testID="project-status-input-draft"
                />
                <Menu.Item
                  onPress={() => {
                    onChange('active')
                    setStatusMenuVisible(false)
                  }}
                  title="Active"
                  testID="project-status-input-active"
                />
                <Menu.Item
                  onPress={() => {
                    onChange('completed')
                    setStatusMenuVisible(false)
                  }}
                  title="Completed"
                  testID="project-status-input-completed"
                />
                <Menu.Item
                  onPress={() => {
                    onChange('archived')
                    setStatusMenuVisible(false)
                  }}
                  title="Archived"
                  testID="project-status-input-archived"
                />
              </Menu>
              {errors.status && (
                <HelperText type="error" visible={!!errors.status}>
                  {errors.status.message}
                </HelperText>
              )}
            </View>
          )}
        />

        {/* Priority Field */}
        <Controller
          control={control}
          name="priority"
          render={({ field: { onChange, value } }) => (
            <View style={styles.fieldContainer}>
              <Menu
                visible={priorityMenuVisible}
                onDismiss={() => setPriorityMenuVisible(false)}
                anchor={
                  <Pressable onPress={() => setPriorityMenuVisible(true)}>
                    <View pointerEvents="none">
                      <TextInput
                        label="Priority"
                        value={value ? PRIORITY_LABELS[value] : PRIORITY_LABELS[2]}
                        mode="outlined"
                        editable={false}
                        right={<TextInput.Icon icon="menu-down" />}
                        error={!!errors.priority}
                        testID="project-priority-input"
                      />
                    </View>
                  </Pressable>
                }
              >
                <Menu.Item
                  onPress={() => {
                    onChange(1)
                    setPriorityMenuVisible(false)
                  }}
                  title="Low"
                  testID="project-priority-input-1"
                />
                <Menu.Item
                  onPress={() => {
                    onChange(2)
                    setPriorityMenuVisible(false)
                  }}
                  title="Medium"
                  testID="project-priority-input-2"
                />
                <Menu.Item
                  onPress={() => {
                    onChange(3)
                    setPriorityMenuVisible(false)
                  }}
                  title="High"
                  testID="project-priority-input-3"
                />
                <Menu.Item
                  onPress={() => {
                    onChange(4)
                    setPriorityMenuVisible(false)
                  }}
                  title="Urgent"
                  testID="project-priority-input-4"
                />
              </Menu>
              {errors.priority && (
                <HelperText type="error" visible={!!errors.priority}>
                  {errors.priority.message}
                </HelperText>
              )}
            </View>
          )}
        />

        {/* Start Date Field */}
        <Controller
          control={control}
          name="start_date"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.fieldContainer}>
              <TextInput
                label="Start Date (optional)"
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                placeholder="YYYY-MM-DD"
                error={!!errors.start_date}
                testID="project-start-date-input"
              />
              {errors.start_date && (
                <HelperText type="error" visible={!!errors.start_date}>
                  {errors.start_date.message}
                </HelperText>
              )}
            </View>
          )}
        />

        {/* Due Date Field */}
        <Controller
          control={control}
          name="due_date"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.fieldContainer}>
              <TextInput
                label="Due Date (optional)"
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                placeholder="YYYY-MM-DD"
                error={!!errors.due_date}
                testID="project-due-date-input"
              />
              {errors.due_date && (
                <HelperText type="error" visible={!!errors.due_date}>
                  {errors.due_date.message}
                </HelperText>
              )}
            </View>
          )}
        />

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isPending}
          disabled={isPending}
          style={styles.button}
          testID="project-submit-button"
        >
          {isPending ? 'Saving...' : isEditMode ? 'Update Project' : 'Create Project'}
        </Button>

        {/* Cancel Button */}
        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          disabled={isPending}
          style={styles.button}
        >
          Cancel
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    marginBottom: 8,
    fontWeight: '600',
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
