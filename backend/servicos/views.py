from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from .models import Servico
from .serializers import ServicoSerializer

class ServicoViewSet(viewsets.ModelViewSet):
    queryset = Servico.objects.all()
    serializer_class = ServicoSerializer

    @action(detail=False, methods=['get'])
    def estatisticas(self, request):
        servicos = Servico.objects.all()
        total_valor = servicos.aggregate(total=Sum('valor'))['total'] or 0
        
        dados = []
        for servico in servicos:
            porcentagem = (servico.valor / total_valor * 100) if total_valor > 0 else 0
            dados.append({
                'id': servico.id,
                'servico': servico.servico,
                'valor': float(servico.valor),
                'porcentagem': round(porcentagem, 1)
            })
        
        return Response({
            'dados': dados,
            'total_servicos': servicos.count(),
            'valor_total': float(total_valor)
        })