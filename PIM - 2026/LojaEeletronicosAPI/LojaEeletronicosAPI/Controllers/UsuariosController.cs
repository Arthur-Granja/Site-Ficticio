using Microsoft.AspNetCore.Mvc;
using LojaEeletronicosAPI.Data;
using LojaEeletronicosAPI.Models;
using System.Linq;
using System.Collections.Generic;

namespace LojaEeletronicosAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsuariosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public ActionResult<List<Usuario>> Get()
        {
            return _context.Usuarios.ToList();
        }

        [HttpGet("{id}")]
        public ActionResult<Usuario> GetById(int id)
        {
            var user = _context.Usuarios.Find(id);

            if (user == null)
                return NotFound("Usuário não encontrado");

            return user;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] Usuario usuario)
        {
            if (usuario == null)
                return BadRequest("Dados inválidos");

            _context.Usuarios.Add(usuario);
            _context.SaveChanges();

            return Ok(usuario);
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDTO dados)
        {
            if (dados == null)
                return BadRequest("Dados inválidos");

            var user = _context.Usuarios
                .FirstOrDefault(x => x.Email == dados.Email && x.Senha == dados.Senha);

            if (user == null)
                return BadRequest("Email ou senha inválidos");

            return Ok(user);
        }

        [HttpDelete("{id}")]
        public IActionResult DeletarUsuario(int id)
        {
            var user = _context.Usuarios.FirstOrDefault(u => u.Id == id);

            if (user == null)
                return NotFound("Usuário não encontrado");

            _context.Usuarios.Remove(user);
            _context.SaveChanges();

            return Ok("Usuário deletado");
        }

        [HttpPut("{id}")]
        public IActionResult AtualizarUsuario(int id, Usuario usuarioAtualizado)
        {
            var user = _context.Usuarios.FirstOrDefault(u => u.Id == id);

            if (user == null)
                return NotFound("Usuário não encontrado");

            user.Nome = usuarioAtualizado.Nome;
            user.Email = usuarioAtualizado.Email;
            user.Senha = usuarioAtualizado.Senha;
            user.Tipo = usuarioAtualizado.Tipo;

            _context.SaveChanges();

            return Ok("Usuário atualizado");
        }
    }
}