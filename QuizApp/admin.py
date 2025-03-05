from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Group

from QuizApp.models import Question, User
from QuizApp.models.Option import Option
from QuizApp.models.Case import Case
from QuizApp.models.MCQ import MCQ
from QuizApp.models.QuestionTopic import QuestionTopic
from QuizApp.models.QuestionTemplate import QuestionTemplate
from QuizApp.models.QuestionCategory import QuestionCategory
from QuizApp.models.StoryText import StoryText
from QuizApp.models.Variable import Variable
from QuizApp.models.VariableName import VariableName

admin.site.site_header = "AIG Admin"
admin.site.site_title = "Django admin"
admin.site.index_title = "AIG | Admin panel"


class AdminMCQ(admin.ModelAdmin):
    list_filter = ["question", "story", "questionCategory"]
    search_fields = ["question", "story", "questionCategory"]
    list_display = ["question", "story", "questionCategory"]


class AdminQuestionTopic(admin.ModelAdmin):
    list_filter = ["name", "mcq"]
    search_fields = ["name", "mcq__story"]
    list_display = ["name", "mcq"]


class AdminQuestionCategory(admin.ModelAdmin):
    list_filter = ["name", "mcq"]
    search_fields = ["name", "mcq__story"]
    list_display = ["name", "mcq"]


class AdminOption(admin.ModelAdmin):
    list_filter = ["title", "mcq"]
    search_fields = ["title", "mcq__story"]
    list_display = ["title", "mcq"]


admin.site.register(MCQ, AdminMCQ)
admin.site.register(QuestionTopic)
admin.site.register(QuestionCategory)
admin.site.register(QuestionTemplate)
admin.site.register(Variable)
admin.site.register(VariableName)
admin.site.register(Case)
admin.site.register(Option)
admin.site.register(Question)
admin.site.register(StoryText)

# UNREGISTER
admin.site.unregister(Group)

class CustomUserAdmin(UserAdmin):
    fieldsets = (
        *UserAdmin.fieldsets,  # original form fieldsets, expanded
        (                      # new fieldset added on to the bottom
            'Login token',  # group heading of your choice; set to None for a blank space instead of a header
            {
                'fields': (
                    'jwt_secret',
                ),
            },
        ),
        (
            'Picture',  # group heading of your choice; set to None for a blank space instead of a header
            {
                'fields': (
                    'image',
                ),
            },
        )
    )


admin.site.register(User, CustomUserAdmin)