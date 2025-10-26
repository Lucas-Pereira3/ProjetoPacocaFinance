from django.db import models
from django.utils import timezone
from clientes.models import Cliente
from produtos.models import Produto

class Venda(models.Model):
    data_venda = models.DateTimeField(default=timezone.now)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='vendas')
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    quantidade = models.IntegerField(default=1)
    valor_unitario = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Adicione default
    valor_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)     # Adicione default
    forma_pagamento = models.CharField(max_length=50, default='Dinheiro')
    observacoes = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        # Calcula automaticamente os valores se não forem fornecidos
        if not self.valor_unitario and self.produto:
            self.valor_unitario = self.produto.preco_venda
        
        if not self.valor_total and self.valor_unitario and self.quantidade:
            self.valor_total = self.valor_unitario * self.quantidade
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Venda {self.id} - {self.cliente.nome} - {self.produto.nome}"

    class Meta:
        ordering = ['-data_venda']  # Adicione ordenação padrão