import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Produtos from './pages/Produtos';
import Clientes from './pages/Clientes';
import Vendas from './pages/Vendas';
import HistoricoVendas from './pages/HistoricoVendas';
import Servicos from './pages/Servicos';
import { CarrinhoProvider } from './context/CarrinhoContext';
import './App.css';

function App() {
  return (
    <Router>
      <CarrinhoProvider>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/produtos" />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/vendas" element={<Vendas />} />
            <Route path="/historico" element={<HistoricoVendas />} />
            <Route path="/servicos" element={<Servicos />} />
          </Routes>
        </main>
      </CarrinhoProvider>
    </Router>
  );
}

export default App;