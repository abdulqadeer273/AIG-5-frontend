from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    jwt_secret = models.CharField(max_length=255, blank=True, null=True)
    image = models.ImageField(null=False, blank=False, default="profile_pictures/profile.png")