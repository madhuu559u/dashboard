import { useState, useEffect, useRef, useCallback, useMemo } from "react";import App1 from "./App1";
import App2 from "./App2";


import App1 from "./App1";
import App2 from "./App2";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ComposedChart
} from "recharts";

/* ═══════════════════════════════════════════════════════════════════
   NEXUS v6 — World-Class Agentic Dashboard
   
   ARCHITECTURE CHANGE: Dynamic data computation
   - AI now specifies WHAT data to compute + HOW to filter it
   - App computes aggregations on-the-fly from raw orders
   - Supports any combination of filters/groupings
   - Shows AI's raw response for debugging
   ═══════════════════════════════════════════════════════════════════ */
// API key is now stored server-side in Azure — no key needed in frontend

const C = {
  bg: "#04060C", bg2: "#080D18", sf: "#0C1322", sf2: "#101B2E",
  bd: "#162236", bd2: "#1E3050", bh: "#2A4470",
  tx: "#ECF0F6", tx2: "#C4CDD9", mt: "#7A8BA0", dm: "#3E5068",
  ac: "#3B8BF6", pr: "#7C3AED", gn: "#10B981", am: "#F59E0B",
  rd: "#EF4444", cy: "#06B6D4", pk: "#EC4899",
};
const PAL = ["#3B8BF6","#7C3AED","#10B981","#F59E0B","#EF4444","#06B6D4","#EC4899","#6366F1","#14B8A6","#F97316"];
const fmt$ = n => { if (n == null) return "—"; const a = Math.abs(n); if (a >= 1e6) return "$"+(n/1e6).toFixed(1)+"M"; if (a >= 1e3) return "$"+(n/1e3).toFixed(1)+"K"; return "$"+n.toFixed(2); };
const fmtN = n => { if (n == null) return "—"; if (Math.abs(n) >= 1e3) return (n/1e3).toFixed(1)+"K"; return String(Math.round(n)); };

