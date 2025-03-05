from django.db import models

from QuizApp.models.QuestionTopic import QuestionTopic
from QuizApp.models.QuestionCategory import QuestionCategory


class MCQ(models.Model):
    story = models.TextField()
    question = models.TextField()
    questionTopic = models.ForeignKey(
        QuestionTopic, on_delete=models.CASCADE, null=False, blank=False
    )
    questionCategory = models.ForeignKey(
        QuestionCategory, on_delete=models.CASCADE, blank=False, null=False
    )

    def __str__(self):
        return str(self.questionCategory)
