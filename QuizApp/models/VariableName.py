from django.db import models

from QuizApp.models.Case import Case


class VariableName(models.Model):
    name = models.CharField(max_length=255, unique=True)
    variable_code = models.IntegerField(unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "variable name"
