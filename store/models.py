from datetime import datetime
from django.db import models
from django.conf import settings

def process(content, scope):
    if not scope['session'].session_key:
        scope['session'].create()

    for function in ['create', 'update']:
        cls = {
            'Solve': Solve, 'Tryout': Tryout,
            }.get(content.get(function))

        if not cls:
            continue

        getattr(cls, function)(cls, content, scope)

class EpochField(models.DateTimeField):
    def to_python(self, value):
        if not value is None and not isinstance(value, datetime):
            value = datetime.fromtimestamp(value/1000.0)

        return value



class Task(models.Model):
    representation = models.TextField()
    description = models.TextField()
    key = models.CharField(max_length=255)


class Tryout(models.Model):
    started = EpochField(null=True, blank=True)
    completed = EpochField(null=True, blank=True)
    session = models.CharField(max_length=255, null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    def create(cls, content, scope):
        scope['tryout'] = cls.objects.create(
            session = scope['session'],
            user = scope['user'].id,
            **content.get('with', {})
        )

    def update(cls, content, scope):
        cls.objects.filter(
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

    def create(cls, content, scope):
        print(content)
        cls.objects.create(
            tryout = Tryout.objects.get(
                user=scope['user'].id,
                session=scope['session']
            ),
            **content.get('with', {}),
        )

    def update(cls, content, scope):
        cls.objects.filter(
            tryout = Tryout.objects.get(
                user=scope['user'].id,
                session=scope['session']
            ),
            **content.get('where', {})
        ).update(**content.get('with', {}))
