from rest_framework import serializers
from .models import Venda
from produtos.models import Produto  # Adicione esta importação
from clientes.models import Cliente  # Adicione esta importação
from produtos.serializers import ProdutoSerializer
from clientes.serializers import ClienteSerializer

class VendaWriteSerializer(serializers.ModelSerializer):
    cliente = serializers.PrimaryKeyRelatedField(queryset=Cliente.objects.all())
    produto = serializers.PrimaryKeyRelatedField(queryset=Produto.objects.all())
    
    class Meta:
        model = Venda
        fields = ['cliente', 'produto', 'quantidade', 'forma_pagamento', 'observacoes']

class VendaReadSerializer(serializers.ModelSerializer):
    cliente = ClienteSerializer()
    produto = ProdutoSerializer()
    
    class Meta:
        model = Venda
        fields = '__all__'