import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from predict.models import RouteStop, CrowdReport


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        now = timezone.localtime()

        for days_ago in range(28):
            day = now - timedelta(days=days_ago)

            for hour in range(6, 22):
                for rs in RouteStop.objects.all():

                    is_weekday = day.weekday() < 5
                    is_rush = hour in [8, 9, 17, 18, 19]

                    if is_weekday and is_rush:
                        level = random.choice([2, 3, 3, 3])
                    else:
                        level = random.choice([1, 1, 2])

                    when = day.replace(hour=hour, minute=random.randint(0, 59))

                    CrowdReport.objects.create(
                        route=rs.route,
                        stop=rs.stop,
                        crowd_level=level,
                        reported_at=when,
                    )

        print("Done creating reports")