/**
 * ProjectFormScreen - Session 9.5 Implementation (GREEN phase - TDD)
 * Create/Edit project form with React Hook Form + Zod validation
 */

import React, { useEffect } from 'react'
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { Text, TextInput, Button, SegmentedButtons, ActivityIndicator, HelperText } from 'react-native-paper'
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
              <Text variant="bodyMedium" style={styles.fieldLabel}>
                Status
              </Text>
              <View testID="project-status-input">
                <SegmentedButtons
                  value={value || 'draft'}
                  onValueChange={onChange}
                  buttons={[
                    { value: 'draft', label: STATUS_LABELS.draft, testID: 'project-status-input-draft' },
                    { value: 'active', label: STATUS_LABELS.active, testID: 'project-status-input-active' },
                    { value: 'completed', label: STATUS_LABELS.completed, testID: 'project-status-input-completed' },
                    { value: 'archived', label: STATUS_LABELS.archived, testID: 'project-status-input-archived' },
                  ]}
                />
              </View>
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
              <Text variant="bodyMedium" style={styles.fieldLabel}>
                Priority
              </Text>
              <View testID="project-priority-input">
                <SegmentedButtons
                  value={String(value || 2)}
                  onValueChange={(v) => onChange(Number(v))}
                  buttons={[
                    { value: '1', label: PRIORITY_LABELS[1], testID: 'project-priority-input-1' },
                    { value: '2', label: PRIORITY_LABELS[2], testID: 'project-priority-input-2' },
                    { value: '3', label: PRIORITY_LABELS[3], testID: 'project-priority-input-3' },
                    { value: '4', label: PRIORITY_LABELS[4], testID: 'project-priority-input-4' },
                  ]}
                />
              </View>
              {errors.priority && (
                <HelperText type="error" visible={!!errors.priority}>
                  {errors.priority.message}
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
