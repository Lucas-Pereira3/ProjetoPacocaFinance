import React, { useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { CarrinhoContext } from '../context/CarrinhoContext';
import './Page.css';
import './Vendas.css';

function Vendas() {
    const [clientes, setClientes] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [form, setForm] = useState({ clienteId: '', produtoId: '', quantidade: 1 });
    const [formaPagamento, setFormaPagamento] = useState('Dinheiro');
    const [loading, setLoading] = useState(false);
    
    const { itens, adicionarAoCarrinho, removerDoCarrinho, limparCarrinho, getTotal } = useContext(CarrinhoContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientesRes, produtosRes] = await Promise.all([
                    api.get('clientes/'),
                    api.get('produtos/')
                ]);
                setClientes(clientesRes.data.results || clientesRes.data);
                setProdutos(produtosRes.data.results || produtosRes.data);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        const produto = produtos.find(p => p.id === parseInt(form.produtoId));
        
        if (!produto) {
            alert('Selecione um produto!');
            return;
        }
        
        if (produto.estoque < form.quantidade) {
            alert(`Estoque insuficiente! Disponível: ${produto.estoque}`);
            return;
        }
        
        adicionarAoCarrinho(produto, parseInt(form.quantidade));
        setForm({ ...form, produtoId: '', quantidade: 1 });
    };

    const handleFinalizarVenda = async () => {
        if (!form.clienteId) {
            alert("Selecione um cliente!");
            return;
        }
        
        if (itens.length === 0) {
            alert("Carrinho vazio!");
            return;
        }
        
        setLoading(true);
        
        const vendasPayload = itens.map(item => ({
            cliente: parseInt(form.clienteId),
            produto: item.id,
            quantidade: item.quantidade,
            forma_pagamento: formaPagamento,
            preco_unitario: parseFloat(item.preco_venda),
            total: parseFloat(item.subtotal)
        }));
        
        try {
            await api.post('vendas/', vendasPayload);
            alert('🎉 Venda finalizada com sucesso!');
            limparCarrinho();
            setForm({ clienteId: '', produtoId: '', quantidade: 1 });
            setFormaPagamento('Dinheiro');
        } catch (error) {
            alert('❌ Erro ao finalizar venda: ' + (error.response?.data?.error || 'Erro desconhecido'));
        }
        
        setLoading(false);
    };

    const produtoSelecionado = produtos.find(p => p.id === parseInt(form.produtoId));
    const total = getTotal();

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="page-header-content">
                    <h1>💰 Registrar Vendas</h1>
                    <p>Gerencie as vendas da sua loja de forma eficiente</p>
                </div>
                <div className="page-stats">
                    <div className="page-stat-card">
                        <div className="page-stat-icon">👥</div>
                        <div className="page-stat-info">
                            <h3>{clientes.length}</h3>
                            <span>Clientes</span>
                        </div>
                    </div>
                    <div className="page-stat-card">
                        <div className="page-stat-icon">📦</div>
                        <div className="page-stat-info">
                            <h3>{produtos.length}</h3>
                            <span>Produtos</span>
                        </div>
                    </div>
                    <div className="page-stat-card">
                        <div className="page-stat-icon">🛒</div>
                        <div className="page-stat-info">
                            <h3>{itens.length}</h3>
                            <span>Itens no Carrinho</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="vendas-grid">
                {/* Formulário de Venda */}
                <div className="vendas-form">
                    <h2>➕ Nova Venda</h2>
                    <form onSubmit={handleAddItem}>
                        <div className="form-group">
                            <label>Cliente</label>
                            <select 
                                name="clienteId" 
                                value={form.clienteId} 
                                onChange={handleChange} 
                                required
                            >
                                <option value="">Selecione um Cliente</option>
                                {clientes.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Produto</label>
                            <select 
                                name="produtoId" 
                                value={form.produtoId} 
                                onChange={handleChange} 
                                required
                            >
                                <option value="">Selecione um Produto</option>
                                {produtos.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.nome} - R$ {parseFloat(p.preco_venda).toFixed(2)} (Est: {p.estoque})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {produtoSelecionado && (
                            <div className="produto-info-rapida">
                                <div style={{
                                    background: '#FFF3E0',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    color: '#5D4037',
                                    marginBottom: '10px'
                                }}>
                                    <strong>Preço:</strong> R$ {parseFloat(produtoSelecionado.preco_venda).toFixed(2)}<br/>
                                    <strong>Estoque:</strong> {produtoSelecionado.estoque} unidades
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Quantidade</label>
                            <input 
                                name="quantidade" 
                                type="number" 
                                value={form.quantidade} 
                                onChange={handleChange} 
                                min="1" 
                                max={produtoSelecionado?.estoque || 999}
                                required 
                            />
                        </div>

                        <button type="submit" className="btn-adicionar">
                            🛒 Adicionar ao Carrinho
                        </button>
                    </form>
                </div>

                {/* Carrinho */}
                <div className="vendas-carrinho">
                    <div className="carrinho-header">
                        <h2>🛒 Carrinho de Compras</h2>
                        <div className="carrinho-total">
                            Total: R$ {total.toFixed(2)}
                        </div>
                    </div>

                    {itens.length === 0 ? (
                        <div className="carrinho-vazio">
                            📝 Carrinho vazio. Adicione produtos para continuar.
                        </div>
                    ) : (
                        <div className="carrinho-table-container">
                            <table className="carrinho-table">
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>Qtd</th>
                                        <th>Subtotal</th>
                                        <th>Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itens.map(item => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="produto-info-carrinho">
                                                    <div className="produto-nome-carrinho">{item.nome}</div>
                                                    <div className="produto-preco-carrinho">
                                                        R$ {parseFloat(item.preco_venda).toFixed(2)} un
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="quantidade-cell">
                                                {item.quantidade}
                                            </td>
                                            <td className="subtotal-cell">
                                                R$ {parseFloat(item.subtotal).toFixed(2)}
                                            </td>
                                            <td className="actions-cell-carrinho">
                                                <button 
                                                    className="delete-btn-carrinho"
                                                    onClick={() => removerDoCarrinho(item.id)}
                                                    title="Remover do carrinho"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="finalizar-container">
                        <div className="finalizar-header">
                            <div className="finalizar-total">
                                Total: R$ {total.toFixed(2)}
                            </div>
                        </div>
                        
                        <div className="pagamento-group">
                            <label>Forma de Pagamento</label>
                            <select 
                                className="pagamento-select"
                                value={formaPagamento} 
                                onChange={(e) => setFormaPagamento(e.target.value)}
                            >
                                <option value="Dinheiro">💵 Dinheiro</option>
                                <option value="Cartão Débito">💳 Cartão Débito</option>
                                <option value="Cartão Crédito">💳 Cartão Crédito</option>
                                <option value="PIX">📱 PIX</option>
                            </select>
                        </div>

                        <div className="finalizar-actions">
                            <button 
                                className="btn-finalizar"
                                onClick={handleFinalizarVenda}
                                disabled={loading || itens.length === 0}
                            >
                                {loading ? '⏳ Processando...' : '✅ Finalizar Venda'}
                            </button>
                            <button 
                                className="btn-limpar"
                                onClick={limparCarrinho}
                                disabled={itens.length === 0}
                            >
                                🗑️ Limpar Carrinho
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Vendas;