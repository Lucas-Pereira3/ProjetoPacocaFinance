import React, { createContext, useState } from 'react';

export const CarrinhoContext = createContext();

export const CarrinhoProvider = ({ children }) => {
    const [itens, setItens] = useState([]);
    
    const adicionarAoCarrinho = (produto, quantidade) => {
        const itemExistente = itens.find(i => i.id === produto.id);
        if (itemExistente) {
            alert("Este produto já está no carrinho.");
            return;
        }
        setItens(prevItens => [
            ...prevItens, 
            { 
                ...produto, 
                quantidade, 
                subtotal: parseFloat(produto.preco_venda) * parseInt(quantidade) 
            }
        ]);
    };

    const removerDoCarrinho = (produtoId) => {
        setItens(prevItens => prevItens.filter(item => item.id !== produtoId));
    };

    const limparCarrinho = () => {
        setItens([]);
    };

    const getTotal = () => {
        return itens.reduce((total, item) => total + parseFloat(item.subtotal), 0);
    };

    return (
        <CarrinhoContext.Provider value={{ 
            itens, 
            adicionarAoCarrinho, 
            removerDoCarrinho, 
            limparCarrinho, 
            getTotal 
        }}>
            {children}
        </CarrinhoContext.Provider>
    );
};