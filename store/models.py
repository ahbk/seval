import datetime
from django.db import models
from django.conf import settings

utcfromtimestamp = datetime.datetime.utcfromtimestamp


class Task(models.Model):
    representation = models.TextField()
    key = models.IntegerField()

    def as_dict(task):
        return {
            'id': task.pk,
            'data': task.representation,
            'key': task.key,
            }


class Battery(models.Model):
    code = models.CharField(max_length=255, unique=True)
    title = models.CharField(max_length=255)
    instructions = models.TextField()
    tasks = models.ManyToManyField(Task)

    def get(content, scope):
        battery = Battery.objects.get(code=content['code'])
        return {
                'id': battery.pk,
                'title': battery.title,
                'instructions': battery.instructions,
                'tasks': [Task.as_dict(task) for task in battery.tasks.all()],
                }

class Tryout(models.Model):
    battery = models.ForeignKey(Battery, on_delete=models.SET_NULL, null=True, blank=True)
    started = models.DateTimeField(null=True, blank=True)
    ended = models.DateTimeField(null=True, blank=True)
    session = models.CharField(max_length=255, null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    def get(content, scope):
        tryout = Tryout.objects.get(pk=content['id'])
        return {
            'id': tryout.pk,
            'started': tryout.started.timestamp() * 1e3,
            'ended': tryout.ended.timestamp() * 1e3,
            'battery': {
                'title': tryout.battery.title,
                'instructions': tryout.battery.instructions,
                },
            'solves': [ Solve.as_dict(s) for s in tryout.solve_set.all() ]
            }

    def start(content, scope):
        return Tryout.objects.create(
            battery_id=content['battery'],
            started=utcfromtimestamp(content['started']/1e3),
            ).pk

    def end(content, scope):
        tryout = Tryout.objects.get(pk=content['id'])
        tryout.ended=utcfromtimestamp(content['ended']/1e3)
        tryout.save()

        return {
            'id': tryout.pk,
            'started': tryout.started.timestamp() * 1e3,
            'ended': tryout.ended.timestamp() * 1e3,
            }


class Solve(models.Model):
    tryout = models.ForeignKey(Tryout, on_delete=models.CASCADE)
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    picked = models.DateTimeField(null=True, blank=True)
    solved = models.DateTimeField(null=True, blank=True)
    response = models.IntegerField(null=True, blank=True)
    order = models.IntegerField(null=True, blank=True)

    def add(content, scope):
        solve = Solve(
            tryout_id=content['tryout_id'],
            task_id=content['task_id'],
            picked=utcfromtimestamp(content['picked']/1e3),
            solved=utcfromtimestamp(content['solved']/1e3),
            response=content['response'],
            order=content['order'],
            )

        solve.save()

        return Solve.as_dict(solve)
    
    def as_dict(solve):
        return {
            'tryout': solve.tryout.pk,
            'id': solve.pk,
            'picked': solve.picked.timestamp() * 1e3,
            'solved': solve.solved.timestamp() * 1e3,
            'response': solve.response,
            'order': solve.order,
            'correct': solve.response == solve.task.key,
            'task': Task.as_dict(solve.task),
            }

