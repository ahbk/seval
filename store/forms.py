from django.forms import ModelForm
from . import models

class TryoutForm(ModelForm):
    class Meta:
        model = models.Tryout
        fields = '__all__'
