using Microsoft.AspNetCore.Mvc;
using LojaEeletronicosAPI.Data;
using LojaEeletronicosAPI.Models;
using LojaEeletronicosAPI.DTOs;
using System;
using System.Linq;

[ApiController]
[Route("api/[controller]")]
public class PedidosController : ControllerBase
{
    private readonly AppDbContext _context;

    public PedidosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("finalizar")]
    public IActionResult FinalizarPedido(PedidoDTO dto)
    {
        var pedido = new Pedido
        {
            UsuarioId = dto.UsuarioId,
            Data = DateTime.Now,
            Total = 0
        };
        _context.Pedidos.Add(pedido);
        _context.SaveChanges();

        decimal total = 0;

        foreach (var item in dto.Itens)
        {
            var produto = _context.Produtos.FirstOrDefault(p => p.ID == item.ProdutoId);

            if (produto == null)
                return BadRequest("Produto não encontrado");

            if (produto.Quantidade < item.Quantidade)
                return BadRequest("Estoque insuficiente");

            var itemPedido = new ItemPedido
            {
                PedidoId = pedido.Id,
                ProdutoId = produto.ID,
                Quantidade = item.Quantidade,
                PrecoUnitario = produto.Preco
            };

            produto.Quantidade -= item.Quantidade;

            total += produto.Preco * item.Quantidade;

            _context.ItensPedido.Add(itemPedido);
        }

        pedido.Total = total;

        _context.SaveChanges();

        return Ok(new { mensagem = "Compra realizada com sucesso!" });
    }


    [HttpGet("meus-pedidos/{usuarioId}")]
    public IActionResult MeusPedidos(int usuarioId)
    {
        var pedidos = _context.Pedidos
            .Where(p => p.UsuarioId == usuarioId)
            .Select(p => new
            {
                p.Id,
                p.Data,
                p.Total,
                Itens = _context.ItensPedido
                    .Where(i => i.PedidoId == p.Id)
                    .Select(i => new
                    {
                        NomeProduto = _context.Produtos
                            .Where(pr => pr.ID == i.ProdutoId)
                            .Select(pr => pr.Nome)
                            .FirstOrDefault(),

                        i.Quantidade,
                        i.PrecoUnitario
                    }).ToList()
            })
            .ToList();

        return Ok(pedidos);
    }


    [HttpDelete("{id}")]
    public IActionResult DeletarPedido(int id)
    {
        var pedido = _context.Pedidos.FirstOrDefault(p => p.Id == id);

        if (pedido == null)
            return NotFound("Pedido não encontrado");

        var itens = _context.ItensPedido
            .Where(i => i.PedidoId == id)
            .ToList();

        _context.ItensPedido.RemoveRange(itens);
        _context.Pedidos.Remove(pedido);

        _context.SaveChanges();

        return Ok("Pedido deletado com sucesso");
    }


    [HttpPut("{id}")]
    public IActionResult AtualizarPedido(int id, Pedido pedidoAtualizado)
    {
        var pedido = _context.Pedidos.FirstOrDefault(p => p.Id == id);

        if (pedido == null)
            return NotFound("Pedido não encontrado");

        pedido.Status = pedidoAtualizado.Status;
        pedido.Data = pedidoAtualizado.Data;
        pedido.Total = pedidoAtualizado.Total;

        _context.SaveChanges();

        return Ok("Pedido atualizado com sucesso");
    }
}
