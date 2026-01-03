// Teste de formatação
const testCases = [
  {
    name: "Texto com negrito e espaços",
    input: "<strong>Am</strong>&nbsp;&nbsp;&nbsp;&nbsp;Em&nbsp;&nbsp;F",
    expected: "Deve preservar <strong> e &nbsp;"
  },
  {
    name: "Texto com acorde e negrito",
    input: "[Am]<strong>Texto</strong> com [Em]negrito",
    expected: "Linha 1: Am       Em\nLinha 2: <strong>Texto</strong> com negrito"
  },
  {
    name: "Múltiplos espaços com &nbsp;",
    input: "E&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A",
    expected: "Deve manter &nbsp;"
  }
];

console.log("=== TESTE DE FORMATAÇÃO ===\n");

testCases.forEach(test => {
  console.log(`\nTeste: ${test.name}`);
  console.log(`Input: ${test.input}`);
  console.log(`Esperado: ${test.expected}`);
  console.log("---");
});

console.log("\n=== Para testar no backend, use: ===");
console.log("docker compose exec backend node test-formatting.js");
