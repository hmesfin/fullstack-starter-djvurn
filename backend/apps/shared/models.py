import uuid

from django.db import models
from django.utils.translation import gettext_lazy as _


class TimeStampedModel(models.Model):
    """
    An abstract base class model that provides self-updating
    'created' and 'modified' fields.
    """

    created = models.DateTimeField(_("created"), auto_now_add=True)
    modified = models.DateTimeField(_("modified"), auto_now=True)

    class Meta:
        abstract = True


class UUIDModel(models.Model):
    """
    An abstract base class model that provides a UUID 'id' field.
    """

    id = models.UUIDField(
        _("id"),
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
    )

    class Meta:
        abstract = True


class UUIDTimeStampedModel(TimeStampedModel, UUIDModel):
    """
    An abstract base class model that provides both UUID 'id' field
    and self-updating 'created' and 'modified' fields.
    """

    class Meta:
        abstract = True


class SoftDeleteModel(models.Model):
    """
    An abstract base class model that provides a 'is_deleted' field
    for soft deletion of records.
    """

    is_deleted = models.BooleanField(_("is deleted"), default=False)

    class Meta:
        abstract = True


class BaseModel(UUIDTimeStampedModel, SoftDeleteModel):
    """
    An abstract base class model that combines UUID 'id' field,
    self-updating 'created' and 'modified' fields, and 'is_deleted'
    field for soft deletion.
    """

    class Meta:
        abstract = True
