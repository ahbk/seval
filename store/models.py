from django.db import models
from django.conf import settings

class Tryout(models.Model):
    started = models.DateTimeField(null=True, blank=True)
    completed = models.DateTimeField(null=True, blank=True)
    session = models.CharField(max_length=255, null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

class Task(models.Model):
    representation = models.TextField()
    description = models.TextField()
    key = models.CharField(max_length=255)

class Solve(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    tryout = models.ForeignKey(Tryout, on_delete=models.CASCADE)
    picked = models.DateTimeField()
    solved = models.DateTimeField()
    response = models.CharField(max_length=255)
    order = models.IntegerField()
