import datetime
from django.db import models
from django.conf import settings

utcfromtimestamp = datetime.datetime.utcfromtimestamp

class Task(models.Model):
    representation = models.TextField()
    key = models.IntegerField()


class Battery(models.Model):
    code = models.CharField(max_length=255, unique=True)
    title = models.CharField(max_length=255)
    instructions = models.TextField()
    tasks = models.ManyToManyField(Task)

    def get(content, scope):
        battery = Battery.objects.get(code=content['code'])
        tasks = [{
            'id': task.pk,
            'key': task.key,
            'data': task.representation,
            } for task in battery.tasks.all()]
        return {
                'id': battery.pk,
                'title': battery.title,
                'instructions': battery.instructions,
                'tasks': tasks,
                }

class Tryout(models.Model):
    battery = models.ForeignKey(Battery, on_delete=models.SET_NULL, null=True, blank=True)
    started = models.DateTimeField(null=True, blank=True)
    completed = models.DateTimeField(null=True, blank=True)
    session = models.CharField(max_length=255, null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    def start(content, scope):
        return Tryout.objects.create(
            battery_id=content['battery'],
            started=utcfromtimestamp(content['started']/1000),
            ).pk

class Solve(models.Model):
    tryout = models.ForeignKey(Tryout, on_delete=models.CASCADE)
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    picked = models.DateTimeField(null=True, blank=True)
    solved = models.DateTimeField(null=True, blank=True)
    response = models.IntegerField(null=True, blank=True)
    order = models.IntegerField(null=True, blank=True)

    def add(content, scope):
        return Solve.objects.create(
            task_id=content['task_id'],
            tryout_id=content['tryout_id'],
            picked=utcfromtimestamp(content['picked']/1000),
            solved=utcfromtimestamp(content['solved']/1000),
            response=content['response'],
            order=content['order'],
            ).pk
