# User Factory
import factory

from apps.users.models import User


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        skip_postgeneration_save = True

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    is_active = True
    is_staff = False
    is_superuser = False

    @factory.post_generation
    def password(self, create, extracted, **kwargs):
        if create:
            # Use Faker for random password or extracted value
            raw_password = extracted or factory.Faker("password").evaluate(
                None, None, {"locale": None}
            )
            self.set_password(raw_password)
            self.save()
