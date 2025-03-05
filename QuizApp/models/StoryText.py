from django.db import models

from QuizApp.models.VariableName import VariableName


# Create your models here.
class StoryText(models.Model):
    variable = models.ForeignKey(
        VariableName, on_delete=models.CASCADE, blank=False, null=False
    )
    text = models.TextField()

    def __str__(self):
        return f"{str(self.variable.variable_code)} {str(self.text)}"
