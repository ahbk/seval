import json
from django.core.management.base import BaseCommand
from store.models import Battery, Task
from store.polygons import shape, rotation

class Command(BaseCommand):
    help = 'Run this on empty database'

    def handle(self, *args, **options):
        batterydata = {
            'title': "Sortera blockpar på tid",
            'instructions': (
                """Du kommer få se två tredimensionella block, om blocken har samma
                form ska du swipa höger, annars ska du swipa vänster. Blocken är
                roterade olika så det kan ta ett tag att se. Svara rätt så snabbt
                du kan."""
                )

            }
        battery, created = Battery.objects.update_or_create(
            code='mrt-pair-swipe',
            defaults=batterydata,
            )

        for i in range(0, 5):
            sa, sb = shape(i)
            task, created = Task.objects.update_or_create(
                    pk=3*i,
                    defaults={
                        'key': 0,
                        'representation': json.dumps({
                            'a': { 'r': rotation(), 's': sa  },
                            'b': { 'r': rotation(), 's': sb },
                            }),
                        }
                    )
            battery.tasks.add(task)

            task, created = Task.objects.update_or_create(
                    pk=3*i+1,
                    defaults={
                        'key': 1,
                        'representation': json.dumps({
                            'a': { 'r': rotation(), 's': sa  },
                            'b': { 'r': rotation(), 's': 'a' },
                            }),
                        }
                    )
            battery.tasks.add(task)

            task, created = Task.objects.update_or_create(
                    pk=3*i+2,
                    defaults={
                        'key': 1,
                        'representation': json.dumps({
                            'a': { 'r': rotation(), 's': sb  },
                            'b': { 'r': rotation(), 's': 'a' },
                            }),
                        }
                    )
            battery.tasks.add(task)
