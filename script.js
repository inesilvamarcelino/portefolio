const linha = document.getElementById("caminho");

linha.addEventListener("mouseenter", () => {
  linha.style.transform = "rotate(1deg) scale(1.01)";
});

linha.addEventListener("mouseleave", () => {
  linha.style.transform = "rotate(0deg) scale(1)";
});
