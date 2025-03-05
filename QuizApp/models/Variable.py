from django.db import models

from QuizApp.models.Case import Case
from QuizApp.models.VariableName import VariableName

AGE_IN = (
    ("DAYS", "DAYS"),
    ("MONTHS", "MONTHS"),
    ("YEARS", "YEARS"),
    ("WEEKS", "WEEKS"),
)


class Variable(models.Model):
    name = models.ForeignKey(
        VariableName, on_delete=models.CASCADE, null=True, blank=True
    )
    value = models.CharField(max_length=255)
    var_case = models.ForeignKey(Case, on_delete=models.CASCADE)
    age_in = models.CharField(choices=AGE_IN, max_length=20, null=True, blank=True)

    def __str__(self):
        return f"{self.name.name} {self.value} {self.var_case}"

    class Meta:
        verbose_name = "Variable"
