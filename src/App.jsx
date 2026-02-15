import { useState, useEffect, useCallback, useMemo, createContext, useContext, useRef } from "react";
import { createWorker } from 'tesseract.js';

// ============================================================
// CONTEXT & DATA STORE
// ============================================================
const AppContext = createContext();

const generateId = () => Math.random().toString(36).substr(2, 9);

const initialData = {
  clientes: [
    { id: generateId(), nome: "Carlos Mendes", tipo: "PF", cpfCnpj: "123.456.789-00", email: "carlos@email.com", telefone: "(11) 99999-0001", endereco: "Rua A, 100 - São Paulo/SP", observacoes: "" },
    { id: generateId(), nome: "Tech Solutions LTDA", tipo: "PJ", cpfCnpj: "12.345.678/0001-00", email: "contato@techsol.com", telefone: "(11) 3333-0001", endereco: "Av. Paulista, 500 - São Paulo/SP", observacoes: "Cliente corporativo" },
    { id: generateId(), nome: "Maria Oliveira", tipo: "PF", cpfCnpj: "987.654.321-00", email: "maria@email.com", telefone: "(21) 98888-0002", endereco: "Rua B, 200 - Rio de Janeiro/RJ", observacoes: "" },
  ],
  produtos: [
    { id: generateId(), nome: "Vaso Decorativo Geométrico", categoria: "Decoração", preco: 89.90, custoBase: 22.50, custoEmbalagem: 3.50, custoFrete: 0, taxaMarketplace: 18, impostos: 6, tempoImpressao: 180, composicao: [{ tipo: "PLA", cor: "Branco", peso: 120 }], imagemUrl: "https://images.unsplash.com/photo-1595185966453-906d98e5792d?auto=format&fit=crop&q=80&w=200", descricao: "Vaso com design geométrico moderno" },
    { id: generateId(), nome: "Suporte para Celular", categoria: "Utilidades", preco: 35.00, custoBase: 8.00, tempoImpressao: 45, composicao: [{ tipo: "PLA", cor: "Preto", peso: 35 }], imagemUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&q=80&w=200", descricao: "Suporte ajustável para smartphone" },
    { id: generateId(), nome: "Miniatura Dragão", categoria: "Miniaturas", preco: 150.00, custoBase: 45.00, tempoImpressao: 360, composicao: [{ tipo: "Resina", cor: "Cinza", peso: 85 }], imagemUrl: "https://images.unsplash.com/photo-1596727147702-89b43746978e?auto=format&fit=crop&q=80&w=200", descricao: "Miniatura detalhada de dragão para RPG" },
    { id: generateId(), nome: "Engrenagem Industrial", categoria: "Peças Técnicas", preco: 120.00, custoBase: 38.00, tempoImpressao: 90, composicao: [{ tipo: "ABS", cor: "Preto", peso: 200 }], imagemUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=200", descricao: "Engrenagem de reposição sob medida" },
    { id: generateId(), nome: "Luminária Voronoi", categoria: "Decoração", preco: 199.90, custoBase: 55.00, tempoImpressao: 420, composicao: [{ tipo: "PLA", cor: "Branco", peso: 180 }], imagemUrl: "https://images.unsplash.com/photo-1513506003013-d33d43497c6b?auto=format&fit=crop&q=80&w=200", descricao: "Luminária com padrão Voronoi" },
    { id: generateId(), nome: "Chaveiro Stitch", categoria: "Personalizado", preco: 25.00, custoBase: 5.00, tempoImpressao: 60, composicao: [{ tipo: "PLA", cor: "Azul", peso: 15 }, { tipo: "PLA", cor: "Branco", peso: 5 }], imagemUrl: "", descricao: "Chaveiro multicolorido" },
  ],
  materiais: [
    { id: generateId(), nome: "PLA Branco 1kg", tipo: "PLA", cor: "Branco", marca: "3D Fila", fornecedor: "FilaTech", quantidadeTotal: 1000, quantidadeAtual: 720, unidade: "g", custoKg: 89.90, estoqueMinimo: 200 },
    { id: generateId(), nome: "PLA Preto 1kg", tipo: "PLA", cor: "Preto", marca: "3D Fila", fornecedor: "FilaTech", quantidadeTotal: 1000, quantidadeAtual: 450, unidade: "g", custoKg: 89.90, estoqueMinimo: 200 },
    { id: generateId(), nome: "ABS Preto 1kg", tipo: "ABS", cor: "Preto", marca: "PrintMax", fornecedor: "FilaTech", quantidadeTotal: 1000, quantidadeAtual: 180, unidade: "g", custoKg: 110.00, estoqueMinimo: 200 },
    { id: generateId(), nome: "Resina Cinza 500ml", tipo: "Resina", cor: "Cinza", marca: "ElegooStd", fornecedor: "Elegoo Brasil", quantidadeTotal: 500, quantidadeAtual: 320, unidade: "ml", custoKg: 180.00, estoqueMinimo: 100 },
    { id: generateId(), nome: "PETG Transparente 1kg", tipo: "PETG", cor: "Transparente", marca: "3D Fila", fornecedor: "FilaTech", quantidadeTotal: 1000, quantidadeAtual: 900, unidade: "g", custoKg: 120.00, estoqueMinimo: 200 },
  ],
  impressoras: [
    { id: generateId(), nome: "Ender 3 V3", modelo: "Creality Ender 3 V3", tipo: "FDM", status: "disponivel", horasUso: 1240, ultimaManutencao: "2026-01-15", observacoes: "Principal para PLA" },
    { id: generateId(), nome: "Prusa MK4", modelo: "Prusa i3 MK4", tipo: "FDM", status: "imprimindo", horasUso: 890, ultimaManutencao: "2026-02-01", observacoes: "Alta precisão" },
    { id: generateId(), nome: "Elegoo Saturn 3", modelo: "Elegoo Saturn 3 Ultra", tipo: "Resina", status: "disponivel", horasUso: 340, ultimaManutencao: "2026-01-20", observacoes: "Para miniaturas e peças detalhadas" },
    { id: generateId(), nome: "Bambu Lab X1C", modelo: "Bambu Lab X1 Carbon", tipo: "FDM", status: "manutencao", horasUso: 2100, ultimaManutencao: "2026-02-10", observacoes: "Multi-material, em manutenção preventiva" },
    { id: generateId(), nome: "Bambu Lab A1", modelo: "Bambu Lab A1", tipo: "FDM", status: "disponivel", horasUso: 0, ultimaManutencao: new Date().toISOString().split("T")[0], observacoes: "Nova aquisição" },
  ],
  fornecedores: [
    { id: generateId(), nome: "FilaTech Distribuidora", contato: "João Silva", email: "vendas@filatech.com", telefone: "(11) 3333-5555", endereco: "Rua Industrial, 500 - Guarulhos/SP", produtos: "Filamentos PLA, ABS, PETG", observacoes: "Entrega em 3 dias úteis" },
    { id: generateId(), nome: "Elegoo Brasil", contato: "Ana Costa", email: "ana@elegoobr.com", telefone: "(11) 4444-6666", endereco: "Av. das Nações, 1200 - Barueri/SP", produtos: "Resinas, impressoras SLA", observacoes: "Importador oficial" },
  ],
  pedidos: [
    { id: generateId(), clienteId: "", itens: [{ produto: "Vaso Decorativo Geométrico", quantidade: 2, valorUnitario: 89.90 }, { produto: "Suporte para Celular", quantidade: 1, valorUnitario: 35.00 }], valorTotal: 214.80, status: "producao", dataPedido: "2026-02-05", dataEntrega: "2026-02-15", formaPagamento: "PIX", observacoes: "Cor branca" },
    { id: generateId(), clienteId: "", itens: [{ produto: "Miniatura Dragão", quantidade: 5, valorUnitario: 150.00 }], valorTotal: 750.00, status: "acabamento", dataPedido: "2026-02-01", dataEntrega: "2026-02-12", formaPagamento: "Cartão 3x", observacoes: "Para campanha de RPG" },
  ],
  producao: [
    { id: generateId(), pedidoRef: "Vaso Geométrico #1", impressora: "Prusa MK4", status: "imprimindo", inicio: "2026-02-10 08:00", previsaoFim: "2026-02-10 11:00", material: "PLA Branco", pesoUsado: 120, falhas: 0, etapaPosProc: "nenhuma", observacoes: "" },
    { id: generateId(), pedidoRef: "Vaso Geométrico #2", impressora: "Ender 3 V3", status: "fila", inicio: "", previsaoFim: "", material: "PLA Branco", pesoUsado: 120, falhas: 0, etapaPosProc: "nenhuma", observacoes: "Aguardando liberação da impressora" },
    { id: generateId(), pedidoRef: "Dragão Mini #3", impressora: "Elegoo Saturn 3", status: "posProcessamento", inicio: "2026-02-09 14:00", previsaoFim: "2026-02-09 20:00", material: "Resina Cinza", pesoUsado: 85, falhas: 1, etapaPosProc: "pintura", observacoes: "Houve 1 falha na primeira tentativa" },
  ],
  financeiro: {
    contasReceber: [
      { id: generateId(), descricao: "Pedido Vasos - Carlos Mendes", valor: 179.80, dataVencimento: "2026-02-15", status: "pendente", formaPagamento: "PIX" },
      { id: generateId(), descricao: "Pedido Miniaturas - Tech Solutions", valor: 750.00, dataVencimento: "2026-02-12", status: "parcial", formaPagamento: "Cartão 3x", valorRecebido: 250.00 },
      { id: generateId(), descricao: "Pedido Luminárias - Maria", valor: 399.80, dataVencimento: "2026-01-30", status: "recebido", formaPagamento: "PIX", valorRecebido: 399.80 },
    ],
    contasPagar: [
      { id: generateId(), descricao: "Filamentos - FilaTech", valor: 450.00, dataVencimento: "2026-02-20", status: "pendente", fornecedor: "FilaTech" },
      { id: generateId(), descricao: "Resina - Elegoo Brasil", valor: 360.00, dataVencimento: "2026-02-25", status: "pendente", fornecedor: "Elegoo Brasil" },
      { id: generateId(), descricao: "Energia Elétrica", valor: 580.00, dataVencimento: "2026-02-15", status: "pendente", fornecedor: "Enel" },
      { id: generateId(), descricao: "Manutenção Bambu Lab X1C", valor: 200.00, dataVencimento: "2026-02-10", status: "pago", fornecedor: "Assistência Técnica" },
    ],
  },
  usuarios: [
    { id: generateId(), nome: "Administrador", login: "admin", senha: "123", perfil: "admin" },
    { id: generateId(), nome: "Operador de Fila", login: "operador", senha: "123", perfil: "usuario" },
  ],
};

// ============================================================
// MAIN APP COMPONENT
// ============================================================
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize from localStorage or fallback to initialData
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("print3d_manager_db");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with initialData to ensure new fields/modules are present
        return { ...initialData, ...parsed };
      } catch (e) {
        console.error("Failed to parse saved data", e);
        return initialData;
      }
    }
    return initialData;
  });

  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Ensure config structure exists on load
  useEffect(() => {
    setData(prev => {
      const current = prev.configCustos || {};
      if (!current.vendas || !current.logistica || !current.energia) {
        return {
          ...prev,
          configCustos: {
            energia: { custoKwh: 0.95, consumoMedioFDM: 150, consumoMedioResina: 50, ...current.energia },
            trabalho: { horaTecnica: 35.00, horaModelagem: 60.00, ...current.trabalho },
            depreciacao: { vidaUtilHoras: 2000, manutencaoPercent: 10, ...current.depreciacao },
            vendas: { impostosPercent: 6.0, taxaMarketplacePercent: 12.0, ...current.vendas },
            logistica: { custoFretePadrao: 20.00, custoEmbalagemPadrao: 2.50, ...current.logistica },
            insumos: current.insumos || [
              { id: 1, nome: "Álcool Isopropílico (Litro)", custo: 25.00, categoria: "Resina", durabilidadeEstimada: 50 },
              { id: 2, nome: "Filme FEP", custo: 80.00, categoria: "Resina", durabilidadeEstimada: 30 },
              { id: 3, nome: "Luvas Nitrílicas (Par)", custo: 0.50, categoria: "Geral", durabilidadeEstimada: 1 },
              { id: 4, nome: "Bico Nozzle 0.4mm", custo: 15.00, categoria: "FDM", durabilidadeEstimada: 500 },
              { id: 5, nome: "Cola Bastão/Spray", custo: 20.00, categoria: "FDM", durabilidadeEstimada: 100 },
              { id: 6, nome: "Lixa d'água (Folha)", custo: 2.50, categoria: "Acabamento", durabilidadeEstimada: 5 },
              { id: 7, nome: "Primer Spray", custo: 35.00, categoria: "Acabamento", durabilidadeEstimada: 20 },
            ]
          }
        };
      }
      return prev;
    });
  }, []);

  // Persist data whenever it changes
  useEffect(() => {
    localStorage.setItem("print3d_manager_db", JSON.stringify(data));
  }, [data]);

  // Ensure data structure integrity on mount/update
  useEffect(() => {
    if (!data.usuarios) {
      setData(prev => ({ ...prev, usuarios: initialData.usuarios }));
    }
  }, [data]);

  const handleLogin = (user, pass) => {
    // Safe access or fallback
    const usersList = data.usuarios || initialData.usuarios;
    const foundUser = usersList.find(u => u.login === user && u.senha === pass);

    if (foundUser) {
      setIsAuthenticated(true);
      showToast(`Bem-vindo, ${foundUser.nome}!`, "success");
    } else {
      showToast("Usuário ou senha incorretos", "error");
    }
  };

  const [navigationData, setNavigationData] = useState(null);

  const navigateTo = (module, data) => {
    setActiveModule(module);
    if (data) setNavigationData(data);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveModule("dashboard");
  };

  if (!isAuthenticated) return <LoginPage onLogin={handleLogin} toast={toast} />;

  const modules = [
    { type: "header", label: "Visão Geral" },
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "kanban", label: "Kanban", icon: "📋" },

    { type: "header", label: "Gestão" },
    { key: "orcamentos", label: "Orçamentos", icon: "📝" },
    { key: "pedidos", label: "Pedidos", icon: "🛒" },
    { key: "producao", label: "Produção", icon: "🏭" },
    { key: "financeiro", label: "Financeiro", icon: "💰" },

    { type: "header", label: "Cadastros" },
    { key: "clientes", label: "Clientes", icon: "👥" },
    { key: "produtos", label: "Produtos", icon: "📦" },
    { key: "materiais", label: "Materiais", icon: "🧵" },
    { key: "custos", label: "Custos e Insumos", icon: "💸" },
    { key: "impressoras", label: "Impressoras", icon: "🖨️" },
    { key: "fornecedores", label: "Fornecedores", icon: "🚚" },

    { type: "header", label: "Sistema" },
    { key: "relatorios", label: "Relatórios", icon: "📈" },
    { key: "usuarios", label: "Usuários", icon: "👤" },
  ];

  return (
    <AppContext.Provider value={{ data, setData, showToast, navigateTo, navigationData, setNavigationData }}>
      <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif", display: "flex", height: "100vh", background: "#F2F2F7", color: "#1C1C1E", overflow: "hidden" }}>

        {/* SIDEBAR */}
        {/* SIDEBAR */}
        <aside style={{
          width: isMobile ? (sidebarOpen ? "80%" : 0) : (sidebarOpen ? 240 : 64),
          maxWidth: 300,
          background: "#FFFFFF",
          borderRight: "1px solid #E5E5EA",
          transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          flexShrink: 0,
          position: isMobile ? "fixed" : "static",
          zIndex: 100,
          height: "100%",
          boxShadow: isMobile && sidebarOpen ? "0 0 50px rgba(0,0,0,0.5)" : "none",
        }}>
          <div style={{ padding: sidebarOpen ? "20px 16px" : "20px 12px", borderBottom: "1px solid #E5E5EA", display: "flex", alignItems: "center", gap: 10, minHeight: 68 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "transparent", border: "none", padding: 0, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              {isMobile && sidebarOpen ? <span style={{ fontSize: 24 }}>✕</span> : (
                <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ borderRadius: 8, boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}>
                  <rect width="100" height="100" fill="#00589F" />
                  {/* Nozzle */}
                  <rect x="30" y="25" width="40" height="8" fill="white" />
                  <rect x="42" y="33" width="16" height="12" fill="white" />
                  <polygon points="42,45 58,45 50,55" fill="white" />
                  {/* Cube */}
                  <path d="M50 58 L35 65 L35 80 L50 88 L65 80 L65 65 Z" fill="none" stroke="white" strokeWidth="3" />
                  <path d="M50 58 L50 88 M35 65 L50 72.5 M65 65 L50 72.5 M35 80 L50 72.5 M65 80 L50 72.5" stroke="white" strokeWidth="2" />
                </svg>
              )}
            </button>
            {sidebarOpen && (
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: "#000000", letterSpacing: -0.2 }}>CB2K3D</div>
                <div style={{ fontSize: 11, color: "#8E8E93" }}>SISTEMAS</div>
              </div>
            )}
          </div>

          <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
            {modules.map((m, i) => {
              if (m.type === "header") {
                return sidebarOpen ? (
                  <div key={i} style={{ fontSize: 11, fontWeight: 600, color: "#8E8E93", textTransform: "uppercase", padding: "16px 12px 6px", letterSpacing: 0.5 }}>
                    {m.label}
                  </div>
                ) : <div key={i} style={{ height: 16 }} />;
              }
              return (
                <button key={m.key} onClick={() => setActiveModule(m.key)} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: sidebarOpen ? "8px 12px" : "10px 0",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  background: activeModule === m.key ? "#F2F2F7" : "transparent",
                  borderRadius: 8, cursor: "pointer",
                  color: activeModule === m.key ? "#007AFF" : "#48484A",
                  border: "none",
                  fontSize: 13, fontWeight: activeModule === m.key ? 600 : 400, transition: "all 0.2s",
                  fontFamily: "inherit", width: "100%",
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{m.icon}</span>
                  {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{m.label}</span>}
                </button>
              );
            })}
          </nav>

          <div style={{ padding: 16, borderTop: "1px solid #E5E5EA" }}>
            {sidebarOpen && <div style={{ fontSize: 11, color: "#8E8E93", textAlign: "center" }}>v2.2 • Apple Light</div>}
          </div>
        </aside>
        {isMobile && sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 99 }} />}

        {/* MAIN */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* TOPBAR */}
          <header style={{
            padding: "16px 32px", borderBottom: "1px solid #E5E5EA",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {isMobile && (
                  <button onClick={() => setSidebarOpen(true)} style={{ background: "transparent", border: "none", fontSize: 24, padding: 4, cursor: "pointer" }}>☰</button>
                )}
                <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 28, fontWeight: 700, color: "#000000", letterSpacing: -0.6 }}>
                  {modules.find(m => m.key === activeModule)?.label}
                </h1>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 13, color: "#8E8E93", fontWeight: 500 }}>{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</span>
              <div onClick={handleLogout} title="Sair" style={{ cursor: "pointer", width: 32, height: 32, borderRadius: "50%", background: "#34C759", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "#fff", transition: "transform 0.2s" }}>A</div>
            </div>
          </header>

          {/* CONTENT */}
          <div style={{ flex: 1, overflow: "auto", padding: isMobile ? 12 : 28, position: "relative" }}>
            <style>{`
              @media (max-width: 768px) {
                .modal-content { width: 95% !important; margin: 10px !important; max-height: 90vh !important; }
                .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr !important; }
                input, select, button { min-height: 44px; } /* Touch targets */
              }
            `}</style>
            {activeModule === "dashboard" && <DashboardModule />}
            {activeModule === "clientes" && <CrudModule entity="clientes" title="Clientes" fields={clienteFields} />}
            {activeModule === "produtos" && <ProductsModule />}
            {activeModule === "pedidos" && <PedidosModule />}
            {activeModule === "orcamentos" && <OrcamentosModule />}
            {activeModule === "kanban" && <KanbanModule />}
            {activeModule === "producao" && <ProducaoModule />}
            {activeModule === "impressoras" && <ImpressorasModule />}
            {activeModule === "materiais" && <StockModule />}
            {activeModule === "custos" && <CustosModule />}
            {activeModule === "fornecedores" && <CrudModule entity="fornecedores" title="Fornecedores" fields={fornecedorFields} />}
            {activeModule === "financeiro" && <FinanceiroModule />}
            {activeModule === "relatorios" && <RelatoriosModule />}
            {activeModule === "usuarios" && <CrudModule entity="usuarios" title="Usuários" fields={usuarioFields} />}
          </div>
        </main>

        {/* TOAST */}
        {
          toast && (
            <div style={{
              position: "fixed", bottom: 24, right: 24, padding: "12px 20px",
              background: toast.type === "success" ? "rgba(52, 199, 89, 0.9)" : toast.type === "error" ? "rgba(255, 59, 48, 0.9)" : "rgba(255, 149, 0, 0.9)",
              borderRadius: 12, color: "#fff", fontWeight: 500, fontSize: 13,
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)", zIndex: 9999,
              animation: "slideIn 0.3s ease",
            }}>
              {toast.msg}
            </div>
          )
        }

        <style>{`
          @keyframes slideIn { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
          @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
          * { box-sizing: border-box; }
          input, select, textarea, button { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif; }
          h1, h2, h3, h4, h5, h6 { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; }
        `}</style>
      </div >
    </AppContext.Provider >
  );
}

