import React, { useState, useEffect } from 'react';
import api from '../api/api';
import './Page.css';

function Produtos() {
    const [produtos, setProdutos] = useState([]);
    const [form, setForm] = useState({ 
        nome: '', 
        preco_venda: '', 
        estoque: '', 
        descricao: '',
        categoria: 'Paçoca'
    });
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProdutos();
    }, []);

    const fetchProdutos = async () => {
        try {
            const response = await api.get('produtos/');
            setProdutos(response.data.results || response.data);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
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
                await api.put(`produtos/${editId}/`, form);
            } else {
                await api.post('produtos/', form);
            }
            setForm({ 
                nome: '', 
                preco_venda: '', 
                estoque: '', 
                descricao: '',
                categoria: 'Paçoca'
            });
            setEditId(null);
            await fetchProdutos();
        } catch (error) {
            alert('Erro ao salvar produto');
        }
        setLoading(false);
    };

    const handleEdit = (produto) => {
        setForm({
            nome: produto.nome || '',
            preco_venda: produto.preco_venda || '',
            estoque: produto.estoque || '',
            descricao: produto.descricao || '',
            categoria: produto.categoria || 'Paçoca'
        });
        setEditId(produto.id);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Tem certeza que deseja excluir este produto?")) {
            try {
                await api.delete(`produtos/${id}/`);
                await fetchProdutos();
            } catch (error) {
                alert('Erro ao excluir produto');
            }
        }
    };

    const cancelEdit = () => {
        setForm({ 
            nome: '', 
            preco_venda: '', 
            estoque: '', 
            descricao: '',
            categoria: 'Paçoca'
        });
        setEditId(null);
    };

    // Calcular estatísticas
    const totalProdutos = produtos.length;
    const valorTotalEstoque = produtos.reduce((total, produto) => {
        return total + (parseFloat(produto.preco_venda) * parseInt(produto.estoque));
    }, 0);

    const getEstoqueStatus = (estoque) => {
        return estoque <= 5 ? 'baixo' : '';
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="page-header-content">
                    <h1>📦 Gestão de Produtos</h1>
                    <p>Gerencie seu catálogo de produtos e estoque</p>
                </div>
                <div className="page-stats">
                    <div className="page-stat-card">
                        <div className="page-stat-icon">📊</div>
                        <div className="page-stat-info">
                            <h3>{totalProdutos}</h3>
                            <span>Total de Produtos</span>
                        </div>
                    </div>
                    <div className="page-stat-card">
                        <div className="page-stat-icon">💰</div>
                        <div className="page-stat-info">
                            <h3>R$ {valorTotalEstoque.toFixed(2)}</h3>
                            <span>Valor em Estoque</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="page-content">
                {/* Formulário */}
                <div className="page-form-section">
                    <div className="page-card">
                        <h2>{editId ? '✏️ Editar Produto' : '➕ Adicionar Produto'}</h2>
                        <form onSubmit={handleSubmit} className="page-form">
                            <div className="form-group">
                                <label>Nome do Produto</label>
                                <input 
                                    name="nome" 
                                    value={form.nome} 
                                    onChange={handleChange} 
                                    placeholder="Ex: Paçoca Tradicional" 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Preço de Venda (R$)</label>
                                <input 
                                    name="preco_venda" 
                                    value={form.preco_venda} 
                                    onChange={handleChange} 
                                    placeholder="0.00" 
                                    type="number" 
                                    step="0.01" 
                                    min="0"
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Estoque</label>
                                <input 
                                    name="estoque" 
                                    value={form.estoque} 
                                    onChange={handleChange} 
                                    placeholder="Quantidade em estoque" 
                                    type="number" 
                                    min="0"
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Categoria</label>
                                <select 
                                    name="categoria" 
                                    value={form.categoria} 
                                    onChange={handleChange}
                                >
                                    <option value="Paçoca">Paçoca</option>
                                    <option value="Doce">Doce</option>
                                    <option value="Salgado">Salgado</option>
                                    <option value="Bebida">Bebida</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Descrição</label>
                                <textarea 
                                    name="descricao" 
                                    value={form.descricao} 
                                    onChange={handleChange} 
                                    placeholder="Descrição do produto..."
                                    rows="3"
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

                {/* Tabela de Produtos */}
                <div className="page-table-section">
                    <div className="page-card">
                        <h2>📋 Lista de Produtos</h2>
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>Preço</th>
                                        <th>Estoque</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {produtos.map(produto => (
                                        <tr key={produto.id}>
                                            <td>
                                                <div className="produto-info">
                                                    <div className="produto-nome">{produto.nome}</div>
                                                    {produto.descricao && (
                                                        <div className="produto-descricao" title={produto.descricao}>
                                                            {produto.descricao}
                                                        </div>
                                                    )}
                                                    <div className="produto-categoria">
                                                        {produto.categoria}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="valor-cell">
                                                R$ {parseFloat(produto.preco_venda).toFixed(2)}
                                            </td>
                                            <td className="estoque-cell">
                                                <span className={`estoque-badge ${getEstoqueStatus(produto.estoque)}`}>
                                                    {produto.estoque} uni
                                                </span>
                                            </td>
                                            <td className="actions-cell">
                                                <button 
                                                    className="edit-btn"
                                                    onClick={() => handleEdit(produto)}
                                                    title="Editar"
                                                >
                                                    ✏️
                                                </button>
                                                <button 
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(produto.id)}
                                                    title="Excluir"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {produtos.length === 0 && (
                                <div className="no-data">
                                    📝 Nenhum produto cadastrado
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Produtos;