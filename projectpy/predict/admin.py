from django.contrib import admin
from .models import Route, Stop, CrowdReport,RouteStop

admin.site.register(Route)
admin.site.register(Stop)
admin.site.register(CrowdReport)
admin.site.register(RouteStop)