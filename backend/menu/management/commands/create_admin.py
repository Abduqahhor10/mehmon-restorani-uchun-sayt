import os
import secrets

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from rest_framework.authtoken.models import Token

User = get_user_model()


class Command(BaseCommand):
    help = (
        "Creates (or updates) the staff account used by the admin panel. "
        "Reads ADMIN_USERNAME / ADMIN_PASSWORD from the environment when no "
        "arguments are given, and generates a random password as a last resort."
    )

    def add_arguments(self, parser):
        parser.add_argument('--username', default=None)
        parser.add_argument('--password', default=None)
        parser.add_argument(
            '--reset-password',
            action='store_true',
            help='Overwrite the password of an existing account.',
        )

    def handle(self, *args, **options):
        username = (
            options['username']
            or os.environ.get('ADMIN_USERNAME')
            or 'admin'
        ).strip()
        password = options['password'] or os.environ.get('ADMIN_PASSWORD')
        generated = False

        if not username:
            raise CommandError('Username must not be empty.')

        user = User.objects.filter(username=username).first()

        if user is None:
            if not password:
                password = secrets.token_urlsafe(16)
                generated = True
            user = User.objects.create_user(username=username, password=password)
            created = True
        else:
            created = False
            if password and options['reset_password']:
                user.set_password(password)
            elif password and not options['reset_password']:
                self.stdout.write(
                    self.style.WARNING(
                        f"User '{username}' already exists; pass --reset-password to change it."
                    )
                )

        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save()

        token, _ = Token.objects.get_or_create(user=user)

        action = 'Created' if created else 'Updated'
        self.stdout.write(self.style.SUCCESS(f"{action} staff account '{username}'."))
        if generated:
            self.stdout.write(
                self.style.WARNING(f"Generated password (save it now): {password}")
            )
        self.stdout.write(f"API token: {token.key}")
