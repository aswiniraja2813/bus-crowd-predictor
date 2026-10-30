from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
# api_view->it turns some function into web requests
from rest_framework.response import Response
# Response is tool use to send data back
from .models import Route,RouteStop
from .serializers import RouteSerializer,CrowdReportSerializer
from .serializers import StopSerializer
from .models import Stop,CrowdReport
from django.db.models import Avg
from django.db.models.functions import ExtractHour
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from datetime import timedelta
from django.utils import timezone

def read_number(request, name, low, high=None):
    """Read a whole number from the address, or raise ValueError with a clear message."""
    raw = request.GET.get(name)
    if raw is None or raw == "":
        raise ValueError(f"{name} is required")
    try:
        value = int(raw)
    except ValueError:
        raise ValueError(f"{name} must be a whole number")
    if value < low or (high is not None and value > high):
        raise ValueError(f"{name} is out of range")
    return value

# it is decorator that tells the browser to answer only get request. get request is get some data on webpage when you open the page
@api_view(['GET'])
def hello(request):
    return Response({"message": "Hello from aswini"})

@api_view(['GET'])
def route_list(request):
    routes = Route.objects.all()
    serializer = RouteSerializer(routes, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def stop_list(request):
    stop= Stop.objects.all()
    # here Object.all is used to retrieve the data from the database 
    serializer=StopSerializer(stop, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def report_create(request):
    serializer = CrowdReportSerializer(data=request.data)
    if serializer.is_valid():
        recent = CrowdReport.objects.filter(
            user=request.user,
            route=serializer.validated_data['route'],
            stop=serializer.validated_data['stop'],
            reported_at__gte=timezone.now() - timedelta(minutes=30),
        ).exists()

        if recent:
            return Response(
                {"error": "You already reported this stop recently. Please try again in 30 minutes."},
                status=429,
            )

        serializer.save(user=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
def predict(request):
    try:
        route = read_number(request, 'route', 1)
        stop = read_number(request, 'stop', 1)
        day = read_number(request, 'day', 0, 6)
        hour = read_number(request, 'hour', 0, 23)
    except ValueError as error:
        return Response({"error": str(error)}, status=400)

    django_day = (day + 1) % 7 + 1

    levels = CrowdReport.objects.filter(
        route_id=route,
        stop_id=stop,
        reported_at__week_day=django_day,
        reported_at__hour=hour,
    ).values_list('crowd_level', flat=True)

    counts = {1: 0, 2: 0, 3: 0}
    for level in levels:
        counts[level] += 1

    best_count = 0
    best_level = None
    for level_number in counts:
        if counts[level_number] > best_count:
            best_count = counts[level_number]
            best_level = level_number

    return Response({
        "predicted_level": best_level,
        "counts": counts,
        "based_on": len(levels),
    })


@api_view(['GET'])
def hourly(request):
    try:
        route = read_number(request, 'route', 1)
        stop = read_number(request, 'stop', 1)
        day = read_number(request, 'day', 0, 6)
    except ValueError as error:
        return Response({"error": str(error)}, status=400)

    django_day = (day + 1) % 7 + 1

    rows = (
        CrowdReport.objects.filter(
            route_id=route,
            stop_id=stop,
            reported_at__week_day=django_day,
        )
        .annotate(hour=ExtractHour('reported_at'))
        .values('hour')
        .annotate(average=Avg('crowd_level'))
        .order_by('hour')
    )

    data = [
        {"hour": r['hour'], "average": round(r['average'], 2)}
        for r in rows
    ]
    return Response(data)


@api_view(['GET'])
def route_stops(request):
    try:
        route = read_number(request, 'route', 1)
    except ValueError as error:
        return Response({"error": str(error)}, status=400)

    rows = (
        RouteStop.objects.filter(route_id=route)
        .select_related('stop')
        .order_by('stop_order')
    )
    data = [{"id": rs.stop.id, "name": rs.stop.name} for rs in rows]
    return Response(data)

@api_view(['POST'])
def signup(request):
    username = str(request.data.get('username', '')).strip()
    password = str(request.data.get('password', ''))

    if not username or len(password) < 6:
        return Response(
            {"error": "Enter a username and a password of at least 6 characters"},
            status=400,
        )

    if User.objects.filter(username=username).exists():
        return Response({"error": "That username is taken"}, status=400)

    user = User.objects.create_user(username=username, password=password)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "username": user.username}, status=201)

 
