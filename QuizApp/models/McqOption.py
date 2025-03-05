from django.db import models
from QuizApp.models.MCQ import MCQ


class McqOption(models.Model):
    title = models.CharField(max_length=255)
    mcq = models.ForeignKey(MCQ, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.title
