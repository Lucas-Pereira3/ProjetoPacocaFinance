from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction
from .models import Venda, Produto
from .serializers import VendaReadSerializer, VendaWriteSerializer

class VendaViewSet(viewsets.ModelViewSet):
    queryset = Venda.objects.all().order_by('-data_venda')

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return VendaReadSerializer
        return VendaWriteSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        print("=== DADOS RECEBIDOS ===")
        print(f"Dados: {request.data}")
        print("=======================")
        
        # Verifica se é uma lista ou um objeto individual
        if isinstance(request.data, list):
            # Processa múltiplas vendas (carrinho)
            return self._create_multiple_vendas(request.data)
        else:
            # Processa uma única venda
            return self._create_single_venda(request.data)

    def _create_single_venda(self, data):
        """Cria uma única venda"""
        serializer = self.get_serializer(data=data)
        
        if not serializer.is_valid():
            print(f"Erros de validação: {serializer.errors}")
            return Response(
                {"error": "Dados inválidos", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        validated_data = serializer.validated_data
        produto = validated_data['produto']
        quantidade = validated_data['quantidade']
        
        # Valida estoque
        if produto.estoque < quantidade:
            error_msg = f"Estoque insuficiente para {produto.nome}. Disponível: {produto.estoque}"
            print(error_msg)
            return Response(
                {"error": error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Atualiza estoque
        produto.estoque -= quantidade
        produto.save()
        
        # Adiciona os valores calculados
        validated_data['valor_unitario'] = produto.preco_venda
        validated_data['valor_total'] = produto.preco_venda * quantidade
        
        # Cria a venda
        venda = Venda.objects.create(**validated_data)
        
        # Use o serializer de leitura para a resposta
        read_serializer = VendaReadSerializer(venda)
        print(f"Venda criada com sucesso: {venda.id}")
        
        headers = self.get_success_headers(read_serializer.data)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def _create_multiple_vendas(self, data_list):
        """Cria múltiplas vendas (para carrinho)"""
        vendas_criadas = []
        errors = []
        
        # Primeiro valida todo o estoque
        for i, data in enumerate(data_list):
            serializer = self.get_serializer(data=data)
            if not serializer.is_valid():
                errors.append(f"Item {i+1}: {serializer.errors}")
                continue
                
            validated_data = serializer.validated_data
            produto = validated_data['produto']
            quantidade = validated_data['quantidade']
            
            if produto.estoque < quantidade:
                errors.append(f"Item {i+1}: Estoque insuficiente para {produto.nome}. Disponível: {produto.estoque}")
        
        # Se houver erros, retorna todos de uma vez
        if errors:
            return Response(
                {"error": "Erros de validação", "details": errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Se não houver erros, processa todas as vendas
        for data in data_list:
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)  # Já validamos, então não deve falhar
            
            validated_data = serializer.validated_data
            produto = validated_data['produto']
            quantidade = validated_data['quantidade']
            
            # Atualiza estoque
            produto.estoque -= quantidade
            produto.save()
            
            # Adiciona os valores calculados
            validated_data['valor_unitario'] = produto.preco_venda
            validated_data['valor_total'] = produto.preco_venda * quantidade
            
            # Cria a venda
            venda = Venda.objects.create(**validated_data)
            read_serializer = VendaReadSerializer(venda)
            vendas_criadas.append(read_serializer.data)
        
        print(f"{len(vendas_criadas)} vendas criadas com sucesso")
        return Response(vendas_criadas, status=status.HTTP_201_CREATED)