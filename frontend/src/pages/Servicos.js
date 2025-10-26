import React, { useState, useEffect } from 'react';
import api from '../api/api';
import './Servicos.css';

function Servicos() {
    const [servicos, setServicos] = useState([]);
    const [estatisticas, setEstatisticas] = useState({ dados: [], total_servicos: 0, valor_total: 0 });
    const [form, setForm] = useState({ servico: '', valor: '' });
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchServicos();
        fetchEstatisticas();
    }, []);

    const fetchServicos = async () => {
        const response = await api.get('servicos/');
        setServicos(response.data.results || response.data);
    };

    const fetchEstatisticas = async () => {
        try {
            const response = await api.get('servicos/estatisticas/');
            setEstatisticas(response.data);
        } catch (error) {
            console.log('Endpoint de estatísticas não disponível');
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editId) {
                await api.put(`servicos/${editId}/`, form);
            } else {
                await api.post('servicos/', form);
            }
            setForm({ servico: '', valor: '' });
            setEditId(null);
            await fetchServicos();
            await fetchEstatisticas();
        } catch (error) {
            alert('Erro ao salvar serviço');
        }
        setLoading(false);
    };

    const handleEdit = (servico) => {
        setForm({ servico: servico.servico, valor: servico.valor });
        setEditId(servico.id);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Tem certeza que deseja excluir este serviço?")) {
            try {
                await api.delete(`servicos/${id}/`);
                await fetchServicos();
                await fetchEstatisticas();
            } catch (error) {
                alert('Erro ao excluir serviço');
            }
        }
    };

    const cancelEdit = () => {
        setForm({ servico: '', valor: '' });
        setEditId(null);
    };

    // Cores para o gráfico
    const cores = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

    return (
        <div className="servicos-container">
            {/* Header */}
            <div className="servicos-header">
                <div className="header-content">
                    <h1>🎯 Controle de Serviços</h1>
                    <p>Gerencie seus serviços e visualize as estatísticas</p>
                </div>
                <div className="header-stats">
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <h3>{estatisticas.total_servicos}</h3>
                            <span>Total de Serviços</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-info">
                            <h3>R$ {estatisticas.valor_total.toFixed(2)}</h3>
                            <span>Valor Total</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="servicos-content">
                {/* Formulário */}
                <div className="form-section">
                    <div className="card">
                        <h2>{editId ? '✏️ Editar Serviço' : '➕ Adicionar Serviço'}</h2>
                        <form onSubmit={handleSubmit} className="modern-form">
                            <div className="form-group">
                                <label>Nome do Serviço</label>
                                <input 
                                    name="servico" 
                                    value={form.servico} 
                                    onChange={handleChange} 
                                    placeholder="Ex: Paçoca" 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Valor (R$)</label>
                                <input 
                                    name="valor" 
                                    value={form.valor} 
                                    onChange={handleChange} 
                                    placeholder="0.00" 
                                    type="number" 
                                    step="0.01" 
                                    min="0"
                                    required 
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? '⏳ Salvando...' : (editId ? '💾 Salvar' : '➕ Adicionar')}
                                </button>
                                {editId && (
                                    <button type="button" className="btn-secondary" onClick={cancelEdit}>
                                        ❌ Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Gráfico de Porcentagem */}
               {/* Gráfico de Porcentagem */}
<div className="chart-section">
    <div className="card">
        <h2>📈 Distribuição por Valor</h2>
        <div className="chart-container">
            {estatisticas.dados.length > 0 ? (
                <div className="percentage-chart">
                    {estatisticas.dados.map((item, index) => (
                        <div key={item.id} className="chart-item">
                            <div className="chart-bar">
                                <div 
                                    className="chart-fill"
                                    style={{
                                        width: `${Math.max(item.porcentagem, 5)}%`,
                                        backgroundColor: cores[index % cores.length]
                                    }}
                                >
                                    <span className="chart-label">
                                        {item.servico} ({item.porcentagem}%)
                                    </span>
                                </div>
                            </div>
                            <div className="chart-value">
                                R$ {item.valor.toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-data">
                    📊 Nenhum dado disponível para o gráfico
                </div>
            )}
        </div>
    </div>
</div>

                {/* Tabela de Serviços */}
                <div className="table-section">
                    <div className="card">
                        <h2>📋 Lista de Serviços</h2>
                        <div className="table-container">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Serviço</th>
                                        <th>Valor</th>
                                        <th>Porcentagem</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {servicos.map((servico, index) => {
                                        const porcentagem = estatisticas.dados.find(s => s.id === servico.id)?.porcentagem || 0;
                                        return (
                                            <tr key={servico.id}>
                                                <td className="servico-name">
                                                    <div 
                                                        className="color-badge"
                                                        style={{ backgroundColor: cores[index % cores.length ]}}
                                                    ></div>
                                                    {servico.servico}
                                                </td>
                                                <td className="valor-cell">
                                                    R$ {parseFloat(servico.valor).toFixed(2)}
                                                </td>
                                                <td className="percentage-cell">
                                                    <span className="percentage-badge">
                                                        {porcentagem}%
                                                    </span>
                                                </td>
                                                <td className="actions-cell">
                                                    <button 
                                                        className="btn-edit"
                                                        onClick={() => handleEdit(servico)}
                                                        title="Editar"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button 
                                                        className="btn-delete"
                                                        onClick={() => handleDelete(servico.id)}
                                                        title="Excluir"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {servicos.length === 0 && (
                                <div className="no-data">
                                    📝 Nenhum serviço cadastrado
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Servicos;