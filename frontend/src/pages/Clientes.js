import React, { useState, useEffect } from 'react';
import api from '../api/api';
import './Page.css';

function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [form, setForm] = useState({ 
        nome: '', 
        telefone: '', 
        email: '', 
        endereco: '' 
    });
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = async () => {
        try {
            const response = await api.get('clientes/');
            setClientes(response.data.results || response.data);
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
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
                await api.put(`clientes/${editId}/`, form);
            } else {
                await api.post('clientes/', form);
            }
            setForm({ 
                nome: '', 
                telefone: '', 
                email: '', 
                endereco: '' 
            });
            setEditId(null);
            await fetchClientes();
        } catch (error) {
            alert('Erro ao salvar cliente');
        }
        setLoading(false);
    };

    const handleEdit = (cliente) => {
        setForm({
            nome: cliente.nome || '',
            telefone: cliente.telefone || '',
            email: cliente.email || '',
            endereco: cliente.endereco || ''
        });
        setEditId(cliente.id);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
            try {
                await api.delete(`clientes/${id}/`);
                await fetchClientes();
            } catch (error) {
                alert('Erro ao excluir cliente');
            }
        }
    };

    const cancelEdit = () => {
        setForm({ 
            nome: '', 
            telefone: '', 
            email: '', 
            endereco: '' 
        });
        setEditId(null);
    };

    // Calcular estatísticas
    const totalClientes = clientes.length;
    const clientesComEmail = clientes.filter(cliente => cliente.email).length;
    const clientesComTelefone = clientes.filter(cliente => cliente.telefone).length;

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="page-header-content">
                    <h1>👥 Gestão de Clientes</h1>
                    <p>Gerencie sua base de clientes e informações de contato</p>
                </div>
                <div className="page-stats">
                    <div className="page-stat-card">
                        <div className="page-stat-icon">👥</div>
                        <div className="page-stat-info">
                            <h3>{totalClientes}</h3>
                            <span>Total de Clientes</span>
                        </div>
                    </div>
                    <div className="page-stat-card">
                        <div className="page-stat-icon">📧</div>
                        <div className="page-stat-info">
                            <h3>{clientesComEmail}</h3>
                            <span>Com E-mail</span>
                        </div>
                    </div>
                    <div className="page-stat-card">
                        <div className="page-stat-icon">📞</div>
                        <div className="page-stat-info">
                            <h3>{clientesComTelefone}</h3>
                            <span>Com Telefone</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="page-content">
                {/* Formulário */}
                <div className="page-form-section">
                    <div className="page-card">
                        <h2>{editId ? '✏️ Editar Cliente' : '➕ Adicionar Cliente'}</h2>
                        <form onSubmit={handleSubmit} className="page-form">
                            <div className="form-group">
                                <label>Nome Completo</label>
                                <input 
                                    name="nome" 
                                    value={form.nome} 
                                    onChange={handleChange} 
                                    placeholder="Ex: João Silva" 
                                    required 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Telefone</label>
                                <input 
                                    name="telefone" 
                                    value={form.telefone} 
                                    onChange={handleChange} 
                                    placeholder="(11) 99999-9999" 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>E-mail</label>
                                <input 
                                    name="email" 
                                    value={form.email} 
                                    onChange={handleChange} 
                                    placeholder="cliente@email.com" 
                                    type="email"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Endereço</label>
                                <textarea 
                                    name="endereco" 
                                    value={form.endereco} 
                                    onChange={handleChange} 
                                    placeholder="Rua, Número, Bairro, Cidade..."
                                    rows="3"
                                />
                            </div>
                            
                            <div className="form-actions">
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? '⏳ Salvando...' : (editId ? '💾 Salvar Alterações' : '➕ Adicionar Cliente')}
                                </button>
                                {editId && (
                                    <button type="button" className="btn-secondary" onClick={cancelEdit}>
                                        ❌ Cancelar Edição
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Tabela de Clientes */}
                <div className="page-table-section">
                    <div className="page-card">
                        <h2>📋 Lista de Clientes</h2>
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Contato</th>
                                        <th>Endereço</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientes.map(cliente => (
                                        <tr key={cliente.id}>
                                            <td>
                                                <div className="cliente-info">
                                                    <div className="cliente-nome">{cliente.nome}</div>
                                                    <div className="cliente-id">ID: {cliente.id}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="contato-info">
                                                    {cliente.telefone && (
                                                        <div className="cliente-telefone">
                                                            📞 {cliente.telefone}
                                                        </div>
                                                    )}
                                                    {cliente.email && (
                                                        <div className="cliente-email">
                                                            📧 {cliente.email}
                                                        </div>
                                                    )}
                                                    {!cliente.telefone && !cliente.email && (
                                                        <div className="sem-contato">
                                                            📝 Sem contato
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="endereco-info">
                                                    {cliente.endereco ? (
                                                        <div className="cliente-endereco">
                                                            🏠 {cliente.endereco}
                                                        </div>
                                                    ) : (
                                                        <div className="sem-endereco">
                                                            📝 Sem endereço
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="actions-cell">
                                                <button 
                                                    className="edit-btn"
                                                    onClick={() => handleEdit(cliente)}
                                                    title="Editar Cliente"
                                                >
                                                    ✏️
                                                </button>
                                                <button 
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(cliente.id)}
                                                    title="Excluir Cliente"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {clientes.length === 0 && (
                                <div className="no-data">
                                    📝 Nenhum cliente cadastrado
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Clientes;