// ═══ DATA LAYER ═══
function buildOrders(products, carts, users) {
  const ST = ["Delivered","Shipped","Processing","Pending","Cancelled","Returned"];
  const RG = ["North America","Europe","Asia Pacific","Latin America","Middle East"];
  const CH = ["Web Store","Mobile App","Marketplace","Wholesale","In-Store"];
  const now = Date.now();
  const orders = [];
  for (let i = 1; i <= 200; i++) {
    const ni = 1 + Math.floor(Math.random() * 4);
    const items = [];
    let total = 0;
    for (let j = 0; j < ni; j++) {
      const p = products[Math.floor(Math.random() * products.length)];
      const qty = 1 + Math.floor(Math.random() * 5);
      items.push({ productId: p.id, title: p.title, price: p.price, quantity: qty, category: (p.category||"other").replace(/'/g,"") });
      total += p.price * qty;
    }
    const da = Math.floor(Math.random() * 365);
    const dt = new Date(now - da * 86400000);
    const status = ST[Math.floor(Math.random() * ST.length)];
    orders.push({
      id: 1000 + i, items, total: Math.round(total * 100) / 100,
      status,
      region: RG[Math.floor(Math.random() * RG.length)],
      channel: CH[Math.floor(Math.random() * CH.length)],
      orderDate: dt.toISOString().split("T")[0],
      month: dt.toLocaleDateString("en-US",{month:"short",year:"2-digit"}),
      dayOfWeek: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dt.getDay()],
      priority: Math.random()>.7?"High":Math.random()>.4?"Medium":"Low",
      daysInStatus: ["Pending","Processing"].includes(status) ? Math.floor(Math.random()*30)+1 : 0,
      itemCount: 0,
    });
    orders[orders.length-1].itemCount = items.reduce((s,it)=>s+it.quantity,0);
  }
  return orders;
}

// ═══ DYNAMIC DATA ENGINE ═══
// Given raw orders + a query spec from AI, compute the exact data needed
function computeData(orders, spec) {
  const { source, groupBy, metric, filters: f, sortBy, sortDir, limit } = spec;
  
  // Apply filters
  let filtered = [...orders];
  if (f) {
    Object.entries(f).forEach(([field, values]) => {
      if (values && values.length > 0) {
        filtered = filtered.filter(o => {
          const val = field === "category" ? (o.items[0]?.category || "") : o[field];
          return values.includes(val);
        });
      }
    });
  }

  // If source is "orders", return filtered order rows
  if (source === "orders") {
    let result = filtered.map(o => ({
      id: o.id, status: o.status, total: o.total, region: o.region,
      channel: o.channel, orderDate: o.orderDate, priority: o.priority,
      daysWaiting: o.daysInStatus, itemCount: o.itemCount, month: o.month,
    }));
    if (sortBy) result.sort((a,b) => sortDir === "asc" ? (a[sortBy]>b[sortBy]?1:-1) : (a[sortBy]<b[sortBy]?1:-1));
    return result.slice(0, limit || 15);
  }

  // Compute summary
  if (source === "summary") {
    const tot = filtered.length;
    const rev = filtered.reduce((s,o)=>s+o.total,0);
    const items = filtered.reduce((s,o)=>s+o.itemCount,0);
    const custs = new Set(filtered.map(o=>o.userId||o.id)).size;
    const bySt = {};
    filtered.forEach(o => { bySt[o.status] = (bySt[o.status]||0)+1; });
    return {
      totalOrders: tot,
      totalRevenue: Math.round(rev),
      avgOrderValue: tot > 0 ? Math.round(rev/tot) : 0,
      totalItems: items,
      uniqueCustomers: Math.min(custs, 10),
      pendingOrders: bySt["Pending"]||0,
      processingOrders: bySt["Processing"]||0,
      shippedOrders: bySt["Shipped"]||0,
      deliveredOrders: bySt["Delivered"]||0,
      cancelledOrders: bySt["Cancelled"]||0,
      returnedOrders: bySt["Returned"]||0,
      deliveryRate: tot>0 ? Math.round((bySt["Delivered"]||0)/tot*100) : 0,
      issueRate: tot>0 ? Math.round(((bySt["Cancelled"]||0)+(bySt["Returned"]||0))/tot*100) : 0,
    };
  }

  // Aggregate by groupBy field
  if (source === "aggregate" && groupBy) {
    const groups = {};
    filtered.forEach(o => {
      let key;
      if (groupBy === "category") {
        o.items.forEach(it => {
          const cat = it.category || "other";
          if (!groups[cat]) groups[cat] = { name: cat, orders: 0, revenue: 0, cancelled: 0, returned: 0, items: 0 };
          groups[cat].orders++;
          groups[cat].revenue += it.price * it.quantity;
          groups[cat].items += it.quantity;
          if (o.status === "Cancelled") groups[cat].cancelled++;
          if (o.status === "Returned") groups[cat].returned++;
        });
        return;
      }
      if (groupBy === "month") key = o.month;
      else if (groupBy === "dayOfWeek") key = o.dayOfWeek;
      else key = o[groupBy] || "Unknown";
      
      if (!groups[key]) groups[key] = { name: key, orders: 0, revenue: 0, cancelled: 0, returned: 0, items: 0, avgTotal: 0 };
      groups[key].orders++;
      groups[key].revenue += o.total;
      groups[key].items += o.itemCount;
      if (o.status === "Cancelled") groups[key].cancelled++;
      if (o.status === "Returned") groups[key].returned++;
    });
    
    let result = Object.values(groups);
    result.forEach(r => { r.revenue = Math.round(r.revenue); r.avgTotal = r.orders>0?Math.round(r.revenue/r.orders):0; r.issueCount = r.cancelled + r.returned; });
    
    if (groupBy === "month") {
      // Sort chronologically
      const monthOrder = {};
      filtered.forEach(o => { if (!monthOrder[o.month]) monthOrder[o.month] = o.orderDate; });
      result.sort((a,b) => (monthOrder[a.name]||"").localeCompare(monthOrder[b.name]||""));
    } else if (sortBy) {
      result.sort((a,b) => sortDir === "asc" ? (a[sortBy]-b[sortBy]) : (b[sortBy]-a[sortBy]));
    } else {
      result.sort((a,b) => b.orders - a.orders);
    }
    if (limit) result = result.slice(0, limit);
    return result;
  }

  // Cross-tab: group by two dimensions
  if (source === "crosstab" && spec.groupBy1 && spec.groupBy2) {
    const groups = {};
    filtered.forEach(o => {
      const k1 = o[spec.groupBy1] || "Unknown";
      const k2 = o[spec.groupBy2] || "Unknown";
      const key = `${k1} × ${k2}`;
      if (!groups[key]) groups[key] = { name: key, [spec.groupBy1]: k1, [spec.groupBy2]: k2, orders: 0, revenue: 0, cancelled: 0, returned: 0, issueCount: 0 };
      groups[key].orders++;
      groups[key].revenue += o.total;
      if (o.status === "Cancelled") groups[key].cancelled++;
      if (o.status === "Returned") groups[key].returned++;
    });
    let result = Object.values(groups);
    result.forEach(r => { r.revenue = Math.round(r.revenue); r.issueCount = r.cancelled + r.returned; });
    if (sortBy) result.sort((a,b) => sortDir==="asc"?(a[sortBy]-b[sortBy]):(b[sortBy]-a[sortBy]));
    else result.sort((a,b) => b.issueCount - a.issueCount || b.orders - a.orders);
    return result.slice(0, limit || 20);
  }

  // Top products
  if (source === "products") {
    const prods = {};
    filtered.forEach(o => {
      o.items.forEach(it => {
        const name = (it.title||"").substring(0,30);
        if (!prods[name]) prods[name] = { name, category: it.category, price: it.price, orders: 0, revenue: 0, qty: 0 };
        prods[name].orders++;
        prods[name].revenue += it.price * it.quantity;
        prods[name].qty += it.quantity;
      });
    });
    let result = Object.values(prods);
    result.forEach(r => r.revenue = Math.round(r.revenue));
    result.sort((a,b) => (sortDir==="asc"?1:-1) * ((a[sortBy||"revenue"]||0) - (b[sortBy||"revenue"]||0)));
    if (sortDir !== "asc") result.sort((a,b) => b[sortBy||"revenue"] - a[sortBy||"revenue"]);
    return result.slice(0, limit || 10);
  }

  return filtered;
}

// ═══ SYSTEM PROMPT ═══
function buildPrompt(orders) {
  // Send real statistics so AI knows the data
  const regions = [...new Set(orders.map(o=>o.region))];
  const channels = [...new Set(orders.map(o=>o.channel))];
  const statuses = [...new Set(orders.map(o=>o.status))];
  const categories = [...new Set(orders.flatMap(o=>o.items.map(i=>i.category)))];
  
  // Per-region stats
  const regionStats = {};
  regions.forEach(r => {
    const ro = orders.filter(o=>o.region===r);
    regionStats[r] = { orders: ro.length, cancelled: ro.filter(o=>o.status==="Cancelled").length, returned: ro.filter(o=>o.status==="Returned").length, revenue: Math.round(ro.reduce((s,o)=>s+o.total,0)) };
  });
  const channelStats = {};
  channels.forEach(ch => {
    const co = orders.filter(o=>o.channel===ch);
    channelStats[ch] = { orders: co.length, cancelled: co.filter(o=>o.status==="Cancelled").length, returned: co.filter(o=>o.status==="Returned").length, revenue: Math.round(co.reduce((s,o)=>s+o.total,0)) };
  });

  return `You are a dashboard layout AI. Given a query about order data, return ONLY raw JSON (no markdown, no backticks).

REAL DATA STATISTICS (${orders.length} orders):
- Regions: ${JSON.stringify(regionStats)}
- Channels: ${JSON.stringify(channelStats)}  
- Statuses: ${statuses.map(s => s+":"+orders.filter(o=>o.status===s).length).join(", ")}
- Categories: ${categories.join(", ")}
- Total Revenue: $${Math.round(orders.reduce((s,o)=>s+o.total,0))}
- Date range: ${orders.map(o=>o.orderDate).sort()[0]} to ${orders.map(o=>o.orderDate).sort().pop()}

Each widget specifies HOW to compute its data dynamically:

JSON Schema:
{
  "title": "Dashboard Title",
  "insight": "One-line insight SPECIFIC to the query with real numbers from the stats above",
  "widgets": [
    {
      "type": "kpi | bar | pie | area | line | table | composed",
      "title": "Widget Title",
      "span": 1 or 2,
      "data": {
        "source": "summary | aggregate | orders | crosstab | products",
        "groupBy": "status | region | channel | category | month | dayOfWeek | priority",
        "groupBy1": "for crosstab: first dimension",
        "groupBy2": "for crosstab: second dimension", 
        "filters": { "status": ["Cancelled","Returned"], "region": ["Europe"] },
        "sortBy": "field to sort by",
        "sortDir": "desc or asc",
        "limit": 10,
        "metric": "orders | revenue | cancelled | returned | issueCount"
      },
      "config": { ... }
    }
  ],
  "filters": [{"field":"status|region|channel","label":"Label"}]
}

DATA SOURCE TYPES:
- "summary": Returns computed summary object. Use for KPIs.
  Fields: totalOrders, totalRevenue, avgOrderValue, pendingOrders, cancelledOrders, returnedOrders, deliveredOrders, shippedOrders, deliveryRate, issueRate
- "aggregate": Groups orders by groupBy field. Returns array of {name, orders, revenue, cancelled, returned, issueCount, avgTotal, items}
- "orders": Returns individual order rows. Fields: id, status, total, region, channel, orderDate, priority, daysWaiting, itemCount
- "crosstab": Groups by TWO fields (groupBy1 + groupBy2). Returns {name, region, channel, orders, cancelled, returned, issueCount, revenue}
- "products": Returns product-level aggregation. Fields: name, category, price, orders, revenue, qty

FILTERS in data.filters narrow the orders BEFORE aggregation. Example: {"region":["Europe"]} only includes European orders.

WIDGET CONFIGS:
- kpi: {"metrics":[{"label":"str","valueKey":"summary field","icon":"emoji","color":"#hex","format":"currency|number|percent"}]}
- bar: {"xKey":"name","yKeys":[{"key":"orders|revenue|cancelled|returned|issueCount","color":"#hex","name":"Display"}]}
- pie: {"nameKey":"name","valueKey":"orders|revenue|cancelled|returned"}
- area/line: {"xKey":"name","yKeys":[{"key":"field","color":"#hex","name":"Display"}]}
- table: {"columns":[{"key":"field","label":"Header","format":"currency|number|status|date|text","align":"left|right"}],"limit":10}
- composed: {"xKey":"name","bars":[...],"lines":[...],"areas":[...]}

CRITICAL RULES:
1. First widget MUST be "kpi" with span:2 with 4-6 metrics. Use data.source:"summary" and apply relevant filters.
2. When user asks about a specific region/channel/status, put the filter in data.filters for ALL widgets.
3. For "highest/lowest" questions: use sortBy + sortDir to rank the data.
4. For comparison queries: use aggregate grouped by the comparison dimension.
5. Always include 5-8 widgets minimum. Use span:2 for wide charts and tables. Fill both columns.
6. For "Asia" use data.filters:{"region":["Asia Pacific"]}. For "Europe" use {"region":["Europe"]}.
7. Include at least one table with detailed data relevant to the query.
8. Use REAL numbers from the stats above in your insight text.
9. Every chart MUST have valid xKey and yKeys matching the computed data fields.
10. For regional comparison queries, use groupBy:"region". For channel comparison, groupBy:"channel".`;
}

async function callGPT(query, sysPrompt, onLog) {
  for (let i = 1; i <= 3; i++) {
    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini-2024-07-18", temperature: 0.15, max_tokens: 3000,
          messages: [{ role: "system", content: sysPrompt }, { role: "user", content: query }],
          response_format: { type: "json_object" }
        })
      });
      if (resp.status === 429) {
        const w = 2000 * i;
        onLog?.(`⏳ Rate limited, retry ${i}/3 in ${w/1000}s`, "warn");
        await new Promise(r => setTimeout(r, w));
        if (i === 3) throw new Error("Rate limited");
        continue;
      }
      if (!resp.ok) { const e = await resp.json().catch(()=>({})); throw new Error(e.error?.message || `HTTP ${resp.status}`); }
      const d = await resp.json();
      const txt = (d.choices?.[0]?.message?.content || "").replace(/```json|```/g,"").trim();
      return JSON.parse(txt);
    } catch(e) {
      if (i === 3) throw e;
    }
  }
}

