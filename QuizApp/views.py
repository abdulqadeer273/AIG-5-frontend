import random
from tokenize import TokenError

from django.contrib.auth import authenticate
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Count
from django.http import JsonResponse
from django.shortcuts import render
from jwt import ExpiredSignatureError, InvalidTokenError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import AccessToken

from QuizApp.models import Question, User
from QuizApp.models.Case import Case

# Models
from QuizApp.models.MCQ import MCQ
from QuizApp.models.McqOption import McqOption
from QuizApp.models.Option import Option
from QuizApp.models.QuestionCategory import QuestionCategory
from QuizApp.models.QuestionTemplate import QuestionTemplate
from QuizApp.models.QuestionTopic import QuestionTopic
from QuizApp.models.StoryText import StoryText
from QuizApp.models.Variable import Variable
from QuizApp.models.VariableName import VariableName
from QuizApp.utils import generate_jwt_token


class SendMcqDataView(APIView):
    def post(self, request):
        object = request.data
        topic = None
        for data in object:

            # MCQ DATA CREATION
            story_content = data["story"]
            question_title = data["question"]
            question_category = data["questionCategory"]
            mcq_category = data["mcqCategory"]
            options = data["options"]

            topic, created = QuestionTopic.objects.get_or_create(name=mcq_category)
            q_category, q_category_created = QuestionCategory.objects.get_or_create(
                name=question_category
            )
            mcq_obj = MCQ.objects.create(
                story=story_content,
                question=question_title,
                questionTopic=topic,
                questionCategory=q_category,
            )
            mcq_obj.save()

            for option in options:
                McqOption.objects.create(title=option, mcq_id=mcq_obj.id)

        return Response(object)


def index(request):
    return render(request, "index.html")


def cases_list_data(cases_list, categories):
    cases_list_two = []
    for case_obj in cases_list:
        for category in categories:
            male_in_correct_options_count = (
                Option.objects.filter(
                    isTrue=False,
                    question_category__name=category,
                    question_case__name=case_obj.name,
                    gender__in=["male", "both"],
                )
                .exclude(title="")
                .values()
                .distinct()
                .count()
            )
            female_in_correct_options_count = (
                Option.objects.filter(
                    isTrue=False,
                    question_category__name=category,
                    question_case__name=case_obj.name,
                    gender__in=["both", "female"],
                )
                .exclude(title="")
                .values()
                .distinct()
                .count()
            )
            if (
                    male_in_correct_options_count > 3
                    or female_in_correct_options_count > 3
            ):
                cases_list_two.append(case_obj.name)
    return cases_list_two


