from django.db import models

from QuizApp.models.QuestionCategory import QuestionCategory
from QuizApp.models.Case import Case


class Option(models.Model):
    title = models.CharField(max_length=255)
    question_category = models.ForeignKey(
        QuestionCategory, on_delete=models.CASCADE, blank=False, null=False
    )
    isTrue = models.BooleanField(default=False)
    question_case = models.ForeignKey(Case, on_delete=models.CASCADE)
    gender = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.title
