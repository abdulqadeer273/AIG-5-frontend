from django.db import models

from QuizApp.models.QuestionCategory import QuestionCategory


# Create your models here.
class QuestionTemplate(models.Model):
    question_category = models.ForeignKey(
        QuestionCategory, on_delete=models.CASCADE, blank=False, null=False
    )
    question = models.TextField()

    def __str__(self):
        return f"{str(self.question_category.name)} {str(self.question)}"
