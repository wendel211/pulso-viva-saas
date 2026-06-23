import { describe, expect, it } from "vitest";

import { toCsv } from "./csv";

describe("toCsv", () => {
  it("gera cabeçalho e linhas separados por vírgula", () => {
    const csv = toCsv(
      ["Nome", "Idade"],
      [
        ["Maria", 45],
        ["João", 30],
      ],
    );
    expect(csv).toBe("Nome,Idade\nMaria,45\nJoão,30");
  });

  it("escapa valores com vírgula, aspas ou quebra de linha", () => {
    const csv = toCsv(
      ["Campo"],
      [["a, b"], ['diz "oi"'], ["linha1\nlinha2"]],
    );
    const lines = csv.split("\n");
    expect(lines[1]).toBe('"a, b"');
    expect(lines[2]).toBe('"diz ""oi"""');
    // valor com quebra de linha vira célula entre aspas (ocupa 2 linhas físicas)
    expect(csv).toContain('"linha1\nlinha2"');
  });

  it("trata null/valores ausentes como célula vazia", () => {
    const csv = toCsv(["A", "B"], [[null, "x"]]);
    expect(csv).toBe("A,B\n,x");
  });
});
