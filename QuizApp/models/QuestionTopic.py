from django.db import models


class QuestionTopic(models.Model):
    name = models.CharField(max_length=255)
    # mcq = models.ForeignKey(MCQ, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Question topic"
