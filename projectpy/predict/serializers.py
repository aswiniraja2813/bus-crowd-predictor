from rest_framework import serializers
from .models import Route
from .models import Stop
from .models import CrowdReport


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = ['id', 'route_number', 'name']

class StopSerializer(serializers.ModelSerializer):
    class Meta:
        model=Stop
        fields = ['id','name']

class CrowdReportSerializer(serializers.ModelSerializer):
    class Meta:
        model=CrowdReport
        fields=['id','route','stop','crowd_level']
        
    def validate_crowd_level(self,value):
        if value not in [1,2,3]:
            raise serializers.ValidationError("Crowd level must be 1, 2 or 3")
        return value
    