// ============================================================
// LOGIN PAGE
// ============================================================
function LoginPage({ onLogin, toast }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(user, pass);
  };

  return (
    <div style={{
      height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#F2F2F7", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    }}>
      <div style={{
        width: 360, padding: 40, background: "#fff", borderRadius: 20,
        boxShadow: "0 20px 60px rgba(0,0,0,0.05)", textAlign: "center",
        border: "1px solid #E5E5EA"
      }}>
        <div style={{ width: 120, height: 120, margin: "0 auto 24px" }}>
          <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ borderRadius: 12, boxShadow: "0 10px 30px rgba(0,88,159,0.3)" }}>
            <rect width="100" height="100" fill="#00589F" />
            {/* Nozzle */}
            <rect x="20" y="20" width="60" height="10" fill="white" />
            <rect x="40" y="30" width="20" height="15" fill="white" />
            <polygon points="40,45 60,45 50,55" fill="white" />
            {/* Cube Wireframe */}
            <path d="M50 58 L32 66 L32 84 L50 92 L68 84 L68 66 Z" fill="none" stroke="white" strokeWidth="3" />
            <path d="M50 58 L50 76 M32 66 L50 76 M68 66 L50 76 M50 76 L50 92 M32 84 L50 76 M68 84 L50 76" stroke="white" strokeWidth="2" />
            {/* Text */}
            <text x="50" y="90" fontSize="16" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif" style={{ display: 'none' }}>CB2K3D</text>
          </svg>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px", color: "#1C1C1E", letterSpacing: -0.5 }}>CB2K3D SISTEMAS</h1>
        <p style={{ fontSize: 14, color: "#8E8E93", margin: "0 0 32px" }}>Faça login para continuar</p>
        <div style={{ fontSize: 12, color: "#FF9500", background: "rgba(255,149,0,0.1)", padding: 8, borderRadius: 6, marginBottom: 16 }}>
          Padrão: <b>admin</b> / <b>123</b>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            type="text" placeholder="Usuário (admin)"
            value={user} onChange={e => setUser(e.target.value)}
            style={{
              padding: "14px", borderRadius: 12, border: "1px solid #E5E5EA",
              background: "#F2F2F7", fontSize: 15, outline: "none",
              color: "#1C1C1E"
            }}
          />
          <input
            type="password" placeholder="Senha (admin)"
            value={pass} onChange={e => setPass(e.target.value)}
            style={{
              padding: "14px", borderRadius: 12, border: "1px solid #E5E5EA",
              background: "#F2F2F7", fontSize: 15, outline: "none",
              color: "#1C1C1E"
            }}
          />
          <button type="submit" style={{
            padding: "14px", borderRadius: 12, border: "none",
            background: "#007AFF", color: "#fff", fontSize: 16, fontWeight: 600,
            cursor: "pointer", marginTop: 8, transition: "background 0.2s"
          }}>
            Entrar
          </button>
        </form>
        <div style={{ marginTop: 24, fontSize: 12, color: "#C7C7CC" }}>
          v2.3 • Secure Session
        </div>
      </div>

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, width: 300, padding: "12px 20px", left: "50%", transform: "translateX(-50%)",
          background: toast.type === "success" ? "rgba(52, 199, 89, 0.9)" : "rgba(255, 59, 48, 0.9)",
          borderRadius: 30, color: "#fff", fontWeight: 500, fontSize: 13, textAlign: "center",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)", zIndex: 9999,
          animation: "slideIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)"
        }}>
          {toast.msg}
        </div>
      )}
      <style>{`@keyframes slideIn { from { opacity:0; transform: translate(-50%, 20px); } to { opacity:1; transform: translate(-50%, 0); } }`}</style>
    </div>
  );
}

// ============================================================
// FIELD DEFINITIONS
// ============================================================
const usuarioFields = [
  { key: "nome", label: "Nome", type: "text", required: true },
  { key: "login", label: "Login de Acesso", type: "text", required: true },
  { key: "senha", label: "Senha", type: "password", required: true },
  { key: "perfil", label: "Perfil de Acesso", type: "select", options: ["admin", "usuario", "visualizador"] },
];

const clienteFields = [
  { key: "nome", label: "Nome", type: "text", required: true },
  { key: "tipo", label: "Tipo", type: "select", options: ["PF", "PJ"] },
  { key: "cpfCnpj", label: "CPF/CNPJ", type: "text" },
  { key: "email", label: "E-mail", type: "text" },
  { key: "telefone", label: "Telefone", type: "text" },
  { key: "cep", label: "CEP", type: "text" },
  { key: "endereco", label: "Endereço Completo", type: "text" },
  { key: "cidade", label: "Cidade", type: "text" },
  { key: "estado", label: "Estado (UF)", type: "text" },
  { key: "observacoes", label: "Observações", type: "textarea" },
];

const produtoFields = [
  { key: "imagemUrl", label: "Imagem do Produto", type: "image" },
  { key: "nome", label: "Nome", type: "text", required: true },
  { key: "categoria", label: "Categoria", type: "select", options: ["Decoração", "Utilidades", "Miniaturas", "Peças Técnicas", "Personalizado", "Outros"] },
  { key: "tempoImpressao", label: "Tempo Impressão", type: "time" },
  { key: "composicao", label: "Composição (Filamentos)", type: "composition" },
  // Hidden field to store the auto-calculated base cost
  { key: "custoBase", label: "Custo Base", type: "number", hiddenInForm: true },

  // Pricing Widget Fields (stored flat but displayed via widget)
  { key: "custoEmbalagem", label: "Embalagem", type: "number", hiddenInForm: true },
  { key: "custoFrete", label: "Frete", type: "number", hiddenInForm: true },
  { key: "taxaMarketplace", label: "Taxa Mkt (%)", type: "number", hiddenInForm: true },
  { key: "impostos", label: "Impostos (%)", type: "number", hiddenInForm: true },
  { key: "lucroDesejado", label: "Margem (%)", type: "number", hiddenInForm: true },

  // The aggregated Pricing Widget
  { key: "preco", label: "Precificação", type: "pricing" },

  { key: "descricao", label: "Descrição", type: "textarea" },
];

const fornecedorFields = [
  { key: "nome", label: "Razão Social", type: "text", required: true },
  { key: "contato", label: "Contato", type: "text" },
  { key: "email", label: "E-mail", type: "text" },
  { key: "telefone", label: "Telefone", type: "text" },
  { key: "endereco", label: "Endereço", type: "text" },
  { key: "produtos", label: "Produtos Fornecidos", type: "text" },
  { key: "observacoes", label: "Observações", type: "textarea" },
];

// ============================================================
// SHARED COMPONENTS
// ============================================================
// ============================================================
// SHARED COMPONENTS
// ============================================================
// ============================================================
// SHARED COMPONENTS
// ============================================================
// ============================================================
// SHARED COMPONENTS
// ============================================================
const cardStyle = {
  background: "#FFFFFF",
  border: "1px solid #E5E5EA",
  borderRadius: 12,
  padding: 24,
  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
};

const btnPrimary = {
  background: "#007AFF",
  border: "none", borderRadius: 8, color: "#fff",
  padding: "8px 16px", cursor: "pointer", fontWeight: 500,
  fontSize: 13, fontFamily: "inherit", transition: "all 0.2s",
};

const btnSecondary = {
  background: "#F2F2F7",
  border: "none", borderRadius: 8, color: "#007AFF",
  padding: "8px 16px", cursor: "pointer", fontWeight: 500,
  fontSize: 13, fontFamily: "inherit",
};

const inputStyle = {
  background: "#F2F2F7", border: "1px solid transparent",
  borderRadius: 8, padding: "10px 12px", color: "#1C1C1E", fontSize: 15,
  width: "100%", outline: "none", fontFamily: "inherit", transition: "all 0.2s",
  textTransform: "uppercase",
};

function StatCard({ icon, label, value, sub, color = "#007AFF" }) {
  return (
    <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 16, flex: "1 1 200px", minWidth: 200 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, color: "#fff" }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 13, color: "#8E8E93", fontWeight: 500, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 600, color: "#000000", letterSpacing: -0.5 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: "#8E8E93" }}>{sub}</div>}
      </div>
    </div>
  );
}

function Badge({ children, color = "#007AFF" }) {
  return (
    <span style={{
      display: "inline-block", padding: "4px 10px", borderRadius: 6,
      background: color, color: "#fff", fontSize: 11, fontWeight: 600,
    }}>{children}</span>
  );
}

function StatusBadge({ status }) {
  const map = {
    orcamento: { label: "Orçamento", color: "#8E8E93" },
    aprovado: { label: "Aprovado", color: "#007AFF" },
    producao: { label: "Em Produção", color: "#FF9500" },
    acabamento: { label: "Acabamento", color: "#AF52DE" },
    enviado: { label: "Enviado", color: "#5AC8FA" },
    entregue: { label: "Entregue", color: "#34C759" },
    cancelado: { label: "Cancelado", color: "#FF3B30" },
    fila: { label: "Na Fila", color: "#8E8E93" },
    imprimindo: { label: "Imprimindo", color: "#FF9500" },
    posProcessamento: { label: "Pós-Proc.", color: "#AF52DE" },
    concluido: { label: "Concluído", color: "#34C759" },
    falha: { label: "Falha", color: "#FF3B30" },
    disponivel: { label: "Disponível", color: "#34C759" },
    manutencao: { label: "Manutenção", color: "#FF3B30" },
    pendente: { label: "Pendente", color: "#FF9500" },
    parcial: { label: "Parcial", color: "#007AFF" },
    recebido: { label: "Recebido", color: "#34C759" },
    pago: { label: "Pago", color: "#34C759" },
  };
  const s = map[status] || { label: status, color: "#8E8E93" };
  return <Badge color={s.color}>{s.label}</Badge>;
}

