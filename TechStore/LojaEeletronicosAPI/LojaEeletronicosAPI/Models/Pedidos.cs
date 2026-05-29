using LojaEeletronicosAPI.Models;

public class Pedido
{
    public int Id { get; set; }

    public int UsuarioId { get; set; }

    public DateTime Data { get; set; } = DateTime.Now;

    public decimal Total { get; set; }

    public Usuario Usuario { get; set; }
    public List<ItemPedido> Itens { get; set; }
    public string Status { get; set; } = "Pendente";
}