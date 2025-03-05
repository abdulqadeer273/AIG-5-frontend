from django.db import models

from QuizApp.models.QuestionTopic import QuestionTopic


class Case(models.Model):
    name = models.CharField(max_length=255, unique=False)
    topic = models.ForeignKey(
        QuestionTopic, on_delete=models.CASCADE, null=True, blank=True
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Case"
