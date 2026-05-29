namespace LojaEeletronicosAPI.DTOs
{
    public class PedidoDTO
    {
        public int UsuarioId { get; set; }
        public List<ItemPedidoCreateDTO> Itens { get; set; }
    }
}