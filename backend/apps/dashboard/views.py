from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import DashboardStatsService


class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = DashboardStatsService.get_dashboard_for_user(request.user)
        return Response(data)
