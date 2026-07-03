import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import logoMarca from "@/assets/images/base-logo-v2.svg"

interface DadosPagamentos {
  dataInicio: string;
  dataFim: string;
  filtroStatus: string;
  filtroConta: string;
  totalLiquidado: string;
  totalInter: string;
  totalTon: string;
  totalDinheiro: string;
  vendasFiltradas: any[];
}

export const exportarPagamentosParaPDF = async (dados: DadosPagamentos) => {
  const doc = new jsPDF()

  const formatarData = (dataStr: string | null) => {
    if (!dataStr) return "-"
    const [ano, mes, dia] = dataStr.split("-")
    return `${dia}/${mes}/${ano}`
  }

  const textoPeriodo = (dados.dataInicio && dados.dataFim)
    ? `${formatarData(dados.dataInicio)} a ${formatarData(dados.dataFim)}`
    : "Histórico Completo"

  // 1. Tratamento da Logo SVG
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
          reject(new Error("Falha ao obter contexto do canvas"))
        }
      }
      img.onerror = (e) => reject(e)
    })
  }

  try {
    const pngBase64 = await carregarLogo()
    doc.addImage(pngBase64, "PNG", 14, 10, 46.5, 12) 
  } catch (error) {
    console.warn("Aviso: Não foi possível carregar a logo para o PDF.", error)
  }

  // 2. Cabeçalho de Metadados Financeiros
  const dataGeracao = new Date().toLocaleString("pt-BR")
  const statusTraduzido = dados.filtroStatus === "TODOS" ? "Todos" : dados.filtroStatus === "PAGO" ? "Liquidados" : "Pendentes"
  const contaTraduzida = dados.filtroConta === "TODOS" ? "Todas" : dados.filtroConta

  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(33, 37, 41)
  doc.text("Extrato e Relatório de Conciliação - SIGBRO", 14, 34)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Gerado em: ${dataGeracao}`, 14, 40)
  doc.text(`Filtros: Período: ${textoPeriodo} | Status: ${statusTraduzido} | Conta: ${contaTraduzida}`, 14, 45)

  // Linha decorativa
  doc.setDrawColor(200, 200, 200)
  doc.line(14, 50, 196, 50)

  // 3. Resumo de Saldos Liquidados por Conta
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(33, 37, 41)
  doc.text("Fechamento de Caixa por Destino (Valores Líquidos)", 14, 60)

  autoTable(doc, {
    startY: 64,
    head: [["Conta de Destino", "Montante Total Liquidado"]],
    body: [
      ["Banco Inter", dados.totalInter],
      ["Maquininha Ton", dados.totalTon],
      ["Caixa Físico (Dinheiro)", dados.totalDinheiro],
      ["Total Geral do Período Filtrado", dados.totalLiquidado],
    ],
    theme: "grid",
    headStyles: { fillColor: [43, 94, 82] },
    styles: { fontSize: 10, cellPadding: 3.5 },
    didParseCell: (data) => {
      if (data.row.index === 3) {
        data.cell.styles.fontStyle = "bold"
        if (data.column.index === 1) data.cell.styles.textColor = [21, 115, 71]
      }
    }
  })

  let finalY = (doc as any).lastAutoTable.finalY

  // 4. Listagem Cronológica de Movimentações
  doc.setFont("helvetica", "bold")
  doc.text("Histórico Analítico Lançamentos", 14, finalY + 12)

  const formatarMoedaLocal = (valor: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)

  const corpoTabela = dados.vendasFiltradas.map(v => [
    `#${v.id}`,
    v.cliente,
    formatarData(v.data_venda),
    formatarData(v.data_baixa),
    v.conta_destino || "Pendente",
    v.status === "PAGO" ? "Liquidado" : "Aberto",
    formatarMoedaLocal(v.valor)
  ])

  autoTable(doc, {
    startY: finalY + 16,
    head: [["Cód.", "Cliente", "Data Venda", "Data Baixa", "Conta", "Status", "Valor Total"]],
    body: corpoTabela,
    theme: "striped",
    headStyles: { fillColor: [115, 109, 110] }, // (#736d6e)
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      5: { fontStyle: "bold" },
      6: { fontStyle: "bold" }
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 5) {
        if (data.cell.text[0] === "Liquidado") {
          data.cell.styles.textColor = [21, 115, 71]
        } else {
          data.cell.styles.textColor = [13, 110, 253]
        }
      }
    },
    alternateRowStyles: { fillColor: [250, 250, 250] }
  })

  // 5. Numeração de Páginas no Rodapé
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont("helvetica", "italic")
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    
    const textoRodape = `Página ${i} de ${pageCount} - Extrato Financeiro SIGBRO`
    const pageWidth = doc.internal.pageSize.width
    doc.text(textoRodape, pageWidth / 2, doc.internal.pageSize.height - 10, { align: "center" })
  }

  // 6. Download com nome limpo
  const nomeSafe = textoPeriodo.replace(/\//g, "-").replace(/\s/g, "_")
  doc.save(`Extrato_Conciliacao_SIGBRO_${nomeSafe}.pdf`)
}