import React, { useState, useEffect } from 'react';
import api from '../api/api';
import './Page.css';
import './HistoricoVendas.css';

function HistoricoVendas() {
    const [vendas, setVendas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtroData, setFiltroData] = useState('');
    const [filtroPagamento, setFiltroPagamento] = useState('');

    useEffect(() => {
        fetchVendas();
    }, []);

    const fetchVendas = async () => {
        setLoading(true);
        try {
            const response = await api.get('vendas/');
            setVendas(response.data.results || response.data);
        } catch (error) {
            console.error('Erro ao buscar vendas:', error);
        }
        setLoading(false);
    };

    const formatarData = (dataStr) => {
        const data = new Date(dataStr);
        return data.toLocaleString('pt-BR');
    };

    const formatarDataCurta = (dataStr) => {
        const data = new Date(dataStr);
        return data.toLocaleDateString('pt-BR');
    };

    const getIconePagamento = (formaPagamento) => {
        switch (formaPagamento) {
            case 'Dinheiro': return '💵';
            case 'Cartão Débito': return '💳';
            case 'Cartão Crédito': return '💳';
            case 'PIX': return '📱';
            default: return '💰';
        }
    };

    const getStatusVenda = (dataVenda) => {
        const data = new Date(dataVenda);
        const hoje = new Date();
        const diffTime = Math.abs(hoje - data);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'hoje';
        if (diffDays <= 7) return 'recente';
        return 'antiga';
    };

    // Filtrar vendas
    const vendasFiltradas = vendas.filter(venda => {
        const matchesData = !filtroData || formatarDataCurta(venda.data_venda).includes(filtroData);
        const matchesPagamento = !filtroPagamento || venda.forma_pagamento === filtroPagamento;
        return matchesData && matchesPagamento;
    });

    // Calcular estatísticas
    const totalVendas = vendasFiltradas.length;
    const valorTotal = vendasFiltradas.reduce((total, venda) => total + parseFloat(venda.valor_total), 0);
    const vendasHoje = vendasFiltradas.filter(venda => getStatusVenda(venda.data_venda) === 'hoje').length;

    const formasPagamento = [...new Set(vendas.map(v => v.forma_pagamento))];

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="page-header-content">
                    <h1>📊 Histórico de Vendas</h1>
                    <p>Acompanhe todas as vendas realizadas na sua loja</p>
                </div>
                <div className="page-stats">
                    <div className="page-stat-card">
                        <div className="page-stat-icon">💰</div>
                        <div className="page-stat-info">
                            <h3>{totalVendas}</h3>
                            <span>Total de Vendas</span>
                        </div>
                    </div>
                    <div className="page-stat-card">
                        <div className="page-stat-icon">📈</div>
                        <div className="page-stat-info">
                            <h3>R$ {valorTotal.toFixed(2)}</h3>
                            <span>Valor Total</span>
                        </div>
                    </div>
                    <div className="page-stat-card">
                        <div className="page-stat-icon">🕒</div>
                        <div className="page-stat-info">
                            <h3>{vendasHoje}</h3>
                            <span>Vendas Hoje</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="page-card">
                <div className="filtros-container">
                    <h3>🔍 Filtros</h3>
                    <div className="filtros-grid">
                        <div className="form-group">
                            <label>Data</label>
                            <input
                                type="date"
                                value={filtroData}
                                onChange={(e) => setFiltroData(e.target.value)}
                                placeholder="Filtrar por data"
                            />
                        </div>
                        <div className="form-group">
                            <label>Forma de Pagamento</label>
                            <select
                                value={filtroPagamento}
                                onChange={(e) => setFiltroPagamento(e.target.value)}
                            >
                                <option value="">Todas</option>
                                {formasPagamento.map(forma => (
                                    <option key={forma} value={forma}>
                                        {getIconePagamento(forma)} {forma}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Ações</label>
                            <div className="filtro-actions">
                                <button 
                                    className="btn-primary"
                                    onClick={fetchVendas}
                                    disabled={loading}
                                >
                                    {loading ? '⏳ Atualizando...' : '🔄 Atualizar Lista'}
                                </button>
                                <button 
                                    className="btn-secondary"
                                    onClick={() => {
                                        setFiltroData('');
                                        setFiltroPagamento('');
                                    }}
                                >
                                    🗑️ Limpar Filtros
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabela de Vendas */}
            <div className="page-card">
                <h2>📋 Histórico Completo</h2>
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Data/Hora</th>
                                <th>Cliente</th>
                                <th>Produto</th>
                                <th>Quantidade</th>
                                <th>Valor</th>
                                <th>Pagamento</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendasFiltradas.map(venda => (
                                <tr key={venda.id} className={`venda-${getStatusVenda(venda.data_venda)}`}>
                                    <td>
                                        <div className="venda-data">
                                            <div className="venda-data-hora">
                                                {formatarData(venda.data_venda)}
                                            </div>
                                            <div className="venda-data-curta">
                                                {formatarDataCurta(venda.data_venda)}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="venda-cliente">
                                            <div className="cliente-nome">{venda.cliente?.nome}</div>
                                            <div className="cliente-id">ID: {venda.cliente?.id}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="venda-produto">
                                            <div className="produto-nome">{venda.produto?.nome}</div>
                                            <div className="produto-preco">
                                                R$ {parseFloat(venda.produto?.preco_venda).toFixed(2)} un
                                            </div>
                                        </div>
                                    </td>
                                    <td className="quantidade-cell">
                                        <span className="quantidade-badge">
                                            {venda.quantidade}
                                        </span>
                                    </td>
                                    <td className="valor-cell">
                                        <div className="venda-valor">
                                            R$ {parseFloat(venda.valor_total).toFixed(2)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="venda-pagamento">
                                            <span className="pagamento-icone">
                                                {getIconePagamento(venda.forma_pagamento)}
                                            </span>
                                            <span className="pagamento-tipo">
                                                {venda.forma_pagamento}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${getStatusVenda(venda.data_venda)}`}>
                                            {getStatusVenda(venda.data_venda) === 'hoje' && '🟢 Hoje'}
                                            {getStatusVenda(venda.data_venda) === 'recente' && '🟡 Recente'}
                                            {getStatusVenda(venda.data_venda) === 'antiga' && '🔴 Antiga'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {vendasFiltradas.length === 0 && !loading && (
                        <div className="no-data">
                            {vendas.length === 0 ? '📝 Nenhuma venda registrada' : '🔍 Nenhuma venda encontrada com os filtros aplicados'}
                        </div>
                    )}
                    
                    {loading && (
                        <div className="no-data">
                            ⏳ Carregando vendas...
                        </div>
                    )}
                </div>
                
                {vendasFiltradas.length > 0 && (
                    <div className="resumo-vendas">
                        <div className="resumo-item">
                            <strong>Total filtrado:</strong> {vendasFiltradas.length} venda(s)
                        </div>
                        <div className="resumo-item">
                            <strong>Valor total:</strong> R$ {valorTotal.toFixed(2)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HistoricoVendas;