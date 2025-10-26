from rest_framework import serializers
from .models import Cliente

class ClienteSerializer(serializers.ModelSerializer):
    data_cadastro = serializers.DateField(format='%Y-%m-%d', read_only=True)
    
    class Meta:
        model = Cliente
        fields = '__all__'