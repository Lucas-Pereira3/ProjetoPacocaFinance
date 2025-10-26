import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/" onClick={closeMenu}>🥜 PacoçaFinance</NavLink>
      </div>
      
      <div 
        className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
        <li>
          <NavLink 
            to="/produtos" 
            onClick={closeMenu}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            📦 Produtos
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/clientes" 
            onClick={closeMenu}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            👥 Clientes
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/vendas" 
            onClick={closeMenu}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            💰 Nova Venda
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/historico" 
            onClick={closeMenu}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            📊 Histórico
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/servicos" 
            onClick={closeMenu}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            📋 Serviços
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;