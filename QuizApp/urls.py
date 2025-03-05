from django.urls import path

from QuizApp.views import (
    SendMcqDataView,
    FetchMCQSByCategory,
    get_category_mcq_list,
    get_question_category_mcq_list,
    fetch_topics,
    FetchVariableByTopic,
    FetchQuestionByCases,
    fetch_categories,
    SaveCase,
    FetchThemes,
    FetchCasesByTheme,
    ViewCase,
    DeleteCase,
    EditCase,
    AddTheme,
    DeleteTheme,
    EditTheme,
    PossibleCombinations,
    FetchVariables, FetchStoryVariable, FetchCombinations, FetchMcqFromCases, DownloadTheme, ImportTheme,
    UserLogoutView, UserInfo, UserLoginView,
)

app_name = "QuizApp"

urlpatterns = [
    # path('', views.index,name='name'),
    path("send_mcq_data/", SendMcqDataView.as_view(), name="send_mcq_data"),
    path("category_mcq_list/", get_category_mcq_list, name="category_mcq_list"),
    path(
        "question_category_mcq_list/",
        get_question_category_mcq_list,
        name="question_category_mcq_list",
    ),
    path(
        "fetch_mcq_by_category/",
        FetchMCQSByCategory.as_view(),
        name="fetch_mcq_by_category",
    ),
    path(
        "fetch_topic/",
        fetch_topics,
        name="fetch_topic",
    ),
    path(
        "fetch_categories/",
        fetch_categories,
        name="fetch_categories",
    ),
    path(
        "fetch_themes/",
        FetchThemes.as_view(),
        name="fetch_themes",
    ),
    path(
        "fetch_cases_by_theme/",
        FetchCasesByTheme.as_view(),
        name="fetch_cases_by_theme",
    ),
    path(
        "fetch_variable_by_topic/",
        FetchVariableByTopic.as_view(),
        name="fetch_variable_by_topic",
    ),
    path(
        "FetchStoryVariable/",
        FetchStoryVariable.as_view(),
        name="fetch_variable_by_topic",
    ),
    path(
        "FetchMcqFromCases/",
        FetchMcqFromCases.as_view(),
        name="fetch_mcq_from_cases",
    ),
    path(
        "possible_combinations/",
        PossibleCombinations.as_view(),
        name="possible_combinations",
    ),
    path(
        "checksentence/",
        FetchCombinations.as_view(),
        name="checksentence",
    ),
    path(
        "save_case/",
        SaveCase.as_view(),
        name="save_case",
    ),
    path(
        "view_case/",
        ViewCase.as_view(),
        name="view_case",
    ),
    path(
      "download_theme/",DownloadTheme.as_view(), name="download_theme",
    ),
    path(
      "import_theme/", ImportTheme.as_view(), name="import_theme",
    ),
    path("delete_case/", DeleteCase.as_view(), name="delete_case"),
    path("delete_theme/", DeleteTheme.as_view(), name="delete_theme"),
    path("edit_theme/", EditTheme.as_view(), name="edit_theme"),
    path("edit_case/", EditCase.as_view(), name="edit_case"),
    path("fetch_question_by_cases/", FetchQuestionByCases.as_view(), name="fetch_question_by_cases"),
    path("add_theme/", AddTheme.as_view(), name="add_theme"),
    path("fetch-variables/", FetchVariables.as_view(), name="fetch_variables"),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('logout/', UserLogoutView.as_view(), name='user-logout'),
    path("fetch_user_info/", UserInfo.as_view(), name="fetch_user_info", ),
]