class PossibleCombinations(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        topic = data["topic"]
        cases = Case.objects.filter(topic__name=topic)
        categories = data["categories"]
        distractors_cases_list = cases_list_data(cases, categories)
        response = []
        all_combinations = 0
        cases_list = []
        variables = {}
        for case_obj in cases:
            count = 1
            variable_list = Variable.objects.filter(var_case__name=case_obj.name).values_list('name__variable_code',
                                                                                              flat=True).distinct()
            sentence = ''
            variables[case_obj.name] = sorted(list(variable_list))
            for code in variables[case_obj.name]:
                text_query = StoryText.objects.filter(variable__variable_code=code).values_list('text',
                                                                                                flat=True).distinct()
                text = text_query.first() if text_query else None
                if text is not None:
                    sentence = sentence + ' ' + text
                else:
                    sentence = ''
                    break
            gender_case_count = (
                Variable.objects.filter(var_case=case_obj, name__variable_code="2")
                .exclude(value="both")
                .count()
            )
            if 2 in variable_list:
                if gender_case_count != 0:
                    for variable in variable_list:
                        values_count = (
                            Variable.objects.filter(
                                var_case=case_obj, name__variable_code=variable
                            )
                            .exclude(value="both")
                            .count()
                        )
                        if values_count != 0:
                            count = count * values_count
                            print(variable, 'count')
                        else:
                            print(variable, 'else count')
                            count = 0
                            break
                    if count > 0:
                        all_combinations += count
                        cases_list.append(case_obj.name)
                cases_list_two = []
                for case_obj in cases_list:
                    category_list = []
                    for category in categories:
                        male_correct_options_count = (
                            Option.objects.filter(
                                isTrue=True,
                                question_category__name=category,
                                question_case__name=case_obj,
                                gender__in=["male", "both"],
                            )
                            .exclude(title="")
                            .values()
                            .distinct()
                            .count()
                        )
                        female_correct_options_count = (
                            Option.objects.filter(
                                isTrue=True,
                                question_category__name=category,
                                question_case__name=case_obj,
                                gender__in=["both", "female"],
                            )
                            .exclude(title="")
                            .values()
                            .distinct()
                            .count()
                        )
                        male_in_correct_options_count = (
                            Option.objects.filter(
                                isTrue=False,
                                question_category__name=category,
                                question_case__name=case_obj,
                                gender__in=["male", "both"],
                            )
                            .exclude(title="")
                            .values()
                            .distinct()
                            .count()
                        )
                        female_in_correct_options_count = (
                            Option.objects.filter(
                                isTrue=False,
                                question_category__name=category,
                                question_case__name=case_obj,
                                gender__in=["both", "female"],
                            )
                            .exclude(title="")
                            .values()
                            .distinct()
                            .count()
                        )
                        if (
                                (male_correct_options_count != 0
                                 and male_in_correct_options_count > 3)
                                or (female_correct_options_count != 0
                                    and female_in_correct_options_count > 3)
                        ):
                            category_list.append(category)
                    if len(category_list) == len(categories):
                        cases_list_two.append(case_obj)
                print(cases_list_two, "cases_list_two")
                print(categories, 'categories')
                if len(category_list) == len(categories) and sentence != '':
                    context = {
                        "all_combinations": all_combinations,
                        "cases_list": cases_list_two,
                        "distractors_cases_list": list(distractors_cases_list),
                    }
                else:
                    context = {"all_combinations": 0, "cases_list": 0}
        response.append(context)
        print(response, "response")
        return JsonResponse({"data": response}, safe=False)


def get_sentence(case_name, variable_list):
    variables = {case_name: sorted(list(variable_list))}
    sentence = ''

    for code in variables[case_name]:
        try:
            texts = StoryText.objects.filter(variable__variable_code=code).values_list('text', flat=True).distinct()

            if texts:
                text = random.choice(texts)

                if text:
                    sentence += ' ' + text
                else:
                    sentence = ''
                    break
            else:
                sentence = ''
                break
        except ObjectDoesNotExist:
            sentence = ''
            break

    return sentence


def category_count(categories, cases_list):
    cases_list_two = {}
    for case_obj in cases_list:
        category_list = []
        for category in categories:
            male_correct_options_count = (
                Option.objects.filter(
                    isTrue=True,
                    question_category__name=category,
                    question_case__name=case_obj,
                    gender__in=["male", "both"],
                )
                .exclude(title="")
                .values()
                .distinct()
                .count()
            )
            female_correct_options_count = (
                Option.objects.filter(
                    isTrue=True,
                    question_category__name=category,
                    question_case__name=case_obj,
                    gender__in=["both", "female"],
                )
                .exclude(title="")
                .values()
                .distinct()
                .count()
            )
            male_in_correct_options_count = (
                Option.objects.filter(
                    isTrue=False,
                    question_category__name=category,
                    question_case__name=case_obj,
                    gender__in=["male", "both"],
                )
                .exclude(title="")
                .values()
                .distinct()
                .count()
            )
            female_in_correct_options_count = (
                Option.objects.filter(
                    isTrue=False,
                    question_category__name=category,
                    question_case__name=case_obj,
                    gender__in=["both", "female"],
                )
                .exclude(title="")
                .values()
                .distinct()
                .count()
            )
            if (
                    (male_correct_options_count != 0
                     and male_in_correct_options_count > 3)
                    or (female_correct_options_count != 0
                        and female_in_correct_options_count > 3)
            ):
                category_list.append(category)
        cases_list_two[case_obj] = category_list
    return cases_list_two


def variable_count(case_obj, variable_list):
    count = 1
    try:
        gender_case_count = Variable.objects.filter(var_case=case_obj, name__variable_code="2").exclude(
            value="both").count()
        if 2 in variable_list and gender_case_count != 0:
            for variable in variable_list:
                values_count = Variable.objects.filter(var_case=case_obj, name__variable_code=variable).exclude(
                    value="both").count()
                if values_count != 0:
                    count *= values_count
                else:
                    count = 0
                    break
    except ObjectDoesNotExist:
        count = 0
    return count


class FetchCombinations(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        topic = data["topic"]
        categories = data["categories"]
        cases = Case.objects.filter(topic__name=topic)
        cases_list = []
        all_combinations = 0
        for case_obj in cases:
            variable_list = Variable.objects.filter(var_case__name=case_obj.name).values_list('name__variable_code',
                                                                                              flat=True).distinct()
            sentence = get_sentence(case_obj.name, variable_list)
            count = variable_count(case_obj, variable_list)
            if sentence != '' and count != 0:
                all_combinations += count
                cases_list.append(case_obj.name)
        valid_cases = category_count(categories, cases_list)
        if len(valid_cases) != 0 and all_combinations != 0:
            context = {
                "all_combinations": all_combinations,
                "cases_category_list": valid_cases,
                "cases_list": list(valid_cases.keys())
            }
        else:
            context = {"all_combinations": 0, "cases_list": 0}
        return JsonResponse(context, safe=False)


class FetchMCQSByCategory(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        result = []
        for query in data:
            question_category = query["question_category"]
            no_of_mcqs = int(query["numberOfMCQs"])
            topic = query["topic"]
            mcqs_counts = MCQ.objects.filter(
                questionCategory__name=question_category, questionTopic__name=topic
            ).count()
            if mcqs_counts >= no_of_mcqs:
                object_queryset = (
                    MCQ.objects.filter(
                        questionCategory__name=question_category,
                        questionTopic__name=topic,
                    )
                    .distinct()
                    .order_by("id")[:no_of_mcqs]
                    .values(
                        "id",
                        "story",
                        "question",
                    )
                )
                object_queryset_list = list(object_queryset)
                for object in object_queryset_list:
                    options = McqOption.objects.filter(
                        mcq__id=object["id"]
                    ).values_list("title", flat=True)
                    object["options"] = list(options)
                    result.append(object)
            else:
                context = {
                    "status": "False",
                    "message": f'This category {query["name"]} does not have {int(query["numberOfMCQs"])} mcqs',
                }
                return JsonResponse(context, safe=False)
        return JsonResponse(result, safe=False)


class FetchVariableByTopic(APIView):
    def get(self, request, *args, **kwargs):
        variables = VariableName.objects.all().values()
        variables_data = []
        for variable in variables:
            name = variable["name"]
            code = variable["variable_code"]
            variables_data.append({"name": name, "code": code})
        context = {"variables": variables_data}
        return JsonResponse(context, safe=False)


def get_variable_values(case_name, variable_list, ):
    variable_values_list = []
    gender = ""
    age_in = ""
    for var in variable_list:
        variable_values = Variable.objects.filter(name__variable_code=var, var_case__name=case_name).values(
            "value", "age_in").exclude(value="both")
        if len(variable_values) == 0:
            raise ValueError("Variable values not found.")
        value = random.choice(variable_values)
        variable_values_list.append(value["value"])
        if var == 1:
            age_in = value["age_in"]
        if var == 2:
            gender = value["value"]
    return variable_values_list, gender, age_in


def create_mcq(question, case_name, gender):
    mcq = {}
    mcq["question"] = question.question
    mcq["correct_option"] = random.choice(
        Option.objects.filter(
            isTrue=True,
            question_category__name=question.question_category,
            question_case__name=case_name,
            gender__in=[gender, "both"],
        ).values()
    )["title"]
    return mcq


def get_distractor_options(question, cases, gender):
    return list(
        Option.objects.filter(
            isTrue=False,
            question_category__name=question.question_category,
            question_case__name__in=cases,
            gender__in=[gender, "both"],
        ).exclude(title="")
        .values("title")
        .distinct()
    )


def get_mcq_options(distractor_options, correct_option):
    values = [item['title'] for item in distractor_options]
    random.shuffle(values)
    distractor = values[:4]
    options = distractor + [f"{correct_option} *"]
    random.shuffle(options)
    return options


class FetchMcqFromCases(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        topic = data["topic"]
        categories = data["casesWiseCategories"]
        case_list = data["casesList"]
        no_of_mcqs = int(data["noOfMcqs"])
        remainder = no_of_mcqs % len(case_list)
        distractor_cases = Case.objects.filter(topic__name=topic)
        cases = Case.objects.filter(topic__name=topic, name__in=case_list).values("name")
        variables = {}
        response = []
        for c in cases:
            distractors_cases_list = cases_list_data(distractor_cases, categories[c['name']])
            all_sets = []
            all_questions = []
            question_count = Question.objects.filter(question_category__name__in=categories[c['name']],
                                                     question_case__name=c['name']).count()

            variable_list = Variable.objects.filter(var_case__name=c['name']).values_list('name__variable_code',
                                                                                          flat=True).distinct()
            if question_count > 0:
                variables[c['name']] = sorted(list(variable_list))
                sentence = get_sentence(c['name'], variables[c['name']])

                if remainder > 0:
                    mcq_per_case = int(no_of_mcqs / len(case_list)) + remainder
                    remainder = 0
                else:
                    mcq_per_case = int(no_of_mcqs / len(case_list))
                age_list = []
                for i in range(int(mcq_per_case)):
                    variable_values_list, gender, age_in = get_variable_values(c['name'], variables[c['name']])
                    age_list.append(age_in)
                    question_data = Question.objects.filter(question_case__name=c['name'],
                                                            question_category__name__in=categories[c['name']])

                    if len(question_data) != 0:
                        random_question = random.choice(question_data)
                        mcq = create_mcq(random_question, c['name'], gender)
                        distractor_options = get_distractor_options(random_question, distractors_cases_list, gender)

                        if len(distractor_options) > 3:
                            options = get_mcq_options(distractor_options, mcq['correct_option'])
                            mcq["category"] = random_question.question_category.name
                            mcq['case_name'] = c['name']
                            mcq["alternative_options"] = options
                            all_questions.append(mcq)
                            all_sets.append(variable_values_list)

                context = {
                    "all_questions": all_questions,
                    "all_sets": all_sets,
                    "variable_used": variables[c['name']],
                    "s": sentence,
                    "case_name": c['name'],
                    "gender_list": age_list
                }
                response.append(context)

        return JsonResponse(response, safe=False)


class FetchStoryVariable(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        topic = data["topic"]
        categories = data["casesWiseCategories"]
        case_list = data["casesList"]
        no_of_mcqs = int(data["noOfMcqs"])
        remainder = no_of_mcqs % len(case_list)
        cases = Case.objects.filter(topic__name=topic, name__in=case_list).values("name")
        valid_cases = []
        response = []
        variables = {}
        for c in cases:
            all_sets = []
            all_questions = []
            question_count = Question.objects.filter(question_category__name__in=categories[c['name']],
                                                     question_case__name=c['name']).values().count()
            variable_list = Variable.objects.filter(var_case__name=c['name']).values_list('name__variable_code',
                                                                                          flat=True).distinct()
            if question_count > 0:
                valid_cases.append(c['name'])
                variables[c['name']] = sorted(list(variable_list))
                sentence = get_sentence(c['name'], variable_list)
                if remainder > 0:
                    mcq_per_case = int(no_of_mcqs / len(case_list)) + remainder
                    remainder = 0
                else:
                    mcq_per_case = int(no_of_mcqs / len(case_list))
                for i in range(int(mcq_per_case)):
                    variable_values_list = []
                    gender = ""
                    for var in variables[c['name']]:
                        variable_values = (
                            Variable.objects.filter(
                                name__variable_code=var, var_case__name=c['name']
                            )
                            .values("value")
                            .exclude(value="both")
                        )
                        if len(variable_values) == 0:
                            # print(variable_values, "variable_values")
                            context = {
                                "caseName": c['name'],
                                "code": var,
                            }
                            return JsonResponse(context, safe=False)
                        value = random.choice(variable_values)
                        variable_values_list.append(value["value"])
                        if var == "2":
                            gender = value["value"]
                    question_data = Question.objects.filter(
                        question_case__name=c['name'],
                        question_category__name__in=categories[c['name']],
                    )
                    if len(question_data) != 0:
                        random_question = random.choice(question_data)
                        mcq = {}
                        mcq["question"] = random_question.question
                        mcq["correct_option"] = random.choice(
                            Option.objects.filter(
                                isTrue=True,
                                question_category__name=random_question.question_category,
                                question_case__name=c['name'],
                                gender__in=[gender, "both"],
                            ).values()
                        )["title"]
                        distractor_options = list(
                            Option.objects.filter(
                                isTrue=False,
                                question_category__name=random_question.question_category,
                                question_case__name__in=[c['name']],
                                gender__in=[gender, "both"],
                            )
                            .exclude(title__in=["", mcq["correct_option"]])
                            .values("title")
                            .distinct()
                        )
                        # print(distractor_options, "distractor options")
                        if len(distractor_options) > 3:
                            random.shuffle(distractor_options)
                            distractor = []
                            for i in range(4):
                                distractor.append(distractor_options[i]["title"])
                            options = [
                                distractor[0],
                                distractor[1],
                                distractor[2],
                                distractor[3],
                                f"{mcq['correct_option']} *",
                            ]
                            random.shuffle(options)
                            mcq["category"] = random_question.question_category.name
                            mcq['case_name'] = c['name']
                            mcq["alternative_options"] = options
                            all_questions.append(mcq)
                            all_sets.append(variable_values_list)
                        context = {
                            "all_questions": all_questions,
                            "all_sets": all_sets,
                            "variable_used": variables[c['name']],
                            "s": sentence,
                            "case_name": c['name'],
                        }
            response.append(context)
        return JsonResponse(response, safe=False)


def creation_of_case(data, question_case, edit):
    for variable in data["variables"]:  # other Variable
        other_variable, created = VariableName.objects.get_or_create(
            variable_code=variable
        )
        variables_list = []
        for value in data["variables"][variable]:
            variables_list.append(
                Variable(name=other_variable, var_case=question_case, value=value)
            )
        Variable.objects.bulk_create(variables_list)
    age_range = range(
        int(data["ageRange"][0]), int(data["ageRange"][1]) + 1
    )  # age done
    age_variable = VariableName.objects.get(variable_code="1")
    age_values_list = []
    for n in age_range:
        age_values_list.append(
            Variable(
                name=age_variable,
                var_case=question_case,
                value=n,
                age_in="DAYS",
            )
        )
    Variable.objects.bulk_create(age_values_list)
    age_range_months = range(
        int(data["ageRangeInMonths"][0]), int(data["ageRangeInMonths"][1]) + 1
    )
    age_values_list = []
    for n in age_range_months:
        age_values_list.append(
            Variable(
                name=age_variable,
                var_case=question_case,
                value=n,
                age_in="MONTHS",
            )
        )
    Variable.objects.bulk_create(age_values_list)
    age_range_years = range(
        int(data["ageRangeInYears"][0]), int(data["ageRangeInYears"][1]) + 1
    )
    age_values_list = []
    for n in age_range_years:
        age_values_list.append(
            Variable(
                name=age_variable,
                var_case=question_case,
                value=n,
                age_in="YEARS",
            )
        )
    Variable.objects.bulk_create(age_values_list)
    age_range_weeks = range(
        int(data["ageRangeInWeeks"][0]), int(data["ageRangeInWeeks"][1]) + 1
    )
    age_values_list = []
    for n in age_range_weeks:
        age_values_list.append(
            Variable(
                name=age_variable,
                var_case=question_case,
                value=n,
                age_in="WEEKS",
            )
        )
    Variable.objects.bulk_create(age_values_list)
    gender_variable = VariableName.objects.get(variable_code="2")
    gender_values_list = []
    for gender in data["gender"]:  # gender done
        gender_values_list.append(
            Variable(
                name=gender_variable,
                var_case=question_case,
                value=gender,
            )
        )
    Variable.objects.bulk_create(gender_values_list)
    loop_index = 0
    questions = data["questions"]
    questions_list = []
    for question_category_value in data["questionCategoryValue"]:  # question done
        questions_list.append(
            Question(
                question_category=QuestionCategory.objects.get(
                    name=question_category_value
                ),
                question=questions[loop_index],
                question_case=question_case,
            )
        )
        loop_index += 1
    Question.objects.bulk_create(questions_list)
    for category in data["categoriesFields"]:
        question_category = QuestionCategory.objects.get(name=category)
        correct_options_list = []
        for correct_option in data["correctMultipleOptions"][
            category
        ]:  # correct options done
            if any(obj == "isCorrect" for obj in correct_option):
                if "gender" in correct_option:
                    correct_options_list.append(
                        Option(
                            title=correct_option["title"],
                            question_category=question_category,
                            isTrue=correct_option["isCorrect"],
                            question_case=question_case,
                            gender=correct_option["gender"],
                        )
                    )
                else:
                    correct_options_list.append(
                        Option(
                            title=correct_option["title"],
                            question_category=question_category,
                            isTrue=correct_option["isCorrect"],
                            question_case=question_case,
                        )
                    )
            else:
                if "gender" in correct_option:
                    correct_options_list.append(
                        Option(
                            title=correct_option["title"],
                            question_category=question_category,
                            isTrue=correct_option["isTrue"],
                            question_case=question_case,
                            gender=correct_option["gender"],
                        )
                    )
                else:
                    correct_options_list.append(
                        Option(
                            title=correct_option["title"],
                            question_category=question_category,
                            isTrue=correct_option["isTrue"],
                            question_case=question_case,
                        )
                    )
        Option.objects.bulk_create(correct_options_list)
        distractor_options_list = []
        for in_correct_option in data["option"][category]:  # incorrect options done
            if any(obj == "isCorrect" for obj in in_correct_option):
                if "gender" in in_correct_option:
                    distractor_options_list.append(
                        Option(
                            title=in_correct_option["title"],
                            question_category=question_category,
                            isTrue=in_correct_option["isCorrect"],
                            question_case=question_case,
                            gender=in_correct_option["gender"],
                        )
                    )
                else:
                    distractor_options_list.append(
                        Option(
                            title=in_correct_option["title"],
                            question_category=question_category,
                            isTrue=in_correct_option["isCorrect"],
                            question_case=question_case,
                        )
                    )
            else:
                if "gender" in in_correct_option:
                    distractor_options_list.append(
                        Option(
                            title=in_correct_option["title"],
                            question_category=question_category,
                            isTrue=in_correct_option["isTrue"],
                            question_case=question_case,
                            gender=in_correct_option["gender"],
                        )
                    )
                else:
                    distractor_options_list.append(
                        Option(
                            title=in_correct_option["title"],
                            question_category=question_category,
                            isTrue=in_correct_option["isTrue"],
                            question_case=question_case,
                        )
                    )
        Option.objects.bulk_create(distractor_options_list)


def create_case(data, topic):
    case = Case.objects.create(
        name=data['case_name'],  # case done
        topic=QuestionTopic.objects.get(name=topic),
    )
    data = data['data']
    for variable in data["variables"]:  # other Variable
        other_variable, created = VariableName.objects.get_or_create(
            variable_code=variable
        )
        variables_list = []
        for value in data["variables"][variable]:
            variables_list.append(
                Variable(name=other_variable, var_case=case, value=value)
            )
        Variable.objects.bulk_create(variables_list)
    age_range = range(
        int(data["ageRange"][0]), int(data["ageRange"][1]) + 1
    )  # age done
    age_variable = VariableName.objects.get(variable_code="1")
    age_values_list = []
    for n in age_range:
        age_values_list.append(
            Variable(
                name=age_variable,
                var_case=case,
                value=n,
            )
        )
    Variable.objects.bulk_create(age_values_list)
    gender_variable = VariableName.objects.get(variable_code="2")
    gender_values_list = []
    for gender in data["gender"]:  # gender done
        gender_values_list.append(
            Variable(
                name=gender_variable,
                var_case=case,
                value=gender,
            )
        )
    Variable.objects.bulk_create(gender_values_list)
    loop_index = 0
    questions = data["questions"]
    questions_list = []
    for question_category_value in data["questionCategoryValue"]:  # question done
        questions_list.append(
            Question(
                question_category=QuestionCategory.objects.get(
                    name=question_category_value
                ),
                question=questions[loop_index],
                question_case=case,
            )
        )
        loop_index += 1
    Question.objects.bulk_create(questions_list)
    for category in data["categoriesFields"]:
        question_category = QuestionCategory.objects.get(name=category)
        correct_options_list = []
        for correct_option in data["correctMultipleOptions"][
            category
        ]:  # correct options done
            if any(obj == "isCorrect" for obj in correct_option):
                if "gender" in correct_option:
                    correct_options_list.append(
                        Option(
                            title=correct_option["title"],
                            question_category=question_category,
                            isTrue=correct_option["isCorrect"],
                            question_case=case,
                            gender=correct_option["gender"],
                        )
                    )
                else:
                    correct_options_list.append(
                        Option(
                            title=correct_option["title"],
                            question_category=question_category,
                            isTrue=correct_option["isCorrect"],
                            question_case=case,
                        )
                    )
            else:
                if "gender" in correct_option:
                    correct_options_list.append(
                        Option(
                            title=correct_option["title"],
                            question_category=question_category,
                            isTrue=correct_option["isTrue"],
                            question_case=case,
                            gender=correct_option["gender"],
                        )
                    )
                else:
                    correct_options_list.append(
                        Option(
                            title=correct_option["title"],
                            question_category=question_category,
                            isTrue=correct_option["isTrue"],
                            question_case=case,
                        )
                    )
        Option.objects.bulk_create(correct_options_list)
        distractor_options_list = []
        for in_correct_option in data["option"][category]:  # incorrect options done
            if any(obj == "isCorrect" for obj in in_correct_option):
                if "gender" in in_correct_option:
                    distractor_options_list.append(
                        Option(
                            title=in_correct_option["title"],
                            question_category=question_category,
                            isTrue=in_correct_option["isCorrect"],
                            question_case=case,
                            gender=in_correct_option["gender"],
                        )
                    )
                else:
                    distractor_options_list.append(
                        Option(
                            title=in_correct_option["title"],
                            question_category=question_category,
                            isTrue=in_correct_option["isCorrect"],
                            question_case=case,
                        )
                    )
            else:
                if "gender" in in_correct_option:
                    distractor_options_list.append(
                        Option(
                            title=in_correct_option["title"],
                            question_category=question_category,
                            isTrue=in_correct_option["isTrue"],
                            question_case=case,
                            gender=in_correct_option["gender"],
                        )
                    )
                else:
                    distractor_options_list.append(
                        Option(
                            title=in_correct_option["title"],
                            question_category=question_category,
                            isTrue=in_correct_option["isTrue"],
                            question_case=case,
                        )
                    )
        Option.objects.bulk_create(distractor_options_list)


class SaveCase(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        topic, created = QuestionTopic.objects.get_or_create(
            name=data["topic"]
        )  # topic done
        if topic:
            question_case, created_case = Case.objects.get_or_create(
                name=data["caseName"],  # case done
                topic=QuestionTopic.objects.get(name=topic),
            )
            if created_case:
                creation_of_case(data, question_case, False)
                context = {"status": 200, "data": data}
                return JsonResponse(context, safe=False)
            else:
                return JsonResponse({"status": 400}, safe=False)


class EditCase(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        topic, created = QuestionTopic.objects.get_or_create(
            name=data["topic"]
        )  # topic done
        question_case = Case.objects.get(
            name=data["caseName"], topic=QuestionTopic.objects.get(name=topic)
        )
        case_id = question_case.id
        question_case.delete()
        question_case = Case.objects.create(
            name=data["caseName"],
            id=case_id,
            topic=QuestionTopic.objects.get(name=topic),
        )
        creation_of_case(data, question_case, True)
        context = {"status": 200, "data": data}
        return JsonResponse(context, safe=False)


def get_case_data(theme, case_name):
    selected_case = Case.objects.get(name=case_name, topic__name=theme)
    options = Option.objects.filter(question_case=selected_case)
    other_variable_names = VariableName.objects.exclude(
        name__in={"age", "gender", "Age", "Gender"}
    )
    all_variables = Variable.objects.filter(var_case=selected_case)
    age_values = all_variables.filter(name__name__in=["age", "Age"], age_in="DAYS")
    age_in_months_values = all_variables.filter(name__name__in=["age", "Age"], age_in="MONTHS")
    age_in_years_values = all_variables.filter(name__name__in=["age", "Age"], age_in="YEARS")
    age_in_weeks_values = all_variables.filter(name__name__in=["age", "Age"], age_in="WEEKS")
    # age
    min_age = 100
    max_age = 0
    for age in age_values:
        min_age = min(int(age.value), min_age)
        max_age = max(int(age.value), max_age)
    age_range = {"min_age": min_age, "max_age": max_age}

    min_age_in_months = 100
    max_age_in_months = 0
    for age in age_in_months_values:
        min_age_in_months = min(int(age.value), min_age_in_months)
        max_age_in_months = max(int(age.value), max_age_in_months)
    age_range_in_months = {"min_age": min_age_in_months, "max_age": max_age_in_months}

    min_age_in_years = 100
    max_age_in_years = 0
    for age in age_in_years_values:
        min_age_in_years = min(int(age.value), min_age_in_years)
        max_age_in_years = max(int(age.value), max_age_in_years)
    age_range_in_years = {"min_age": min_age_in_years, "max_age": max_age_in_years}

    min_age_in_weeks = 100
    max_age_in_weeks = 0
    for age in age_in_weeks_values:
        min_age_in_weeks = min(int(age.value), min_age_in_weeks)
        max_age_in_weeks = max(int(age.value), max_age_in_weeks)
    age_range_in_weeks = {"min_age": min_age_in_weeks, "max_age": max_age_in_weeks}

    # gender
    gender = all_variables.filter(name__name__in=["gender", "Gender"]).values_list(
        "value", flat=True
    )

    # other_variables_list
    other_variables_list = {}
    variables_data = []
    for variable_name in other_variable_names:
        name = variable_name.name
        code = variable_name.variable_code
        variables_data.append({"name": name, "code": code})
        values_list = list(
            all_variables.filter(name__name=variable_name).values_list(
                "value", flat=True
            )
        )
        if len(values_list):
            other_variables_list[f"{name} ({code})"] = values_list

    # categories_fields
    categories_fields = (
        Question.objects.filter(question_case=selected_case)
        .values_list("question_category__name", flat=True)
        .distinct()
    )

    # questions
    questions = (
        Question.objects.filter(question_case=selected_case)
        .values_list("question", flat=True)
        .distinct()
    )

    # question_category_values
    question_category_values = Question.objects.filter(
        question_case=selected_case
    ).values_list("question_category__name", flat=True)

    # correct_options
    correct_multiple_options = {}
    for category in categories_fields:
        correct_multiple_options[category] = list(
            options.filter(isTrue=True, question_category__name=category).values()
        )
    # distract_options
    distract_multiple_options = {}
    for category in categories_fields:
        distract_multiple_options[category] = list(
            options.filter(isTrue=False, question_category__name=category).values()
        )
    case_data = {
        "age_range": age_range,
        "age_range_in_years": age_range_in_years,
        "age_range_in_months": age_range_in_months,
        "age_range_in_weeks": age_range_in_weeks,
        "gender": list(gender),
        "other_variables_list": other_variables_list,
        "categories_fields": list(categories_fields),
        "questions": list(questions),
        "question_category_values": list(question_category_values),
        "correct_multiple_options": correct_multiple_options,
        "distract_multiple_options": distract_multiple_options,
        "variables": variables_data,
    }
    return case_data


class ViewCase(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        theme = data["theme"]
        case_name = data["case_name"]
        case_data = get_case_data(theme, case_name)
        return JsonResponse(case_data, safe=False)


class DownloadTheme(APIView):
    def post(self, request, *args, **kwargs):
        theme = request.data['theme']
        cases = Case.objects.filter(topic__name=theme)
        theme_data = []
        for case in cases:
            context = {
                "case_name": case.name,
                "data": get_case_data(theme, case)
            }
            theme_data.append(context)
        return JsonResponse(theme_data, safe=False)


class ImportTheme(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        topic = QuestionTopic.objects.create(
            name=data["themeName"]
        )  # topic done
        for case in data["casesData"]:
            create_case(case, topic)
        context = {"status": 200}
        return JsonResponse(context, safe=False)


class FetchThemes(APIView):
    def get(self, request, *args, **kwargs):
        themes = QuestionTopic.objects.all().values()
        theme_data = []
        for theme in themes:
            cases = Case.objects.filter(topic__name=theme["name"])
            obj = {"name": theme, "noOfCases": len(cases)}
            theme_data.append(obj)
        context = {"themes": theme_data}
        return JsonResponse(context, safe=False)


class FetchVariables(APIView):
    def get(self, request, *args, **kwargs):
        variables = VariableName.objects.exclude(
            name__in=["age", "Age", "Gender", "gender"]
        ).values()
        variables_data = []
        for variable in variables:
            name = variable["name"]
            code = variable["variable_code"]
            variables_data.append({"name": name, "code": code})
        context = {"variables": variables_data}
        return JsonResponse(context, safe=False)


class FetchCasesByTheme(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        # cases = Case.objects.filter(topic__name=data['theme']).values('name')
        cases = Case.objects.filter(topic__name=data["theme"])
        cases_data = []
        for case_obj in cases:
            all_variables = Variable.objects.filter(var_case=case_obj)
            age_values = all_variables.filter(name__variable_code="1")
            gender = all_variables.filter(name__variable_code="2").values_list(
                "value", flat=True
            )
            min_age = 100
            max_age = 0
            for age in age_values:
                min_age = min(int(age.value), min_age)
                max_age = max(int(age.value), max_age)
            age_range = {"min_age": min_age, "max_age": max_age}
            categories_fields = (
                Question.objects.filter(question_case=case_obj)
                .values_list("question_category__name", flat=True)
                .distinct()
            )
            obj = {
                "name": case_obj.name,
                "age_range": age_range,
                "gender": list(gender),
                "categories_fields": list(categories_fields),
            }
            cases_data.append(obj)
        print(cases_data, "caseData")
        return JsonResponse(cases_data, safe=False)


class FetchQuestionByCases(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        topic = data["topic"]
        no_of_mcqs = int(data["noOfMcqs"])
        data["variableUsed"]
        stories_data = data["casesList"]
        story_variables = data["storyVar"]
        remainder = no_of_mcqs % len(stories_data)
        response = []
        print(remainder, "remainder")
        for s in range(len(stories_data)):
            cases_list = stories_data[s]["cases_list"]
            distractors_cases_list = stories_data[s]["distractors_cases_list"]
            all_sets = []
            all_questions = []
            if remainder > 0:
                mcq_per_story = int(no_of_mcqs / len(stories_data)) + remainder
                remainder = 0
            else:
                mcq_per_story = int(no_of_mcqs / len(stories_data))
            gender_list = []
            for i in range(mcq_per_story):
                random_case = random.choice(
                    Case.objects.filter(topic__name=topic, name__in=cases_list)
                )
                variable_values_list = []
                gender = ""
                for var in story_variables[s]:
                    variable_values = (
                        Variable.objects.filter(
                            name__variable_code=var, var_case=random_case
                        )
                        .values("value")
                        .exclude(value="both")
                    )
                    if len(variable_values) == 0:
                        # print(variable_values, "variable_values")
                        context = {
                            "caseName": random_case.name,
                            "code": var,
                        }
                        return JsonResponse(context, safe=False)
                    value = random.choice(variable_values)
                    variable_values_list.append(value["value"])
                    if var == "1":
                        gender_list.append(value["age_in"])
                    if var == "2":
                        gender = value["value"]
                question_data = Question.objects.filter(
                    question_case__name=random_case,
                    question_category__name__in=data["categories"],
                )
                if len(question_data) != 0:
                    random_question = random.choice(question_data)
                    mcq = {}
                    mcq["question"] = random_question.question
                    mcq["correct_option"] = random.choice(
                        Option.objects.filter(
                            isTrue=True,
                            question_category__name=random_question.question_category,
                            question_case__name=random_case,
                            gender__in=[gender, "both"],
                        ).values()
                    )["title"]
                    distractor_options = list(
                        Option.objects.filter(
                            isTrue=False,
                            question_category__name=random_question.question_category,
                            question_case__name__in=distractors_cases_list,
                            gender__in=[gender, "both"],
                        )
                        .exclude(title__in=["", mcq["correct_option"]])
                        .values("title")
                        .distinct()
                    )
                    # print(distractor_options, "distractor options")
                    if len(distractor_options) > 3:
                        random.shuffle(distractor_options)
                        distractor = []
                        for i in range(4):
                            distractor.append(distractor_options[i]["title"])
                        options = [
                            distractor[0],
                            distractor[1],
                            distractor[2],
                            distractor[3],
                            f"{mcq['correct_option']} *",
                        ]
                        random.shuffle(options)
                        mcq["category"] = random_question.question_category.name
                        mcq["alternative_options"] = options
                        all_questions.append(mcq)
                        all_sets.append(variable_values_list)
                    context = {
                        "all_questions": all_questions,
                        "all_sets": all_sets,
                        "variable_used": story_variables[s],
                        "gender_list": gender_list,
                    }
                else:
                    context = {
                        "Error": "Sorry! We didn't find any mcq data that fits to selected categories."
                    }
            response.append(context)
        return JsonResponse(response, safe=False)


def get_category_mcq_list(request):
    mcq_categories = QuestionTopic.objects.all().values("name").distinct()
    context = []
    for category in mcq_categories:
        mcqs = MCQ.objects.filter(questionTopic__name=category["name"])
        if mcqs:
            results_question_category = list(
                mcqs.values("questionCategory__name").annotate(
                    num_mcqs=Count("questionCategory"),
                )
            )
            context.append(
                {"mcq_category": category["name"], "results": results_question_category}
            )
        else:
            context.append({"mcq_category": category["name"], "results": []})
    return JsonResponse(context, safe=False)


def get_question_category_mcq_list(request):
    question_category = (
        QuestionTemplate.objects.all().values("question_category").distinct()
    )
    context = []
    for category in question_category:
        mcq1 = QuestionCategory.objects.get(id=category["question_category"])
        data = QuestionTemplate.objects.filter(
            question_category=category["question_category"]
        )
        results_questions = list(data.values("question"))
        context.append(
            {
                "mcq_category": mcq1.name,
                "results_question": results_questions,
                "selected": False,
            }
        )
    return JsonResponse(context, safe=False)


def fetch_topics(request):
    topics = QuestionTopic.objects.all().values("name").distinct()
    variables = VariableName.objects.all().values().count()
    topics_data = []
    for topic in topics:
        topics_data.append(
            {
                "name": topic["name"],
            }
        )
    context = {"topics": topics_data, "variables_count": variables}
    return JsonResponse(context, safe=False)


def fetch_categories(request):
    categories = QuestionCategory.objects.all().values("name").distinct()
    context = []
    for category in categories:
        context.append(
            {
                "name": category["name"],
            }
        )
    return JsonResponse(context, safe=False)


class DeleteCase(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        theme_case = Case.objects.get(name=data["caseName"], topic__name=data["theme"])
        theme_case.delete()
        return JsonResponse({"status": 200}, safe=False)


class DeleteTheme(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        theme = QuestionTopic.objects.get(name=data["theme"])
        theme.delete()
        return JsonResponse({"status": 200}, safe=False)


class EditTheme(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        theme = QuestionTopic.objects.get(id=data["id"])
        theme.name = data["themeName"]
        theme.save()
        return JsonResponse({"status": 200}, safe=False)


class AddTheme(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        theme, created = QuestionTopic.objects.get_or_create(name=data["theme"])
        if created:
            return JsonResponse({"status": 200}, safe=False)
        else:
            print("error")
            return JsonResponse({"status": 400}, safe=False)

class UserInfo(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            user_obj = User.objects.get(username=request.user)
            return Response({'username': user_obj.username,
                             'image': "https://backend.mcqbank.online"+user_obj.image.url}, status=200)
        except Exception as e:
            return Response({'error': 'Invalid token.'}, status=400)



class UserLoginView(APIView):
    authentication_classes = []

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user:
            # Check if the user is already logged in from another device
            if user.jwt_secret:
                try:
                    AccessToken(user.jwt_secret)
                    # User is already logged in, so return an error
                    return Response({'error': 'User is already logged in from another device/browser. Please logout first or contact admin.'}, status=400)
                except Exception:
                    print("Token Error")
                    pass
            # Generate a new JWT token
            token = generate_jwt_token(user)

            # Save the JWT secret for the user
            user.jwt_secret = token
            user.save()

            return Response({'token': token})
        else:
            return Response({'error': 'Invalid credentials.'}, status=400)


class UserLogoutView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        try:
            # Extract the token from the Authorization header
            token = request.headers.get('Authorization').split(' ')[1]

            # Check if the provided token matches the last token stored in the database
            user = request.user
            if user.jwt_secret is not None:
                if user.jwt_secret == token:
                    # Remove the JWT secret from the user model
                    user.jwt_secret = None
                    user.save()
                else:
                    return Response({'error': 'Invalid token.'}, status=400)
            return Response({'message': 'Logged out successfully.'})
        except Exception as e:
            return Response({'error': 'Invalid token.'}, status=400)