namespace LojaEeletronicosAPI.DTOs
{
    public class ItemPedidoCreateDTO
    {
        public int ProdutoId { get; set; }
        public int Quantidade { get; set; }
        public decimal PrecoUnitario { get; set; }
    }
}