# backend/pacoca_api/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Importe suas views de cada app
from servicos.views import ServicoViewSet
from produtos.views import ProdutoViewSet
from clientes.views import ClienteViewSet
from vendas.views import VendaViewSet

# Cria o roteador
router = DefaultRouter()
router.register(r'servicos', ServicoViewSet, basename='servico')
router.register(r'produtos', ProdutoViewSet, basename='produto')
router.register(r'clientes', ClienteViewSet, basename='cliente')
router.register(r'vendas', VendaViewSet, basename='venda')

urlpatterns = [
    path('admin/', admin.site.urls),
    # Adiciona as URLs da API geradas pelo roteador
    path('api/', include(router.urls)),
]