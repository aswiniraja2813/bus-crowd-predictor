from django.db import models
from django.utils import timezone
from django.conf import settings


class Route(models.Model):
    route_number = models.CharField(max_length=10)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.route_number
    # this function is used to display the route number in the admin panel rather than displaying as routes object


class Stop(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class CrowdReport(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    stop = models.ForeignKey(Stop, on_delete=models.CASCADE)
    crowd_level = models.IntegerField()
    reported_at = models.DateTimeField(default=timezone.now)
    user = models.ForeignKey(
    settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
)
    def __str__(self):
        return f"{self.route.route_number} at {self.stop.name}: level {self.crowd_level}"

class RouteStop(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    stop = models.ForeignKey(Stop, on_delete=models.CASCADE)
    stop_order = models.IntegerField()

    def __str__(self):
        return f"{self.route.route_number}: {self.stop_order}. {self.stop.name}"

