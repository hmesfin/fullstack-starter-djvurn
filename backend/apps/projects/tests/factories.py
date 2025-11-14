# apps/projects/tests/factories.py
from datetime import timedelta

import factory

from apps.projects.models import Project
from apps.users.tests.factories import UserFactory


class ProjectFactory(factory.django.DjangoModelFactory):
    """
    Factory for creating Project instances with realistic test data.

    Usage:
        # Basic project with defaults (DRAFT status, MEDIUM priority)
        project = ProjectFactory()

        # Project with specific attributes
        project = ProjectFactory(name="Custom Name", status=Project.Status.ACTIVE)

        # Using traits
        project = ProjectFactory(active=True, high_priority=True)

        # With specific owner
        user = UserFactory()
        project = ProjectFactory(owner=user)

        # With dates
        project = ProjectFactory(with_dates=True)
    """

    class Meta:
        model = Project
        skip_postgeneration_save = True

    # Core fields
    name = factory.Faker("catch_phrase")
    description = factory.Faker("paragraph", nb_sentences=3)
    owner = factory.SubFactory(UserFactory)

    # Default to DRAFT status and MEDIUM priority
    status = Project.Status.DRAFT
    priority = Project.Priority.MEDIUM

    # Dates are nullable by default
    start_date = None
    due_date = None

    class Params:
        # Status traits
        draft = factory.Trait(status=Project.Status.DRAFT)
        active = factory.Trait(status=Project.Status.ACTIVE)
        completed = factory.Trait(status=Project.Status.COMPLETED)
        archived = factory.Trait(status=Project.Status.ARCHIVED)

        # Priority traits
        low_priority = factory.Trait(priority=Project.Priority.LOW)
        medium_priority = factory.Trait(priority=Project.Priority.MEDIUM)
        high_priority = factory.Trait(priority=Project.Priority.HIGH)
        critical_priority = factory.Trait(priority=Project.Priority.CRITICAL)

        # Date traits
        with_dates = factory.Trait(
            start_date=factory.Faker("date_between", start_date="-30d", end_date="today"),
            due_date=factory.Faker("date_between", start_date="today", end_date="+60d"),
        )

        # Overdue trait (due_date in the past)
        overdue = factory.Trait(
            status=Project.Status.ACTIVE,
            start_date=factory.Faker("date_between", start_date="-60d", end_date="-30d"),
            due_date=factory.Faker("date_between", start_date="-29d", end_date="-1d"),
        )

        # Starting soon (start_date in near future)
        starting_soon = factory.Trait(
            status=Project.Status.DRAFT,
            start_date=factory.Faker("date_between", start_date="today", end_date="+7d"),
            due_date=factory.Faker("date_between", start_date="+8d", end_date="+30d"),
        )


class DraftProjectFactory(ProjectFactory):
    """Draft project - use ProjectFactory(draft=True) instead"""
    status = Project.Status.DRAFT


class ActiveProjectFactory(ProjectFactory):
    """Active project - use ProjectFactory(active=True) instead"""
    status = Project.Status.ACTIVE


class CompletedProjectFactory(ProjectFactory):
    """Completed project - use ProjectFactory(completed=True) instead"""
    status = Project.Status.COMPLETED


class ArchivedProjectFactory(ProjectFactory):
    """Archived project - use ProjectFactory(archived=True) instead"""
    status = Project.Status.ARCHIVED


class HighPriorityProjectFactory(ProjectFactory):
    """High priority project - use ProjectFactory(high_priority=True) instead"""
    priority = Project.Priority.HIGH


class CriticalProjectFactory(ProjectFactory):
    """Critical priority project - use ProjectFactory(critical_priority=True) instead"""
    priority = Project.Priority.CRITICAL
    status = Project.Status.ACTIVE


class OverdueProjectFactory(ProjectFactory):
    """
    Overdue project - use ProjectFactory(overdue=True) instead
    Creates an active project with due_date in the past
    """
    status = Project.Status.ACTIVE
    start_date = factory.Faker("date_between", start_date="-60d", end_date="-30d")
    due_date = factory.Faker("date_between", start_date="-29d", end_date="-1d")
