import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, ChartNoAxesCombined, CircleAlert, LayoutDashboard, Leaf, Package, Pencil, Plus, RefreshCw, Search, Trash2, TrendingUp, X } from "lucide-react";

const API = "http://localhost:5000/api/products";
const categories = ["Fruits & Vegetables", "Dairy", "Bakery", "Beverages", "Snacks", "Staples", "Household", "Other"];
const blank = { name: "", category: "Fruits & Vegetables", sku: "", price: "", quantity: "", reorderLevel: "5", supplier: "" };
const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value || 0);

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blank);

  const loadProducts = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch(API);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load products");
      setProducts(data);
    } catch (err) {
      setError(`${err.message}. Check that the backend and MongoDB are running.`);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);
  const notify = (message) => { setNotice(message); window.setTimeout(() => setNotice(""), 3000); };

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return products.filter((p) => {
      const matchesText = [p.name, p.sku, p.supplier].some((v) => (v || "").toLowerCase().includes(term));
      return matchesText && (category === "All categories" || p.category === category);
    });
  }, [products, search, category]);

  const lowStock = products.filter((p) => p.quantity <= p.reorderLevel);
  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
  const inventoryValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const openAdd = () => { setEditingId(null); setForm(blank); setModalOpen(true); };
  const openEdit = (p) => {
    setEditingId(p._id);
    setForm({ name: p.name, category: p.category, sku: p.sku, price: String(p.price), quantity: String(p.quantity), reorderLevel: String(p.reorderLevel), supplier: p.supplier || "" });
    setModalOpen(true);
  };

  const saveProduct = async (event) => {
    event.preventDefault(); setError("");
    const payload = { ...form, price: Number(form.price), quantity: Number(form.quantity), reorderLevel: Number(form.reorderLevel) };
    try {
      const response = await fetch(editingId ? `${API}/${editingId}` : API, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save product");
      setModalOpen(false); setEditingId(null); setForm(blank);
      await loadProducts();
      notify(editingId ? "Product updated successfully." : "Product added successfully.");
    } catch (err) { setError(err.message); }
  };

  const deleteProduct = async (p) => {
    if (!window.confirm(`Delete ${p.name} from inventory?`)) return;
    try {
      const response = await fetch(`${API}/${p._id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to delete product");
      await loadProducts(); notify("Product deleted successfully.");
    } catch (err) { setError(err.message); }
  };

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><Leaf size={24}/></div><div><strong>FreshStock</strong><small>Grocery inventory</small></div></div>
      <p className="nav-label">MENU</p>
      <div className="nav-item active"><LayoutDashboard size={18}/> Dashboard</div>
      <div className="nav-item"><Package size={18}/> Products <span>{products.length}</span></div>
      <div className="sidebar-note"><div className="note-icon"><Boxes size={19}/></div><strong>Stock made simple</strong><p>Keep products organized and know when items need restocking.</p></div>
      <div className="sidebar-footer"><span className="online-dot"></span><div><strong>Local workspace</strong><small>Inventory demo</small></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><p className="overline">INVENTORY MANAGEMENT</p><h1>Grocery dashboard</h1><p className="subhead">A clear view of your store's stock and products.</p></div><div className="top-actions"><button className="icon-btn" onClick={loadProducts} title="Refresh" aria-label="Refresh"><RefreshCw size={17}/></button><div className="profile">FS</div></div></header>
      {notice && <div className="notice">✓ {notice}</div>}
      {error && <div className="error"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss"><X size={17}/></button></div>}
      <section className="hero"><div><span className="hero-chip"><Leaf size={14}/> FRESH INVENTORY, BETTER CONTROL</span><h2>Everything in stock,<br/>all in one place.</h2><p>Track grocery products, monitor quantities, and manage your inventory with confidence.</p><button className="btn btn-white" onClick={openAdd}><Plus size={17}/> Add a product</button></div><div className="hero-graphic"><div className="hero-ring"><Boxes size={78}/></div><span className="float-one">✦</span><span className="float-two">✧</span></div></section>
      <section className="metrics">
        <Metric icon={Package} label="Total products" value={products.length} note="Different items in inventory" tone="green"/>
        <Metric icon={Boxes} label="Units in stock" value={totalUnits.toLocaleString("en-IN")} note="Combined product quantity" tone="blue"/>
        <Metric icon={CircleAlert} label="Low-stock items" value={lowStock.length} note="At or below reorder level" tone="orange"/>
        <Metric icon={TrendingUp} label="Inventory value" value={money(inventoryValue)} note="Price multiplied by quantity" tone="purple"/>
      </section>
      {lowStock.length > 0 && <div className="stock-warning"><CircleAlert size={18}/><div><strong>Stock needs attention</strong><span>{lowStock.length} product(s) are at or below their reorder level.</span></div></div>}
      <section className="panel">
        <div className="panel-title"><div><h3>Product inventory</h3><p>Manage prices, quantities, categories, and suppliers.</p></div><button className="btn btn-green" onClick={openAdd}><Plus size={16}/> Add product</button></div>
        <div className="filters"><div className="search"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product, SKU or supplier..."/></div><select value={category} onChange={e => setCategory(e.target.value)} aria-label="Filter category"><option>All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select><span className="count">{filtered.length} products</span></div>
        {loading ? <div className="loading"><RefreshCw size={17}/> Loading inventory...</div> : <div className="table-scroll"><table><thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Quantity</th><th>Stock status</th><th>Supplier</th><th>Actions</th></tr></thead><tbody>
          {filtered.map(p => <tr key={p._id}><td><div className="product-cell"><div className="product-icon"><Package size={17}/></div><strong>{p.name}</strong></div></td><td><span className="sku">{p.sku}</span></td><td>{p.category}</td><td className="price">{money(p.price)}</td><td><strong>{p.quantity}</strong></td><td><span className={`badge ${p.quantity <= p.reorderLevel ? "low" : "in-stock"}`}>{p.quantity <= p.reorderLevel ? "Low stock" : "In stock"}</span><small className="reorder">Reorder at {p.reorderLevel}</small></td><td>{p.supplier || "—"}</td><td><div className="actions"><button onClick={() => openEdit(p)} title="Edit" aria-label={`Edit ${p.name}`}><Pencil size={15}/></button><button className="delete" onClick={() => deleteProduct(p)} title="Delete" aria-label={`Delete ${p.name}`}><Trash2 size={15}/></button></div></td></tr>)}
          {filtered.length === 0 && <tr><td colSpan="8" className="empty">No products found. Use “Add product” to create your first inventory record.</td></tr>}
        </tbody></table></div>}
        <div className="panel-foot"><span><ChartNoAxesCombined size={15}/> Inventory summary updates when records change.</span><span>Data stored in MongoDB</span></div>
      </section>
      <footer>FreshStock · MERN stack academic project <span>Use sample data only for this demo.</span></footer>
    </main>
    {modalOpen && <div className="backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModalOpen(false); }}><section className="modal" role="dialog" aria-modal="true" aria-label={editingId ? "Edit product" : "Add product"}><div className="modal-head"><div><h2>{editingId ? "Edit product" : "Add a product"}</h2><p>Enter product details for your grocery inventory.</p></div><button className="icon-btn" onClick={() => setModalOpen(false)} aria-label="Close"><X size={18}/></button></div>
      <form className="form" onSubmit={saveProduct}>
        <label className="wide">Product name *<input required maxLength="120" value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="e.g. Fresh apples"/></label>
        <label>SKU / Item code *<input required maxLength="40" value={form.sku} onChange={e => setForm({...form, sku:e.target.value.toUpperCase()})} placeholder="e.g. FRU-001"/></label>
        <label>Category *<select required value={form.category} onChange={e => setForm({...form, category:e.target.value})}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
        <label>Unit price (₹) *<input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price:e.target.value})} placeholder="0.00"/></label>
        <label>Quantity in stock *<input required type="number" min="0" step="1" value={form.quantity} onChange={e => setForm({...form, quantity:e.target.value})} placeholder="0"/></label>
        <label>Reorder level *<input required type="number" min="0" step="1" value={form.reorderLevel} onChange={e => setForm({...form, reorderLevel:e.target.value})} placeholder="5"/></label>
        <label>Supplier<input maxLength="120" value={form.supplier} onChange={e => setForm({...form, supplier:e.target.value})} placeholder="Supplier name"/></label>
        <div className="form-actions wide"><button type="button" className="btn btn-muted" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-green" type="submit">{editingId ? "Save changes" : "Add product"}</button></div>
      </form>
    </section></div>}
  </div>;
}

function Metric({ icon: Icon, label, value, note, tone }) {
  return <article className="metric"><div className={`metric-icon ${tone}`}><Icon size={19}/></div><p>{label}</p><strong>{value}</strong><small>{note}</small></article>;
}
export default App;
