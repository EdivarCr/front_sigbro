import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import logoMarca from "@/assets/images/base-logo-v2.svg"

interface DadosLucratividade {
  dataInicio: string;
  dataFim: string;
  lucroLiquido: string;
  margemMedia: string;
  produtoMaisVendido: string;
  produtoMaisRentavel: string;
  produtosData: any[];
  proporcaoVendas: any[];
}

export const exportarLucratividadeParaPDF = async (dados: DadosLucratividade) => {
  const doc = new jsPDF()

  const formatarData = (dataStr: string) => {
    if (!dataStr) return ""
    const [ano, mes, dia] = dataStr.split("-")
    return `${dia}/${mes}/${ano}`
  }

  const textoPeriodo = (dados.dataInicio && dados.dataFim)
    ? `${formatarData(dados.dataInicio)} a ${formatarData(dados.dataFim)}`
    : "Histórico Completo"

  // 1. Carregamento da Logo
  const carregarLogo = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = logoMarca
      img.crossOrigin = "anonymous"
      
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = 361 * 2 
        canvas.height = 93 * 2
        
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL("image/png"))
        } else {
          reject(new Error("Não foi possível obter o contexto do canvas"))
        }
      }
      img.onerror = (e) => reject(e)
    })
  }

  try {
    const pngBase64 = await carregarLogo()
    // X=14, Y=10 | Nova Largura=46.5, Altura mantida=12
    doc.addImage(pngBase64, "PNG", 14, 10, 46.5, 12) 
  } catch (error) {
    console.warn("Aviso: Não foi possível renderizar a logo SVG no PDF.", error)
  }

  // 2. Cabeçalho e Metadados do Relatório
  const dataGeracao = new Date().toLocaleString("pt-BR")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(33, 37, 41)
  doc.text("Relatório Analítico de Lucratividade - SIGBRO", 14, 34)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Gerado em: ${dataGeracao}`, 14, 40)
  doc.text(`Período de Análise: ${textoPeriodo}`, 14, 45)

  doc.setDrawColor(200, 200, 200)
  doc.line(14, 50, 196, 50)

  // 3. Resumo dos Indicadores
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(33, 37, 41)
  doc.text("Indicadores de Performance Financeira (KPIs)", 14, 60)

  autoTable(doc, {
    startY: 64,
    head: [["Métrica Indicadora", "Valor / Registro obtido no período"]],
    body: [
      ["Lucro Líquido Total", dados.lucroLiquido],
      ["Margem de Lucro Média", dados.margemMedia],
      ["Produto de Maior Faturamento", dados.produtoMaisVendido],
      ["Produto Mais Rentável (Maior Lucro)", dados.produtoMaisRentavel],
    ],
    theme: "grid",
    headStyles: { fillColor: [144, 108, 62] }, // (#906c3e)
    styles: { fontSize: 10, cellPadding: 4 },
  })

  let finalY = (doc as any).lastAutoTable.finalY

  // 4. Distribuição de Receitas por Canal
  doc.text("Distribuição de Receita por Canal", 14, finalY + 12)

  autoTable(doc, {
    startY: finalY + 16,
    head: [["Canal de Venda", "Faturamento Bruto", "Participação"]],
    body: dados.proporcaoVendas.map(p => [
      p.name, 
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.value), 
      p.percentage
    ]),
    theme: "striped",
    headStyles: { fillColor: [158, 71, 94] }, // (#9e475e)
    styles: { fontSize: 9, cellPadding: 3 },
  })

  finalY = (doc as any).lastAutoTable.finalY

  // 5. Grade Detalhada de Lucratividade por Produto
  doc.text("Detalhamento de Rentabilidade por Produto", 14, finalY + 12)

  const formatarMoedaLocal = (valor: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)

  const corpoTabelaProdutos = dados.produtosData.map((prod) => [
    prod.nome,
    formatarMoedaLocal(prod.receita),
    formatarMoedaLocal(prod.custo),
    formatarMoedaLocal(prod.lucro),
    prod.margem,
  ])

  autoTable(doc, {
    startY: finalY + 16,
    head: [["Produto", "Receita Bruta", "Custo Fabricação", "Lucro Líquido", "Margem de Lucro"]],
    body: corpoTabelaProdutos,
    theme: "grid",
    headStyles: { fillColor: [164, 19, 60] }, // Vermelho Atacado (#a4133c)
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      4: { fontStyle: "bold", textColor: [21, 115, 71] } // Coluna de margem em destaque/negrito
    },
    alternateRowStyles: { fillColor: [248, 249, 250] },
  })

  // 6. Paginação dinâmica no Rodapé
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont("helvetica", "italic")
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    
    const textoRodape = `Página ${i} de ${pageCount} - Relatório de Lucratividade SIGBRO`
    const pageWidth = doc.internal.pageSize.width
    doc.text(textoRodape, pageWidth / 2, doc.internal.pageSize.height - 10, { align: "center" })
  }

  // 7. Dispara o download nativo do explorador de arquivos
  const nomeSafe = textoPeriodo.replace(/\//g, "-").replace(/\s/g, "_")
  doc.save(`Relatorio_Lucratividade_SIGBRO_${nomeSafe}.pdf`)
}