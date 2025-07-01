from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Project, Property
from .serializers import ProjectSerializer, PropertySerializer
from users.permissions import IsSuperUser

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsSuperUser]

    def create(self, request, *args, **kwargs):
        print("\n====== DEBUG: Entered ProjectViewSet.create() ======")
        print(f"Request user: {request.user}")
        print(f"Request data: {request.data}")
        response = super().create(request, *args, **kwargs)
        print(f"Response status: {response.status_code}")
        print(f"Response data: {response.data}")
        print("====== DEBUG END ======\n")
        return response

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsSuperUser]


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import csv
from .serializers import ProjectSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_upload(request):
    file = request.FILES.get('file')
    if not file:
        return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

    decoded_file = file.read().decode('utf-8').splitlines()
    reader = csv.DictReader(decoded_file)
    results = []

    for i, row in enumerate(reader, start=1):
        serializer = ProjectSerializer(data=row)
        if serializer.is_valid():
            serializer.save()
            results.append({'row': i, 'status': 'success'})
        else:
            results.append({'row': i, 'status': 'error', 'errors': serializer.errors})

    return Response({'results': results}, status=status.HTTP_200_OK)