function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(5px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...cardStyle, width, maxWidth: "90vw", maxHeight: "85vh", overflow: "auto",
        border: "1px solid rgba(99,102,241,0.25)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#f1f5f9" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Helper to format CEP
const formatCEP = (str) => {
  return str.replace(/\D/g, "").replace(/^(\d{5})(\d{3})+?$/, "$1-$2").substr(0, 9);
};


function FormField({ field, value, onChange, formValues = {}, setForm }) {
  if (!field) return null;
  const { data, showToast } = useContext(AppContext);
  const base = { ...inputStyle };

  if (field.type === "pricing") {
    const safeVal = (v) => {
      if (typeof v === 'number') return v;
      const str = String(v || "").replace(',', '.');
      return parseFloat(str) || 0;
    };

    // --- CENTRALIZED COST CALCULATION (SAFE MODE) ---
    // Deep merge defaults to ensure no undefined crashes
    const rawConfig = data.configCustos || {};
    const config = {
      energia: { custoKwh: 0.95, consumoMedioFDM: 150, ...(rawConfig.energia || {}) },
      depreciacao: { vidaUtilHoras: 2000, manutencaoPercent: 10, ...(rawConfig.depreciacao || {}) },
      trabalho: { horaTecnica: 35.00, ...(rawConfig.trabalho || {}) },
      logistica: { custoFretePadrao: 20.00, custoEmbalagemPadrao: 2.50, ...(rawConfig.logistica || {}) },
      vendas: { impostosPercent: 6.0, taxaMarketplacePercent: 12.0, ...(rawConfig.vendas || {}) }
    };

    // Destructure from safe config
    const { energia, depreciacao, trabalho, logistica, vendas: vendasConfig } = config;

    const materialItems = Array.isArray(formValues.composicao) ? formValues.composicao : [];
    const materiaisList = Array.isArray(data.materiais) ? data.materiais : [];

    const tempoMinutos = safeVal(formValues.tempoImpressao); // Handles undefined/NaN
    const tempoHoras = tempoMinutos / 60;

    // 1. FIXED/ALLOCATED COSTS (Custos Fixos)
    // Labor: Time * Hourly Rate
    const custoMaoDeObra = tempoHoras * trabalho.horaTecnica;
    // Depreciation: (AvgValue / LifeSpan) * Time
    const valorImpressoraPadrao = 3500; // Estimated avg
    const custoDepreciacao = (valorImpressoraPadrao / depreciacao.vidaUtilHoras) * tempoHoras;
    // Maintenance: % of Depreciation or Machine Cost
    const custoManutencao = custoDepreciacao * (depreciacao.manutencaoPercent / 100);

    const totalCustosFixos = custoMaoDeObra + custoDepreciacao + custoManutencao;

    // 2. VARIABLE COSTS (Custos Variáveis)
    // Materials
    const custoMaterial = materialItems.reduce((acc, item) => {
      const mat = materiaisList.find(m => m.id === item.materialId);
      const pricePerGram = mat ? (mat.custoKg / 1000) : 0;
      return acc + ((item.peso || 0) * pricePerGram);
    }, 0);

    // Energy
    const custoEnergia = (energia.consumoMedioFDM * tempoHoras / 1000) * energia.custoKwh;

    // Logistics (Defaults from config if not overridden)
    const custoEmbalagem = formValues.custoEmbalagem !== undefined ? safeVal(formValues.custoEmbalagem) : logistica.custoEmbalagemPadrao;
    const custoFrete = formValues.custoFrete !== undefined ? safeVal(formValues.custoFrete) : logistica.custoFretePadrao;

    const totalCustosVariaveis = custoMaterial + custoEnergia + custoEmbalagem + custoFrete;

    // 3. SALES & TAXES
    const taxaMktPct = formValues.taxaMarketplace !== undefined ? safeVal(formValues.taxaMarketplace) : vendasConfig.taxaMarketplacePercent;
    const impostosPct = formValues.impostos !== undefined ? safeVal(formValues.impostos) : vendasConfig.impostosPercent;
    const margemAlvoPct = safeVal(formValues.lucroDesejado);

    const precoVenda = safeVal(formValues.preco);

    // Totals
    const custoOperacionalTotal = totalCustosFixos + totalCustosVariaveis;

    const valorTaxaMkt = precoVenda * (taxaMktPct / 100);
    const valorImpostos = precoVenda * (impostosPct / 100);
    const custoVendaTotal = valorTaxaMkt + valorImpostos;

    const custoFinal = custoOperacionalTotal + custoVendaTotal;
    const lucroLiquido = precoVenda - custoFinal;
    const margemReal = precoVenda > 0 ? (lucroLiquido / precoVenda) * 100 : 0;

    // Suggestion Logic: Price = Cost / (1 - Rates)
    let suggestedPrice = 0;
    const totalRates = (taxaMktPct + impostosPct + margemAlvoPct) / 100;
    if (totalRates < 1) {
      suggestedPrice = custoOperacionalTotal / (1 - totalRates);
    }

    const update = (k, v) => setForm(prev => ({ ...prev, [k]: parseFloat(v) || 0 }));

    // SECTION STYLE
    const sectionHeaderStyle = { fontSize: 12, fontWeight: 700, color: "#4B5563", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12, display: "flex", justifyContent: "space-between", borderBottom: "1px solid #E5E7EB", paddingBottom: 6 };
    const rowStyle = { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8, color: "#374151" };
    const valStyle = { fontWeight: 600, fontFamily: "monospace" };

    return (
      <div style={{ background: "#F9FAFB", borderRadius: 16, padding: 24, marginBottom: 24, border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h4 style={{ margin: "0 0 24px", fontSize: 14, fontWeight: 800, textTransform: "uppercase", color: "#1F2937", letterSpacing: 0.5, borderBottom: "2px solid #E5E7EB", paddingBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>📊 Hub de Custos</span>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#6B7280" }}>Baseado nas configurações globais</div>
        </h4>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>

          {/* LEFT: COSTS BREAKDOWN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* CUSTOS FIXOS */}
            <div>
              <div style={sectionHeaderStyle}>
                <span>1. Custos Fixos (Máquina + Hora)</span>
                <span>R$ {totalCustosFixos.toFixed(2)}</span>
              </div>
              <div style={rowStyle}><span>Mão de Obra ({tempoHoras.toFixed(1)}h)</span> <span style={valStyle}>R$ {custoMaoDeObra.toFixed(2)}</span></div>
              <div style={rowStyle}><span>Depreciação</span> <span style={valStyle}>R$ {custoDepreciacao.toFixed(2)}</span></div>
              <div style={rowStyle}><span>Manutenção</span> <span style={valStyle}>R$ {custoManutencao.toFixed(2)}</span></div>
            </div>

            {/* CUSTOS VARIÁVEIS */}
            <div>
              <div style={sectionHeaderStyle}>
                <span>2. Custos Variáveis (Diretos)</span>
                <span>R$ {totalCustosVariaveis.toFixed(2)}</span>
              </div>
              <div style={rowStyle}><span>Material ({materialItems.reduce((a, b) => a + (b.peso || 0), 0)}g)</span> <span style={valStyle}>R$ {custoMaterial.toFixed(2)}</span></div>
              <div style={rowStyle}><span>Energia Elétrica</span> <span style={valStyle}>R$ {custoEnergia.toFixed(2)}</span></div>

              <div style={{ ...rowStyle, alignItems: "center", marginTop: 12 }}>
                <span>Embalagem</span>
                <input type="number" placeholder={logistica.custoEmbalagemPadrao.toString()} value={formValues.custoEmbalagem !== undefined ? formValues.custoEmbalagem : ""} onChange={e => update("custoEmbalagem", e.target.value)} style={{ width: 80, padding: "4px 8px", borderRadius: 6, border: "1px solid #D1D5DB", fontSize: 13, textAlign: "right" }} />
              </div>
              <div style={{ ...rowStyle, alignItems: "center" }}>
                <span>Frete / Logística</span>
                <input type="number" placeholder={logistica.custoFretePadrao.toString()} value={formValues.custoFrete !== undefined ? formValues.custoFrete : ""} onChange={e => update("custoFrete", e.target.value)} style={{ width: 80, padding: "4px 8px", borderRadius: 6, border: "1px solid #D1D5DB", fontSize: 13, textAlign: "right" }} />
              </div>
            </div>

            <div style={{ background: "#EEF2FF", padding: 12, borderRadius: 8, display: "flex", justifyContent: "space-between", color: "#4338CA", fontWeight: 700 }}>
              <span>TOTAL OPERACIONAL</span>
              <span>R$ {custoOperacionalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* RIGHT: PRICING STRATEGY */}
          <div>
            <div style={sectionHeaderStyle}>
              <span>3. Formação de Preço</span>
              <span>Margem: {margemReal.toFixed(1)}%</span>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ ...rowStyle, alignItems: "center" }}>
                <span>Impostos (%)</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>R$ {valorImpostos.toFixed(2)}</span>
                  <input type="number" placeholder={vendasConfig.impostosPercent.toString()} value={formValues.impostos !== undefined ? formValues.impostos : ""} onChange={e => update("impostos", e.target.value)} style={{ width: 60, padding: "4px 8px", borderRadius: 6, border: "1px solid #D1D5DB", fontSize: 13, textAlign: "right" }} />
                </div>
              </div>
              <div style={{ ...rowStyle, alignItems: "center" }}>
                <span>Taxa Marketplace (%)</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>R$ {valorTaxaMkt.toFixed(2)}</span>
                  <input type="number" placeholder={vendasConfig.taxaMarketplacePercent.toString()} value={formValues.taxaMarketplace !== undefined ? formValues.taxaMarketplace : ""} onChange={e => update("taxaMarketplace", e.target.value)} style={{ width: 60, padding: "4px 8px", borderRadius: 6, border: "1px solid #D1D5DB", fontSize: 13, textAlign: "right" }} />
                </div>
              </div>
              <div style={{ ...rowStyle, alignItems: "center", marginTop: 12, background: "#F0FDF4", padding: 8, borderRadius: 6 }}>
                <span style={{ color: "#166534", fontWeight: 600 }}>Lucro Alvo (%)</span>
                <input type="number" value={formValues.lucroDesejado || ""} onChange={e => update("lucroDesejado", e.target.value)} placeholder="0" style={{ width: 60, padding: "4px 8px", borderRadius: 6, border: "1px solid #86EFAC", fontSize: 13, textAlign: "right", color: "#166534", fontWeight: 700 }} />
              </div>
            </div>

            {suggestedPrice > 0 && (
              <div style={{ background: "#DCFCE7", padding: 16, borderRadius: 12, border: "1px dashed #22C55E", textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: "#15803D", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Preço Recomendado</div>
                <div style={{ fontSize: 24, color: "#166534", fontWeight: 800, marginBottom: 8 }}>R$ {suggestedPrice.toFixed(2)}</div>
                <button onClick={(e) => { e.preventDefault(); update("preco", suggestedPrice.toFixed(2)); }} style={{ background: "#16A34A", color: "#fff", padding: "8px 24px", borderRadius: 20, border: "none", fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 4px rgba(22, 163, 74, 0.2)" }}>
                  Aplicar Preço
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RESULTADO FINAL */}
        <div style={{ background: "#1F2937", borderRadius: 12, padding: 20, color: "#fff", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 6 }}>PREÇO DE VENDA</label>
              <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", border: "1px solid rgba(255,255,255,0.2)" }}>
                <span style={{ color: "#D1D5DB", marginRight: 8, fontWeight: 500 }}>R$</span>
                <input
                  type="number"
                  value={formValues.preco || ""}
                  onChange={e => update("preco", e.target.value)}
                  placeholder="0.00"
                  style={{ ...inputStyle, padding: 0, border: "none", background: "transparent", color: "#fff", fontSize: 24, fontWeight: 700, width: "100%" }}
                />
              </div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "#9CA3AF" }}>Custo Total:</span>
                <span style={{ color: "#F87171" }}>R$ {custoTotal.toFixed(2)}</span>
              </div>
              <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.1)" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.5 }}>Lucro Líquido</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: lucro >= 0 ? "#34C759" : "#EF4444" }}>
                    R$ {lucro.toFixed(2)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.5 }}>Margem</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: margem >= 20 ? "#34C759" : margem > 0 ? "#FBBF24" : "#EF4444" }}>
                    {margem.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CEP Integration
  if (field.key === "cep") {
    const handleBlur = async () => {
      const cep = value?.replace(/\D/g, "");
      if (cep?.length === 8 && setForm) {
        // Show loading state if needed
        const currentLabel = field.label;

        try {
          const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
          const data = await res.json();
          if (!data.erro) {
            setForm(prev => ({
              ...prev,
              endereco: `${data.logradouro}, ${data.bairro}`,
              cidade: data.localidade,
              estado: data.uf
            }));
            // Focus on number/complement finding logic could go here
          } else {
            // Handle error
          }
        } catch (e) {
          console.error("Erro CEP", e);
        }
      }
    };

    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, color: "#8E8E93", marginBottom: 6, fontWeight: 500 }}>{field.label}</label>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={value || ""}
            onChange={e => onChange(field.key, formatCEP(e.target.value))}
            onBlur={handleBlur}
            maxLength={9}
            placeholder="00000-000"
            style={base}
          />
          {value && value.length >= 8 && <span style={{ position: "absolute", right: 12, top: 12, fontSize: 10, color: "#34C759" }}>🔍</span>}
        </div>
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, color: "#8E8E93", marginBottom: 6, fontWeight: 500 }}>{field.label}</label>
        <div style={{ position: "relative" }}>
          <select value={value || ""} onChange={e => onChange(field.key, e.target.value)} style={{ ...base, cursor: "pointer", appearance: "none" }}>
            <option value="">Selecione...</option>
            {field.options.map(o => (
              typeof o === 'object' ?
                <option key={o.value} value={o.value}>{o.label}</option> :
                <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <div style={{ position: "absolute", right: 14, top: 14, pointerEvents: "none", color: "#8E8E93", fontSize: 10 }}>▼</div>
        </div>
      </div>
    );
  }
  if (field.type === "image") {
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, color: "#8E8E93", marginBottom: 6, fontWeight: 500 }}>{field.label}</label>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {value ? (
            <div style={{ position: "relative", width: 80, height: 80 }}>
              <img src={value} alt="Preview" style={{ width: "100%", height: "100%", borderRadius: 12, objectFit: "cover", border: "1px solid #E5E5EA" }} />
              <button onClick={() => onChange(field.key, "")} style={{
                position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%",
                background: "#FF3B30", color: "#fff", border: "none", fontSize: 10, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>✕</button>
            </div>
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: 12, border: "2px dashed #E5E5EA",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#C7C7CC", fontSize: 24
            }}>📷</div>
          )}

          <div>
            <label style={{
              ...btnSecondary, display: "inline-block", cursor: "pointer",
              padding: "10px 16px", background: "#F2F2F7", color: "#007AFF"
            }}>
              {value ? "Trocar Imagem" : "Escolher Imagem"}
              <input
                type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => onChange(field.key, reader.result);
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
            <div style={{ fontSize: 11, color: "#8E8E93", marginTop: 6 }}>JPG ou PNG (Max 2MB)</div>
          </div>
        </div>
      </div>
    );
  }
  if (field.type === "composition") {
    const items = value || []; // [{ tipo, cor, peso }]
    const addRow = () => onChange(field.key, [...items, { tipo: "PLA", cor: "", peso: 0 }]);
    const updateRow = (i, k, v) => {
      const newItems = [...items];
      newItems[i] = { ...newItems[i], [k]: v };
      onChange(field.key, newItems);
    };
    const removeRow = (i) => onChange(field.key, items.filter((_, idx) => idx !== i));

    const totalPeso = items.reduce((acc, it) => acc + (it.peso || 0), 0);

    // Cost Calculation Logic
    const config = data.configCustos || {};
    const energia = config.energia || { custoKwh: 0.95, consumoMedioFDM: 150 };
    const depreciacao = config.depreciacao || { vidaUtilHoras: 2000, manutencaoPercent: 10 };

    // Calculate Material Cost
    const custoMaterial = items.reduce((acc, it) => {
      const mat = data.materiais.find(m => m.id === it.materialId);
      const pricePerGram = mat ? (mat.custoKg / 1000) : 0;
      return acc + ((it.peso || 0) * pricePerGram);
    }, 0);

    // Calculate Machine Cost (Energy + Depreciation)
    const tempoMinutos = formValues.tempoImpressao || 0;
    const tempoHoras = tempoMinutos / 60;

    // Energy: (Watts * Hours / 1000) * Cost/kWh
    const custoEnergia = (energia.consumoMedioFDM * tempoHoras / 1000) * energia.custoKwh;

    // Depreciation: (PrinterValue / LifeSpan) * Hours
    // Assuming an average printer value of R$ 3000 if not specified
    const custoDepreciacao = (3000 / depreciacao.vidaUtilHoras) * tempoHoras;

    const custoTotalEstimado = custoMaterial + custoEnergia + custoDepreciacao;

    // Auto-update hidden Custo Base field
    useEffect(() => {
      if (Math.abs((formValues.custoBase || 0) - custoTotalEstimado) > 0.01) {
        setForm(prev => ({ ...prev, custoBase: parseFloat(custoTotalEstimado.toFixed(2)) }));
      }
    }, [custoTotalEstimado, formValues.custoBase, setForm]);

    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 8 }}>
          <label style={{ fontSize: 13, color: "#8E8E93", fontWeight: 600 }}>{field.label}</label>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E5E5EA", borderRadius: 12, padding: 16, boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>

          {/* Header Row */}
          {items.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 40px", gap: 12, marginBottom: 8, padding: "0 4px" }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", letterSpacing: 0.5 }}>MATERIAL</label>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", letterSpacing: 0.5 }}>PESO (g)</label>
              <span />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 120px 40px", gap: 12, alignItems: "center" }}>
                <div>
                  <select
                    value={item.materialId || ""}
                    onChange={e => {
                      const mat = data.materiais.find(m => m.id === e.target.value);
                      if (mat) {
                        const newItems = [...items];
                        newItems[i] = { ...newItems[i], materialId: mat.id, tipo: mat.tipo, cor: mat.cor, nome: mat.nome };
                        onChange(field.key, newItems);
                      } else {
                        const newItems = [...items];
                        newItems[i] = { ...newItems[i], materialId: "", tipo: "", cor: "", nome: "" };
                        onChange(field.key, newItems);
                      }
                    }}
                    style={{ ...inputStyle, padding: "0 12px", height: 40, fontSize: 14, border: "1px solid #E5E5EA", fontWeight: 500, width: "100%", borderRadius: 8, background: "#F9F9F9" }}
                  >
                    <option value="">Selecione...</option>
                    {data.materiais.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nome} ({m.cor})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ position: "relative" }}>
                  <input type="number" placeholder="0" value={item.peso || ""} onChange={e => updateRow(i, "peso", parseFloat(e.target.value))} style={{ ...inputStyle, padding: "0 24px 0 12px", height: 40, textAlign: "left", border: "1px solid #E5E5EA", fontWeight: 600, fontSize: 14, borderRadius: 8, background: "#F9F9F9", width: "100%" }} />
                  <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#8E8E93", fontSize: 12, fontWeight: 600 }}>g</span>
                </div>

                <button type="button" onClick={() => removeRow(i)} style={{ border: "none", background: "#FFF0F0", color: "#FF3B30", width: 40, height: 40, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "0.2s" }}>✕</button>
              </div>
            ))}
          </div>

          {items.length > 0 && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px dashed #E5E5EA" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 24 }}>
                  <div style={{ fontSize: 12, color: "#8E8E93" }}>
                    <span style={{ display: "block", marginBottom: 2 }}>Peso Total</span>
                    <strong style={{ fontSize: 16, color: "#1C1C1E" }}>{totalPeso} g</strong>
                  </div>
                  <div style={{ fontSize: 12, color: "#8E8E93" }}>
                    <span style={{ display: "block", marginBottom: 2 }}>Custo Material</span>
                    <strong style={{ fontSize: 16, color: "#1C1C1E" }}>R$ {custoMaterial.toFixed(2)}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: "#8E8E93" }}>
                    <span style={{ display: "block", marginBottom: 2 }}>Máquina ({tempoMinutos}m)</span>
                    <strong style={{ fontSize: 16, color: "#1C1C1E" }}>R$ {(custoEnergia + custoDepreciacao).toFixed(2)}</strong>
                  </div>
                </div>

                <div style={{ textAlign: "right", background: "#F2FDF5", padding: "8px 16px", borderRadius: 8, border: "1px solid #BBF7D0" }}>
                  <div style={{ fontSize: 10, color: "#166534", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Custo Estimado</div>
                  <div style={{ fontSize: 20, color: "#15803D", fontWeight: 800 }}>R$ {custoTotalEstimado.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: items.length > 0 ? 0 : 20 }}>
            <button type="button" onClick={addRow} style={{ ...btnSecondary, fontSize: 13, padding: "14px", width: "100%", background: "#F2F2F7", border: "none", color: "#007AFF", fontWeight: 600, borderRadius: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
              + Adicionar Filamento
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (field.type === "time") {
    const totalMinutes = value || 0;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const updateTime = (h, m) => {
      onChange(field.key, (parseInt(h || 0) * 60) + parseInt(m || 0));
    };

    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, color: "#8E8E93", marginBottom: 6, fontWeight: 500 }}>{field.label}</label>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ position: "relative" }}>
              <input type="number" value={hours} onChange={e => updateTime(e.target.value, minutes)} style={{ ...inputStyle, paddingRight: 30 }} />
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#8E8E93", fontSize: 11, fontWeight: 600 }}>h</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ position: "relative" }}>
              <input type="number" max="59" value={minutes} onChange={e => updateTime(hours, e.target.value)} style={{ ...inputStyle, paddingRight: 30 }} />
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#8E8E93", fontSize: 11, fontWeight: 600 }}>min</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (field.type === "orderItems") {
    const items = value || [];
    // items: [{ produto, quantidade, valorUnitario }]
    const { data } = useContext(AppContext);

    // Ensure items have IDs for keys (migration for existing items)
    useEffect(() => {
      if (value && value.some(i => !i._id)) {
        onChange(field.key, value.map(i => i._id ? i : { ...i, _id: Math.random() }));
      }
    }, []);

    // Internal state for product selector modal
    const [showProductSelector, setShowProductSelector] = useState(false);
    const [prodSearch, setProdSearch] = useState("");

    const addRow = () => onChange(field.key, [...items, { _id: Date.now(), produto: "", quantidade: 1, valorUnitario: 0 }]);
    const addProduct = (prod) => {
      onChange(field.key, [...items, { _id: Date.now() + Math.random(), produto: prod.nome, quantidade: 1, valorUnitario: prod.preco }]);
      setShowProductSelector(false);
      setProdSearch("");
    };

    const updateRow = (i, k, v) => {
      const newItems = [...items];
      const prod = data.produtos.find(p => p.nome === v);

      if (k === "produto" && prod) {
        newItems[i] = { ...newItems[i], produto: v, valorUnitario: prod.preco };
      } else {
        newItems[i] = { ...newItems[i], [k]: v };
      }
      onChange(field.key, newItems);
    };

    const removeRow = (i) => onChange(field.key, items.filter((_, idx) => idx !== i));

    // Robust parsing helper
    const parseNum = (v) => {
      if (typeof v === 'number') return v;
      if (typeof v === 'string') return parseFloat(v.replace(',', '.')) || 0;
      return 0;
    };

    // Calculate total display using explicit loop for safety
    let total = 0;
    let debugSum = [];
    items.forEach(item => {
      const q = parseNum(item.quantidade);
      const v = parseNum(item.valorUnitario);
      const sub = q * v;
      total += sub;
      debugSum.push(`${q}x${v}=${sub.toFixed(2)}`);
    });

    // Filter products for selector
    const filteredProds = data.produtos.filter(p => !prodSearch || p.nome.toLowerCase().includes(prodSearch.toLowerCase()));

    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, color: "#8E8E93", marginBottom: 6, fontWeight: 500 }}>
          {field.label} - Total Estimado: <span style={{ color: "#34C759", fontWeight: 700 }}>R$ {total.toFixed(2)}</span>
        </label>



        <div style={{ background: "#F2F2F7", borderRadius: 12, padding: 12 }}>
          {items.map((item, i) => {
            const prod = data.produtos.find(p => p.nome === item.produto);
            const subtotal = parseNum(item.quantidade) * parseNum(item.valorUnitario);

            return (
              <div key={item._id || i} style={{
                background: "#fff", borderRadius: 10, padding: 12, marginBottom: 12,
                boxShadow: "0 2px 5px rgba(0,0,0,0.03)", border: "1px solid #E5E5EA"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E" }}>{item.produto}</div>
                    {prod && prod.composicao && (
                      <div style={{ fontSize: 11, color: "#8E8E93", marginTop: 2 }}>
                        Consumo total: <strong>{prod.composicao.reduce((acc, c) => acc + (c.peso || 0), 0) * (item.quantidade || 0)}g</strong>
                        ({prod.composicao.map(c => c.tipo + " " + c.cor).join(", ")})
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={() => removeRow(i)} style={{ border: "none", background: "none", color: "#FF3B30", cursor: "pointer", fontSize: 18, padding: "0 0 0 10px" }}>✕</button>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {/* Product Image Preview */}
                  <div style={{
                    width: 60, height: 60, borderRadius: 8, background: "#F2F2F7",
                    display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0
                  }}>
                    {prod ? (
                      <img src={prod.imagemUrl || "https://placehold.co/60x60?text=3D"} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : <span style={{ fontSize: 20 }}>📦</span>}
                  </div>

                  <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 10, color: "#8E8E93", display: "block", marginBottom: 2 }}>Quantidade</label>
                      <input type="number" min="1" value={item.quantidade} onChange={e => updateRow(i, "quantidade", parseNum(e.target.value))} style={{ ...inputStyle, padding: "8px", width: "100%" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: "#8E8E93", display: "block", marginBottom: 2 }}>Valor Unit. (R$)</label>
                      <input type="number" step="0.01" value={item.valorUnitario} onChange={e => updateRow(i, "valorUnitario", parseNum(e.target.value))} style={{ ...inputStyle, padding: "8px", width: "100%" }} />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #F2F2F7", display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#8E8E93" }}>{prod?.categoria || "Produto"}</span>
                  <span style={{ fontWeight: 600, color: "#34C759" }}>Subtotal: R$ {subtotal.toFixed(2)}</span>
                </div>
              </div>
            );
          })}

          {items.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 4px", borderTop: "1px solid #E5E5EA", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#8E8E93" }}>{items.length} item{items.length !== 1 ? "s" : ""}</span>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 12, color: "#8E8E93", marginRight: 8 }}>Total Estimado:</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#34C759" }}>R$ {total.toFixed(2)}</span>
              </div>
            </div>
          )}

          <button type="button" onClick={() => setShowProductSelector(true)} style={{ ...btnPrimary, background: "#007AFF", width: "100%", justifyContent: "center" }}>+ Adicionar Item</button>

          {/* PRODUCT SELECTOR MODAL */}
          {showProductSelector && (
            <div style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999,
              display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s"
            }}>
              <div style={{ background: "#fff", width: 600, maxHeight: "80vh", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 18 }}>Selecionar Produto</h3>
                  <button type="button" onClick={() => setShowProductSelector(false)} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
                </div>

                <input
                  placeholder="BUSCAR PRODUTO..."
                  value={prodSearch}
                  onChange={e => setProdSearch(e.target.value.toUpperCase())}
                  autoFocus
                  style={{ ...inputStyle, marginBottom: 16 }}
                />

                <div style={{ overflowY: "auto", flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                  {filteredProds.map(p => (
                    <div key={p.id} onClick={() => addProduct(p)} style={{
                      border: "1px solid #E5E5EA", borderRadius: 8, padding: 10, cursor: "pointer",
                      textAlign: "center", transition: "all 0.2s", ":hover": { borderColor: "#007AFF" }
                    }}>
                      <img src={p.imagemUrl || "https://placehold.co/60x60?text=3D"} alt="" style={{ width: 60, height: 60, borderRadius: 6, objectFit: "cover", marginBottom: 8 }} />
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E", marginBottom: 4 }}>{p.nome}</div>
                      <div style={{ fontSize: 12, color: "#34C759", fontWeight: 700 }}>R$ {(p.preco || 0).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  if (field.type === "textarea") {
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, color: "#8E8E93", marginBottom: 6, fontWeight: 500 }}>{field.label}</label>
        <textarea value={value || ""} onChange={e => onChange(field.key, e.target.value.toUpperCase())} rows={3} style={{ ...base, resize: "vertical" }} />
      </div>
    );
  }
  if (field.type === "image") {
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, color: "#8E8E93", marginBottom: 6, fontWeight: 500 }}>{field.label}</label>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input
            type="text"
            placeholder=" https://..."
            value={value || ""}
            onChange={e => onChange(field.key, e.target.value)}
            style={{ ...base, flex: 1 }}
          />
          {value && (
            <div style={{ width: 40, height: 40, borderRadius: 6, overflow: "hidden", border: "1px solid #E5E5EA" }}>
              <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, color: "#8E8E93", marginBottom: 6, fontWeight: 500 }}>{field.label} {field.required && <span style={{ color: "#FF3B30" }}>*</span>}</label>
      <input
        type={field.type || "text"}
        value={field.type === "time" ? (() => {
          const min = parseInt(value || 0, 10);
          const h = Math.floor(min / 60);
          const m = Math.round(min % 60);
          return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        })() : (value || "")}
        onChange={e => {
          const val = e.target.value;
          let finalVal = val;
          if (field.type === "number") {
            finalVal = parseFloat(String(val).replace(',', '.')) || 0;
          } else if (field.type === "time") {
            const [h, m] = val.split(':').map(Number);
            finalVal = (h || 0) * 60 + (m || 0);
          } else if (field.type !== "password") {
            finalVal = val.toUpperCase();
          }
          if (field.key === "cep") {
            finalVal = formatCEP(finalVal);
          }
          onChange(field.key, finalVal);
        }}
        onBlur={async () => {
          if (field.key === "cep" && value && value.replace(/\D/g, "").length === 8) {
            try {
              const cep = value.replace(/\D/g, "");
              const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
              const data = await response.json();
              if (!data.erro) {
                setForm(prev => ({
                  ...prev,
                  endereco: `${data.logradouro}, ${data.bairro}`.toUpperCase(),
                  cidade: data.localidade.toUpperCase(),
                  estado: data.uf.toUpperCase()
                }));
                showToast("Endereço encontrado!");
              } else {
                showToast("CEP não encontrado", "error");
              }
            } catch (error) {
              console.error("Erro ao buscar CEP", error);
              showToast("Erro ao buscar CEP", "error");
            }
          }
        }}
        style={field.type === "password" ? { ...base, textTransform: "none" } : base}
      />
      <p style={{ fontSize: 10, color: "#8E8E93", textAlign: "center", marginTop: 20 }}>
        &copy; {new Date().getFullYear()} Gerenciador de Impressão 3D - v1.0.5 (Atualizado {new Date().toLocaleTimeString()})
      </p>
    </div>
  );
}

function DataTable({ columns, data, onEdit, onDelete }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 4px" }}>
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c.key} style={{ textAlign: "left", padding: "12px 14px", fontSize: 11, color: "#8E8E93", fontWeight: 600, borderBottom: "1px solid #E5E5EA" }}>
                {c.label.toUpperCase()}
              </th>
            ))}
            {(onEdit || onDelete) && <th style={{ textAlign: "right", padding: "12px 14px", fontSize: 11, color: "#8E8E93", borderBottom: "1px solid #E5E5EA" }}>AÇÕES</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length + 1} style={{ textAlign: "center", padding: 40, color: "#475569" }}>Nenhum registro encontrado</td></tr>
          ) : data.map((row, i) => (
            <tr key={row.id || i} style={{ background: i % 2 === 0 ? "#F9F9F9" : "transparent" }}>
              {columns.map(c => (
                <td key={c.key} style={{ padding: "14px 14px", fontSize: 14, color: "#1C1C1E", borderBottom: "1px solid #E5E5EA" }}>
                  {c.render ? c.render(row[c.key], row) : row[c.key]}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td style={{ textAlign: "right", padding: "12px 14px", borderBottom: "1px solid rgba(99,102,241,0.05)" }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    {onEdit && <button onClick={() => onEdit(row)} style={{ ...btnSecondary, padding: "5px 12px", fontSize: 11 }}>Editar</button>}
                    {onDelete && <button onClick={() => onDelete(row.id)} style={{ ...btnSecondary, padding: "5px 12px", fontSize: 11, background: "rgba(255,69,58,0.1)", color: "#FF453A" }}>Excluir</button>}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// PRODUCT CARD COMPONENT
// ============================================================
function ProductCard({ p, onEdit, onProduce, onDelete }) {
  const { navigateTo } = useContext(AppContext);
  const [idx, setIdx] = useState(0);

  // Ensure we consistently view valid media
  const mediaList = useMemo(() => {
    let list = [];
    if (p.fotos && p.fotos.length > 0) list = p.fotos;
    else if (p.imagemUrl) list = [p.imagemUrl];
    else list = [];
    return list;
  }, [p.fotos, p.imagemUrl]);

  const current = mediaList[idx] || null;

  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #E5E5EA", padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 160, background: "#F2F2F7", position: "relative" }}>
        {(() => {
          if (!current) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#C7C7CC", fontSize: 40 }}>📦</div>;

          const isVideo = (typeof current === 'string') && (current.startsWith("data:video") || current.endsWith(".mp4") || current.endsWith(".webm") || current.endsWith(".mov"));

          return isVideo ?
            <video src={current} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted loop autoPlay playsInline /> :
            <img src={current} alt={p.nome} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.2s" }} />;
        })()}

        <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,0.9)", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
          {p.categoria}
        </div>

        {/* Navigation Arrows */}
        {mediaList.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setIdx(prev => (prev === 0 ? mediaList.length - 1 : prev - 1)); }}
              style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 20, fontSize: 16, paddingBottom: 2 }}
            >‹</button>
            <button
              onClick={(e) => { e.stopPropagation(); setIdx(prev => (prev === mediaList.length - 1 ? 0 : prev + 1)); }}
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 20, fontSize: 16, paddingBottom: 2 }}
            >›</button>
          </>
        )}

        {/* Navigation Dots */}
        {mediaList.length > 1 && (
          <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6, zIndex: 10 }}>
            {mediaList.map((_, i) => (
              <div key={i}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: i === idx ? "#007AFF" : "rgba(255,255,255,0.8)",
                  cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.3)"
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#1C1C1E", marginBottom: 4 }}>{p.nome}</div>
        <div style={{ fontSize: 13, color: "#8E8E93", marginBottom: 12, flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.descricao || "Sem descrição"}</div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#34C759" }}>R$ {parseFloat(p.preco || 0).toFixed(2)}</div>
            {(p.estoqueAtual > 0) && <div style={{ fontSize: 11, color: "#007AFF", fontWeight: 600, marginTop: 2 }}>{p.estoqueAtual} un</div>}
          </div>
          <div style={{ fontSize: 11, color: "#8E8E93", textAlign: "right" }}>
            <div>Base: R$ {parseFloat(p.custoBase || 0).toFixed(2)}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16, paddingTop: 16, borderTop: "1px solid #F2F2F7" }}>
          <button onClick={() => onProduce(p)} style={{ ...btnSecondary, width: 36, padding: 0, fontSize: 16, background: "#E3F2FD", color: "#007AFF" }} title="Produzir">🔨</button>
          <button onClick={() => onEdit(p)} style={{ ...btnSecondary, flex: 1, fontSize: 12 }}>Editar</button>
          <button onClick={() => navigateTo && navigateTo("orcamentos", { action: "new", product: p })} style={{ ...btnSecondary, flex: 1, fontSize: 12, background: "#E8F5E9", color: "#16A34A" }}>Orçar</button>
          <button onClick={() => onDelete(p.id)} style={{ ...btnSecondary, width: 36, padding: 0, color: "#FF3B30", background: "rgba(255,59,48,0.1)", fontSize: 14 }} title="Excluir">✕</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PRODUCTS MODULE (CUSTOM)
// ============================================================
function ProductsModule() {
  const { data, setData, showToast, navigateTo } = useContext(AppContext);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const products = data.produtos || [];
  const filtered = products.filter(p => p && p.nome).filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    (p.categoria && p.categoria.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      setData(prev => ({
        ...prev,
        produtos: prev.produtos.filter(p => p.id !== id)
      }));
      showToast("Produto excluído", "warning");
    }
  };

  const handleSave = (product) => {
    // Ensure numeric fields are numbers
    const cleanProduct = {
      ...product,
      preco: parseFloat(product.preco) || 0,
      custoBase: parseFloat(product.custoBase) || 0,
      tempoImpressao: parseFloat(product.tempoImpressao) || 0,
    };

    if (editingProduct) {
      setData(prev => ({
        ...prev,
        produtos: prev.produtos.map(p => p.id === cleanProduct.id ? cleanProduct : p)
      }));
      showToast("Produto atualizado com sucesso!");
    } else {
      setData(prev => ({
        ...prev,
        produtos: [...prev.produtos, { ...cleanProduct, id: generateId() }]
      }));
      showToast("Produto criado com sucesso!");
    }
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleProduce = (product) => {
    const qtyStr = prompt(`Quantas unidades de '${product.nome}' você produziu para estoque? (Irá descontar material)`, "1");
    if (!qtyStr) return;
    const qty = parseInt(qtyStr);
    if (!qty || qty <= 0) return;

    setData(prev => {
      let newMaterials = [...prev.materiais];
      let newProducts = [...prev.produtos];
      let log = [];

      if (product.composicao) {
        product.composicao.forEach(comp => {
          const totalGrams = (comp.peso || 0) * qty;
          let matIndex = newMaterials.findIndex(m => String(m.id).trim() === String(comp.materialId).trim());
          if (matIndex === -1 && comp.tipo && comp.cor) {
            const tType = (comp.tipo || "").toLowerCase().trim();
            const tColor = (comp.cor || "").toLowerCase().trim();
            matIndex = newMaterials.findIndex(m => {
              const mT = (m.tipo || "").toLowerCase().trim();
              const mC = (m.cor || "").toLowerCase().trim();
              return (mT === tType && mC === tColor) || ((m.nome || "").toLowerCase().includes(tType) && (m.nome || "").toLowerCase().includes(tColor));
            });
          }

          if (matIndex >= 0) {
            const current = parseFloat(newMaterials[matIndex].quantidadeAtual || 0);
            newMaterials[matIndex] = { ...newMaterials[matIndex], quantidadeAtual: Math.max(0, current - totalGrams) };
            log.push(`${newMaterials[matIndex].nome}: -${totalGrams}g`);
          }
        });
      }

      const pIndex = newProducts.findIndex(p => p.id === product.id);
      if (pIndex >= 0) {
        const currentStock = newProducts[pIndex].estoqueAtual || 0;
        newProducts[pIndex] = { ...newProducts[pIndex], estoqueAtual: currentStock + qty };
      }

      showToast(`Produzido +${qty} un. ${log.join(", ")}`, "success");

      return { ...prev, materiais: newMaterials, produtos: newProducts };
    });
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <input
          placeholder="Buscar produtos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: 300, background: "#fff" }}
        />
        <button onClick={() => { setEditingProduct(null); setShowModal(true); }} style={btnPrimary}>
          + Novo Produto
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
        {filtered.map(p => (
          <ProductCard
            key={p.id}
            p={p}
            onEdit={(prod) => { setEditingProduct(prod); setShowModal(true); }}
            onProduce={(prod) => handleProduce(prod)}
            onDelete={(id) => handleDelete(id)}
          />
        ))}
      </div>

      {showModal && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          materials={data.materiais}
          config={data.configCustos}
        />
      )}
    </div>
  );
}

