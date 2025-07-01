from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Company, CompanyDocument
from .serializers import CompanySerializer, CompanyDocumentSerializer
from users.permissions import IsSuperUser

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsSuperUser]

    @action(detail=True, methods=['post'], permission_classes=[IsSuperUser])
    def upload_document(self, request, pk=None):
        company = self.get_object()
        files = request.FILES.getlist('documents')
        if len(files) > 10:
            return Response({'error': 'You can upload a maximum of 10 documents.'}, status=status.HTTP_400_BAD_REQUEST)
        created = []
        for f in files:
            if f.size > 5 * 1024 * 1024:
                return Response({'error': f'{f.name} exceeds 5MB limit.'}, status=status.HTTP_400_BAD_REQUEST)
            doc = CompanyDocument.objects.create(company=company, file=f)
            created.append(CompanyDocumentSerializer(doc).data)
        return Response({'uploaded': created}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='bulk_upload', permission_classes=[IsSuperUser])
    def bulk_upload(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file uploaded'}, status=400)

        import csv
        decoded_file = file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)
        results = []
        for i, row in enumerate(reader, start=1):
            serializer = CompanySerializer(data=row)
            if serializer.is_valid():
                serializer.save()
                results.append({'row': i, 'status': 'success'})
            else:
                results.append({'row': i, 'status': 'error', 'errors': serializer.errors})

        return Response({'results': results})