// ═══ CHART CONTAINER ═══
function ChartBox({ children, h = 280 }) {
  const ref = useRef(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 30) setW(Math.floor(r.width));
      else raf = requestAnimationFrame(measure);
    };
    raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      if (r.width > 30) setW(Math.floor(r.width));
    });
    ro.observe(el);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return (
    <div ref={ref} style={{ width: "100%", height: h }}>
      {w > 30 ? <ResponsiveContainer width={w} height={h}>{children}</ResponsiveContainer>
        : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: C.dm, fontSize: 11 }}>Rendering...</div>}
    </div>
  );
}

function CTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (<div style={{ background: "#0F172AEE", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", fontSize: 11 }}>
    {label && <div style={{ color: "#94A3B8", marginBottom: 3, fontWeight: 600 }}>{label}</div>}
    {payload.map((p,i) => (<div key={i} style={{ color: p.color, display: "flex", gap: 6, alignItems: "center", marginTop: 1 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color }} />{p.name}: <b>{typeof p.value==="number"?(p.value>=1000?fmtN(p.value):p.value.toLocaleString()):p.value}</b>
    </div>))}
  </div>);
}

// ═══ WIDGET ═══
function Widget({ spec, orders, delay = 0, uiFilters }) {
  // Compute data dynamically
  const dataSpec = spec.data || {};
  
  // Merge UI filters into data filters
  const mergedFilters = { ...(dataSpec.filters || {}) };
  if (uiFilters) {
    Object.entries(uiFilters).forEach(([k, v]) => {
      if (v?.length) mergedFilters[k] = v;
    });
  }
  
  const computedData = useMemo(() => {
    try {
      return computeData(orders, { ...dataSpec, filters: mergedFilters });
    } catch(e) { return null; }
  }, [orders, JSON.stringify(dataSpec), JSON.stringify(mergedFilters)]);

  if (!computedData) return null;
  
  const cfg = spec.config || {};
  const span = Number(spec.span) || 1;
  const d = computedData;

  const card = (ch) => (
    <div style={{ background: `linear-gradient(180deg, ${C.sf}, ${C.bg2})`, border: `1px solid ${C.bd}`, borderRadius: 16, padding: 20, gridColumn: span >= 2 ? "1 / -1" : undefined, animation: `rise .5s ease ${delay}ms both`, overflow: "hidden", transition: "border-color .2s, box-shadow .2s" }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=C.bh;e.currentTarget.style.boxShadow=`0 6px 30px ${C.bg}CC`;}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=C.bd;e.currentTarget.style.boxShadow="none";}}>
      {spec.type !== "kpi" && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.tx }}>{spec.title}</div>
        <span style={{ fontSize: 8, color: C.dm, padding: "2px 7px", background: C.bg, borderRadius: 5, textTransform: "uppercase", letterSpacing: .5 }}>{spec.type}</span>
      </div>}
      {ch}
    </div>
  );

  // KPI
  if (spec.type === "kpi") {
    const metrics = cfg.metrics?.length ? cfg.metrics : [];
    return card(
      <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${metrics.length<=3?"200px":"140px"}, 1fr))`, gap: 10 }}>
        {metrics.map((m, i) => {
          const val = d?.[m.valueKey];
          const disp = m.format==="currency"?fmt$(val):m.format==="percent"?`${val??"—"}%`:fmtN(val);
          return (<div key={i} style={{ background: C.bg, border: `1px solid ${C.bd}`, borderRadius: 12, padding: "14px 16px", position: "relative", overflow: "hidden", animation: `rise .4s ease ${delay+i*40}ms both` }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${m.color||C.ac}, transparent)` }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 9, color: C.mt, letterSpacing: .8, textTransform: "uppercase", marginBottom: 5 }}>{m.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: C.tx, letterSpacing: -.5 }}>{disp}</div>
              </div>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: (m.color||C.ac)+"15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{m.icon||"📊"}</div>
            </div>
          </div>);
        })}
      </div>
    );
  }

  if (!Array.isArray(d) || d.length === 0) return card(<div style={{ color: C.dm, padding: 20, textAlign: "center" }}>No data for this view</div>);

  // BAR
  if (spec.type === "bar") {
    const isV = cfg.layout === "vertical";
    return card(<ChartBox h={280}>
      <BarChart data={d} layout={isV?"vertical":"horizontal"} margin={isV?{left:100}:{bottom:5}}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.bd} />
        {isV ? <><XAxis type="number" stroke={C.dm} fontSize={10} tickFormatter={v=>v>=1000?fmtN(v):v}/><YAxis dataKey={cfg.xKey||"name"} type="category" stroke={C.dm} fontSize={9} width={95}/></> :
          <><XAxis dataKey={cfg.xKey||"name"} stroke={C.dm} fontSize={10} interval={0} angle={d.length>5?-15:0} textAnchor={d.length>5?"end":"middle"} height={d.length>5?50:30}/><YAxis stroke={C.dm} fontSize={10} tickFormatter={v=>v>=1000?fmtN(v):v}/></>}
        <Tooltip content={<CTip/>}/>
        {(cfg.yKeys||[]).map((y,i) => <Bar key={i} dataKey={y.key} fill={y.color||PAL[i]} radius={isV?[0,4,4,0]:[4,4,0,0]} name={y.name||y.key}/>)}
        {(cfg.yKeys||[]).length > 1 && <Legend wrapperStyle={{fontSize:11}}/>}
      </BarChart>
    </ChartBox>);
  }

  // PIE
  if (spec.type === "pie") {
    return card(<ChartBox h={280}>
      <PieChart>
        <Pie data={d} dataKey={cfg.valueKey||"orders"} nameKey={cfg.nameKey||"name"} cx="50%" cy="50%" outerRadius="75%" innerRadius="35%" paddingAngle={2} strokeWidth={0}
          label={({name,percent})=>`${(name||"").substring(0,11)} ${(percent*100).toFixed(0)}%`} fontSize={10}>
          {d.map((_,i)=><Cell key={i} fill={PAL[i%PAL.length]}/>)}
        </Pie>
        <Tooltip content={<CTip/>}/>
      </PieChart>
    </ChartBox>);
  }

  // AREA
  if (spec.type === "area") {
    const uid = "ar_"+delay+"_"+(spec.title||"").replace(/\W/g,"").substring(0,5);
    return card(<ChartBox h={280}>
      <AreaChart data={d}>
        <defs>{(cfg.yKeys||[]).map((y,i)=><linearGradient key={i} id={uid+i} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={y.color||PAL[i]} stopOpacity={.3}/><stop offset="95%" stopColor={y.color||PAL[i]} stopOpacity={.02}/></linearGradient>)}</defs>
        <CartesianGrid strokeDasharray="3 3" stroke={C.bd}/><XAxis dataKey={cfg.xKey||"name"} stroke={C.dm} fontSize={10}/><YAxis stroke={C.dm} fontSize={10} tickFormatter={v=>v>=1000?fmtN(v):v}/><Tooltip content={<CTip/>}/>
        {(cfg.yKeys||[]).map((y,i)=><Area key={i} type="monotone" dataKey={y.key} stroke={y.color||PAL[i]} fill={`url(#${uid}${i})`} strokeWidth={2.5} name={y.name||y.key}/>)}
        {(cfg.yKeys||[]).length>1&&<Legend wrapperStyle={{fontSize:11}}/>}
      </AreaChart>
    </ChartBox>);
  }

  // LINE
  if (spec.type === "line") {
    return card(<ChartBox h={280}>
      <LineChart data={d}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.bd}/><XAxis dataKey={cfg.xKey||"name"} stroke={C.dm} fontSize={10}/><YAxis stroke={C.dm} fontSize={10} tickFormatter={v=>v>=1000?fmtN(v):v}/><Tooltip content={<CTip/>}/>
        {(cfg.yKeys||[]).map((y,i)=><Line key={i} type="monotone" dataKey={y.key} stroke={y.color||PAL[i]} strokeWidth={2.5} dot={false} name={y.name||y.key}/>)}
        <Legend wrapperStyle={{fontSize:11}}/>
      </LineChart>
    </ChartBox>);
  }

  // COMPOSED
  if (spec.type === "composed") {
    return card(<ChartBox h={280}>
      <ComposedChart data={d}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.bd}/><XAxis dataKey={cfg.xKey||"name"} stroke={C.dm} fontSize={10}/><YAxis stroke={C.dm} fontSize={10} tickFormatter={v=>v>=1000?fmtN(v):v}/><Tooltip content={<CTip/>}/>
        {(cfg.areas||[]).map((a,i)=><Area key={"a"+i} type="monotone" dataKey={a.key} fill={(a.color||PAL[i])+"25"} stroke={a.color||PAL[i]} strokeWidth={2} name={a.name}/>)}
        {(cfg.bars||[]).map((b,i)=><Bar key={"b"+i} dataKey={b.key} fill={b.color||PAL[i+2]} radius={[4,4,0,0]} name={b.name}/>)}
        {(cfg.lines||[]).map((l,i)=><Line key={"l"+i} type="monotone" dataKey={l.key} stroke={l.color||PAL[i+4]} strokeWidth={2} dot={false} name={l.name}/>)}
        <Legend wrapperStyle={{fontSize:11}}/>
      </ComposedChart>
    </ChartBox>);
  }

  // TABLE
  if (spec.type === "table") {
    const cols = cfg.columns || [];
    const rows = d.slice(0, cfg.limit || 12);
    return card(<div style={{ maxHeight: 360, overflowY: "auto", borderRadius: 10, border: `1px solid ${C.bd}` }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead><tr style={{ background: C.bg, position: "sticky", top: 0, zIndex: 2 }}>
          {cols.map(c=><th key={c.key} style={{ padding: "9px 11px", textAlign: c.align||"left", color: C.mt, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: .5, borderBottom: `1px solid ${C.bd}` }}>{c.label}</th>)}
        </tr></thead>
        <tbody>{rows.map((row,ri)=><tr key={ri} onMouseEnter={e=>e.currentTarget.style.background=C.bg2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          {cols.map(c=>{
            let v = row[c.key]; const st = { padding: "9px 11px", textAlign: c.align||"left", color: C.tx, borderBottom: `1px solid ${C.bd}10` };
            if (c.format==="currency"&&typeof v==="number") v="$"+v.toFixed(2);
            if (c.format==="number"&&typeof v==="number") v=v.toLocaleString();
            if (c.key==="status"||c.key==="priority"||c.format==="status") {
              const cl = {Delivered:C.gn,Shipped:C.ac,Processing:C.am,Pending:C.dm,Cancelled:C.rd,Returned:C.pk,High:C.rd,Medium:C.am,Low:C.gn};
              return <td key={c.key} style={st}><span style={{ padding:"2px 8px", borderRadius:6, fontSize:10, fontWeight:600, background:(cl[v]||C.mt)+"18", color:cl[v]||C.mt }}>{v}</span></td>;
            }
            if (typeof v==="string"&&v.length>32) v=v.substring(0,32)+"…";
            return <td key={c.key} style={st}>{v??"—"}</td>;
          })}
        </tr>)}</tbody>
      </table>
    </div>);
  }
  return null;
}

// ═══ MAIN ═══
export default function Nexus() {
  const [query, setQuery] = useState("");
  const [listening, setListening] = useState(false);
  const [phase, setPhase] = useState("boot");
  const [orders, setOrders] = useState(null);
  const [spec, setSpec] = useState(null);
  const [logs, setLogs] = useState([]);
  const [lastQ, setLastQ] = useState("");
  const [filters, setFilters] = useState({});
  const [showLog, setShowLog] = useState(false);
  const [gptRaw, setGptRaw] = useState("");
  const [showRaw, setShowRaw] = useState(false);
  const recRef = useRef(null);
  const inRef = useRef(null);
  const log = useCallback((m,t="info")=>setLogs(p=>[...p.slice(-12),{m,t,ts:new Date().toLocaleTimeString()}]),[]);

  useEffect(()=>{
    (async()=>{
      log("🔌 Connecting to FakeStoreAPI...","api");
      try {
        const [pr,ca,us] = await Promise.all([fetch("https://fakestoreapi.com/products").then(r=>r.json()),fetch("https://fakestoreapi.com/carts").then(r=>r.json()),fetch("https://fakestoreapi.com/users").then(r=>r.json())]);
        log(`✅ ${pr.length} products, ${us.length} users loaded`,"ok");
        const o = buildOrders(pr,ca,us);
        setOrders(o);
        setPhase("idle");
        log(`🟢 ${o.length} orders ready — Next-Era AI active`,"ok");
      } catch(e) {
        log("⚠️ "+e.message+" — using fallback","warn");
        const fp = Array.from({length:20},(_,i)=>({id:i+1,title:"Product "+(i+1),price:+(10+Math.random()*190).toFixed(2),category:["electronics","jewelery","mens clothing","womens clothing"][i%4]}));
        setOrders(buildOrders(fp,[],[{id:1}]));
        setPhase("idle");
      }
    })();
  },[log]);

  const run = useCallback(async(q)=>{
    if (!q.trim()||!orders) return;
    setLastQ(q); setFilters({}); setPhase("think"); setGptRaw("");
    log(`🎯 "${q}"`,"voice");
    let res;
    try {
      log("🧠 Next-Era AI analyzing...","api");
      const sysP = buildPrompt(orders);
      res = await callGPT(q, sysP, log);
      setGptRaw(JSON.stringify(res, null, 2));
      log(`✅ ${res.widgets?.length||0} widgets returned`,"ok");
    } catch(e) {
      log(`⚠️ ${e.message}`,"warn");
      res = { title: "Overview", insight: "Fallback view", widgets: [
        { type:"kpi", span:2, data:{source:"summary"}, config:{metrics:[
          {label:"Orders",valueKey:"totalOrders",icon:"📦",color:C.ac,format:"number"},
          {label:"Revenue",valueKey:"totalRevenue",icon:"💰",color:C.gn,format:"currency"},
          {label:"Cancelled",valueKey:"cancelledOrders",icon:"🚫",color:C.rd,format:"number"},
          {label:"Returned",valueKey:"returnedOrders",icon:"↩️",color:C.pk,format:"number"},
        ]}},
        { type:"pie",span:1,title:"By Status",data:{source:"aggregate",groupBy:"status"},config:{nameKey:"name",valueKey:"orders"}},
        { type:"bar",span:1,title:"By Region",data:{source:"aggregate",groupBy:"region"},config:{xKey:"name",yKeys:[{key:"orders",color:C.ac,name:"Orders"}]}},
        { type:"table",span:2,title:"Recent Orders",data:{source:"orders",sortBy:"orderDate",sortDir:"desc",limit:10},config:{columns:[{key:"id",label:"#"},{key:"status",label:"Status",format:"status"},{key:"total",label:"Total",format:"currency",align:"right"},{key:"region",label:"Region"},{key:"channel",label:"Channel"}]}},
      ], filters:[{field:"status",label:"Status"},{field:"region",label:"Region"}]};
    }
    // Normalize
    if (res?.widgets) {
      const singles = []; const rest = [];
      res.widgets.forEach(w => {
        if (w.type==="kpi"&&w.config?.metrics?.length===1) singles.push(w);
        else rest.push(w);
      });
      if (singles.length>=2) res.widgets = [{type:"kpi",span:2,data:singles[0].data||{source:"summary"},config:{metrics:singles.flatMap(k=>k.config.metrics)}},...rest];
      res.widgets = res.widgets.map(w=>({...w,span:Number(w.span)||1}));
    }
    setSpec(res); setPhase("ready"); log("🎨 Rendered","ok");
  },[orders,log]);

  useEffect(()=>{
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    if (SR) {
      const r = new SR(); r.continuous=false; r.interimResults=true; r.lang="en-US";
      r.onresult=e=>{let f="",t="";for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)f+=e.results[i][0].transcript;else t+=e.results[i][0].transcript;}setQuery(f||t);if(f){setListening(false);run(f);}};
      r.onend=()=>setListening(false); r.onerror=()=>setListening(false); recRef.current=r;
    }
  },[run]);

  const mic=()=>{if(!recRef.current)return;if(listening){recRef.current.stop();setListening(false);}else{recRef.current.start();setListening(true);log("🎙️ Listening...","voice");}};
  const togF=(f,v)=>setFilters(p=>{const c=p[f]||[];return{...p,[f]:c.includes(v)?c.filter(x=>x!==v):[...c,v]};});

  const FO = { status:["Pending","Processing","Shipped","Delivered","Cancelled","Returned"], region:["North America","Europe","Asia Pacific","Latin America","Middle East"], channel:["Web Store","Mobile App","Marketplace","Wholesale","In-Store"] };
  const CMDS = [
    {i:"📦",l:"Overview",q:"Complete order overview with all KPIs, status pie chart, regional bar chart, monthly trend, and recent orders table"},
    {i:"💰",l:"Revenue",q:"Revenue analysis: monthly revenue trend, revenue by category, by channel, and top 10 products by revenue"},
    {i:"⚠️",l:"Issues",q:"Show cancelled and returned orders: which regions and channels have highest cancellations and returns, with detailed table"},
    {i:"🌍",l:"Regions",q:"Compare all regions: orders, revenue, cancelled and returned counts for each region"},
    {i:"📈",l:"Trends",q:"Monthly trends showing orders, revenue, cancellations over time"},
    {i:"🏷️",l:"Products",q:"Top 10 products by revenue with category breakdown"},
    {i:"📡",l:"Channels",q:"Compare all sales channels: orders, revenue, and issue rates per channel"},
    {i:"🎯",l:"Executive",q:"Executive summary: all KPIs, biggest problem areas, top revenue sources, monthly trend"},
  ];

  return (
    <div style={{minHeight:"100vh",width:"100%",background:C.bg,color:C.tx,fontFamily:"'Space Grotesk',system-ui,sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
html,body,#root{width:100%;min-height:100vh;margin:0;padding:0;background:${C.bg}}
@keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{from{height:4px}to{height:18px}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes glow{0%,100%{box-shadow:0 0 15px ${C.rd}20}50%{box-shadow:0 0 30px ${C.rd}40}}
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.bd};border-radius:3px}
input::placeholder{color:${C.dm}}
.qb:hover{border-color:${C.ac}!important;background:${C.ac}10!important}`}</style>

      <header style={{position:"sticky",top:0,zIndex:100,background:C.bg+"E8",backdropFilter:"blur(20px)",borderBottom:`1px solid ${C.bd}`}}>
        <div style={{maxWidth:1400,margin:"0 auto",padding:"12px 24px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{display:"flex",alignItems:"center",gap:9,flexShrink:0}}>
              <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#0176D3,#1B96FF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:"#fff"}}>N</div>
              <div><div style={{fontSize:14,fontWeight:700,letterSpacing:-.3}}>Next-Era AI</div><div style={{fontSize:8,color:C.dm,letterSpacing:1,textTransform:"uppercase"}}>Next-Era AI Agent</div></div>
            </div>
            <form onSubmit={e=>{e.preventDefault();run(query);}} style={{flex:1,display:"flex",gap:7}}>
              <div style={{flex:1,display:"flex",alignItems:"center",background:C.sf,border:`1px solid ${listening?C.rd+"80":C.bd}`,borderRadius:11,padding:"0 14px",minHeight:42,animation:listening?"glow 2s infinite":"none"}}>
                <span style={{color:C.dm,marginRight:8,fontSize:15}}>⌕</span>
                <input ref={inRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder='Try: "Which channel has highest returns in Europe?" or "Pending orders with wait times"' style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.tx,fontSize:13,padding:"10px 0",fontFamily:"inherit"}}/>
                {listening&&<div style={{display:"flex",gap:3,marginRight:6}}>{[0,1,2,3,4].map(i=><div key={i} style={{width:3,borderRadius:2,background:C.rd,animation:`pulse .5s ease ${i*70}ms infinite alternate`}}/>)}</div>}
                {query&&<button type="button" onClick={()=>{setQuery("");inRef.current?.focus();}} style={{background:"none",border:"none",color:C.dm,cursor:"pointer",fontSize:14}}>✕</button>}
              </div>
              <button type="button" onClick={mic} style={{width:42,height:42,borderRadius:10,border:`1px solid ${listening?C.rd:C.bd}`,background:listening?C.rd+"15":C.sf,color:listening?C.rd:C.mt,cursor:"pointer",fontSize:16,flexShrink:0}}>🎙️</button>
              <button type="submit" disabled={phase==="think"} style={{padding:"0 20px",height:42,borderRadius:10,border:"none",background:"linear-gradient(135deg,#0176D3,#1B96FF)",color:"#fff",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit",flexShrink:0,opacity:phase==="think"?.6:1}}>
                {phase==="think"?"⏳ Thinking...":"Run ▸"}
              </button>
              <button type="button" onClick={()=>setShowLog(!showLog)} style={{width:42,height:42,borderRadius:10,border:`1px solid ${C.bd}`,background:C.sf,color:C.dm,cursor:"pointer",fontSize:13,flexShrink:0}} title="Agent Log">📋</button>
              {gptRaw&&<button type="button" onClick={()=>setShowRaw(!showRaw)} style={{width:42,height:42,borderRadius:10,border:`1px solid ${C.bd}`,background:C.sf,color:showRaw?C.ac:C.dm,cursor:"pointer",fontSize:13,flexShrink:0}} title="AI Response">🔍</button>}
            </form>
          </div>
          {showLog&&<div style={{marginTop:8,padding:"8px 12px",background:C.sf,borderRadius:8,border:`1px solid ${C.bd}`,maxHeight:110,overflowY:"auto",animation:"rise .2s ease"}}>
            {logs.map((l,i)=><div key={i} style={{fontSize:10,color:l.t==="ok"?C.gn:l.t==="warn"?C.am:l.t==="voice"?C.rd:l.t==="api"?C.cy:C.mt,marginBottom:2}}><span style={{color:C.dm,marginRight:4}}>{l.ts}</span>{l.m}</div>)}
          </div>}
          {showRaw&&gptRaw&&<div style={{marginTop:8,padding:"8px 12px",background:C.sf,borderRadius:8,border:`1px solid ${C.bd}`,maxHeight:200,overflowY:"auto",animation:"rise .2s ease"}}>
            <div style={{fontSize:9,color:C.mt,marginBottom:4,fontWeight:600}}>AI Raw Response:</div>
            <pre style={{fontSize:10,color:C.tx2,whiteSpace:"pre-wrap",wordBreak:"break-all",fontFamily:"monospace",lineHeight:1.4}}>{gptRaw}</pre>
          </div>}
          <div style={{marginTop:8,display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
            {CMDS.map(c=><button key={c.l} className="qb" onClick={()=>{setQuery(c.q);run(c.q);}} style={{padding:"4px 9px",borderRadius:7,border:`1px solid ${C.bd}`,background:C.sf,color:C.tx2,cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:500,transition:"all .15s"}}>{c.i} {c.l}</button>)}
            {spec?.filters&&<>
              <div style={{width:1,height:16,background:C.bd,margin:"0 3px"}}/>
              {spec.filters.slice(0,3).map(f=>{const opts=FO[f.field]||[];const active=filters[f.field]||[];
                return <div key={f.field} style={{display:"flex",gap:2,alignItems:"center"}}>
                  <span style={{fontSize:9,color:C.dm}}>{f.label}:</span>
                  {opts.map(o=><button key={o} onClick={()=>togF(f.field,o)} style={{padding:"2px 6px",borderRadius:5,border:`1px solid ${active.includes(o)?C.ac:C.bd}`,background:active.includes(o)?C.ac+"18":"transparent",color:active.includes(o)?C.ac:C.dm,cursor:"pointer",fontSize:8,fontFamily:"inherit"}}>{o}</button>)}
                </div>;
              })}
            </>}
          </div>
        </div>
      </header>

      <main style={{maxWidth:1400,margin:"0 auto",padding:"20px 24px"}}>
        {phase==="boot"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"70vh"}}><div style={{width:44,height:44,border:`3px solid ${C.bd}`,borderTopColor:C.ac,borderRadius:"50%",animation:"spin 1s linear infinite",marginBottom:16}}/><div style={{fontSize:15,fontWeight:600}}>Connecting to FakeStoreAPI...</div></div>}
        
        {phase==="think"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"70vh",animation:"rise .3s ease"}}><div style={{width:44,height:44,border:`3px solid ${C.bd}`,borderTopColor:C.pr,borderRadius:"50%",animation:"spin .8s linear infinite",marginBottom:16}}/><div style={{fontSize:15,fontWeight:600}}>Next-Era AI building your dashboard...</div><div style={{fontSize:12,color:C.mt,marginTop:6}}>"{lastQ}"</div></div>}

        {phase==="idle"&&!spec&&orders&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"70vh",animation:"rise .5s ease"}}>
          <div style={{fontSize:48,marginBottom:14}}>🎯</div>
          <div style={{fontSize:24,fontWeight:700,background:"linear-gradient(135deg,#0176D3,#1B96FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>What would you like to see?</div>
          <div style={{fontSize:13,color:C.mt,maxWidth:520,textAlign:"center",lineHeight:1.7,margin:"10px 0 24px"}}>Ask complex questions. Next-Era AI understands filters, comparisons, rankings, and builds unique dashboards with real computed data.</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,maxWidth:560}}>
            {["Which channel and region has the highest returns?","Show pie chart of order status for Europe only","Pending orders with wait times sorted by longest waiting","Compare cancelled vs returned by region and channel","Revenue trend with monthly cancellation rates","Top 5 products in electronics category"].map(s=><div key={s} onClick={()=>{setQuery(s);run(s);}} style={{padding:"12px 14px",borderRadius:10,border:`1px solid ${C.bd}`,background:C.sf,fontSize:11,color:C.mt,cursor:"pointer",lineHeight:1.4,transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.ac;e.currentTarget.style.color=C.tx;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.bd;e.currentTarget.style.color=C.mt;}}>"{s}"</div>)}
          </div>
        </div>}

        {spec&&orders&&phase==="ready"&&<div style={{animation:"rise .4s ease"}}>
          <div style={{marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <h1 style={{fontSize:19,fontWeight:700,letterSpacing:-.3,margin:0}}>{spec.title}</h1>
              {spec.insight&&<p style={{fontSize:12,color:C.mt,marginTop:4}}>🤖 {spec.insight}</p>}
              <p style={{fontSize:10,color:C.dm,marginTop:3}}>Query: "{lastQ}"</p>
            </div>
            <span style={{fontSize:10,color:C.gn,padding:"4px 10px",background:C.sf,borderRadius:7,border:`1px solid ${C.bd}`,flexShrink:0}}>Next-Era AI · {spec.widgets?.length} widgets</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
            {(spec.widgets||[]).map((w,i)=><Widget key={lastQ+"_"+i} spec={w} orders={orders} delay={i*50} uiFilters={filters}/>)}
          </div>
        </div>}
      </main>
    </div>
  );
}


export default function App() {
  const path = window.location.pathname.toLowerCase();

  if (path === "/app1") return <App1 />;
  if (path === "/app2") return <App2 />;

  return <Nexus />;
}