function ProductFormModal({ product, onClose, onSave, materials, config }) {
  const [form, setForm] = useState(product || {
    nome: "", categoria: "Decoração", estoqueAtual: 0, descricao: "", imagemUrl: "",
    tempoImpressao: 0, composicao: [], partes: [],
    // Print Profile Config
    perfil: { impressora: "A1", camada: "0.20", paredes: 3, preenchimento: "15%", bico: "0.4" },
    activeCosts: { material: true, energia: true, depreciacao: true, manutencao: true, maoDeObra: true },
    custoBase: 0,
    custoEmbalagem: config?.logistica?.custoEmbalagemPadrao || 0,
    custoFrete: config?.logistica?.custoFretePadrao || 0,
    taxaMarketplace: config?.vendas?.taxaMarketplacePercent || 0,
    impostos: config?.vendas?.impostosPercent || 0,
    lucroDesejado: 50, preco: 0
  });

  const pasteTargetRef = useRef("main");
  // STATE: API Keys
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem("print3d_gemini_key") || "AIzaSyB6rMwtZ22cFcTstXpb3WsXtoTzbnZ4LN0");
  const [extracting, setExtracting] = useState(false);

  const saveGeminiKey = (key) => {
    setGeminiKey(key);
    localStorage.setItem("print3d_gemini_key", key);
  };

  // HELPER: Convert Blob to Base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // HELPER: Call Gemini Vision API
  const handleGeminiExtraction = async (imageInput) => {
    const key = geminiKey ? geminiKey.trim() : "";
    if (!key) {
      alert("Por favor, insira sua chave da API Gemini primeiro!");
      return null;
    }

    try {
      let base64Image = "";
      if (typeof imageInput === "string" && imageInput.includes("base64,")) {
        base64Image = imageInput.split("base64,")[1];
      } else if (imageInput instanceof Blob) {
        base64Image = await blobToBase64(imageInput);
      } else {
        throw new Error("Formato de imagem não suportado (não é Blob nem Base64).");
      }

      const prompt = `
        Analise esta imagem de um fatiador de impressão 3D (tabela de resumo ou tela principal).
        Extraia os seguintes dados em formato JSON estrito:
        
        {
          "tempoTotalMinutos": number, // Converta horas/minutos para total em minutos
          "pesoTotalGramas": number, // Peso total do print
          "filamentos": [
             { "id": 1, "pesoGramas": number, "corEstimada": "string" },
             { "id": 2, "pesoGramas": number, "corEstimada": "string" }
          ]
        }
        
        Se houver uma tabela, use os valores da coluna 'Total' para cada filamento.
        Ignore custos monetários. Foque em PESO (g) e TEMPO.
        Retorne APENAS o JSON, sem markdown.
        `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: "image/png", data: base64Image } }
            ]
          }]
        })
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error.message);

      const textResponse = data.candidates[0].content.parts[0].text;
      // Clean markdown if present
      const jsonStr = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);

    } catch (error) {
      console.error("Gemini Error:", error);

      // DEBUG: List available models if not found
      if (error.message.includes("not found") || error.message.includes("not supported")) {
        try {
          const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
          const listData = await listResp.json();
          if (listData.models) {
            const modelNames = listData.models.map(m => m.name).join("\n");
            alert("ERRO DE MODELO. Modelos disponíveis para sua chave:\n" + modelNames);
            return { error: "Modelo errado. Use um destes:\n" + modelNames };
          }
        } catch (e) {
          console.error("List models failed", e);
        }
      }

      return { error: error.message };
    }
  };

  // HELPER: Pre-process image (Smart Invert for Dark Mode Tables) - IMPROVED
  const preprocessImage = async (imageSource) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const w = img.width;
        const h = img.height;
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0);

        // Get raw pixel data
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        // 1. Analyze Brightness (Is it Dark Mode?)
        let totalBrightness = 0;
        for (let i = 0; i < data.length; i += 4) {
          totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        const avgBrightness = totalBrightness / (data.length / 4);
        const isDark = avgBrightness < 128; // Standard cutoff

        // 2. Process Pixels (Grayscale + Invert if Dark + High Contrast)
        for (let i = 0; i < data.length; i += 4) {
          let r = data[i], g = data[i + 1], b = data[i + 2];

          // Grayscale
          let gray = 0.299 * r + 0.587 * g + 0.114 * b;

          // Invert if dark mode detected (make text black, bg white)
          if (isDark) gray = 255 - gray;

          // High Contrast Threshold (Binarization)
          // Make it crisp for Tesseract
          const threshold = 180;
          gray = (gray > threshold) ? 255 : 0;

          data[i] = gray;     // R
          data[i + 1] = gray;   // G
          data[i + 2] = gray;   // B
        }

        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob(resolve, 'image/png');
      };

      img.onerror = () => resolve(imageSource);
      if (imageSource instanceof Blob) img.src = URL.createObjectURL(imageSource);
      else img.src = imageSource;
    });
  };

  // OCR EXTRACTION LOGIC (Gemini Vision + Tesseract Fallback)

  const handleExtractData = async () => {
    const images = form.fotosTecnicas || [];
    if (images.length === 0) {
      alert("Adicione uma imagem de print do fatiador primeiro!");
      return;
    }

    setExtracting(true);
    let updates = {};
    let log = [];

    try {
      const originalImage = images[images.length - 1];

      // OPTION 1: Gemini Vision (Superior)
      if (geminiKey) {
        log.push("Usando Gemini AI Vision...");
        const geminiData = await handleGeminiExtraction(originalImage);

        if (geminiData && !geminiData.error) {
          log.push("Gemini processou com sucesso!");

          if (geminiData.tempoTotalMinutos) updates.tempoImpressao = geminiData.tempoTotalMinutos;
          if (geminiData.pesoTotalGramas) updates.totalWeight = geminiData.pesoTotalGramas;

          const fillets = geminiData.filamentos || [];
          if (fillets.length > 0) {
            const newPartes = fillets.map((f, i) => ({
              id: Date.now() + i,
              nome: `Filamento ${f.id} (${f.corEstimada || 'Auto'})`,
              materialId: "",
              peso: f.pesoGramas,
              tempo: updates.tempoImpressao ? Math.round(updates.tempoImpressao * (f.pesoGramas / geminiData.pesoTotalGramas)) : 0,
              foto: ""
            }));

            const newComp = newPartes.map(p => ({
              materialId: "", peso: p.peso, tipo: "", cor: ""
            }));

            updates.partes = newPartes;
            updates.composicao = newComp;
            log.push(`Detectados ${fillets.length} filamentos via AI.`);
          }

          setForm(prev => ({ ...prev, ...updates }));
          alert("Dados extraídos via Gemini AI!\n\n" + log.join('\n'));
          return; // EXIT EARLY
        } else {
          log.push("Falha no Gemini: " + (geminiData?.error || "Erro desconhecido"));
          log.push("Tentando OCR local...");
        }
      }

      // OPTION 2: Local OCR (Fallback)
      log.push("Otimizando tabela (Modo Tabela)...");
      const processedBlob = await preprocessImage(originalImage);

      const worker = await createWorker('eng');
      // PSM 6 is good for uniform blocks of text like tables
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789.,:hms kigTotalFilamentoCustoTempo', // Safe whitelist for numbers/units
        tessedit_pageseg_mode: '6',
      });

      log.push("Lendo dados (Modo Tabela)...");
      const { data: { text } } = await worker.recognize(processedBlob);
      await worker.terminate();

      console.log("OCR Text:", text);
      const cleanText = text.replace(/\n/g, ' | ');
      log.push(`Texto extraído: ${cleanText.substring(0, 50)}...`);

      // 1. EXTRACT TIME (Tempo total: 5h0m)
      let timeFound = false;
      let totalMins = 0;

      // Flexible Time Regex: allows "Tempo total:", "Total time:", "5h 30m", "5h30m", "5 h 30 m"
      const simpleTimeRegex = /(?:tempo|time|total|estimado).*?(\d+)\s*h\s*(\d*)\s*m?/i;
      let timeMatch = text.match(simpleTimeRegex);

      if (timeMatch) {
        const h = parseInt(timeMatch[1]) || 0;
        const m = parseInt(timeMatch[2]) || 0;
        totalMins = (h * 60) + m;
        timeFound = true;
      } else {
        // Try loose pattern just looking for H and M near each other: "5h 30m"
        const looseMatch = text.match(/(\d+)\s*h\s*(\d+)\s*m/i);
        if (looseMatch) {
          const h = parseInt(looseMatch[1]) || 0;
          const m = parseInt(looseMatch[2]) || 0;
          totalMins = (h * 60) + m;
          timeFound = true;
        } else {
          // Try complex including Days
          const complexMatch = text.match(/(?:(\d+)d\s*)?(?:(\d+)h\s*)?(\d+)m/i);
          if (complexMatch) {
            const d = complexMatch[1] ? parseInt(complexMatch[1]) : 0;
            const h = complexMatch[2] ? parseInt(complexMatch[2]) : 0;
            const m = complexMatch[3] ? parseInt(complexMatch[3]) : 0;
            if (d > 0 || h > 0 || m > 0) {
              totalMins = (d * 24 * 60) + (h * 60) + m;
              timeFound = true;
            }
          }
        }
      }

      if (timeFound && totalMins > 0) {
        updates.tempoImpressao = totalMins;
        const h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        log.push(`Tempo: ${h}h${m}m (${totalMins} min)`);
      } else {
        log.push("Aviso: Tempo de impressão não detectado.");
      }

      // 2. EXTRACT FILAMENTS / WEIGHTS
      // STRATEGY: BAG OF WEIGHTS (Robust to bad formatting)
      const rawWeights = [];
      const tokens = text.split(/[\s|]+/); // Split by any whitespace or separator

      tokens.forEach(t => {
        // Regex allows: "12.5g", "12,5g", "12g"
        const matches = t.matchAll(/(\d+[.,]?\d*)\s*(k?g)/gi);
        for (const m of matches) {
          let val = parseFloat(m[1].replace(',', '.'));
          if (m[2].toLowerCase() === 'kg') val *= 1000;
          if (!isNaN(val) && val > 0.5 && val < 50000) rawWeights.push(val); // Ignore < 0.5g (noise)
        }
      });
      console.log("All Weights Found:", rawWeights);

      let finalWeights = [];
      let grandTotal = 0;

      // 1. Identification Phase
      // The largest number is almost certainly the Grand Total (or Cumulative Total)
      // Sort descending
      const sortedWeights = [...rawWeights].sort((a, b) => b - a);

      if (sortedWeights.length > 0) {
        grandTotal = sortedWeights[0]; // Largest is Total
        log.push(`Total Detectado (Maior valor): ${grandTotal}g`);

        // 2. Component Phase
        // Identifying parts: 
        // A. If we have a math match (Sum of X, Y, Z approx Total) -> Perfect
        // B. If not, exclude values that are clearly "Sub-totals" or "Duplicates" of the Total?

        const candidates = sortedWeights.slice(1); // Detect components from the rest

        // Filter candidates: 
        // Sometimes OCR reads the same number twice (e.g. in a summary list and a detail list)
        // Or reads "119.06" as "119.06" and "19.06".
        // Let's filter unique values? Or keep duplicates (maybe 2 filaments have same weight)?
        // Let's keep distinct instances for now.

        // Try Subset Sum First (Most accurate)
        let currentSum = 0;
        let subset = [];
        const tolerance = grandTotal * 0.05; // 5% tolerance for bad OCR

        // Heuristic: Pure "Bag" - just take numbers that add up to Total
        for (const w of candidates) {
          if (currentSum + w <= grandTotal + tolerance) {
            subset.push(w);
            currentSum += w;
          }
        }

        if (Math.abs(currentSum - grandTotal) <= tolerance && subset.length > 0) {
          finalWeights = subset;
          log.push(`Componentes identificados pela soma: ${subset.join(', ')}`);
        } else {
          // Fallback: The OCR might have missed the "Total" line completely, and detected pieces are just pieces.
          // OR The "Total" is correct, but pieces are missing.

          // New Strategy: "The Big Filter"
          // If we have multiple numbers, and they are significantly smaller than the max, assume they are filaments.
          // e.g. [119, 64, 45, 9, 3] -> 119 is Total. 64+45+9 approx 119.

          // Let's just return ALL candidates that are likely components (e.g. < 90% of Total)
          // This might include "garbage" numbers but better to let user delete than type.
          const likelyComponents = candidates.filter(w => w < grandTotal * 0.95);

          if (likelyComponents.length > 0) {
            finalWeights = likelyComponents;
            log.push(`Aviso: Soma não exata. Trazendo todos os valores menores encontrados (${likelyComponents.length} itens).`);
          } else {
            // No components found? Just one big block?
            finalWeights = [grandTotal];
          }
        }
      } else {
        log.push("Erro: Nenhum peso encontrado.");
      }

      updates.totalWeight = parseFloat(grandTotal.toFixed(2));

      const fillets = [];
      // If we found specific components, use them. 
      // If we only found the Grand Total (finalWeights has 1 item and it matches grandTotal), treat as 1 filament.
      if (finalWeights.length === 0 && grandTotal > 0) finalWeights = [grandTotal];

      fillets.push(...finalWeights.map((w, i) => ({
        id: i + 1,
        weight: w,
        nome: `Filamento ${i + 1} (Auto)`
      })));

      // UPDATE FORM
      if (fillets.length > 0) {
        const newPartes = fillets.map((f, i) => ({
          id: Date.now() + i,
          nome: f.nome,
          materialId: "",
          peso: f.weight,
          tempo: updates.tempoImpressao ? Math.round(updates.tempoImpressao / fillets.length) : 0,
          foto: ""
        }));

        // Sync composition
        const newComp = newPartes.map(p => ({
          materialId: "", peso: p.peso, tipo: "", cor: ""
        }));

        updates.partes = newPartes;
        updates.composicao = newComp;
        log.push(`Detectados ${fillets.length} filamentos: ${fillets.map(f => f.weight + 'g').join(', ')}`);

      } else if (updates.totalWeight > 0) {
        // Just update the first part or create one
        const currentPart = (form.partes && form.partes[0]) || { id: Date.now(), nome: "Parte Principal", materialId: "", peso: 0, tempo: 0 };
        const newPart = { ...currentPart, peso: updates.totalWeight, tempo: updates.tempoImpressao || currentPart.tempo };

        updates.partes = [newPart];
        updates.composicao = [{ materialId: newPart.materialId, peso: updates.totalWeight, tipo: "", cor: "" }];
        log.push(`Peso Total detectado: ${updates.totalWeight}g`);
      } else {
        log.push("Aviso: Nenhum peso válido encontrado.");
      }

      setForm(prev => ({ ...prev, ...updates }));
      alert("Processamento concluído (Modo Local)!\n\n" + log.join('\n'));

    } catch (error) {
      console.error(error);
      alert("Erro ao ler tabela: " + error.message);
    } finally {
      setExtracting(false);
    }
  };

  // Removed activeTab state

  // Helper to update form
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  // Cost Calculation Effect
  // --- COST CALCULATIONS (Real-time) ---
  const cfg = {
    energia: { custoKwh: 0.95, consumoMedioFDM: 150, ...(config?.energia || {}) },
    trabalho: { horaTecnica: 35.00, ...(config?.trabalho || {}) },
    depreciacao: { vidaUtilHoras: 2000, manutencaoPercent: 10, ...(config?.depreciacao || {}) },
    logistica: { custoFretePadrao: 20.00, custoEmbalagemPadrao: 2.50, ...(config?.logistica || {}) }
  };

  const tempoHoras = (form.tempoImpressao || 0) / 60;

  const custoMaoDeObra = parseFloat((tempoHoras * cfg.trabalho.horaTecnica).toFixed(2));
  const custoDepreciacao = parseFloat(((3500 / cfg.depreciacao.vidaUtilHoras) * tempoHoras).toFixed(2));
  const custoManutencao = parseFloat((custoDepreciacao * (cfg.depreciacao.manutencaoPercent / 100)).toFixed(2));
  const fixedCost = custoMaoDeObra + custoDepreciacao + custoManutencao;

  const custoMaterial = parseFloat((form.composicao || []).reduce((acc, item) => {
    let m = materials.find(x => String(x.id) === String(item.materialId));

    // Fallback: Try match by Type + Color (Legacy Data Support)
    if (!m && item.tipo) {
      const targetTipo = (item.tipo || "").trim().toLowerCase();
      const targetCor = (item.cor || "").trim().toLowerCase();

      m = materials.find(x => {
        const matTipo = (x.tipo || "").trim().toLowerCase();
        const matCor = (x.cor || "").trim().toLowerCase();
        return matTipo === targetTipo && matCor === targetCor;
      });

      // Secondary Fallback: Try match just by Type if Color is missing/empty
      if (!m && !targetCor) {
        m = materials.find(x => (x.tipo || "").trim().toLowerCase() === targetTipo);
      }
    }

    if (!m) {
      console.warn("Material mismatch for item:", item);
    } else {
      // Debug Log
      // console.log("Matched:", m.nome, "Cost/Kg:", m.custoKg);
    }

    const pricePerGram = m ? (m.custoKg / 1000) : 0;
    return acc + ((item.peso || 0) * pricePerGram);
  }, 0).toFixed(2));

  const custoEnergia = parseFloat(((cfg.energia.consumoMedioFDM * tempoHoras / 1000) * cfg.energia.custoKwh).toFixed(2));

  // Calculate Base based on ACTIVE costs
  const active = form.activeCosts || { material: true, energia: true, depreciacao: true, manutencao: true, maoDeObra: true, frete: true, embalagem: true, taxaMarketplace: true, impostos: true };
  const calculatedBase = parseFloat((
    (active.maoDeObra ? custoMaoDeObra : 0) +
    (active.depreciacao ? custoDepreciacao : 0) +
    (active.manutencao ? custoManutencao : 0) +
    (active.material ? custoMaterial : 0) +
    (active.energia ? custoEnergia : 0)
  ).toFixed(2));

  const totalCost = calculatedBase +
    ((active.embalagem !== false) ? (form.custoEmbalagem || 0) : 0) +
    ((active.frete !== false) ? (form.custoFrete || 0) : 0);

  // Auto-update form state if calculations diverge (to save correct values)
  useEffect(() => {
    const feePercent = (
      ((active.taxaMarketplace !== false) ? (form.taxaMarketplace || 0) : 0) +
      ((active.impostos !== false) ? (form.impostos || 0) : 0)
    ) / 100;
    const profitPercent = (form.lucroDesejado || 0) / 100;

    let suggestedPrice = 0;
    if (feePercent < 1) {
      suggestedPrice = (totalCost * (1 + profitPercent)) / (1 - feePercent);
    } else {
      suggestedPrice = totalCost * (1 + profitPercent + feePercent);
    }

    // Only update if changed > 0.01 to avoid loops
    if (Math.abs(calculatedBase - (form.custoBase || 0)) > 0.01 || Math.abs(suggestedPrice - (form.preco || 0)) > 0.01) {
      setForm(prev => ({
        ...prev,
        custoBase: calculatedBase,
        preco: parseFloat(suggestedPrice.toFixed(2))
      }));
    }
  }, [calculatedBase, totalCost, form.taxaMarketplace, form.impostos, form.lucroDesejado, form.custoBase, form.preco, form.activeCosts]);

  // ENABLE PASTE (Ctrl+V) for Images
  // ENABLE PASTE (Ctrl+V) for Images
  useEffect(() => {
    const handlePaste = (e) => {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target.result;
            if (pasteTargetRef.current === "tech") {
              setForm(prev => ({ ...prev, fotosTecnicas: [...(prev.fotosTecnicas || []), result] }));
              showToast("Print técnico adicionado!", "success");
            } else {
              setForm(prev => {
                const newFotos = [...(prev.fotos || (prev.imagemUrl ? [prev.imagemUrl] : [])), result];
                return { ...prev, fotos: newFotos, imagemUrl: newFotos[0] };
              });
              showToast("Imagem adicionada à galeria!", "success");
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  return (
    <Modal title={product ? "Editar Produto (Atualizado)" : "Novo Produto (Atualizado)"} onClose={onClose} width={900}>
      <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 8 }}>

        {/* SECTION 1: INFO (Original) */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1C1C1E", borderBottom: "1px solid #E5E5EA", paddingBottom: 8, marginBottom: 16 }}>INFORMAÇÕES BÁSICAS</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#8E8E93", marginBottom: 6 }}>Nome do Produto</label>
              <input value={form.nome} onChange={e => update("nome", e.target.value)} style={inputStyle} placeholder="Ex: Vaso Geométrico" />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#8E8E93", marginBottom: 6 }}>Categoria</label>
              <select value={form.categoria} onChange={e => update("categoria", e.target.value)} style={inputStyle}>
                {["Decoração", "Utilidades", "Miniaturas", "Peças Técnicas", "Chaveiros", "Pets", "Personalizado", "Outros"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#8E8E93", marginBottom: 6 }}>Estoque Pronta Entrega</label>
              <input type="number" min="0" value={form.estoqueAtual || 0} onChange={e => update("estoqueAtual", parseInt(e.target.value) || 0)} style={inputStyle} />
            </div>

            {/* IMAGE/VIDEO UPLOAD */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#8E8E93", marginBottom: 6 }}>Fotos e Vídeos do Produto</label>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {/* Gallery */}
                {(form.fotos || (form.imagemUrl ? [form.imagemUrl] : [])).map((url, idx) => {
                  const isVideo = typeof url === "string" && (url.startsWith("data:video") || url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".mov"));
                  return (
                    <div key={idx} style={{ position: "relative", width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: "1px solid #E5E5EA", background: "#000" }}>
                      {isVideo ? (
                        <video src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
                      ) : (
                        <img src={url} alt={`Mídia ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}

                      <button
                        onClick={() => {
                          const newFotos = (form.fotos || (form.imagemUrl ? [form.imagemUrl] : [])).filter((_, i) => i !== idx);
                          setForm(prev => ({ ...prev, fotos: newFotos, imagemUrl: newFotos[0] || "" }));
                        }}
                        style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, zIndex: 10 }}
                      >✕</button>
                      {/* Video Indicator */}
                      {isVideo && <div style={{ position: "absolute", bottom: 2, left: 2, fontSize: 10, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>🎥 Vídeo</div>}
                    </div>
                  );
                })}

                {/* Add Button */}
                <div style={{ width: 80, height: 80, borderRadius: 8, border: "2px dashed #E5E5EA", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", background: "#F9F9F9" }}>
                  <span style={{ fontSize: 24, color: "#C7C7CC" }}>+</span>
                  <input type="file" accept="image/*,video/mp4,video/webm,video/quicktime"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // Limit video size (5MB)
                        if (file.type.startsWith("video/") && file.size > 5 * 1024 * 1024) {
                          alert("Vídeo muito grande! Máximo 5MB.");
                          return;
                        }

                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const newFotos = [...(form.fotos || (form.imagemUrl ? [form.imagemUrl] : [])), reader.result];
                          setForm(prev => ({ ...prev, fotos: newFotos, imagemUrl: newFotos[0] }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                  />
                </div>
              </div>

              {/* URL Input */}
              <div style={{ marginTop: 8 }}>
                <input
                  placeholder="Ou adicione via URL e pressione Enter..."
                  style={{ ...inputStyle, fontSize: 12 }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      const newFotos = [...(form.fotos || (form.imagemUrl ? [form.imagemUrl] : [])), e.target.value];
                      setForm(prev => ({ ...prev, fotos: newFotos, imagemUrl: newFotos[0] }));
                      e.target.value = "";
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            </div>

            {/* TECHNICAL SPECS IMAGES */}
            <div
              onMouseEnter={() => pasteTargetRef.current = "tech"}
              onMouseLeave={() => pasteTargetRef.current = "main"}
              style={{ gridColumn: "1 / -1", marginTop: 16, padding: 16, background: "#F2F2F7", borderRadius: 12, border: "1px dashed #D1D1D6", transition: "border-color 0.2s" }}
            >
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1C1C1E", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                📄 Documentação Técnica / Prints do Fatiador
              </label>
              <p style={{ fontSize: 11, color: "#8E8E93", marginBottom: 12 }}>
                Adicione aqui prints do fatiamento (tempo, gramas), esquemas de montagem ou anotações técnicas.
                <br />Estas imagens <strong>não aparecem</strong> na galeria principal do produto.
              </p>

              {/* GEMINI KEY CONFIG - RE-ADDED */}
              <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center", background: "#fff", padding: 8, borderRadius: 6, border: "1px solid #E5E5EA" }}>
                <span style={{ fontSize: 16 }}>✨</span>
                <input
                  type="password"
                  placeholder="Cole sua API Key do Google Gemini aqui para IA Avançada..."
                  value={geminiKey}
                  onChange={(e) => saveGeminiKey(e.target.value)}
                  style={{ ...inputStyle, fontSize: 11, height: 28, borderColor: geminiKey ? "#34C759" : "#E5E5EA", flex: 1, margin: 0 }}
                />
                <button
                  onClick={(e) => { e.preventDefault(); window.open("https://aistudio.google.com/app/apikey", "_blank"); }}
                  style={{ ...btnSecondary, fontSize: 10, padding: "0 8px", height: 28, whiteSpace: "nowrap" }}
                  title="Obter chave gratuita no Google AI Studio"
                >
                  Criar Chave Grátis ↗
                </button>
              </div>



              {/* OCR BUTTON - ALWAYS VISIBLE */}
              <div style={{ marginBottom: 12 }}>
                <button
                  onClick={(e) => { e.preventDefault(); handleExtractData(); }}
                  disabled={extracting || !form.fotosTecnicas || form.fotosTecnicas.length === 0}
                  style={{
                    padding: "8px 12px",
                    background: (extracting || !form.fotosTecnicas || form.fotosTecnicas.length === 0) ? "#E5E5EA" : "#5856D6",
                    color: (extracting || !form.fotosTecnicas || form.fotosTecnicas.length === 0) ? "#8E8E93" : "#fff",
                    border: "none", borderRadius: 8,
                    fontSize: 12, fontWeight: 600,
                    cursor: (extracting || !form.fotosTecnicas || form.fotosTecnicas.length === 0) ? "default" : "pointer",
                    display: "flex", alignItems: "center", gap: 6,
                    width: "100%", justifyContent: "center"
                  }}
                >
                  {extracting ? "Processando..." : (!form.fotosTecnicas || form.fotosTecnicas.length === 0) ? "⚡ Adicione um print para extrair dados" : "⚡ Extrair Dados do Print (Beta)"}
                </button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {/* Tech Gallery */}
                {(form.fotosTecnicas || []).map((url, idx) => (
                  <div key={idx} style={{ position: "relative", width: 100, height: 100, borderRadius: 8, overflow: "hidden", border: "1px solid #E5E5EA", background: "#fff", cursor: "pointer" }} onClick={() => window.open(url, "_blank")}>
                    <img src={url} alt={`Doc ${idx}`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newFotos = (form.fotosTecnicas || []).filter((_, i) => i !== idx);
                        setForm(prev => ({ ...prev, fotosTecnicas: newFotos }));
                      }}
                      style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12 }}
                    >✕</button>
                  </div>
                ))}

                {/* Add Button */}
                <div style={{ width: 100, height: 100, borderRadius: 8, border: "2px dashed #C7C7CC", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", background: "#fff" }}>
                  <span style={{ fontSize: 24, color: "#C7C7CC" }}>+</span>
                  <input type="file" accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const newFotos = [...(form.fotosTecnicas || []), reader.result];
                          setForm(prev => ({ ...prev, fotosTecnicas: newFotos }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                  />
                </div>
              </div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#8E8E93", marginBottom: 6 }}>Descrição</label>
              <textarea value={form.descricao} onChange={e => update("descricao", e.target.value)} style={{ ...inputStyle, height: 80, resize: "vertical" }} />
            </div>
          </div>
        </div>

        {/* SECTION 2: PRODUCTION (Assembly) */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1C1C1E", borderBottom: "1px solid #E5E5EA", paddingBottom: 8, marginBottom: 16 }}>ESTRUTURA DE PRODUÇÃO (COMPONENTES)</h3>

          <div style={{ background: "#F9F9F9", borderRadius: 12, padding: 16, border: "1px solid #E5E5EA" }}>
            <div style={{ marginBottom: 16 }}>
              {(form.partes && form.partes.length > 0 ? form.partes : (form.composicao && form.composicao.length > 0 ? form.composicao.map((c, i) => ({ id: i, nome: `Parte ${i + 1}`, materialId: c.materialId, peso: c.peso, tempo: Math.round((form.tempoImpressao || 0) / form.composicao.length), foto: "" })) : [{ id: Date.now(), nome: "Parte Principal", materialId: "", peso: 0, tempo: 0, foto: "" }])).map((part, idx, arr) => (
                <div key={idx} style={{ background: "#fff", border: "1px solid #E5E5EA", borderRadius: 8, padding: 12, marginBottom: 12, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  {/* Part Photo */}
                  <div style={{ width: 60, height: 60, background: "#F2F2F7", borderRadius: 6, position: "relative", flexShrink: 0, overflow: "hidden", border: "1px dashed #C7C7CC" }}>
                    {part.foto ? <img src={part.foto} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 20, color: "#C7C7CC" }}>📷</div>}
                    <input type="file" accept="image/*" style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} onChange={(e) => {
                      if (e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const newParts = [...arr];
                          newParts[idx] = { ...part, foto: reader.result };
                          // Update Logic Inline
                          const totalTime = newParts.reduce((a, b) => a + (parseFloat(b.tempo) || 0), 0);
                          const newComposicao = newParts.map(p => {
                            const m = materials.find(x => String(x.id) === String(p.materialId));
                            return { materialId: p.materialId, peso: parseFloat(p.peso) || 0, tipo: m?.tipo || "", cor: m?.cor || "" };
                          });
                          setForm(prev => ({ ...prev, partes: newParts, composicao: newComposicao, tempoImpressao: totalTime }));
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }} />
                  </div>

                  {/* Part Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 8, display: "flex", gap: 8 }}>
                      <input placeholder="Nome da Parte (ex: Base, Tampa)" value={part.nome} onChange={e => {
                        const newParts = [...arr]; newParts[idx] = { ...part, nome: e.target.value };
                        // Update Sync
                        const totalTime = newParts.reduce((a, b) => a + (parseFloat(b.tempo) || 0), 0);
                        const newComposicao = newParts.map(p => {
                          const m = materials.find(x => String(x.id) === String(p.materialId));
                          return { materialId: p.materialId, peso: parseFloat(p.peso) || 0, tipo: m?.tipo || "", cor: m?.cor || "" };
                        });
                        setForm(prev => ({ ...prev, partes: newParts, composicao: newComposicao, tempoImpressao: totalTime }));
                      }} style={{ ...inputStyle, flex: 1, fontWeight: "600" }} />
                      {arr.length > 1 && <button onClick={() => {
                        const newParts = arr.filter((_, i) => i !== idx);
                        const totalTime = newParts.reduce((a, b) => a + (parseFloat(b.tempo) || 0), 0);
                        const newComposicao = newParts.map(p => {
                          const m = materials.find(x => String(x.id) === String(p.materialId));
                          return { materialId: p.materialId, peso: parseFloat(p.peso) || 0, tipo: m?.tipo || "", cor: m?.cor || "" };
                        });
                        setForm(prev => ({ ...prev, partes: newParts, composicao: newComposicao, tempoImpressao: totalTime }));
                      }} style={{ ...btnSecondary, color: "#FF3B30", padding: "0 8px" }}>✕</button>}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 8 }}>
                      <div>
                        <label style={{ fontSize: 10, color: "#8E8E93" }}>Material</label>
                        <select value={part.materialId} onChange={e => {
                          const newParts = [...arr]; newParts[idx] = { ...part, materialId: e.target.value };
                          const totalTime = newParts.reduce((a, b) => a + (parseFloat(b.tempo) || 0), 0);
                          const newComposicao = newParts.map(p => {
                            const m = materials.find(x => String(x.id) === String(p.materialId));
                            return { materialId: p.materialId, peso: parseFloat(p.peso) || 0, tipo: m?.tipo || "", cor: m?.cor || "" };
                          });
                          setForm(prev => ({ ...prev, partes: newParts, composicao: newComposicao, tempoImpressao: totalTime }));
                        }} style={{ ...inputStyle, padding: "4px" }}>
                          <option value="">Selecione...</option>
                          {materials.map(m => <option key={m.id} value={m.id}>{m.nome} ({m.cor})</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 10, color: "#8E8E93" }}>Peso (g)</label>
                        <input type="number" min="0" value={part.peso} onChange={e => {
                          const newParts = [...arr]; newParts[idx] = { ...part, peso: parseFloat(e.target.value) || 0 };
                          const totalTime = newParts.reduce((a, b) => a + (parseFloat(b.tempo) || 0), 0);
                          const newComposicao = newParts.map(p => {
                            const m = materials.find(x => String(x.id) === String(p.materialId));
                            return { materialId: p.materialId, peso: parseFloat(p.peso) || 0, tipo: m?.tipo || "", cor: m?.cor || "" };
                          });
                          setForm(prev => ({ ...prev, partes: newParts, composicao: newComposicao, tempoImpressao: totalTime }));
                        }} style={{ ...inputStyle, padding: "4px" }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, color: "#8E8E93" }}>Tempo (min)</label>
                        <input type="number" min="0" value={part.tempo} onChange={e => {
                          const newParts = [...arr]; newParts[idx] = { ...part, tempo: parseFloat(e.target.value) || 0 };
                          const totalTime = newParts.reduce((a, b) => a + (parseFloat(b.tempo) || 0), 0);
                          // Just update time (and sync composicao just in case, though not needed for time)
                          setForm(prev => ({ ...prev, partes: newParts, tempoImpressao: totalTime }));
                        }} style={{ ...inputStyle, padding: "4px" }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => {
              const currentParts = form.partes && form.partes.length > 0 ? form.partes : (form.composicao && form.composicao.length > 0 ? form.composicao.map((c, i) => ({ id: i, nome: `Parte ${i + 1}`, materialId: c.materialId, peso: c.peso, tempo: Math.round((form.tempoImpressao || 0) / form.composicao.length), foto: "" })) : [{ id: Date.now(), nome: "Parte Principal", materialId: "", peso: 0, tempo: 0, foto: "" }]);
              const newParts = [...currentParts, { id: Date.now(), nome: `Parte ${currentParts.length + 1}`, materialId: "", peso: 0, tempo: 0, foto: "" }];
              // Sync
              const totalTime = newParts.reduce((a, b) => a + (parseFloat(b.tempo) || 0), 0);
              const newComposicao = newParts.map(p => {
                const m = materials.find(x => String(x.id) === String(p.materialId));
                return { materialId: p.materialId, peso: parseFloat(p.peso) || 0, tipo: m?.tipo || "", cor: m?.cor || "" };
              });
              setForm(prev => ({ ...prev, partes: newParts, composicao: newComposicao, tempoImpressao: totalTime }));
            }} style={{ ...btnSecondary, width: "100%", justifyContent: "center", border: "1px dashed #007AFF", color: "#007AFF" }}>+ Adicionar Parte / Componente</button>

            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", padding: "0 4px" }}>
              <span>Tempo Total: <strong>{form.tempoImpressao || 0} min</strong></span>
              <span>Peso Total: <strong>{(form.composicao || []).reduce((a, b) => a + (parseFloat(b.peso) || 0), 0)} g</strong></span>
            </div>
          </div>
        </div>

        {/* SECTION 3: PRICING */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1C1C1E", borderBottom: "1px solid #E5E5EA", paddingBottom: 8, marginBottom: 16 }}>PRECIFICAÇÃO</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ background: "#F2F2F7", padding: 20, borderRadius: 12 }}>
              <h4 style={{ margin: "0 0 16px", fontSize: 13, color: "#48484A", textTransform: "uppercase", letterSpacing: 0.5 }}>Detalhamento de Custos (Marque para cobrar)</h4>

              {[
                { key: "material", label: "Material (Filamento)", val: custoMaterial },
                { key: "energia", label: "Energia Elétrica", val: custoEnergia },
                { key: "depreciacao", label: "Depreciação Máquina", val: custoDepreciacao },
                { key: "manutencao", label: "Manutenção Prevista", val: custoManutencao },
                { key: "maoDeObra", label: "Mão de Obra (Técnica)", val: custoMaoDeObra }
              ].map(item => (
                <div key={item.key} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: (form.activeCosts?.[item.key] !== false) ? "#1C1C1E" : "#C7C7CC", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, cursor: "pointer" }}>
                    <input type="checkbox" checked={form.activeCosts?.[item.key] !== false} onChange={e => {
                      setForm(prev => ({ ...prev, activeCosts: { ...(prev.activeCosts || { material: true, energia: true, depreciacao: true, manutencao: true, maoDeObra: true }), [item.key]: e.target.checked } }));
                    }} />
                    {item.label}
                  </label>
                  <span style={{ textDecoration: (form.activeCosts?.[item.key] !== false) ? "none" : "line-through" }}>R$ {item.val.toFixed(2)}</span>
                </div>
              ))}

              <div style={{ height: 1, background: "#D1D1D6", margin: "10px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>
                <span>Custo Base (Produção)</span>
                <span>R$ {calculatedBase.toFixed(2)}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 13 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: (form.activeCosts?.embalagem !== false) ? "#1C1C1E" : "#C7C7CC" }}>
                  <input type="checkbox" checked={form.activeCosts?.embalagem !== false} onChange={e => {
                    setForm(prev => ({ ...prev, activeCosts: { ...(prev.activeCosts || { material: true, energia: true, depreciacao: true, manutencao: true, maoDeObra: true, frete: true, embalagem: true }), embalagem: e.target.checked } }));
                  }} />
                  Embalagem
                </label>
                <input type="number" value={form.custoEmbalagem || 0} onChange={e => update("custoEmbalagem", parseFloat(e.target.value))} style={{ ...inputStyle, width: 80, padding: "4px 8px", fontSize: 13, textAlign: "right", color: (form.activeCosts?.embalagem !== false) ? "#000" : "#C7C7CC", textDecoration: (form.activeCosts?.embalagem !== false) ? "none" : "line-through" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 13 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: (form.activeCosts?.frete !== false) ? "#1C1C1E" : "#C7C7CC" }}>
                  <input type="checkbox" checked={form.activeCosts?.frete !== false} onChange={e => {
                    setForm(prev => ({ ...prev, activeCosts: { ...(prev.activeCosts || { material: true, energia: true, depreciacao: true, manutencao: true, maoDeObra: true, frete: true, embalagem: true }), frete: e.target.checked } }));
                  }} />
                  Frete / Logística
                </label>
                <input type="number" value={form.custoFrete || 0} onChange={e => update("custoFrete", parseFloat(e.target.value))} style={{ ...inputStyle, width: 80, padding: "4px 8px", fontSize: 13, textAlign: "right", color: (form.activeCosts?.frete !== false) ? "#000" : "#C7C7CC", textDecoration: (form.activeCosts?.frete !== false) ? "none" : "line-through" }} />
              </div>

              <div style={{ borderTop: "1px solid #D1D1D6", margin: "12px 0", paddingTop: 12, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 15, color: "#000" }}>
                <span>Custo Total Final</span>
                <span>R$ {(totalCost).toFixed(2)}</span>
              </div>
            </div>

            <div>
              <div style={{ marginBottom: 20, padding: 16, background: "#fff", borderRadius: 8, border: "1px solid #E5E5EA" }}>
                <h5 style={{ fontSize: 11, fontWeight: 700, margin: "0 0 12px", color: "#8E8E93", letterSpacing: 0.5, textTransform: "uppercase" }}>TAXAS & VENDAS</h5>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 13 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: (active.impostos !== false) ? "#1C1C1E" : "#C7C7CC" }}>
                    <input type="checkbox" checked={active.impostos !== false} onChange={e => setForm(prev => ({ ...prev, activeCosts: { ...(prev.activeCosts || active), impostos: e.target.checked } }))} />
                    Impostos
                  </label>
                  <div style={{ position: "relative", width: 80 }}>
                    <input type="number" value={form.impostos || 0} onChange={e => update("impostos", parseFloat(e.target.value))} style={{ ...inputStyle, width: "100%", padding: "4px 8px", paddingRight: 24, fontSize: 13, textAlign: "right", color: (active.impostos !== false) ? "#000" : "#C7C7CC", textDecoration: (active.impostos !== false) ? "none" : "line-through" }} />
                    <span style={{ position: "absolute", right: 6, top: 4, fontSize: 10, color: "#8E8E93" }}>%</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 13 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: (active.taxaMarketplace !== false) ? "#1C1C1E" : "#C7C7CC" }}>
                    <input type="checkbox" checked={active.taxaMarketplace !== false} onChange={e => setForm(prev => ({ ...prev, activeCosts: { ...(prev.activeCosts || active), taxaMarketplace: e.target.checked } }))} />
                    Marketplace
                  </label>
                  <div style={{ position: "relative", width: 80 }}>
                    <input type="number" value={form.taxaMarketplace || 0} onChange={e => update("taxaMarketplace", parseFloat(e.target.value))} style={{ ...inputStyle, width: "100%", padding: "4px 8px", paddingRight: 24, fontSize: 13, textAlign: "right", color: (active.taxaMarketplace !== false) ? "#000" : "#C7C7CC", textDecoration: (active.taxaMarketplace !== false) ? "none" : "line-through" }} />
                    <span style={{ position: "absolute", right: 6, top: 4, fontSize: 10, color: "#8E8E93" }}>%</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: "#8E8E93" }}>Lucro Desejado (%)</label>
                <input type="number" value={form.lucroDesejado} onChange={e => update("lucroDesejado", parseFloat(e.target.value))} style={{ ...inputStyle, borderColor: "#34C759" }} />
              </div>

              <div style={{ background: "#34C759", padding: 20, borderRadius: 12, color: "#fff", textAlign: "center" }}>
                <label style={{ fontSize: 12, opacity: 0.8, textTransform: "uppercase", fontWeight: 600 }}>Preço de Venda</label>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 4 }}>
                  <span style={{ fontSize: 20 }}>R$</span>
                  <input
                    type="number"
                    value={form.preco}
                    onChange={e => update("preco", parseFloat(e.target.value))}
                    onBlur={() => update("preco", parseFloat((form.preco || 0).toFixed(2)))}
                    step="0.01"
                    style={{ background: "transparent", border: "none", color: "#fff", fontSize: 32, fontWeight: 700, width: 140, textAlign: "center", outline: "none" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, paddingTop: 20, borderTop: "1px solid #E5E5EA" }}>
        <button onClick={onClose} style={btnSecondary}>Cancelar</button>
        <button onClick={() => onSave(form)} style={btnPrimary}>Salvar Produto</button>
      </div>
    </Modal>
  );
}

// ============================================================
// DASHBOARD MODULE
// ============================================================
function DashboardModule() {
  const { data } = useContext(AppContext);

  const totalFaturamento = data.financeiro.contasReceber.reduce((s, c) => s + (c.valorRecebido || 0), 0);
  const totalPendente = data.financeiro.contasReceber.filter(c => c.status !== "recebido").reduce((s, c) => s + c.valor - (c.valorRecebido || 0), 0);
  const totalPagar = data.financeiro.contasPagar.filter(c => c.status !== "pago").reduce((s, c) => s + c.valor, 0);
  const impressorasAtivas = data.impressoras.filter(i => i.status === "imprimindo").length;
  const pedidosAtivos = data.pedidos.filter(p => !["entregue", "cancelado"].includes(p.status)).length;
  const alertasEstoque = data.materiais.filter(m => m.quantidadeAtual <= m.estoqueMinimo).length;

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* KPI CARDS */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard icon="💰" label="Faturado" value={`R$ ${totalFaturamento.toFixed(2)}`} sub="este mês" color="#34C759" />
        <StatCard icon="⏳" label="A Receber" value={`R$ ${totalPendente.toFixed(2)}`} sub="pendente" color="#FF9500" />
        <StatCard icon="📋" label="Pedidos Ativos" value={pedidosAtivos} sub="em andamento" color="#007AFF" />
        <StatCard icon="🖨️" label="Impressoras" value={`${impressorasAtivas}/${data.impressoras.length}`} sub="ativas agora" color="#AF52DE" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* PEDIDOS RECENTES */}
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "#5856D6" }}>📋 Pedidos Recentes</h3>
          {data.pedidos.slice(0, 5).map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F2F2F7" }}>
              <div>
                <div style={{ fontSize: 13, color: "#1C1C1E", fontWeight: 500 }}>
                  {p.itens && p.itens.length > 0 ? (
                    p.itens.length === 1 ? p.itens[0].produto : `${p.itens[0].produto} + ${p.itens.length - 1}`
                  ) : "Pedido Vazio"}
                </div>
                <div style={{ fontSize: 11, color: "#8E8E93" }}>
                  R$ {p.valorTotal.toFixed(2)}
                </div>
              </div>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </div>

        {/* PRODUCAO ATIVA */}
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "#5856D6" }}>🏭 Produção Ativa</h3>
          {data.producao.slice(0, 5).map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F2F2F7" }}>
              <div>
                <div style={{ fontSize: 13, color: "#1C1C1E", fontWeight: 500 }}>{p.pedidoRef}</div>
                <div style={{ fontSize: 11, color: "#8E8E93" }}>{p.impressora} • {p.material}</div>
              </div>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* ALERTAS ESTOQUE */}
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "#000" }}>⚠️ Alertas de Estoque</h3>
          {alertasEstoque === 0 ? (
            <div style={{ color: "#34C759", fontSize: 13 }}>✓ Todos os materiais acima do mínimo</div>
          ) : data.materiais.filter(m => m.quantidadeAtual <= m.estoqueMinimo).map(m => (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
              <div>
                <div style={{ fontSize: 13, color: "#f87171", fontWeight: 500 }}>{m.nome}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Atual: {m.quantidadeAtual}{m.unidade} • Mín: {m.estoqueMinimo}{m.unidade}</div>
              </div>
              <Badge color="#ef4444">BAIXO</Badge>
            </div>
          ))}
        </div>

        {/* CONTAS */}
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "#5856D6" }}>💳 Contas a Pagar (Próximas)</h3>
          {data.financeiro.contasPagar.filter(c => c.status !== "pago").slice(0, 4).map(c => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F2F2F7" }}>
              <div>
                <div style={{ fontSize: 13, color: "#1C1C1E", fontWeight: 500 }}>{c.descricao}</div>
                <div style={{ fontSize: 11, color: "#8E8E93" }}>Vence: {c.dataVencimento}</div>
              </div>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: "#FF3B30", fontWeight: 600 }}>R$ {c.valor.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// GENERIC CRUD MODULE
// ============================================================
function CrudModule({ entity, title, fields }) {
  const { data, setData, showToast, navigateTo } = useContext(AppContext);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});

  const items = data[entity] || [];
  const filtered = items.filter(item =>
    Object.values(item).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
  );

  const columns = fields
    .filter(f => !f.hiddenInTable && f.type !== "textarea") // Respect hiddenInTable
    .slice(0, 7)
    .map(f => ({
      key: f.key,
      label: f.label,
      render: (v) => {
        if (f.key === "imagemUrl") {
          return (
            <img
              src={v || "https://placehold.co/40x40?text=3D"}
              alt=""
              onClick={() => { if (v) window.open(v, "_blank"); }}
              style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover", cursor: v ? "pointer" : "default" }}
            />
          );
        }
        if (f.type === "composition") {
          // v is array of materials
          if (!Array.isArray(v) || v.length === 0) return <span style={{ color: "#999", fontSize: 11 }}>Sem material</span>;
          return (
            <div style={{ fontSize: 11 }}>
              {v.map((m, i) => (
                <div key={i}>{m.tipo} {m.cor} ({m.peso}g)</div>
              ))}
            </div>
          );
        }
        if (f.key === "preco" || f.key === "custoBase") return `R$ ${(v || 0).toFixed(2)}`;
        if (f.key === "tempoImpressao") return `${v} min`;
        if (f.key === "pesoMaterial") return `${v}g`;
        return v;
      }
    }));

  if (entity === "produtos") {
    columns.push({
      key: "actions_extra", label: "",
      render: (v, row) => (
        <button
          onClick={() => navigateTo && navigateTo("orcamentos", { action: "new", product: row })}
          style={{ ...btnSecondary, padding: "4px 8px", fontSize: 11, background: "#34C759", color: "#fff", border: "none", marginRight: 8 }}
          title="Criar Orçamento"
        >
          💲 Orçar
        </button>
      )
    });
  }

  const openNew = () => { setEditItem(null); setForm({}); setShowModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ ...item }); setShowModal(true); };

  const handleChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    if (editItem) {
      setData(prev => ({ ...prev, [entity]: prev[entity].map(i => i.id === editItem.id ? { ...form, id: editItem.id } : i) }));
      showToast("Registro atualizado com sucesso!");
    } else {
      setData(prev => ({ ...prev, [entity]: [...prev[entity], { ...form, id: generateId() }] }));
      showToast("Registro criado com sucesso!");
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este registro?")) {
      setData(prev => ({ ...prev, [entity]: prev[entity].filter(i => i.id !== id) }));
      showToast("Registro excluído", "warning");
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, maxWidth: 300 }} />
        <button onClick={openNew} style={btnPrimary}>+ Novo {title.slice(0, -1)}</button>
      </div>

      <div style={cardStyle}>
        <DataTable columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />
      </div>

      {showModal && (
        <Modal title={editItem ? `Editar ${title.slice(0, -1)}` : `Novo ${title.slice(0, -1)}`} onClose={() => setShowModal(false)} width={1000}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            {fields.filter(f => !f.hiddenInForm && f.type !== "pricing").map(f => (
              <div key={f.key} style={f.type === "textarea" || f.type === "composition" ? { gridColumn: "1 / -1" } : {}}>
                <FormField field={f} value={form[f.key]} onChange={handleChange} formValues={form} setForm={setForm} />
              </div>
            ))}

            {/* Render Pricing Widget at the bottom */}
            {fields.filter(f => f.type === "pricing").map(f => (
              <div key={f.key} style={{ gridColumn: "1 / -1", marginTop: 16 }}>
                <FormField field={f} value={form[f.key]} onChange={handleChange} formValues={form} setForm={setForm} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24, paddingTop: 16, borderTop: "1px solid #E5E5EA" }}>
            <button onClick={() => setShowModal(false)} style={btnSecondary}>Cancelar</button>
            <button onClick={handleSave} style={btnPrimary}>Salvar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// ORCAMENTOS MODULE
// ============================================================
function OrcamentosModule() {
  const { data, setData, showToast, navigationData, setNavigationData } = useContext(AppContext);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});

  // Check for navigation data (pre-fill)
  useEffect(() => {
    if (navigationData && navigationData.action === "new" && navigationData.product) {
      const prod = navigationData.product;
      setEditItem(null);
      setForm({
        status: "orcamento",
        dataPedido: new Date().toISOString().split("T")[0],
        itens: [{ produto: prod.nome, quantidade: 1, valorUnitario: prod.preco }],
        valorTotal: prod.preco // Initial total
      });
      setShowModal(true);
      setNavigationData(null); // Clear after using
    }
  }, [navigationData]);

  const filtered = data.pedidos.filter(p =>
    p.status === "orcamento" &&
    JSON.stringify(p).toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditItem(null); setForm({ status: "orcamento", dataPedido: new Date().toISOString().split("T")[0], itens: [] }); setShowModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ ...item }); setShowModal(true); };

  const handleChange = (key, val) => {
    setForm(prev => {
      const next = { ...prev, [key]: val };
      // Auto calc total from items
      if (key === "itens") {
        next.valorTotal = val.reduce((acc, item) => acc + ((item.quantidade || 0) * (item.valorUnitario || 0)), 0);
      }
      return next;
    });
  };

  const handleSave = () => {
    if (editItem) {
      setData(prev => ({ ...prev, pedidos: prev.pedidos.map(i => i.id === editItem.id ? { ...form, id: editItem.id } : i) }));
      showToast("Orçamento atualizado!");
    } else {
      setData(prev => ({ ...prev, pedidos: [...prev.pedidos, { ...form, id: generateId() }] }));
      showToast("Orçamento criado!");
    }
    setShowModal(false);
  };

  const handleApprove = (item) => {
    setData(prev => {
      // 1. Calculate new stock
      let newMaterials = [...prev.materiais];
      let newProducts = [...prev.produtos];
      let stockUpdated = false;

      if (item.itens && Array.isArray(item.itens)) {
        item.itens.forEach(orderItem => {
          // Find product index to update stock
          let prodIndex = newProducts.findIndex(p => p.nome === orderItem.produto);
          if (prodIndex === -1) prodIndex = newProducts.findIndex(p => p.nome.toLowerCase().trim() === (orderItem.produto || "").toLowerCase().trim());

          let qtyNeeded = orderItem.quantidade || 0;
          let qtyToMake = qtyNeeded;

          if (prodIndex >= 0) {
            const available = newProducts[prodIndex].estoqueAtual || 0;
            // 1. Try to fulfill from Stock
            if (available > 0) {
              const qtyFromStock = Math.min(qtyNeeded, available);
              qtyToMake = qtyNeeded - qtyFromStock;

              newProducts[prodIndex] = { ...newProducts[prodIndex], estoqueAtual: available - qtyFromStock };
              if (qtyFromStock > 0) showToast(`${qtyFromStock} un de '${newProducts[prodIndex].nome}' via Estoque`, "info");
            }

            // 2. Manufacture remainder
            if (qtyToMake > 0 && newProducts[prodIndex].composicao) {
              newProducts[prodIndex].composicao.forEach(comp => {
                let matIndex = newMaterials.findIndex(m => String(m.id).trim() === String(comp.materialId).trim());
                if (matIndex === -1 && comp.tipo && comp.cor) {
                  // Fallback lookup
                  const tType = (comp.tipo || "").toLowerCase().trim();
                  const tColor = (comp.cor || "").toLowerCase().trim();
                  matIndex = newMaterials.findIndex(m => {
                    const mT = (m.tipo || "").toLowerCase().trim();
                    const mC = (m.cor || "").toLowerCase().trim();
                    return (mT === tType && mC === tColor) || ((m.nome || "").toLowerCase().includes(tType) && (m.nome || "").toLowerCase().includes(tColor));
                  });
                }

                if (matIndex >= 0) {
                  // Deduct based on qtyToMake
                  const deductAmount = (comp.peso || 0) * qtyToMake;
                  const currentStock = parseFloat(newMaterials[matIndex].quantidadeAtual || 0);
                  newMaterials[matIndex] = { ...newMaterials[matIndex], quantidadeAtual: Math.max(0, currentStock - deductAmount) };
                  stockUpdated = true;
                }
              });
            }
          }
        });
      }

      const updatedPedidos = prev.pedidos.map(i => i.id === item.id ? { ...i, status: "aprovado" } : i);

      // FINANCE: Auto-generate Receivable on Approval
      let newFinanceiro = { ...prev.financeiro };
      const billExists = newFinanceiro.contasReceber.some(c => c.descricao && c.descricao.includes(`Pedido #${item.id}`));

      if (!billExists) {
        const clientName = prev.clientes.find(c => c.id === item.clienteId)?.nome || "Cliente";
        newFinanceiro.contasReceber = [...newFinanceiro.contasReceber, {
          id: generateId(),
          descricao: `Pedido #${item.id} - ${clientName}`,
          valor: parseFloat(item.valorTotal || 0),
          dataVencimento: new Date().toISOString().split('T')[0],
          status: "pendente",
          formaPagamento: item.formaPagamento || "PIX"
        }];
        showToast("Conta a receber gerada automaticamente!", "success");
      }

      return {
        ...prev,
        materiais: newMaterials,
        produtos: newProducts,
        pedidos: updatedPedidos,
        financeiro: newFinanceiro
      };
    });

    showToast("Orçamento aprovado e estoque deduzido!", "success");
  };

  const handleDelete = (id) => {
    setData(prev => ({ ...prev, pedidos: prev.pedidos.filter(i => i.id !== id) }));
    showToast("Orçamento excluído", "warning");
  };

  const orcamentoFields = [
    { key: "clienteId", label: "Cliente", type: "select", options: data.clientes.map(c => ({ label: c.nome, value: c.id })) },
    { key: "itens", label: "Produtos", type: "orderItems" },
    { key: "dataPedido", label: "Data", type: "date" },
    { key: "observacoes", label: "Observações", type: "textarea" },
  ];

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <input placeholder="Buscar orçamento..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, maxWidth: 300 }} />
        <button onClick={openNew} style={btnPrimary}>+ Novo Orçamento</button>
      </div>

      <div style={cardStyle}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 4px" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "12px 14px", fontSize: 11, color: "#8E8E93", fontWeight: 600, borderBottom: "1px solid #E5E5EA" }}>CLIENTE</th>
                <th style={{ textAlign: "left", padding: "12px 14px", fontSize: 11, color: "#8E8E93", fontWeight: 600, borderBottom: "1px solid #E5E5EA" }}>ITENS</th>
                <th style={{ textAlign: "left", padding: "12px 14px", fontSize: 11, color: "#8E8E93", fontWeight: 600, borderBottom: "1px solid #E5E5EA" }}>TOTAL</th>
                <th style={{ textAlign: "right", padding: "12px 14px", fontSize: 11, color: "#8E8E93", borderBottom: "1px solid #E5E5EA" }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: "center", padding: 40, color: "#8E8E93" }}>Nenhum orçamento pendente</td></tr>
              ) : filtered.map((row, i) => (
                <tr key={row.id} style={{ background: i % 2 === 0 ? "#F9F9F9" : "transparent" }}>
                  <td style={{ padding: "14px", fontSize: 14, color: "#1C1C1E", borderBottom: "1px solid #E5E5EA" }}>
                    {row.clienteId ? data.clientes.find(c => c.id === row.clienteId)?.nome : "N/A"}
                  </td>
                  <td style={{ padding: "14px", fontSize: 14, color: "#1C1C1E", borderBottom: "1px solid #E5E5EA" }}>
                    {(row.itens || []).map(it => `${it.produto} (${it.quantidade})`).join(", ")}
                  </td>
                  <td style={{ padding: "14px", fontSize: 14, color: "#1C1C1E", borderBottom: "1px solid #E5E5EA", fontFamily: "'Space Mono', monospace", fontWeight: 600 }}>
                    R$ {(row.valorTotal || 0).toFixed(2)}
                  </td>
                  <td style={{ textAlign: "right", padding: "12px 14px", borderBottom: "1px solid rgba(99,102,241,0.05)" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button onClick={() => handleApprove(row)} style={{ ...btnPrimary, background: "#34C759", padding: "6px 12px", fontSize: 11 }}>✔ Aprovar</button>
                      <button onClick={() => openEdit(row)} style={{ ...btnSecondary, padding: "6px 12px", fontSize: 11 }}>Editar</button>
                      <button onClick={() => handleDelete(row.id)} style={{ ...btnSecondary, padding: "6px 12px", fontSize: 11, color: "#FF3B30" }}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={editItem ? "Editar Orçamento" : "Novo Orçamento"} onClose={() => setShowModal(false)} width={600}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            {orcamentoFields.map(f => (
              <div key={f.key} style={f.type === "textarea" || f.key === "itens" ? { gridColumn: "1 / -1" } : {}}>
                <FormField field={f} value={form[f.key]} onChange={handleChange} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={() => setShowModal(false)} style={btnSecondary}>Cancelar</button>
            <button onClick={handleSave} style={btnPrimary}>Salvar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// PEDIDOS MODULE
// ============================================================
function PedidosModule() {
  const { data, setData, showToast } = useContext(AppContext);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [filterStatus, setFilterStatus] = useState("todos");

  const statuses = ["orcamento", "aprovado", "producao", "acabamento", "enviado", "entregue", "cancelado"];
  const filtered = data.pedidos.filter(p => {
    const matchSearch = JSON.stringify(p).toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "todos" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openNew = () => { setEditItem(null); setForm({ status: "orcamento", dataPedido: new Date().toISOString().split("T")[0], itens: [] }); setShowModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ ...item }); setShowModal(true); };
  const handleChange = (key, val) => {
    setForm(prev => {
      const next = { ...prev, [key]: val };
      if (key === "itens") {
        next.valorTotal = val.reduce((acc, item) => acc + ((item.quantidade || 0) * (item.valorUnitario || 0)), 0);
      }
      return next;
    });
  };

  const handleSave = () => {
    setData(prev => {
      let newMaterials = [...prev.materiais];
      let msg = editItem ? "Pedido atualizado!" : "Pedido criado!";

      const consumingStatuses = ["aprovado", "producao", "imprimindo", "acabamento", "enviado", "entregue", "concluido", "posProcessamento"];
      const isConsuming = (s) => consumingStatuses.includes(s);

      // STOCK MANAGEMENT LOGIC
      // 1. If Creating NEW order directly as Consuming -> Deduct
      // 2. If Updating:
      //    a. Non-Consuming -> Consuming: Deduct
      //    b. Consuming -> Non-Consuming: Refund
      //    c. Consuming -> Consuming: Need to check if items changed... (Advanced: skipping for now, assume status change is primary trigger)
      //       Ideally we refund old items and deduct new ones, but let's stick to status transitions for safety first.

      const oldStatus = editItem ? editItem.status : "orcamento";
      const newStatus = form.status;

      let stockAction = null; // 'deduct', 'refund', or null
      if (editItem) {
        if (!isConsuming(oldStatus) && isConsuming(newStatus)) stockAction = 'deduct';
        else if (isConsuming(oldStatus) && !isConsuming(newStatus)) stockAction = 'refund';
      } else {
        if (isConsuming(newStatus)) stockAction = 'deduct';
      }

      if (stockAction && form.itens) {
        let log = [];
        form.itens.forEach(orderItem => {
          let produto = prev.produtos.find(p => p.nome === orderItem.produto);
          if (!produto) produto = prev.produtos.find(p => p.nome.toLowerCase().trim() === (orderItem.produto || "").toLowerCase().trim());

          if (produto && produto.composicao) {
            produto.composicao.forEach(comp => {
              const qtd = (comp.peso || 0) * (orderItem.quantidade || 0);

              // Robust Lookup
              let matIndex = newMaterials.findIndex(m => String(m.id).trim() === String(comp.materialId).trim());
              if (matIndex === -1 && comp.tipo && comp.cor) {
                const targetType = (comp.tipo || "").toLowerCase().trim();
                const targetColor = (comp.cor || "").toLowerCase().trim();
                matIndex = newMaterials.findIndex(m => {
                  const mType = (m.tipo || "").toLowerCase().trim();
                  const mColor = (m.cor || "").toLowerCase().trim();
                  if (mType === targetType && mColor === targetColor) return true;
                  const mName = (m.nome || "").toLowerCase();
                  if (mName.includes(targetType) && mName.includes(targetColor)) return true;
                  return false;
                });
              }

              if (matIndex >= 0) {
                const current = parseFloat(newMaterials[matIndex].quantidadeAtual || 0);
                if (stockAction === 'deduct') {
                  newMaterials[matIndex] = { ...newMaterials[matIndex], quantidadeAtual: Math.max(0, current - qtd) };
                  log.push(`-${qtd}g ${newMaterials[matIndex].nome}`);
                } else {
                  const maxStock = newMaterials[matIndex].quantidadeTotal || 1000;
                  newMaterials[matIndex] = { ...newMaterials[matIndex], quantidadeAtual: Math.min(maxStock, current + qtd) };
                  log.push(`+${qtd}g ${newMaterials[matIndex].nome}`);
                }
              }
            });
          }
        });
        if (log.length > 0) msg += ` (Estoque: ${log.join(", ")})`;
      }

      // FINANCE LOGIC: Create Receivable if moving to Consuming Status (e.g. Aprovado) 
      let newFinanceiro = { ...prev.financeiro };
      if (stockAction === 'deduct') {
        const tempId = editItem ? editItem.id : null;
        // For new items, we can't easily guess the ID here without refactoring `generateId`. 
        // BUT, we can rely on text description or handle it for `editItem` primarily.
        // Refactoring to ensure ID is stable:

        const finalId = editItem ? editItem.id : generateId();
        const clientName = prev.clientes.find(c => c.id === form.clienteId)?.nome || "Cliente";

        const billExists = newFinanceiro.contasReceber.some(c => c.descricao && c.descricao.includes(`Pedido #${finalId}`));
        if (!billExists) {
          newFinanceiro.contasReceber = [...newFinanceiro.contasReceber, {
            id: generateId(),
            descricao: `Pedido #${finalId} - ${clientName}`,
            valor: parseFloat(form.valorTotal || 0),
            dataVencimento: new Date().toISOString().split('T')[0],
            status: "pendente",
            formaPagamento: form.formaPagamento || "PIX"
          }];
          msg += " + Conta Gerada";
        }

        // Return with specified ID to ensure consistency
        if (editItem) {
          return { ...prev, materiais: newMaterials, financeiro: newFinanceiro, pedidos: prev.pedidos.map(i => i.id === finalId ? { ...form, id: finalId } : i) };
        } else {
          return { ...prev, materiais: newMaterials, financeiro: newFinanceiro, pedidos: [...prev.pedidos, { ...form, id: finalId }] };
        }
      }

      if (editItem) {
        return {
          ...prev,
          materiais: newMaterials,
          pedidos: prev.pedidos.map(i => i.id === editItem.id ? { ...form, id: editItem.id } : i)
        };
      } else {
        return {
          ...prev,
          materiais: newMaterials,
          pedidos: [...prev.pedidos, { ...form, id: generateId() }]
        };
      }
    });

    // Toast needs to be called after render or via effect, but here we can just show generic success
    // Since we are inside setState updater, we can't reliably get the msg out to showToast immediately with dynamic content easily without refactoring.
    // We will just show a generic toast outside.
    showToast(editItem ? "Pedido atualizado!" : "Pedido criado!");
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este pedido?")) return;

    setData(prev => {
      const order = prev.pedidos.find(p => p.id === id);
      let newMaterials = [...prev.materiais];

      // Restore stock if order was in a status that consumed stock
      const consumedStockStatuses = ["aprovado", "producao", "acabamento", "enviado", "entregue"];
      if (order && consumedStockStatuses.includes(order.status) && order.itens) {
        order.itens.forEach(orderItem => {
          // Find product (robust lookup)
          let product = prev.produtos.find(p => p.nome === orderItem.produto);
          if (!product) {
            product = prev.produtos.find(p => p.nome.toLowerCase().trim() === (orderItem.produto || "").toLowerCase().trim());
          }

          if (product && product.composicao) {
            product.composicao.forEach(comp => {
              // 1. Try to find by ID
              let matIndex = newMaterials.findIndex(m => String(m.id).trim() === String(comp.materialId).trim());

              // 2. Fallback: Type/Color
              if (matIndex === -1 && comp.tipo && comp.cor) {
                const targetType = (comp.tipo || "").toLowerCase().trim();
                const targetColor = (comp.cor || "").toLowerCase().trim();

                matIndex = newMaterials.findIndex(m => {
                  const mType = (m.tipo || "").toLowerCase().trim();
                  const mColor = (m.cor || "").toLowerCase().trim();
                  if (mType === targetType && mColor === targetColor) return true;

                  const mName = (m.nome || "").toLowerCase();
                  if (mName.includes(targetType) && mName.includes(targetColor)) return true;
                  return false;
                });
              }

              if (matIndex >= 0) {
                const returnAmount = (comp.peso || 0) * (orderItem.quantidade || 0);
                const maxStock = newMaterials[matIndex].quantidadeTotal || 1000;
                newMaterials[matIndex] = {
                  ...newMaterials[matIndex],
                  quantidadeAtual: Math.min(maxStock, (newMaterials[matIndex].quantidadeAtual || 0) + returnAmount)
                };
              }
            });
          }
        });
        showToast("Estoque restaurado e pedido excluído", "warning");
      } else {
        showToast("Pedido excluído", "warning");
      }

      return {
        ...prev,
        materiais: newMaterials,
        pedidos: prev.pedidos.filter(i => i.id !== id)
      };
    });
  };

  const pedidoFields = [
    { key: "clienteId", label: "Cliente", type: "select", options: data.clientes.map(c => ({ label: c.nome, value: c.id })) },
    { key: "itens", label: "Produtos", type: "orderItems" },
    { key: "status", label: "Status", type: "select", options: statuses },
    { key: "dataPedido", label: "Data do Pedido", type: "date" },
    { key: "dataEntrega", label: "Data Entrega Prevista", type: "date" },
    { key: "formaPagamento", label: "Forma de Pagamento", type: "select", options: ["PIX", "Cartão", "Cartão 2x", "Cartão 3x", "Boleto", "Dinheiro"] },
    { key: "observacoes", label: "Observações", type: "textarea" },
  ];

  const columns = [
    {
      key: "itens", label: "", width: 50, render: (v, r) => {
        const prodName = r.itens?.[0]?.produto;
        const prod = data.produtos.find(p => p.nome === prodName);
        return (
          <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", background: "#F2F2F7", border: "1px solid #E5E5EA" }}>
            <img src={prod?.imagemUrl || "https://placehold.co/40x40?text=..."} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        );
      }
    },
    {
      key: "itens", label: "Produtos", render: (v, r) => (
        <div>
          <div style={{ fontWeight: 500, color: "#1C1C1E" }}>{r.itens?.[0]?.produto || "Sem produtos"}</div>
          {r.itens?.length > 1 && <div style={{ fontSize: 11, color: "#8E8E93" }}>+ {r.itens.length - 1} outros item(s)</div>}
        </div>
      )
    },
    { key: "valorTotal", label: "Total", render: (v) => <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 600 }}>R$ {(v || 0).toFixed(2)}</span> },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
    { key: "dataPedido", label: "Data", render: v => new Date(v).toLocaleDateString("pt-BR") },
    { key: "formaPagamento", label: "Pagamento" },
  ];

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, maxWidth: 250 }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, maxWidth: 180 }}>
            <option value="todos">Todos os Status</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={openNew} style={btnPrimary}>+ Novo Pedido</button>
      </div>

      {/* STATUS PIPELINE */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {statuses.map(s => {
          const count = data.pedidos.filter(p => p.status === s).length;
          return (
            <div key={s} onClick={() => setFilterStatus(s === filterStatus ? "todos" : s)} style={{
              ...cardStyle, padding: "10px 16px", cursor: "pointer", minWidth: 120, textAlign: "center",
              border: filterStatus === s ? "1px solid rgba(99,102,241,0.5)" : cardStyle.border,
              background: filterStatus === s ? "rgba(99,102,241,0.1)" : cardStyle.background,
            }}>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: "#a5b4fc" }}>{count}</div>
              <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>{s}</div>
            </div>
          );
        })}
      </div>

      <div style={cardStyle}>
        <DataTable columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />
      </div>

      {showModal && (
        <Modal title={editItem ? "Editar Pedido" : "Novo Pedido"} onClose={() => setShowModal(false)} width={640}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            {pedidoFields.map(f => (
              <div key={f.key} style={f.type === "textarea" ? { gridColumn: "1 / -1" } : {}}>
                <FormField field={f} value={form[f.key]} onChange={handleChange} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={() => setShowModal(false)} style={btnSecondary}>Cancelar</button>
            <button onClick={handleSave} style={btnPrimary}>Salvar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// PRODUÇÃO MODULE
// ============================================================
function ProducaoModule() {
  const { data, setData, showToast } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});

  const statuses = ["fila", "imprimindo", "posProcessamento", "concluido", "falha"];

  const openNew = () => { setEditItem(null); setForm({ status: "fila", falhas: 0, pesoUsado: 0 }); setShowModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ ...item }); setShowModal(true); };
  const handleChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    if (editItem) {
      setData(prev => ({ ...prev, producao: prev.producao.map(i => i.id === editItem.id ? { ...form, id: editItem.id } : i) }));
      showToast("Produção atualizada!");
    } else {
      setData(prev => ({ ...prev, producao: [...prev.producao, { ...form, id: generateId() }] }));
      showToast("Item de produção criado!");
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setData(prev => ({ ...prev, producao: prev.producao.filter(i => i.id !== id) }));
    showToast("Removido da produção", "warning");
  };

  const producaoFields = [
    { key: "pedidoRef", label: "Referência do Pedido", type: "text", required: true },
    { key: "impressora", label: "Impressora", type: "select", options: data.impressoras.map(i => i.nome) },
    { key: "status", label: "Status", type: "select", options: statuses },
    { key: "material", label: "Material", type: "select", options: data.materiais.map(m => m.nome) },
    { key: "pesoUsado", label: "Peso Material (g)", type: "number" },
    { key: "falhas", label: "Nº de Falhas", type: "number" },
    { key: "inicio", label: "Início", type: "text" },
    { key: "previsaoFim", label: "Previsão de Término", type: "text" },
    { key: "etapaPosProc", label: "Pós-Processamento", type: "select", options: ["nenhuma", "lixamento", "pintura", "montagem", "acabamento geral"] },
    { key: "observacoes", label: "Observações", type: "textarea" },
  ];

  const columns = [
    { key: "pedidoRef", label: "Referência" },
    { key: "impressora", label: "Impressora" },
    { key: "status", label: "Status", render: v => <StatusBadge status={v} /> },
    { key: "material", label: "Material" },
    { key: "falhas", label: "Falhas", render: v => v > 0 ? <Badge color="#ef4444">{v}</Badge> : <span style={{ color: "#64748b" }}>0</span> },
    { key: "etapaPosProc", label: "Pós-Proc." },
  ];

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* STATUS OVERVIEW */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        {statuses.map(s => {
          const count = data.producao.filter(p => p.status === s).length;
          const colors = { fila: "#8E8E93", imprimindo: "#FF9F0A", posProcessamento: "#BF5AF2", concluido: "#30D158", falha: "#FF453A" };
          return (
            <div key={s} style={{ ...cardStyle, padding: "14px 20px", textAlign: "center", minWidth: 130, borderLeft: `3px solid ${colors[s]}` }}>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "inherit", color: colors[s] }}>{count}</div>
              <div style={{ fontSize: 11, color: "#86868b", textTransform: "uppercase", letterSpacing: 0.5 }}>{s === "posProcessamento" ? "Pós-Proc." : s}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={openNew} style={btnPrimary}>+ Nova Impressão</button>
      </div>

      <div style={cardStyle}>
        <DataTable columns={columns} data={data.producao} onEdit={openEdit} onDelete={handleDelete} />
      </div>

      {showModal && (
        <Modal title={editItem ? "Editar Produção" : "Nova Impressão"} onClose={() => setShowModal(false)} width={640}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            {producaoFields.map(f => (
              <div key={f.key} style={f.type === "textarea" ? { gridColumn: "1 / -1" } : {}}>
                <FormField field={f} value={form[f.key]} onChange={handleChange} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={() => setShowModal(false)} style={btnSecondary}>Cancelar</button>
            <button onClick={handleSave} style={btnPrimary}>Salvar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// KANBAN MODULE
// ============================================================
function KanbanModule() {
  const { data, setData, showToast } = useContext(AppContext);
  const [draggedItem, setDraggedItem] = useState(null);

  // Define Kanban Columns and their allowed statuses
  const columns = [
    { title: "A Fazer 📝", statuses: ["orcamento", "aprovado", "fila"], color: "#8E8E93" },
    { title: "Em Produção ⚙️", statuses: ["producao", "imprimindo"], color: "#007AFF" },
    { title: "Acabamento 🎨", statuses: ["acabamento", "posProcessamento"], color: "#AF52DE" },
    { title: "Pronto / Enviado ✅", statuses: ["concluido", "enviado", "entregue"], color: "#34C759" },
  ];

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    // Transparent drag image hack
    const img = new Image();
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    if (!draggedItem) return;

    // Determine target entity type based on dragged item (could be multiple in future)
    // For now, we assume it's a 'pedido' or 'producao' item.
    // If we want to move item to a general status of the column (first status in list)

    // We update the item's status to the PRIMARY status of the target column
    // Or if the column has multiple, we pick the first one as default drop target

    const newStatus = targetStatus;

    if (draggedItem.entity === "pedido") {
      let updatedMaterials = [...data.materiais];
      let newProducts = [...data.produtos];
      let newFinanceiro = { ...data.financeiro, contasReceber: [...data.financeiro.contasReceber] };
      let moveMsg = `Pedido movido para ${newStatus}`;

      // STOCK DEDUCTION LOGIC
      // Deduct ONLY if moving to a consuming state AND coming from a non-consuming state (e.g. orcamento)
      // If status is 'aprovado', it means stock was already deducted by handleApprove.
      const consumingStatuses = ["aprovado", "producao", "imprimindo", "acabamento", "enviado", "entregue", "concluido", "posProcessamento"];
      const isConsuming = (s) => consumingStatuses.includes(s);

      // Condition: Target is consuming, Source was NOT consuming (i.e. was 'orcamento' or 'fila')
      if (isConsuming(newStatus) && !isConsuming(draggedItem.status)) {
        let deductedLog = [];

        // Loop through ALL items in the order
        if (draggedItem.itens && draggedItem.itens.length > 0) {
          draggedItem.itens.forEach(orderItem => {
            let prodIndex = newProducts.findIndex(p => p.nome === orderItem.produto);
            if (prodIndex === -1) prodIndex = newProducts.findIndex(p => p.nome.toLowerCase().trim() === (orderItem.produto || "").toLowerCase().trim());

            let qtyToMake = orderItem.quantidade || 0;

            if (prodIndex >= 0) {
              const available = newProducts[prodIndex].estoqueAtual || 0;
              if (available > 0) {
                const take = Math.min(qtyToMake, available);
                qtyToMake -= take;
                newProducts[prodIndex] = { ...newProducts[prodIndex], estoqueAtual: available - take };
                deductedLog.push(`${newProducts[prodIndex].nome}: -${take} (Estoque)`);
              }

              if (qtyToMake > 0 && newProducts[prodIndex].composicao) {
                newProducts[prodIndex].composicao.forEach(comp => {
                  const totalGramsNeeded = (comp.peso || 0) * qtyToMake;
                  // Robust Lookup
                  let stockIndex = updatedMaterials.findIndex(m => String(m.id).trim() === String(comp.materialId).trim());
                  if (stockIndex === -1 && comp.tipo && comp.cor) {
                    const targetType = (comp.tipo || "").toLowerCase().trim();
                    const targetColor = (comp.cor || "").toLowerCase().trim();
                    stockIndex = updatedMaterials.findIndex(m => {
                      const mT = (m.tipo || "").toLowerCase().trim();
                      const mC = (m.cor || "").toLowerCase().trim();
                      return (mT === tType && mC === tColor) || ((m.nome || "").toLowerCase().includes(tType) && (m.nome || "").toLowerCase().includes(tColor));
                    });
                  }

                  if (stockIndex >= 0) {
                    updatedMaterials[stockIndex] = { ...updatedMaterials[stockIndex], quantidadeAtual: Math.max(0, updatedMaterials[stockIndex].quantidadeAtual - totalGramsNeeded) };
                    deductedLog.push(`${updatedMaterials[stockIndex].nome}: -${totalGramsNeeded}g`);
                  } else {
                    deductedLog.push(`FALTA: ${comp.tipo} ${comp.cor}`);
                  }
                });
              }
            }
          });
          if (deductedLog.length > 0) moveMsg += `. Consumo: ${deductedLog.join(", ")}`;
        }

        // FINANCE: Auto-generate Receivable on Kanban Drop
        const billId = draggedItem.id;
        const billExists = newFinanceiro.contasReceber.some(c => c.descricao && c.descricao.includes(`Pedido #${billId}`));

        if (!billExists) {
          const clientName = data.clientes.find(c => c.id === draggedItem.clienteId)?.nome || "Cliente";
          newFinanceiro.contasReceber.push({
            id: generateId(),
            descricao: `Pedido #${billId} - ${clientName}`,
            valor: parseFloat(draggedItem.valorTotal || 0),
            dataVencimento: new Date().toISOString().split('T')[0],
            status: "pendente",
            formaPagamento: draggedItem.formaPagamento || "PIX"
          });
          moveMsg += " + Conta Gerada";
        }
      } else if (!isConsuming(newStatus) && isConsuming(draggedItem.status)) {
        // REFUND LOGIC: Moving from Consuming -> Non-Consuming (e.g. Producao -> Orcamento)
        let refundedLog = [];

        if (draggedItem.itens && draggedItem.itens.length > 0) {
          draggedItem.itens.forEach(orderItem => {
            let produto = data.produtos.find(p => p.nome === orderItem.produto);
            if (!produto) produto = data.produtos.find(p => p.nome.toLowerCase().trim() === (orderItem.produto || "").toLowerCase().trim());

            if (produto && produto.composicao) {
              produto.composicao.forEach(comp => {
                const returning = (comp.peso || 0) * (orderItem.quantidade || 0);

                // Robust Lookup (Refund)
                let stockIndex = updatedMaterials.findIndex(m => String(m.id).trim() === String(comp.materialId).trim());
                if (stockIndex === -1 && comp.tipo && comp.cor) {
                  const targetType = (comp.tipo || "").toLowerCase().trim();
                  const targetColor = (comp.cor || "").toLowerCase().trim(); // Fixed typo in previous step but checking here
                  stockIndex = updatedMaterials.findIndex(m => {
                    const mType = (m.tipo || "").toLowerCase().trim();
                    const mColor = (m.cor || "").toLowerCase().trim();
                    if (mType === targetType && mColor === targetColor) return true;
                    const mName = (m.nome || "").toLowerCase();
                    if (mName.includes(targetType) && mName.includes(targetColor)) return true;
                    return false;
                  });
                }

                if (stockIndex >= 0) {
                  const stockItem = updatedMaterials[stockIndex];
                  const maxStock = stockItem.quantidadeTotal || 1000;
                  updatedMaterials[stockIndex] = {
                    ...stockItem,
                    quantidadeAtual: Math.min(maxStock, (stockItem.quantidadeAtual || 0) + returning)
                  };
                  refundedLog.push(`${stockItem.nome}: +${returning}g`);
                }
              });
            }
          });
          if (refundedLog.length > 0) moveMsg += `. Estoque Estornado: ${refundedLog.join(", ")}`;
        }
      }

      setData(prev => ({
        ...prev,
        financeiro: newFinanceiro,
        produtos: newProducts,
        pedidos: prev.pedidos.map(p => p.id === draggedItem.id ? { ...p, status: newStatus } : p),
        materiais: updatedMaterials
      }));
      showToast(moveMsg);
    }
    // Add logic for production items if needed

    setDraggedItem(null);
  };

  return (
    <div style={{ display: "flex", gap: 16, height: "100%", overflowX: "auto", paddingBottom: 16, animation: "fadeIn 0.4s ease" }}>
      {columns.map((col, i) => (
        <div key={i}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.statuses[0])}
          style={{
            flex: "0 0 300px",
            background: "#F2F2F7",
            borderRadius: 12,
            border: "1px solid #E5E5EA",
            display: "flex", flexDirection: "column",
            maxHeight: "100%"
          }}
        >
          {/* Header */}
          <div style={{ padding: 16, borderBottom: "1px solid #E5E5EA", background: "#fff", borderTopLeftRadius: 12, borderTopRightRadius: 12, position: "sticky", top: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: col.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{col.title}</div>
            <div style={{ fontSize: 11, color: "#8E8E93" }}>
              {data.pedidos.filter(p => col.statuses.includes(p.status)).length} itens
            </div>
          </div>

          {/* Cards Container */}
          <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {data.pedidos.filter(p => col.statuses.includes(p.status)).map(item => {
              // Get image of first product as representative
              const firstProdName = item.itens && item.itens[0] ? item.itens[0].produto : "";
              const prod = data.produtos.find(prod => prod.nome === firstProdName);

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, { ...item, entity: "pedido" })} // Item now has full 'itens' array
                  style={{
                    background: "#fff",
                    padding: 14,
                    borderRadius: 10,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    border: "1px solid #E5E5EA",
                    cursor: "grab",
                    opacity: draggedItem?.id === item.id ? 0.5 : 1,
                    transform: draggedItem?.id === item.id ? "scale(0.98)" : "scale(1)",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                    <img
                      src={prod?.imagemUrl || "https://placehold.co/60x60?text=3D"}
                      alt=""
                      style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", flexShrink: 0, background: "#F2F2F7" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#8E8E93" }}># {item.id.slice(0, 5).toUpperCase()}</span>
                        <StatusBadge status={item.status} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E", lineHeight: 1.2 }}>
                        {item.itens && item.itens.length > 1 ? `${item.itens.length} Produtos` : firstProdName}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{item.clienteId ? data.clientes.find(c => c.id === item.clienteId)?.nome : "Cliente não ident."}</div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F2F2F7", paddingTop: 8 }}>
                    <div style={{ fontSize: 11, color: "#8E8E93" }}>{new Date(item.dataPedido).toLocaleDateString()}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#1C1C1E" }}>R$ {(item.valorTotal || 0).toFixed(2)}</div>
                  </div>
                </div>
              );
            })}
            {data.pedidos.filter(p => col.statuses.includes(p.status)).length === 0 && (
              <div style={{ textAlign: "center", padding: 30, color: "#C7C7CC", fontSize: 12, fontStyle: "italic" }}>
                Vazio
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// IMPRESSORAS MODULE
// ============================================================
function ImpressorasModule() {
  const { data, setData, showToast } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});

  const openNew = () => { setEditItem(null); setForm({ status: "disponivel", horasUso: 0 }); setShowModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ ...item }); setShowModal(true); };
  const handleChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    if (editItem) {
      setData(prev => ({ ...prev, impressoras: prev.impressoras.map(i => i.id === editItem.id ? { ...form, id: editItem.id } : i) }));
      showToast("Impressora atualizada!");
    } else {
      setData(prev => ({ ...prev, impressoras: [...prev.impressoras, { ...form, id: generateId() }] }));
      showToast("Impressora cadastrada!");
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setData(prev => ({ ...prev, impressoras: prev.impressoras.filter(i => i.id !== id) }));
    showToast("Impressora removida", "warning");
  };

  const impFields = [
    { key: "nome", label: "Nome/Apelido", type: "text", required: true },
    { key: "modelo", label: "Modelo", type: "text" },
    { key: "tipo", label: "Tipo", type: "select", options: ["FDM", "Resina", "SLS", "SLA"] },
    { key: "status", label: "Status", type: "select", options: ["disponivel", "imprimindo", "manutencao"] },
    { key: "horasUso", label: "Horas de Uso", type: "number" },
    { key: "ultimaManutencao", label: "Última Manutenção", type: "text" },
    { key: "observacoes", label: "Observações", type: "textarea" },
  ];

  const statusColors = { disponivel: "#34C759", imprimindo: "#FF9500", manutencao: "#FF3B30" };

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button onClick={openNew} style={btnPrimary}>+ Nova Impressora</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {data.impressoras.map(imp => (
          <div key={imp.id} style={{
            ...cardStyle,
            borderLeft: `4px solid ${statusColors[imp.status] || "#6366f1"}`,
            transition: "transform 0.2s",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#1C1C1E" }}>{imp.nome}</div>
                <div style={{ fontSize: 12, color: "#8E8E93" }}>{imp.modelo}</div>
              </div>
              <StatusBadge status={imp.status} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#8E8E93" }}>Tipo: <span style={{ color: "#1C1C1E" }}>{imp.tipo}</span></div>
              <div style={{ fontSize: 11, color: "#8E8E93" }}>Horas: <span style={{ color: "#1C1C1E", fontFamily: "inherit" }}>{imp.horasUso}h</span></div>
              <div style={{ fontSize: 11, color: "#8E8E93", gridColumn: "1 / -1" }}>Manutenção: <span style={{ color: "#1C1C1E" }}>{imp.ultimaManutencao}</span></div>
            </div>
            {imp.observacoes && <div style={{ fontSize: 11, color: "#475569", fontStyle: "italic", marginBottom: 12 }}>{imp.observacoes}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => openEdit(imp)} style={{ ...btnSecondary, padding: "6px 14px", fontSize: 11, flex: 1 }}>Editar</button>
              <button onClick={() => handleDelete(imp.id)} style={{ ...btnSecondary, padding: "6px 14px", fontSize: 11, borderColor: "rgba(239,68,68,0.3)", color: "#f87171" }}>Excluir</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title={editItem ? "Editar Impressora" : "Nova Impressora"} onClose={() => setShowModal(false)}>
          {impFields.map(f => <FormField key={f.key} field={f} value={form[f.key]} onChange={handleChange} />)}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={() => setShowModal(false)} style={btnSecondary}>Cancelar</button>
            <button onClick={handleSave} style={btnPrimary}>Salvar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// MATERIAIS MODULE
// ============================================================
// ============================================================
// STOCK MODULE (ESTOQUE)
// ============================================================
function StockModule() {
  const { data, setData, showToast } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [filterType, setFilterType] = useState("todos");

  // Calculate demand from quotes (Status = "orcamento")
  const potentialDemand = useMemo(() => {
    const demand = {}; // materialId -> weight needed
    data.pedidos
      .filter(p => p.status === "orcamento")
      .forEach(p => {
        if (!p.itens) return;
        p.itens.forEach(orderItem => {
          let product = data.produtos.find(px => px.nome === orderItem.produto);
          if (!product) product = data.produtos.find(px => px.nome.toLowerCase().trim() === (orderItem.produto || "").toLowerCase().trim());

          if (product && product.composicao) {
            product.composicao.forEach(c => {
              // Aggregation key: ID if valid, else Type+Color
              // We will try to map to existing material IDs first
              const mat = data.materiais.find(m => String(m.id).trim() === String(c.materialId).trim());
              let key = mat ? mat.id : `${c.tipo}_${c.cor}`;

              if (!demand[key]) demand[key] = 0;
              demand[key] += (c.peso || 0) * (orderItem.quantidade || 0);
            });
          }
        });
      });
    return demand;
  }, [data.pedidos, data.produtos, data.materiais]);

  const openNew = () => {
    setEditItem(null);
    setForm({
      quantidadeTotal: 1000,
      quantidadeAtual: 1000,
      estoqueMinimo: 5,
      unidade: "g",
      tipo: "PLA",
      cor: "Branco"
    });
    setShowModal(true);
  };

  const openEdit = (item) => { setEditItem(item); setForm({ ...item }); setShowModal(true); };

  const handleChange = (key, val) => {
    setForm(prev => {
      const next = { ...prev, [key]: val };

      // Auto-update Name if Type or Color changes
      if (key === "tipo" || key === "cor") {
        const t = key === "tipo" ? val : (next.tipo || "");
        const c = key === "cor" ? val : (next.cor || "");
        next.nome = `${t} ${c}`.trim();
      }

      return next;
    });
  };

  const handleSave = () => {
    if (!form.nome) form.nome = `${form.tipo} ${form.cor}`; // Fallback name

    // Auto calc Cost/Kg if provided price
    if (form.precoPago && form.quantidadeTotal) {
      let factor = (form.unidade === "kg" || form.unidade === "l") ? 1 : 1000;
      if (form.unidade === "g" || form.unidade === "ml") factor = 1000;

      // If unit is 'g', price is per package. 
      // We usually store costKg. 
      // CostKg = (Price / TotalWeight) * 1000
      const totalW = parseFloat(form.quantidadeTotal);
      const price = parseFloat(form.precoPago);
      if (totalW > 0) {
        form.custoKg = parseFloat(((price / totalW) * factor).toFixed(2));
      }
    }

    if (editItem) {
      setData(prev => ({ ...prev, materiais: prev.materiais.map(i => i.id === editItem.id ? { ...form, id: editItem.id } : i) }));
      showToast("Material atualizado!");
    } else {
      setData(prev => ({ ...prev, materiais: [...prev.materiais, { ...form, id: generateId() }] }));
      showToast("Novo material adicionado ao estoque!");
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Remover este material do estoque?")) {
      setData(prev => ({ ...prev, materiais: prev.materiais.filter(i => i.id !== id) }));
      showToast("Material removido", "warning");
    }
  };

  const matFields = [
    { key: "tipo", label: "Tipo (PLA/ABS...)", type: "select", options: ["PLA", "ABS", "PETG", "Resina", "TPU", "Nylon", "ASA"] },
    { key: "cor", label: "Cor", type: "text", required: true },
    { key: "nome", label: "Nome de Identificação", type: "text", placeholder: "Ex: PLA Branco 3D Fila" },
    { key: "marca", label: "Marca / Fabricante", type: "text" },
    { key: "quantidadeTotal", label: "Peso do Carretel (Original)", type: "number", placeholder: "1000" },
    { key: "quantidadeAtual", label: "Peso Atual (Restante)", type: "number", required: true },
    { key: "unidade", label: "Unidade", type: "select", options: ["g", "kg", "ml", "l"] },
    { key: "estoqueMinimo", label: "Alerta de Mínimo", type: "number" },
    { key: "precoPago", label: "Preço Pago (R$)", type: "number", placeholder: "Custo do rolo fechado" },
  ];

  const types = ["todos", ...new Set(data.materiais.map(m => m.tipo))];
  const filtered = data.materiais.filter(m => filterType === "todos" || m.tipo === filterType);

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* Header / Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>📦 Controle de Estoque</h2>
          <div style={{ height: 24, w: 1, background: "#ccc", margin: "0 8px" }} />
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...inputStyle, width: 150, margin: 0 }}>
            {types.map(t => <option key={t} value={t}>{t === "todos" ? "Todos os Tipos" : t}</option>)}
          </select>
        </div>
        <button onClick={openNew} style={btnPrimary}>+ Adicionar Material</button>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {filtered.map(m => {
          const pct = Math.min(100, Math.max(0, ((m.quantidadeAtual || 0) / (m.quantidadeTotal || 1000)) * 100));
          const isLow = (m.quantidadeAtual || 0) <= (m.estoqueMinimo || 0);
          const barColor = isLow ? "#FF3B30" : (pct < 40 ? "#FF9500" : "#34C759");

          // Demand Calculation
          const demandKey = m.id;
          const fallbackKey = `${m.tipo}_${m.cor}`;
          const needed = (potentialDemand[demandKey] || 0) + (potentialDemand[fallbackKey] || 0);

          return (
            <div key={m.id} style={{ ...cardStyle, position: "relative", overflow: "hidden" }}>
              {isLow && <div style={{ position: "absolute", top: 0, right: 0, background: "#FF3B30", color: "#fff", fontSize: 9, fontWeight: 700, padding: "4px 8px", borderBottomLeftRadius: 8 }}>BAIXO ESTOQUE</div>}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#1C1C1E" }}>{m.tipo} {m.cor}</div>
                  <div style={{ fontSize: 12, color: "#8E8E93" }}>{m.marca || "Genérico"}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: "#1C1C1E" }}>
                    {m.quantidadeAtual}<small style={{ fontSize: 12, fontWeight: 400 }}>{m.unidade}</small>
                  </div>
                  <div style={{ fontSize: 10, color: "#8E8E93" }}>de {m.quantidadeTotal}{m.unidade}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ height: 8, background: "#F2F2F7", borderRadius: 4, overflow: "hidden", marginBottom: 8, position: "relative" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: barColor, transition: "width 0.5s ease" }} />
              </div>

              {/* Stats & Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 11, color: "#666", marginTop: 12, paddingTop: 12, borderTop: "1px solid #F2F2F7" }}>
                <div>
                  <div>Preço Kg: <strong>R$ {m.custoKg ? m.custoKg.toFixed(2) : "0.00"}</strong></div>
                  {needed > 0 && (
                    <div style={{ color: "#FF9500", marginTop: 4, fontWeight: 600 }}>
                      ⚠ Demanda em Orçamentos: {needed}g
                    </div>
                  )}
                  {needed > (m.quantidadeAtual || 0) && (
                    <div style={{ color: "#FF3B30", fontWeight: 700 }}>
                      FALTA: {(needed - m.quantidadeAtual).toFixed(0)}g
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
                  <button onClick={() => openEdit(m)} style={{ ...btnSecondary, padding: "4px 10px", height: 28 }}>Editar</button>
                  <button onClick={() => handleDelete(m.id)} style={{ ...btnSecondary, padding: "4px 10px", height: 28, color: "#FF3B30" }}>Excluir</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <Modal title={editItem ? "Editar Material" : "Novo Material"} onClose={() => setShowModal(false)} width={600}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            {matFields.map(f => (
              <div key={f.key} style={f.key === "nome" ? { gridColumn: "1 / -1" } : {}}>
                <FormField field={f} value={form[f.key]} onChange={handleChange} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24, paddingTop: 16, borderTop: "1px solid #E5E5EA" }}>
            <button onClick={() => setShowModal(false)} style={btnSecondary}>Cancelar</button>
            <button onClick={handleSave} style={btnPrimary}>Salvar Estoque</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// FINANCEIRO MODULE
// ============================================================
function FinanceiroModule() {
  const { data, setData, showToast } = useContext(AppContext);
  const [tab, setTab] = useState("receber");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});

  const totalReceber = data.financeiro.contasReceber.reduce((s, c) => s + c.valor, 0);
  const totalRecebido = data.financeiro.contasReceber.reduce((s, c) => s + (c.valorRecebido || 0), 0);
  const totalPagar = data.financeiro.contasPagar.reduce((s, c) => s + c.valor, 0);
  const totalPago = data.financeiro.contasPagar.filter(c => c.status === "pago").reduce((s, c) => s + c.valor, 0);

  const recFields = [
    { key: "descricao", label: "Descrição", type: "text", required: true },
    { key: "valor", label: "Valor (R$)", type: "number" },
    { key: "valorRecebido", label: "Valor Recebido (R$)", type: "number" },
    { key: "dataVencimento", label: "Vencimento", type: "date" },
    { key: "status", label: "Status", type: "select", options: ["pendente", "parcial", "recebido"] },
    { key: "formaPagamento", label: "Forma Pagamento", type: "select", options: ["PIX", "Cartão", "Cartão 2x", "Cartão 3x", "Boleto", "Transferência"] },
  ];

  const pagFields = [
    { key: "descricao", label: "Descrição", type: "text", required: true },
    { key: "valor", label: "Valor (R$)", type: "number" },
    { key: "dataVencimento", label: "Vencimento", type: "date" },
    { key: "status", label: "Status", type: "select", options: ["pendente", "pago"] },
    { key: "fornecedor", label: "Fornecedor", type: "text" },
  ];

  const fields = tab === "receber" ? recFields : pagFields;
  const listKey = tab === "receber" ? "contasReceber" : "contasPagar";
  const items = data.financeiro[listKey];

  const openNew = () => { setEditItem(null); setForm({ status: "pendente" }); setShowModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ ...item }); setShowModal(true); };
  const handleChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    if (editItem) {
      setData(prev => ({
        ...prev,
        financeiro: {
          ...prev.financeiro,
          [listKey]: prev.financeiro[listKey].map(i => i.id === editItem.id ? { ...form, id: editItem.id } : i),
        }
      }));
      showToast("Registro atualizado!");
    } else {
      setData(prev => ({
        ...prev,
        financeiro: {
          ...prev.financeiro,
          [listKey]: [...prev.financeiro[listKey], { ...form, id: generateId() }],
        }
      }));
      showToast("Registro criado!");
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setData(prev => ({
      ...prev,
      financeiro: { ...prev.financeiro, [listKey]: prev.financeiro[listKey].filter(i => i.id !== id) }
    }));
    showToast("Registro removido", "warning");
  };

  const columns = tab === "receber" ? [
    { key: "descricao", label: "Descrição" },
    { key: "valor", label: "Valor", render: v => `R$ ${(v || 0).toFixed(2)}` },
    { key: "valorRecebido", label: "Recebido", render: v => `R$ ${(v || 0).toFixed(2)}` },
    { key: "dataVencimento", label: "Vencimento" },
    { key: "status", label: "Status", render: v => <StatusBadge status={v} /> },
    { key: "formaPagamento", label: "Pagamento" },
  ] : [
    { key: "descricao", label: "Descrição" },
    { key: "valor", label: "Valor", render: v => `R$ ${(v || 0).toFixed(2)}` },
    { key: "dataVencimento", label: "Vencimento" },
    { key: "fornecedor", label: "Fornecedor" },
    { key: "status", label: "Status", render: v => <StatusBadge status={v} /> },
  ];

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* SUMMARY */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard icon="📥" label="Total a Receber" value={`R$ ${totalReceber.toFixed(2)}`} sub={`Recebido: R$ ${totalRecebido.toFixed(2)}`} color="#34C759" />
        <StatCard icon="📤" label="Total a Pagar" value={`R$ ${totalPagar.toFixed(2)}`} sub={`Pago: R$ ${totalPago.toFixed(2)}`} color="#FF3B30" />
        <StatCard icon="📊" label="Balanço" value={`R$ ${(totalRecebido - totalPago).toFixed(2)}`} sub="recebido - pago" color={totalRecebido - totalPago >= 0 ? "#34C759" : "#FF3B30"} />
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button onClick={() => setTab("receber")} style={{ ...tab === "receber" ? btnPrimary : btnSecondary, borderRadius: 10 }}>💰 Contas a Receber</button>
        <button onClick={() => setTab("pagar")} style={{ ...tab === "pagar" ? btnPrimary : btnSecondary, borderRadius: 10 }}>💳 Contas a Pagar</button>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={openNew} style={btnPrimary}>+ Nova Conta</button>
      </div>

      <div style={cardStyle}>
        <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      </div>

      {showModal && (
        <Modal title={editItem ? "Editar Conta" : "Nova Conta"} onClose={() => setShowModal(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            {fields.map(f => <FormField key={f.key} field={f} value={form[f.key]} onChange={handleChange} formValues={form} setForm={setForm} />)}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={() => setShowModal(false)} style={btnSecondary}>Cancelar</button>
            <button onClick={handleSave} style={btnPrimary}>Salvar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// RELATORIOS MODULE
// ============================================================
function RelatoriosModule() {
  const { data } = useContext(AppContext);

  const totalFaturado = data.financeiro.contasReceber.reduce((s, c) => s + (c.valorRecebido || 0), 0);
  const totalCustos = data.financeiro.contasPagar.reduce((s, c) => s + c.valor, 0);
  const lucro = totalFaturado - totalCustos;

  const produtoVendas = {};
  data.pedidos.forEach(p => {
    if (p.itens) {
      p.itens.forEach(it => {
        // Add proportional value or full value if single item. For simplicity we assume valorUnit exists
        const totalItem = (it.valorUnitario || 0) * (it.quantidade || 0);
        produtoVendas[it.produto] = (produtoVendas[it.produto] || 0) + totalItem;
      });
    }
  });
  const topProdutos = Object.entries(produtoVendas).sort((a, b) => b[1] - a[1]);

  const categoriaCount = {};
  data.produtos.forEach(p => { categoriaCount[p.categoria] = (categoriaCount[p.categoria] || 0) + 1; });

  const impressoraHoras = data.impressoras.map(i => ({ nome: i.nome, horas: i.horasUso })).sort((a, b) => b.horas - a.horas);

  const falhasTotal = data.producao.reduce((s, p) => s + (p.falhas || 0), 0);
  const totalImpr = data.producao.length;
  const taxaFalha = totalImpr ? ((falhasTotal / totalImpr) * 100).toFixed(1) : 0;

  const materialConsumo = {};
  data.producao.forEach(p => {
    materialConsumo[p.material] = (materialConsumo[p.material] || 0) + (p.pesoUsado || 0);
  });
  const topMateriais = Object.entries(materialConsumo).sort((a, b) => b[1] - a[1]);

  const barMax = topProdutos.length > 0 ? topProdutos[0][1] : 1;

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* TOP SUMMARY */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard icon="💰" label="Faturamento" value={`R$ ${totalFaturado.toFixed(2)}`} color="#34C759" />
        <StatCard icon="💸" label="Custos" value={`R$ ${totalCustos.toFixed(2)}`} color="#FF3B30" />
        <StatCard icon="📈" label="Resultado" value={`R$ ${lucro.toFixed(2)}`} color={lucro >= 0 ? "#34C759" : "#FF3B30"} sub={lucro >= 0 ? "Lucro" : "Prejuízo"} />
        <StatCard icon="⚠️" label="Taxa de Falha" value={`${taxaFalha}%`} color={parseFloat(taxaFalha) > 20 ? "#FF3B30" : "#FF9500"} sub={`${falhasTotal} falhas em ${totalImpr} impressões`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* TOP PRODUTOS */}
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "#5856D6" }}>🏆 Produtos Mais Vendidos</h3>
          {topProdutos.length === 0 ? <div style={{ color: "#8E8E93", fontSize: 13 }}>Sem dados</div> : topProdutos.map(([nome, valor], i) => (
            <div key={nome} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "#1C1C1E", fontWeight: 500 }}>{i + 1}. {nome}</span>
                <span style={{ fontFamily: "'Space Mono', monospace", color: "#5856D6", fontWeight: 600 }}>R$ {valor.toFixed(2)}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "#F2F2F7", overflow: "hidden" }}>
                <div style={{ width: `${(valor / barMax) * 100}%`, height: "100%", borderRadius: 3, background: "linear-gradient(90deg, #5856D6, #AF52DE)" }} />
              </div>
            </div>
          ))}
        </div>

        {/* CONSUMO MATERIAIS */}
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "#5856D6" }}>🧵 Consumo de Materiais</h3>
          {topMateriais.length === 0 ? <div style={{ color: "#8E8E93", fontSize: 13 }}>Sem dados</div> : topMateriais.map(([nome, peso]) => (
            <div key={nome} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F2F2F7" }}>
              <span style={{ fontSize: 13, color: "#1C1C1E" }}>{nome}</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: "#FF9500", fontWeight: 600 }}>{peso}g</span>
            </div>
          ))}
        </div>

        {/* IMPRESSORAS POR USO */}
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "#5856D6" }}>🖨️ Uso das Impressoras</h3>
          {impressoraHoras.map(imp => (
            <div key={imp.nome} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "#1C1C1E", fontWeight: 500 }}>{imp.nome}</span>
                <span style={{ fontFamily: "'Space Mono', monospace", color: "#007AFF", fontWeight: 600 }}>{imp.horas}h</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "#F2F2F7", overflow: "hidden" }}>
                <div style={{ width: `${(imp.horas / Math.max(...impressoraHoras.map(h => h.horas), 1)) * 100}%`, height: "100%", borderRadius: 3, background: "linear-gradient(90deg, #007AFF, #5AC8FA)" }} />
              </div>
            </div>
          ))}
        </div>

        {/* STATUS GERAL */}
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "#5856D6" }}>📂 Produtos por Categoria</h3>
          {Object.entries(categoriaCount).map(([cat, count]) => (
            <div key={cat} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F2F2F7" }}>
              <span style={{ fontSize: 13, color: "#1C1C1E" }}>{cat}</span>
              <Badge color="#AF52DE">{count} produto{count !== 1 ? "s" : ""}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CUSTOS MODULE
// ============================================================
function CustosModule() {
  const { data, setData, showToast } = useContext(AppContext);

  // Ensure config structure exists
  // Ensure config structure exists and merge new fields
  // Config initialization moved to App component


  if (!data.configCustos || !data.configCustos.vendas) return <div style={{ padding: 40, color: "#8E8E93" }}>Carregando configurações...</div>;

  const { energia, trabalho, depreciacao, vendas, logistica, insumos } = data.configCustos;

  const updateConfig = (section, key, val) => {
    setData(prev => ({
      ...prev,
      configCustos: {
        ...prev.configCustos,
        [section]: { ...prev.configCustos[section], [key]: parseFloat(val) || 0 }
      }
    }));
  };

  const addInsumo = () => {
    const nome = prompt("Nome do Insumo:");
    const custo = parseFloat(prompt("Custo Unitário (R$):"));
    if (nome && custo) {
      setData(prev => ({
        ...prev,
        configCustos: {
          ...prev.configCustos,
          insumos: [...prev.configCustos.insumos, { id: Date.now(), nome, custo, categoria: "Geral", durabilidadeEstimada: 10 }]
        }
      }));
    }
  };

  const removeInsumo = (id) => {
    if (confirm("Remover este insumo?")) {
      setData(prev => ({
        ...prev,
        configCustos: {
          ...prev.configCustos,
          insumos: prev.configCustos.insumos.filter(i => i.id !== id)
        }
      }));
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease", paddingBottom: 40 }}>
      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: "#1C1C1E", marginBottom: 8 }}>Configuração de Custos</h2>
        <p style={{ fontSize: 14, color: "#8E8E93" }}>Base de cálculo para precificação precisa dos seus produtos.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>

        {/* ENERGIA */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#FF9500", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>⚡ Energia Elétrica</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "#8E8E93" }}>Custo por kWh (R$)</label>
              <input type="number" step="0.01" value={energia.custoKwh} onChange={e => updateConfig("energia", "custoKwh", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#8E8E93" }}>Consumo Médio FDM (Watts)</label>
              <input type="number" value={energia.consumoMedioFDM} onChange={e => updateConfig("energia", "consumoMedioFDM", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#8E8E93" }}>Consumo Médio Resina (Watts)</label>
              <input type="number" value={energia.consumoMedioResina} onChange={e => updateConfig("energia", "consumoMedioResina", e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* MÃO DE OBRA */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#007AFF", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>👷 Mão de Obra</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "#8E8E93" }}>Hora Técnica / Operacional (R$)</label>
              <input type="number" step="0.50" value={trabalho.horaTecnica} onChange={e => updateConfig("trabalho", "horaTecnica", e.target.value)} style={inputStyle} />
              <p style={{ fontSize: 10, color: "#8E8E93", marginTop: 4 }}>Tempo gasto fatiando, limpando a impressora, removendo suportes.</p>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#8E8E93" }}>Hora Modelagem 3D (R$)</label>
              <input type="number" step="0.50" value={trabalho.horaModelagem} onChange={e => updateConfig("trabalho", "horaModelagem", e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* DEPRECIAÇÃO */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#AF52DE", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>📉 Depreciação</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "#8E8E93" }}>Vida Útil Estimada (Horas de Impressão)</label>
              <input type="number" value={depreciacao.vidaUtilHoras} onChange={e => updateConfig("depreciacao", "vidaUtilHoras", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#8E8E93" }}>% Custo Manutenção (sobre o valor da máquina)</label>
              <input type="number" value={depreciacao.manutencaoPercent} onChange={e => updateConfig("depreciacao", "manutencaoPercent", e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>



        {/* TAXAS & VENDAS */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#FF3B30", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>💸 Taxas & Vendas</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "#8E8E93" }}>Impostos Padronizados (%)</label>
              <div style={{ position: "relative" }}>
                <input type="number" step="0.5" value={vendas.impostosPercent} onChange={e => updateConfig("vendas", "impostosPercent", e.target.value)} style={inputStyle} />
                <span style={{ position: "absolute", right: 12, top: 12, color: "#8E8E93", fontSize: 12 }}>%</span>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#8E8E93" }}>Taxa Marketplace Padrão (%)</label>
              <div style={{ position: "relative" }}>
                <input type="number" step="0.5" value={vendas.taxaMarketplacePercent} onChange={e => updateConfig("vendas", "taxaMarketplacePercent", e.target.value)} style={inputStyle} />
                <span style={{ position: "absolute", right: 12, top: 12, color: "#8E8E93", fontSize: 12 }}>%</span>
              </div>
            </div>
          </div>
        </div>

        {/* LOGÍSTICA & EMBALAGEM */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#34C759", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>📦 Logística & Embalagem</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "#8E8E93" }}>Custo Frete Médio (R$)</label>
              <input type="number" step="0.50" value={logistica.custoFretePadrao} onChange={e => updateConfig("logistica", "custoFretePadrao", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#8E8E93" }}>Custo Embalagem Média (R$)</label>
              <input type="number" step="0.10" value={logistica.custoEmbalagemPadrao} onChange={e => updateConfig("logistica", "custoEmbalagemPadrao", e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>

      </div>

      {/* LISTA DE INSUMOS */}
      <div style={{ ...cardStyle, marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1C1C1E" }}>🧴 Lista de Insumos &amp; Consumíveis</h3>
          <button onClick={addInsumo} style={btnSecondary}>+ Adicionar Insumo</button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: 12, color: "#8E8E93" }}>
                <th style={{ paddingBottom: 8 }}>ITEM</th>
                <th style={{ paddingBottom: 8 }}>CATEGORIA</th>
                <th style={{ paddingBottom: 8 }}>CUSTO (R$)</th>
                <th style={{ paddingBottom: 8, textAlign: "right" }}>AÇÃO</th>
              </tr>
            </thead>
            <tbody>
              {insumos.map(insumo => (
                <tr key={insumo.id} style={{ background: "#F9F9F9" }}>
                  <td style={{ padding: "12px", borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}>{insumo.nome}</td>
                  <td style={{ padding: "12px" }}><Badge color="#8E8E93">{insumo.categoria}</Badge></td>
                  <td style={{ padding: "12px", fontWeight: 600 }}>R$ {insumo.custo.toFixed(2)}</td>
                  <td style={{ padding: "12px", textAlign: "right", borderTopRightRadius: 8, borderBottomRightRadius: 8 }}>
                    <button onClick={() => removeInsumo(insumo.id)} style={{ border: "none", background: "none", color: "#FF3B30", cursor: "pointer" }}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div >
  );
}
