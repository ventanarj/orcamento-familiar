(function () {
  const buttons = document.querySelectorAll('.action');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      alert(`Você selecionou: ${button.querySelector('strong')?.textContent}`);
    });
  });
})();
