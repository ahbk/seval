from datetime import datetime
from django.db import models
from django.conf import settings


class EpochField(models.DateTimeField):
    def from_db_value(self, value, expression, connection):
        return value.timestamp() * 1000

    def to_python(self, value):
        if not value is None and not isinstance(value, datetime):
            value = datetime.fromtimestamp(value/1000.0)

        return value


class Task(models.Model):
    representation = models.TextField()
    description = models.TextField()
    key = models.CharField(max_length=255)

    def read(content, scope):
        return [{
            'id': t.id,
            'representation': t.representation,
            'description': t.description,
            'key': t.key
            } for t in Task.objects.all()]


class Tryout(models.Model):
    started = EpochField(null=True, blank=True)
    completed = EpochField(null=True, blank=True)
    session = models.CharField(max_length=255, null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    def summarize(content, scope):
        tryout = (Tryout.objects
                .annotate(
                    models.Count('solve'),
                    correct=models.Sum('solve__correct'),
                    )
                .get(pk=content['where']['id']))

        return {
                'id': tryout.id,
                'time': tryout.completed - tryout.started,
                'tasks': tryout.solve__count,
                'correct': tryout.correct,
                }


    def create(content, scope):
        return Tryout.objects.create(
            session = scope['session'],
            user = scope['user'].id,
            **content.get('with', {})
        ).pk

    def update(content, scope):
        return Tryout.objects.filter(
            session = scope['session'],
            user = scope['user'].id,
            **content.get('where', {})
        ).update(**content.get('with', {}))


class Solve(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    tryout = models.ForeignKey(Tryout, on_delete=models.CASCADE)
    picked = EpochField(null=True, blank=True)
    solved = EpochField(null=True, blank=True)
    response = models.CharField(max_length=255, null=True, blank=True)
    order = models.IntegerField(null=True, blank=True)
    correct = models.IntegerField(null=True, blank=True)

    def create(content, scope):
        print(content)
        return Solve.objects.create(
            **content.get('with', {}),
        ).pk

    def update(cls, content, scope):
        Solve.objects.filter(
            **content.get('where', {})
        ).update(**content.get('with', {}))
