import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import logoMarca from "@/assets/images/base-logo-v2.svg"

interface DadosRelatorio {
  dataInicio: string;
  dataFim: string;
  faturamento: string;
  totalVendas: number;
  ticketMedio: string;
  ultimasVendas: any[];
  maisVendidos: any[];
  proporcaoVendas: any[];
}

export const exportarDashboardParaPDF = async (dados: DadosRelatorio) => {
  const doc = new jsPDF()

  const formatarData = (dataStr: string) => {
    if (!dataStr) return ""
    const [ano, mes, dia] = dataStr.split("-")
    return `${dia}/${mes}/${ano}`
  }

  const textoPeriodo = (dados.dataInicio && dados.dataFim)
    ? `${formatarData(dados.dataInicio)} a ${formatarData(dados.dataFim)}`
    : "Histórico Completo"

  // 1. Tratamento da Imagem
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
          resolve(canvas.toDataURL("image/png")) // Retorna o PNG em Base64
        } else {
          reject(new Error("Não foi possível obter o contexto do canvas"))
        }
      }
      img.onerror = (e) => reject(e)
    })
  }

  try {
    const pngBase64 = await carregarLogo()
    doc.addImage(pngBase64, "PNG", 14, 10, 46.5, 12) 
  } catch (error) {
    console.warn("Aviso: Não foi possível renderizar a logo SVG no PDF.", error)
  }

  // 2. Cabeçalho e Metadados
  const dataGeracao = new Date().toLocaleString("pt-BR")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(33, 37, 41)
  doc.text("Relatório de Desempenho Comercial - SIGBRO", 14, 34)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Gerado em: ${dataGeracao}`, 14, 40)
  doc.text(`Período de Análise: ${textoPeriodo}`, 14, 45)

  doc.setDrawColor(200, 200, 200)
  doc.line(14, 50, 196, 50)

  // 3. Tabela de Resumo (KPIs)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(33, 37, 41)
  doc.text("Resumo Executivo", 14, 60)

  autoTable(doc, {
    startY: 64,
    head: [["Métrica", "Resultado"]],
    body: [
      ["Faturamento no Período", dados.faturamento],
      ["Volume de Vendas", `${dados.totalVendas} vendas registradas`],
      ["Ticket Médio", dados.ticketMedio],
    ],
    theme: "grid",
    headStyles: { fillColor: [164, 19, 60] }, // Vermelho Atacado (#a4133c)
    styles: { fontSize: 10, cellPadding: 4 },
  })

  let finalY = (doc as any).lastAutoTable.finalY

  // 4. Tabelas Lado a Lado (Proporção e Top Produtos)
  doc.text("Análise de Produtos e Canais", 14, finalY + 12)

  // Tabela Esquerda: Proporção Varejo x Atacado
  autoTable(doc, {
    startY: finalY + 16,
    margin: { left: 14, right: 110 },
    head: [["Canal de Venda", "Volume", "Representação"]],
    body: dados.proporcaoVendas.map(p => [p.name, p.value, p.percentage]),
    theme: "striped",
    headStyles: { fillColor: [158, 71, 94] }, // Rosa Varejo (#9e475e)
    styles: { fontSize: 9 },
  })

  // Tabela Direita: Top Produtos
  autoTable(doc, {
    startY: finalY + 16,
    margin: { left: 105, right: 14 },
    head: [["Top Produtos Mais Vendidos", "Qtd"]],
    body: dados.maisVendidos.map(p => [p.name, p.qtd]),
    theme: "striped",
    headStyles: { fillColor: [115, 109, 110] }, // Cinza (#736d6e)
    styles: { fontSize: 9 },
  })

  finalY = (doc as any).lastAutoTable.finalY

  // 5. Tabela Detalhada de Últimas Vendas
  doc.text("Detalhamento das Operações", 14, finalY + 14)

  const corpoTabelaVendas = dados.ultimasVendas.map((venda) => [
    new Date(venda.data).toLocaleDateString("pt-BR", { timeZone: "UTC" }),
    venda.cliente,
    venda.zona,
    venda.status,
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(venda.valor),
  ])

  autoTable(doc, {
    startY: finalY + 18,
    head: [["Data", "Cliente", "Região", "Status", "Valor"]],
    body: corpoTabelaVendas,
    theme: "grid",
    headStyles: { fillColor: [50, 50, 50] },
    styles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  })

  // 6. Rodapé com Numeração de Páginas
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont("helvetica", "italic")
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    
    const textoRodape = `Página ${i} de ${pageCount} - Gerado por SIGBRO`
    const pageWidth = doc.internal.pageSize.width
    doc.text(textoRodape, pageWidth / 2, doc.internal.pageSize.height - 10, { align: "center" })
  }

  // 7. Download
  const nomeSafe = textoPeriodo.replace(/\//g, "-").replace(/\s/g, "_")
  doc.save(`Relatorio_SIGBRO_${nomeSafe}.pdf`)
}