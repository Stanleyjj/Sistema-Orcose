const menu = document.getElementById('menuLateral');
const menuBtn = document.getElementById('menuBtn');

const overlay = document.createElement('div');
overlay.className = 'menu-overlay';
document.body.appendChild(overlay);

function confirmar(titulo, texto) {
  return new Promise(resolve => {
    const modal = document.getElementById('modalConfirm');
    document.getElementById('modalTitulo').textContent = titulo;
    document.getElementById('modalTexto').textContent = texto;

    modal.classList.add('show');

    document.getElementById('modalCancelar').onclick = () => {
      modal.classList.remove('show');
      resolve(false);
    };

    document.getElementById('modalConfirmar').onclick = () => {
      modal.classList.remove('show');
      resolve(true);
    };
  });
}

function toggleMenu() {
  if (!menu) return;
  menu.classList.toggle('open');
  overlay.classList.toggle('show');
  menuBtn.classList.toggle('active');
}

overlay.addEventListener('click', fecharMenu);

function fecharMenu() {
  if (!menu) return;
  menu.classList.remove('open');
  overlay.classList.remove('show');
  menuBtn.classList.remove('active');
}

if (menu) {
  menu.querySelectorAll('a, button').forEach(link => {
    link.addEventListener('click', fecharMenu);
  });
}

async function logout() {
  const ok = await confirmar(
    'Sair do sistema',
    'Deseja realmente encerrar a sessão?'
  );
  if (!ok) return;

  sessionStorage.clear();
  localStorage.clear();

  window.location.href = '../login.html';
}

function toggleDropdown() {
  const sub = document.getElementById('submenuCadastro');
  const seta = document.getElementById('setaCadastro');

  if (sub.style.display === 'flex') {
    sub.style.display = 'none';
    seta.textContent = '▾';
  } else {
    sub.style.display = 'flex';
    seta.textContent = '▴';
  }
}

window.addEventListener('load', () => {
  if (
    window.location.href.includes('empresas') ||
    window.location.href.includes('fisica')
  ) {
    const sub = document.getElementById('submenuCadastro');
    const seta = document.getElementById('setaCadastro');

    if (sub && seta) {
      sub.style.display = 'flex';
      seta.textContent = '▴';
    }
  }
});