import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, ScatterChart, Scatter, ZAxis,
  Treemap, ComposedChart, PieChart, Pie,
  RadialBarChart, RadialBar, FunnelChart, Funnel, LabelList
} from "recharts";

/* ═══════════════════ THEMES ═══════════════════ */
const TH = {
  cyber:{nm:"CYBER OPS",ic:"⚡",ac:"#00e8ff",a2:"#00ff80",wr:"#ffab00",dg:"#ff1744",pr:"#b455ff",tx:"#eaf2f8",mt:"rgba(234,242,248,.55)",dm:"rgba(234,242,248,.20)",gl:"rgba(3,8,18,.38)",bd:"rgba(0,232,255,.12)",gr:"rgba(0,232,255,.06)",ms:"https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",mf:"brightness(1.08) contrast(1.08) saturate(1.1)",hd:"'Orbitron',monospace",by:"'Rajdhani',sans-serif",mn:"'JetBrains Mono',monospace",sc:true,brackets:true,glow:true,cardBg:"rgba(10,22,42,.72)",cardBorder:"rgba(0,212,245,.16)",btnBg:"rgba(0,232,255,.12)",btnBorder:"rgba(0,232,255,.35)",btnTx:"#00e8ff"},
  solar:{nm:"SOLAR FLARE",ic:"☀️",ac:"#e8590c",a2:"#f59f00",wr:"#fd7e14",dg:"#c92a2a",pr:"#ae3ec9",tx:"#f5f0e8",mt:"rgba(245,240,232,.55)",dm:"rgba(245,240,232,.20)",gl:"rgba(8,4,2,.38)",bd:"rgba(232,89,12,.14)",gr:"rgba(232,89,12,.06)",ms:"https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",mf:"brightness(1.02) contrast(1.1) saturate(1.25) sepia(0.1)",hd:"'Bebas Neue',sans-serif",by:"'DM Sans',sans-serif",mn:"'Source Code Pro',monospace",sc:false,brackets:false,glow:false,cardBg:"rgba(20,12,6,.65)",cardBorder:"rgba(232,89,12,.18)",btnBg:"rgba(232,89,12,.12)",btnBorder:"rgba(232,89,12,.35)",btnTx:"#e8590c"},
  arctic:{nm:"ARCTIC ZERO",ic:"❄️",ac:"#4c8dbf",a2:"#5fad8e",wr:"#d4a030",dg:"#c44040",pr:"#7b5ea7",tx:"#dce8f2",mt:"rgba(220,232,242,.55)",dm:"rgba(220,232,242,.20)",gl:"rgba(4,10,18,.38)",bd:"rgba(76,141,191,.12)",gr:"rgba(76,141,191,.06)",ms:"https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",mf:"brightness(1.0) contrast(1.06) saturate(0.85) hue-rotate(-3deg)",hd:"'Quicksand',sans-serif",by:"'Nunito',sans-serif",mn:"'Fira Code',monospace",sc:false,brackets:false,glow:false,cardBg:"rgba(8,16,24,.65)",cardBorder:"rgba(76,141,191,.18)",btnBg:"rgba(76,141,191,.12)",btnBorder:"rgba(76,141,191,.35)",btnTx:"#4c8dbf"},
  terminal:{nm:"TERMINAL",ic:"▶",ac:"#00ff80",a2:"#00ccff",wr:"#ffb300",dg:"#ff5555",pr:"#bd93f9",tx:"#b9ffd8",mt:"rgba(185,255,216,.50)",dm:"rgba(185,255,216,.20)",gl:"rgba(2,9,5,.38)",bd:"rgba(0,255,128,.14)",gr:"rgba(0,255,128,.07)",ms:"https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",mf:"brightness(.96) contrast(1.28) saturate(1.12)",hd:"'VT323',monospace",by:"'VT323',monospace",mn:"'VT323',monospace",sc:true,brackets:true,glow:true,cardBg:"rgba(1,12,4,.55)",cardBorder:"rgba(0,255,128,.18)",btnBg:"rgba(0,255,128,.12)",btnBorder:"rgba(0,255,128,.35)",btnTx:"#00ff80"},
  obsidian:{nm:"OBSIDIAN LUXE",ic:"◆",ac:"#c8a84e",a2:"#a89050",wr:"#d4a030",dg:"#b03030",pr:"#7b4fa0",tx:"#f0ebe0",mt:"rgba(240,235,224,.60)",dm:"rgba(240,235,224,.25)",gl:"rgba(8,6,4,.38)",bd:"rgba(200,168,78,.14)",gr:"rgba(200,168,78,.06)",ms:"https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",mf:"brightness(0.92) contrast(1.18) saturate(0.82) sepia(0.18)",hd:"'Playfair Display',serif",by:"'Cormorant Garamond',serif",mn:"'IBM Plex Mono',monospace",sc:false,brackets:false,glow:true,cardBg:"rgba(16,12,6,.55)",cardBorder:"rgba(200,168,78,.18)",btnBg:"rgba(200,168,78,.12)",btnBorder:"rgba(200,168,78,.35)",btnTx:"#c8a84e"},
};

const PAL=["#38bdf8","#a78bfa","#34d399","#fbbf24","#fb7185","#22d3ee","#f472b6","#818cf8","#2dd4bf","#f97316","#84cc16","#e879f9"];
let _s=42;const R=()=>{_s=(_s*16807+12345)%2147483647;return(_s&0x7fffffff)/0x7fffffff};
const ri=(a,b)=>Math.floor(R()*(b-a+1))+a;const rf=(a,b,d=2)=>+(a+R()*(b-a)).toFixed(d);const pick=a=>a[Math.floor(R()*a.length)];
const MO=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const TC={factory:"#00e8ff",warehouse:"#00ff80",port:"#ff2d6a",lab:"#b455ff",hq:"#ffb300",supplier:"#f472b6"};
const TN={factory:"FACTORY",warehouse:"WAREHOUSE",port:"PORT",lab:"R&D LAB",hq:"HEADQUARTERS",supplier:"SUPPLIER"};
const TI={factory:"\u2699\uFE0F",warehouse:"\uD83D\uDCE6",port:"\uD83D\uDEA2",lab:"\uD83D\uDD2C",hq:"\uD83C\uDFDB\uFE0F",supplier:"\uD83D\uDD17"};

/* ═══════════════════ FACILITIES (30) ═══════════════════ */
const FAC=[
  {n:"Mumbai HQ",c:"India",r:"S. Asia",lat:19.08,lon:72.88,t:"hq",rev:0,staff:4500,eff:99,issues:0,st:"OK",cap:"Global Ops",up:"99.9%",d:"L&T Engineering Services Global HQ"},
  {n:"Chennai Heavy Eng.",c:"India",r:"S. Asia",lat:13.08,lon:80.27,t:"factory",rev:18200,staff:12000,eff:94.6,issues:4,st:"OK",cap:"45K tons/yr",up:"97.2%",d:"Heavy engineering fabrication"},
  {n:"Hazira Works",c:"India",r:"S. Asia",lat:21.13,lon:72.64,t:"factory",rev:24800,staff:18000,eff:95.8,issues:3,st:"OK",cap:"80K tons/yr",up:"98.1%",d:"Largest modular fabrication yard"},
  {n:"Vadodara Valve",c:"India",r:"S. Asia",lat:22.31,lon:73.19,t:"factory",rev:8400,staff:3200,eff:97.1,issues:1,st:"OK",cap:"25K valves/yr",up:"99.4%",d:"Industrial control valve manufacturing"},
  {n:"Coimbatore Pump",c:"India",r:"S. Asia",lat:11.01,lon:76.97,t:"factory",rev:6200,staff:2800,eff:96.2,issues:2,st:"OK",cap:"18K pumps/yr",up:"98.8%",d:"Centrifugal & reciprocating pumps"},
  {n:"Bangalore R&D",c:"India",r:"S. Asia",lat:12.97,lon:77.59,t:"lab",rev:2400,staff:6000,eff:91.2,issues:2,st:"OK",cap:"Digital Twin",up:"95%",d:"AI/ML & Digital Twin Center"},
  {n:"Kattupalli Yard",c:"India",r:"S. Asia",lat:13.33,lon:80.32,t:"port",rev:0,staff:5200,eff:93.4,issues:3,st:"OK",cap:"200K DWT",up:"96.8%",d:"Shipyard & global export hub"},
  {n:"Powai Tech Hub",c:"India",r:"S. Asia",lat:19.12,lon:72.91,t:"lab",rev:1800,staff:3500,eff:93.5,issues:1,st:"OK",cap:"Smart Mfg",up:"97.5%",d:"Industry 4.0 & IoT Solutions"},
  {n:"Pithampur Steel",c:"India",r:"S. Asia",lat:22.61,lon:75.70,t:"factory",rev:7800,staff:4200,eff:93.8,issues:5,st:"DEG",cap:"60K tons/yr",up:"95.1%",d:"Structural steel fabrication"},
  {n:"Mundra Warehouse",c:"India",r:"S. Asia",lat:22.84,lon:69.72,t:"warehouse",rev:0,staff:1800,eff:96.4,issues:1,st:"OK",cap:"1.8M sqft",up:"99.2%",d:"West coast mega-distribution"},
  {n:"Jubail Modular",c:"Saudi",r:"Mid East",lat:27.01,lon:49.66,t:"factory",rev:32000,staff:8500,eff:94.8,issues:5,st:"DEG",cap:"120K tons/yr",up:"96.3%",d:"ARAMCO & SABIC modular fabrication"},
  {n:"Ras Al Khair",c:"Saudi",r:"Mid East",lat:27.13,lon:49.24,t:"factory",rev:16200,staff:4800,eff:96.2,issues:2,st:"OK",cap:"55K tons/yr",up:"98.8%",d:"Desalination & power components"},
  {n:"Dubai Logistics",c:"UAE",r:"Mid East",lat:25.25,lon:55.36,t:"warehouse",rev:0,staff:2400,eff:97.1,issues:1,st:"OK",cap:"2.4M sqft",up:"99.8%",d:"Jebel Ali Free Zone hub"},
  {n:"Abu Dhabi Offshore",c:"UAE",r:"Mid East",lat:24.45,lon:54.65,t:"factory",rev:14600,staff:3600,eff:93.2,issues:4,st:"OK",cap:"40K tons/yr",up:"96.5%",d:"ADNOC offshore platform fabrication"},
  {n:"Sohar Port Fab",c:"Oman",r:"Mid East",lat:24.36,lon:56.74,t:"factory",rev:8900,staff:2200,eff:95.4,issues:2,st:"OK",cap:"30K tons/yr",up:"98.2%",d:"Energy infrastructure fabrication"},
  {n:"Rotterdam DC",c:"Netherlands",r:"Europe",lat:51.9,lon:4.5,t:"port",rev:0,staff:1800,eff:96.8,issues:2,st:"OK",cap:"8.5M TEU",up:"98.6%",d:"European gateway & EU distribution"},
  {n:"Aberdeen Subsea",c:"UK",r:"Europe",lat:57.15,lon:-2.09,t:"factory",rev:6800,staff:1600,eff:94.2,issues:3,st:"OK",cap:"15K tons/yr",up:"97.1%",d:"North Sea subsea engineering"},
  {n:"Hamburg Warehouse",c:"Germany",r:"Europe",lat:53.55,lon:9.99,t:"warehouse",rev:0,staff:800,eff:97.5,issues:0,st:"OK",cap:"900K sqft",up:"99.9%",d:"Central European distribution"},
  {n:"Houston EPC",c:"USA",r:"N. America",lat:29.76,lon:-95.37,t:"factory",rev:22000,staff:5200,eff:93.6,issues:4,st:"OK",cap:"75K tons/yr",up:"96.8%",d:"LNG modules & refinery turnarounds"},
  {n:"LA Port Terminal",c:"USA",r:"N. America",lat:33.74,lon:-118.27,t:"port",rev:0,staff:1200,eff:92.8,issues:3,st:"OK",cap:"6M TEU",up:"95%",d:"Pacific gateway material receiving"},
  {n:"Chicago Dist",c:"USA",r:"N. America",lat:41.88,lon:-87.63,t:"warehouse",rev:0,staff:900,eff:96.2,issues:1,st:"OK",cap:"1.6M sqft",up:"99.1%",d:"Central US pipe & fittings distribution"},
  {n:"Sao Paulo Office",c:"Brazil",r:"S. America",lat:-23.55,lon:-46.63,t:"hq",rev:0,staff:600,eff:98,issues:0,st:"OK",cap:"Regional HQ",up:"99.5%",d:"LATAM regional headquarters"},
  {n:"Maputo Fab",c:"Mozambique",r:"Africa",lat:-25.97,lon:32.58,t:"factory",rev:4200,staff:1800,eff:92.4,issues:3,st:"OK",cap:"20K tons/yr",up:"95.8%",d:"East African LNG project support"},
  {n:"Lagos Warehouse",c:"Nigeria",r:"Africa",lat:6.45,lon:3.40,t:"warehouse",rev:0,staff:400,eff:94.2,issues:2,st:"OK",cap:"600K sqft",up:"96.5%",d:"West Africa oil & gas materials"},
  {n:"Singapore Hub",c:"Singapore",r:"SE Asia",lat:1.3,lon:103.79,t:"hq",rev:0,staff:800,eff:98.6,issues:0,st:"OK",cap:"APAC Hub",up:"99.7%",d:"APAC procurement & vendor management"},
  {n:"KL Fabrication",c:"Malaysia",r:"SE Asia",lat:3.14,lon:101.69,t:"factory",rev:5600,staff:2200,eff:94.8,issues:2,st:"OK",cap:"25K tons/yr",up:"97.4%",d:"RAPID project heat exchangers & modules"},
  {n:"Shanghai Sourcing",c:"China",r:"E. Asia",lat:31.23,lon:121.47,t:"warehouse",rev:0,staff:600,eff:96.8,issues:1,st:"OK",cap:"1.2M sqft",up:"99%",d:"China sourcing & QA center"},
  {n:"Yokohama Tech",c:"Japan",r:"E. Asia",lat:35.44,lon:139.64,t:"lab",rev:1200,staff:400,eff:97.2,issues:0,st:"OK",cap:"R&D",up:"100%",d:"Advanced materials & NDT research"},
  {n:"Perth Mining",c:"Australia",r:"Oceania",lat:-31.95,lon:115.86,t:"factory",rev:3800,staff:1200,eff:95.2,issues:1,st:"OK",cap:"15K tons/yr",up:"98.4%",d:"Mining sector conveyors & crushers"},
  {n:"Dammam Pipe",c:"Saudi",r:"Mid East",lat:26.43,lon:50.10,t:"factory",rev:11200,staff:3100,eff:95.6,issues:2,st:"OK",cap:"35K tons/yr",up:"97.8%",d:"Pipe spool fabrication for ARAMCO"},
];

/* ═══════════════════ SUPPLIERS (20) ═══════════════════ */
const SUPS=[
  {n:"POSCO Steel",c:"S. Korea",lat:35.54,lon:129.31,risk:22,lead:18,fill:97.2,otd:96.8,cat:"Heavy Steel",tier:"T1",val:45e6},
  {n:"Nippon Steel",c:"Japan",lat:33.88,lon:130.88,risk:15,lead:21,fill:98.5,otd:98.1,cat:"Heavy Steel",tier:"T1",val:62e6},
  {n:"ArcelorMittal",c:"Luxembourg",lat:49.61,lon:6.13,risk:28,lead:24,fill:94.8,otd:93.4,cat:"Heavy Steel",tier:"T1",val:38e6},
  {n:"Tenaris Pipes",c:"Italy",lat:45.46,lon:9.19,risk:18,lead:16,fill:96.4,otd:97.2,cat:"Pipe",tier:"T1",val:28e6},
  {n:"Vallourec",c:"France",lat:48.86,lon:2.35,risk:32,lead:22,fill:92.8,otd:91.6,cat:"Pipe",tier:"T1",val:22e6},
  {n:"Siemens Energy",c:"Germany",lat:52.52,lon:13.41,risk:12,lead:30,fill:98.8,otd:97.5,cat:"Electrical",tier:"T1",val:55e6},
  {n:"ABB Power",c:"Switzerland",lat:47.55,lon:7.59,risk:10,lead:28,fill:99.1,otd:98.4,cat:"Electrical",tier:"T1",val:48e6},
  {n:"Emerson Process",c:"USA",lat:38.63,lon:-90.24,risk:14,lead:20,fill:97.6,otd:96.9,cat:"Valves",tier:"T1",val:34e6},
  {n:"Flowserve",c:"USA",lat:32.78,lon:-96.80,risk:19,lead:18,fill:96.2,otd:95.8,cat:"Valves",tier:"T1",val:26e6},
  {n:"Yokogawa",c:"Japan",lat:35.68,lon:139.77,risk:11,lead:25,fill:98.9,otd:98.6,cat:"Instrumentation",tier:"T1",val:18e6},
  {n:"Endress+Hauser",c:"Germany",lat:47.63,lon:7.67,risk:16,lead:22,fill:97.4,otd:96.5,cat:"Instrumentation",tier:"T1",val:15e6},
  {n:"Jotun Coatings",c:"Norway",lat:59.13,lon:10.22,risk:20,lead:14,fill:95.8,otd:94.2,cat:"Coatings",tier:"T2",val:8e6},
  {n:"ESAB Welding",c:"Sweden",lat:57.71,lon:11.97,risk:24,lead:12,fill:94.2,otd:93.8,cat:"Welding",tier:"T2",val:6e6},
  {n:"Lincoln Electric",c:"USA",lat:41.5,lon:-81.68,risk:17,lead:10,fill:96.8,otd:97.1,cat:"Welding",tier:"T2",val:7.5e6},
  {n:"Tata Steel",c:"India",lat:22.80,lon:86.20,risk:25,lead:8,fill:95.4,otd:94.8,cat:"Structural",tier:"T1",val:42e6},
  {n:"JSW Steel",c:"India",lat:15.42,lon:73.98,risk:30,lead:6,fill:93.6,otd:92.4,cat:"Structural",tier:"T2",val:32e6},
  {n:"Nexans Cables",c:"France",lat:48.88,lon:2.33,risk:21,lead:20,fill:95.2,otd:94.6,cat:"Cabling",tier:"T2",val:12e6},
  {n:"Prysmian",c:"Italy",lat:45.47,lon:9.17,risk:18,lead:22,fill:96.4,otd:95.8,cat:"Cabling",tier:"T1",val:16e6},
  {n:"RHI Magnesita",c:"Austria",lat:47.07,lon:15.44,risk:35,lead:30,fill:91.4,otd:88.6,cat:"Refractory",tier:"T2",val:5e6},
  {n:"Vesuvius",c:"UK",lat:51.51,lon:-0.13,risk:28,lead:28,fill:93.2,otd:91.8,cat:"Refractory",tier:"T2",val:4.5e6},
];

/* ═══════════════════ LARGER DATASETS ═══════════════════ */
const PO_ST=["Open","Confirmed","In Transit","At Port","Customs","Received","Delayed","Cancelled"];
const DESTS=["Hazira","Chennai","Jubail","Houston","Aberdeen","Abu Dhabi","Sohar","Perth","KL","Dammam"];
const MATS=["SA516 Plate","316L SS Pipe","Inconel 625","CS Elbow","RTJ Flange","Control Valve","Cable Tray","Welding Rod E7018","Refractory Brick","MOV Actuator","Thermocouple K","Gasket Set","SS316 Plate","Alloy 825 Tube","Chrome Moly Pipe","Instrument Cable","Paint Epoxy","Bolting Set B7","Insulation Mat","Structural Beam"];
const POS=Array.from({length:400},(_,i)=>{const sup=SUPS[i%SUPS.length];const qty=ri(10,800);const unit=rf(80,12000);const st=pick(PO_ST);return{id:"PO-"+(300000+i),sup:sup.n,cat:sup.cat,mat:pick(MATS),qty,total:+(qty*unit).toFixed(0),status:st,pri:pick(["Critical","High","Medium","Low"]),eld:sup.lead,ald:st==="Delayed"?sup.lead+ri(5,25):sup.lead+ri(-3,3),dest:pick(DESTS)}});
const CARRIERS=["Maersk","MSC","CMA CGM","Hapag-Lloyd","Evergreen","COSCO","Yang Ming","ONE","ZIM","HMM"];
const SH_ST=["Picked Up","In Transit","At Port","Customs","Out for Delivery","Delivered","Delayed","Exception"];
const SHIPS=Array.from({length:300},(_,i)=>{const o=FAC[ri(0,FAC.length-1)];const d=FAC[ri(0,FAC.length-1)];const dist=Math.max(100,Math.floor(Math.sqrt((o.lat-d.lat)**2+(o.lon-d.lon)**2)*68));const st=pick(SH_ST);return{id:"SHP-"+(200000+i),carrier:pick(CARRIERS),mode:pick(["Ocean FCL","Ocean LCL","Air","Breakbulk","Heavy Lift","Project Cargo","Rail","Road FTL"]),oN:o.n,dN:d.n,status:st,dist,cost:Math.max(1500,Math.floor(dist*rf(2,14)+ri(500,8000))),wt:ri(500,120000),transit:ri(2,60),onTime:st!=="Delayed"&&st!=="Exception"&&R()>0.12,cont:ri(1,60)}});
const INV=Array.from({length:400},(_,i)=>{const fac=pick(FAC.filter(f=>f.t==="warehouse"||f.t==="factory"));const oh=ri(0,12000);const rp=ri(500,4000);const ss=Math.floor(rp*0.5);return{id:"INV-"+String(i+1).padStart(4,"0"),fac:fac.n,mat:pick(MATS),oh,rp,ss,status:oh<=0?"Stockout":oh<ss?"Critical":oh<rp?"Low":oh>rp*3?"Overstock":"Healthy",val:oh*rf(10,500)}});
const RUNS=Array.from({length:200},(_,i)=>{const fac=pick(FAC.filter(f=>f.t==="factory"));const planned=ri(50,3000);const actual=Math.floor(planned*rf(0.75,1.02));return{id:"RUN-"+String(i+1).padStart(4,"0"),plant:fac.n,prod:pick(["Pressure Vessel","Heat Exchanger","Pipe Spool","Structural Module","Column Section","Jacket Leg","Topside Module","Valve Assembly","Condenser","Reactor","Separator","Deaerator"]),planned,actual,oee:rf(65,98,1),scrap:ri(0,Math.floor(planned*0.06)),quality:rf(90,99.9,1),status:pick(["Completed","Running","Scheduled","Paused"]),weld:rf(85,99.8,1),ndt:rf(87,99.9,1)}});

const ALERTS=[
  {sev:"CRITICAL",msg:"Jubail Modular - Crane #7 hydraulic failure, 2 modules delayed",time:"12 min ago",cat:"Equipment"},
  {sev:"CRITICAL",msg:"SA516 Plate stockout at Chennai Heavy - 14 POs affected",time:"28 min ago",cat:"Material"},
  {sev:"HIGH",msg:"Pithampur Steel - Line 3 maintenance overrun by 48hrs",time:"1 hr ago",cat:"Operations"},
  {sev:"HIGH",msg:"Shanghai customs hold on 3 electrical shipments",time:"2 hrs ago",cat:"Logistics"},
  {sev:"HIGH",msg:"RHI Magnesita - delivery 18 days late, risk score 35",time:"3 hrs ago",cat:"Supplier"},
  {sev:"MEDIUM",msg:"Aberdeen Subsea - NDT rework required on weld batch W-4521",time:"4 hrs ago",cat:"Quality"},
  {sev:"MEDIUM",msg:"Mundra Warehouse utilization at 94% - approaching capacity",time:"5 hrs ago",cat:"Warehouse"},
  {sev:"LOW",msg:"Yokohama Tech lab calibration due in 7 days",time:"6 hrs ago",cat:"Maintenance"},
];

const ROUTES=[
  {f:"Hazira Works",t:"Jubail Modular",st:"In Transit",cargo:"Process Modules",w:"4,200 MT",eta:"14 days"},
  {f:"Chennai Heavy",t:"Ras Al Khair",st:"In Transit",cargo:"Heat Exchangers",w:"1,800 MT",eta:"18 days"},
  {f:"POSCO Steel",t:"Hazira Works",st:"At Port",cargo:"SA516 Plate",w:"8,500 MT",eta:"3 days"},
  {f:"Nippon Steel",t:"Chennai Heavy",st:"Customs",cargo:"Clad Steel",w:"3,200 MT",eta:"5 days"},
  {f:"Houston EPC",t:"Aberdeen Subsea",st:"In Transit",cargo:"Subsea Trees",w:"650 MT",eta:"21 days"},
  {f:"Shanghai",t:"Mundra WH",st:"Delayed",cargo:"Electrical Equip",w:"2,100 MT",eta:"OVERDUE"},
  {f:"Siemens Energy",t:"Hazira Works",st:"In Transit",cargo:"Transformers",w:"420 MT",eta:"12 days"},
  {f:"Aberdeen Subsea",t:"Rotterdam DC",st:"In Transit",cargo:"Umbilicals",w:"1,200 MT",eta:"4 days"},
  {f:"Tata Steel",t:"Pithampur Steel",st:"Delayed",cargo:"Structural Beam",w:"6,800 MT",eta:"OVERDUE"},
  {f:"Dammam Pipe",t:"Abu Dhabi",st:"In Transit",cargo:"Pipe Spools",w:"2,600 MT",eta:"6 days"},
];

const MAT_S=[{n:"SA516 Plate",s:"Critical",v:14,t:-12},{n:"316L SS Pipe",s:"Tight",v:28,t:-4},{n:"Inconel 625",s:"Critical",v:8,t:-18},{n:"Welding Cons.",s:"OK",v:62,t:3},{n:"Control Valves",s:"Tight",v:32,t:-6},{n:"Electrical Cable",s:"OK",v:55,t:2},{n:"Refractory",s:"Tight",v:24,t:-8},{n:"CS Flanges",s:"Surplus",v:78,t:8},{n:"Chrome Moly",s:"Critical",v:11,t:-15},{n:"Instrument Cable",s:"OK",v:48,t:1}];

/* ═══════════════════ COMPUTED METRICS ═══════════════════ */
const SM=(()=>{const facs=FAC.filter(x=>x.t==="factory");const rev=FAC.reduce((s,x)=>s+(x.rev||0),0);const staff=FAC.reduce((s,x)=>s+x.staff,0);const eff=+(facs.reduce((s,x)=>s+x.eff,0)/facs.length).toFixed(1);const totalPO=POS.reduce((a,p)=>a+p.total,0);const otd=+((SHIPS.filter(s=>s.onTime).length/SHIPS.length)*100).toFixed(1);const avgOEE=+(RUNS.reduce((a,r)=>a+r.oee,0)/RUNS.length).toFixed(1);const critStock=INV.filter(r=>r.status==="Critical"||r.status==="Stockout").length;const freight=SHIPS.reduce((a,s)=>a+s.cost,0);const avgFill=+(SUPS.reduce((a,s)=>a+s.fill,0)/SUPS.length).toFixed(1);const avgWeld=+(RUNS.reduce((a,r)=>a+r.weld,0)/RUNS.length).toFixed(1);const avgNDT=+(RUNS.reduce((a,r)=>a+r.ndt,0)/RUNS.length).toFixed(1);const bR={};FAC.forEach(x=>{if(!bR[x.r])bR[x.r]={name:x.r,rev:0,n:0,iss:0,staff:0};bR[x.r].rev+=x.rev||0;bR[x.r].n++;bR[x.r].iss+=x.issues;bR[x.r].staff+=x.staff});const delayed=SHIPS.filter(s=>s.status==="Delayed"||s.status==="Exception").length;const highRisk=SUPS.filter(s=>s.risk>25).length;return{rev,staff,eff,totalPO,otd,avgOEE,critStock,freight,avgFill,avgWeld,avgNDT,bR:Object.values(bR).sort((a,b)=>b.rev-a.rev),top:FAC.filter(x=>x.rev>0).sort((a,b)=>b.rev-a.rev).slice(0,12),delayed,highRisk,totalShips:SHIPS.length,totalPOs:POS.length,totalInv:INV.length,totalRuns:RUNS.length}})();

/* Pie data from real PO statuses */
const PO_PIE=PO_ST.map((s,i)=>({name:s,value:POS.filter(p=>p.status===s).length,fill:PAL[i%PAL.length]}));
/* Shipment mode breakdown */
const MODE_PIE=(()=>{const m={};SHIPS.forEach(s=>{m[s.mode]=(m[s.mode]||0)+1});return Object.entries(m).map(([k,v],i)=>({name:k,value:v,fill:PAL[i%PAL.length]}))})();
/* Carrier bar from real data */
const CARRIER_BAR=CARRIERS.map(c=>({name:c.substring(0,7),count:SHIPS.filter(s=>s.carrier===c).length,onTime:SHIPS.filter(s=>s.carrier===c&&s.onTime).length}));
/* Inventory status for funnel */
const INV_FUNNEL=["Healthy","Low","Critical","Stockout","Overstock"].map((s,i)=>({name:s,value:INV.filter(x=>x.status===s).length,fill:["#34d399","#fbbf24","#fb7185","#ff1744","#a78bfa"][i]}));
/* OEE by plant for radial bar */
const OEE_RADIAL=FAC.filter(f=>f.t==="factory").slice(0,8).map((f,i)=>{const runs=RUNS.filter(r=>r.plant===f.n);const oee=runs.length?+(runs.reduce((a,r)=>a+r.oee,0)/runs.length).toFixed(1):rf(78,96,1);return{name:f.n.substring(0,10),oee,fill:oee>92?"#34d399":oee>85?"#fbbf24":"#fb7185"}});
/* Monthly production from real data */
const PROD_MO=MO.map((m,idx)=>{const runs=RUNS.slice(idx*16,(idx+1)*16);const out=runs.reduce((a,r)=>a+r.actual,0)||ri(3000,7000);const scrap=runs.reduce((a,r)=>a+r.scrap,0)||ri(50,200);const weld=runs.length?+(runs.reduce((a,r)=>a+r.weld,0)/runs.length).toFixed(1):rf(90,98,1);const ndt=runs.length?+(runs.reduce((a,r)=>a+r.ndt,0)/runs.length).toFixed(1):rf(91,99,1);return{name:m,out,scrap,weld,ndt,def:Math.round(scrap/(out||1)*100*10)/10}});
/* Supplier scatter from real data */
const SUP_SCATTER=SUPS.map(s=>({name:s.n.substring(0,10),risk:s.risk,fill:s.fill,otd:s.otd,val:s.val/1e6}));
/* Region radar from real facility data */
const REG_RADAR=SM.bR.map(r=>({name:r.name,rev:Math.round(r.rev/1000),sites:r.n,staff:Math.round(r.staff/1000),health:Math.round(100-r.iss*3)}));
/* PO priority funnel */
const PRI_DATA=["Critical","High","Medium","Low"].map((p,i)=>({name:p,value:POS.filter(x=>x.pri===p).length,fill:["#ff1744","#ffab00","#38bdf8","#34d399"][i]}));
/* Cost trend from real freight data */
const COST_MO=MO.map((m,i)=>{const sh=SHIPS.slice(i*25,(i+1)*25);return{name:m,freight:sh.reduce((a,s)=>a+s.cost,0)||ri(80000,200000),poVal:Math.round(POS.slice(i*33,(i+1)*33).reduce((a,p)=>a+p.total,0)/1000)||ri(5000,15000),inv:Math.round(INV.slice(i*33,(i+1)*33).reduce((a,x)=>a+x.val,0)/1000)||ri(8000,20000)}});
/* Shipment status counts */
const shC={};SHIPS.forEach(s=>{shC[s.status]=(shC[s.status]||0)+1});
/* Inventory value by material */
const INV_BY_MAT=(()=>{const m={};INV.forEach(x=>{m[x.mat]=(m[x.mat]||0)+x.val});return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v],i)=>({name:k.substring(0,12),value:Math.round(v/1000),fill:PAL[i%PAL.length]}))})();

const TICKER=["\u26A1 Hazira Works \u2014 120K ton module dispatched to ARAMCO","\uD83D\uDEA8 Chennai Heavy \u2014 Column C-4502 hydro-test PASSED","\uD83D\uDCE6 Jubail Modular \u2014 Q4 output target +8%","\u2705 Vadodara Valve \u2014 99.4% quality, zero NCR 6mo","\u26A0\uFE0F Pithampur \u2014 Line 3 maintenance overrun","\uD83C\uDF10 POSCO shipment cleared Mumbai customs","\uD83D\uDCCA L&T ES revenue crosses $"+Math.round(SM.rev/1000)+"B","\uD83D\uDD2C Bangalore R&D \u2014 Digital Twin v3.2 deployed","\uD83C\uDFED Abu Dhabi \u2014 Platform P-47 jacket lift done","\uD83D\uDCC8 OTD improved to "+SM.otd+"%","\uD83D\uDEA2 Kattupalli \u2014 MV Industrial Pioneer loaded","\u26FD Houston EPC \u2014 LNG Train 4 ahead of schedule"];

const f$=n=>{if(!n)return"\u2014";if(n>=1e9)return"$"+(n/1e9).toFixed(1)+"B";if(n>=1e6)return"$"+(n/1e6).toFixed(1)+"M";if(n>=1e3)return"$"+(n/1e3).toFixed(1)+"K";return"$"+n};
const fN=n=>{if(n>=1e6)return(n/1e6).toFixed(1)+"M";if(n>=1e3)return(n/1e3).toFixed(1)+"K";return""+n};
const FU="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=Source+Code+Pro:wght@300;400;500;600;700&family=Quicksand:wght@300;400;500;600;700&family=Nunito:wght@300;400;500;600;700&family=Fira+Code:wght@300;400;500;600;700&family=VT323&family=Playfair+Display:wght@400;500;600;700;800;900&family=Cormorant+Garamond:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap";

/* ═══════════════════ MAP UTILITIES ═══════════════════ */
function ld(){[FU,"https://unpkg.com/maplibre-gl@5.17.0/dist/maplibre-gl.css"].forEach(function(u){if(!document.querySelector('link[href="'+u+'"]')){var l=document.createElement("link");l.rel="stylesheet";l.href=u;document.head.appendChild(l)}});return new Promise(function(r){if(window.maplibregl)return r();var s=document.createElement("script");s.src="https://unpkg.com/maplibre-gl@5.17.0/dist/maplibre-gl.js";s.onload=r;s.onerror=r;document.head.appendChild(s)});}

/* ═══════════════════ SMALL COMPONENTS ═══════════════════ */
function CT({active,payload,label}){if(!active||!payload||!payload.length)return null;return(<div style={{background:"rgba(6,10,20,.94)",backdropFilter:"blur(14px)",border:"1px solid rgba(0,229,255,.15)",borderRadius:7,padding:"8px 12px",fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>{label?<div style={{color:"#99a",marginBottom:3,fontWeight:700,fontSize:9,letterSpacing:1}}>{label}</div>:null}{payload.map(function(p,i){return <div key={i} style={{color:p.color||"#0ef",display:"flex",gap:5,alignItems:"center",marginBottom:1}}><span style={{width:5,height:5,borderRadius:"50%",background:p.color,flexShrink:0}}/>{p.name}: <b>{typeof p.value==="number"?(p.value>=1e3?fN(p.value):p.value):p.value}</b></div>})}</div>);}

function RingGauge({val,max,label,color,size,T}){var mx=max||100,sz=size||50;var p=Math.min(val,mx)/mx,ci=2*Math.PI*(sz/2-4);return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><svg width={sz} height={sz} style={{transform:"rotate(-90deg)"}}><circle cx={sz/2} cy={sz/2} r={sz/2-4} fill="none" stroke="rgba(255,255,255,.04)" strokeWidth={3}/><circle cx={sz/2} cy={sz/2} r={sz/2-4} fill="none" stroke={color} strokeWidth={3} strokeDasharray={ci} strokeDashoffset={ci-p*ci} strokeLinecap="round" style={{transition:"stroke-dashoffset 1.2s ease"}}/><text x="50%" y="50%" textAnchor="middle" dy=".35em" fontSize={sz*0.22} fontWeight={700} fill={T.tx} fontFamily={T.mn} style={{transform:"rotate(90deg)",transformOrigin:"center"}}>{val}</text></svg>{label?<div style={{fontSize:7,color:T.dm,fontFamily:T.mn,letterSpacing:1.2}}>{label}</div>:null}</div>);}

function HalfGauge({val,max,label,color,T}){var mx=max||100;var pct=Math.min(val,mx)/mx;var r=35,ci=Math.PI*r;return(<div style={{textAlign:"center"}}><svg width={80} height={50} viewBox="0 0 80 50"><path d={`M 5 45 A ${r} ${r} 0 0 1 75 45`} fill="none" stroke="rgba(255,255,255,.04)" strokeWidth={5} strokeLinecap="round"/><path d={`M 5 45 A ${r} ${r} 0 0 1 75 45`} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeDasharray={ci} strokeDashoffset={ci-pct*ci} style={{transition:"stroke-dashoffset 1.2s ease"}}/><text x="40" y="42" textAnchor="middle" fontSize="14" fontWeight="700" fill={T.tx} fontFamily={T.mn}>{val}%</text></svg>{label?<div style={{fontSize:7,color:T.dm,fontFamily:T.mn,letterSpacing:1,marginTop:-2}}>{label}</div>:null}</div>);}

function Spark({data,color,w,h}){var W=w||80,H=h||18;if(!data||!data.length)return null;var mx=Math.max(...data),mn=Math.min(...data),rg=mx-mn||1;var pts=data.map((v,i)=>((i/(data.length-1))*W)+","+(H-((v-mn)/rg)*H)).join(" ");var id="sp"+Math.random().toString(36).substr(2,4);return(<svg width={W} height={H}><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".2"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs><polygon points={"0,"+H+" "+pts+" "+W+","+H} fill={"url(#"+id+")"}/><polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} opacity={.85}/></svg>);}

function StatusDot({status,T}){var m={Healthy:T.a2,Low:T.wr,Critical:T.dg,Stockout:T.dg,Open:T.ac,Confirmed:T.a2,"In Transit":T.ac,Received:T.a2,Delayed:T.dg,Cancelled:T.dm,"Picked Up":T.ac,"At Port":T.pr,Customs:T.wr,"Out for Delivery":T.a2,Delivered:T.a2,Exception:T.dg,Running:T.ac,Completed:T.a2,Scheduled:T.ac,Paused:T.wr};var c=m[status]||T.dm;return <span style={{display:"inline-flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:c,boxShadow:"0 0 6px "+c+"60",flexShrink:0}}/><span style={{color:c,fontSize:8,fontWeight:700}}>{status}</span></span>;}

function RiskBar({score,T,w}){var c=score>65?T.dg:score>40?T.wr:T.a2;return <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:w||50,height:5,background:T.ac+"10",borderRadius:3,overflow:"hidden"}}><div style={{width:score+"%",height:"100%",background:"linear-gradient(90deg,"+T.a2+","+c+")",borderRadius:3}}/></div><span style={{fontSize:7,color:c,fontWeight:700}}>{score}</span></div>;}

function G({children,title,glow,delay,icon,badge,style:sx,T}){var d=delay||0;return(<div style={Object.assign({background:T.cardBg,backdropFilter:"blur(20px) saturate(1.3)",WebkitBackdropFilter:"blur(20px) saturate(1.3)",border:"1px solid "+T.cardBorder,borderRadius:9,padding:"8px 10px",position:"relative",overflow:"hidden",animation:"hu .6s ease "+d+"ms both",boxShadow:T.glow?"0 0 22px rgba(0,0,0,.15), inset 0 1px 0 rgba(255,255,255,.03)":"0 2px 12px rgba(0,0,0,.08)",display:"flex",flexDirection:"column"},sx||{})}>{T.glow?<div style={{position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(90deg,transparent,"+(glow||T.ac)+"30,transparent)"}}/>:null}{title?<div style={{fontSize:9,fontWeight:700,color:glow||T.ac,letterSpacing:2,marginBottom:4,fontFamily:T.hd,textTransform:"uppercase",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}><div style={{display:"flex",alignItems:"center",gap:4}}>{icon?<span style={{fontSize:10}}>{icon}</span>:null}{title}</div>{badge?<span style={{fontSize:7,color:T.mt,padding:"2px 6px",background:T.ac+"12",borderRadius:4,fontFamily:T.mn,fontWeight:600}}>{badge}</span>:null}</div>:null}<div style={{flex:1,minHeight:0,overflow:"hidden"}}>{children}</div></div>);}

function TickerBar({T}){var ref=useRef(0);var[,setTick]=useState(0);useEffect(function(){var id=setInterval(function(){ref.current-=0.5;setTick(t=>t+1)},30);return ()=>clearInterval(id)},[]);var items=TICKER.concat(TICKER);if(ref.current<-(TICKER.length*400))ref.current=0;return(<div style={{overflow:"hidden",width:"100%",height:22,position:"relative"}}><div style={{display:"flex",gap:60,position:"absolute",left:0,top:0,transform:"translateX("+ref.current+"px)",whiteSpace:"nowrap",willChange:"transform"}}>{items.map((t,i)=><span key={i} style={{fontFamily:T.mn,fontSize:9,color:T.tx,letterSpacing:.8,opacity:.85,flexShrink:0}}>{t}</span>)}</div></div>);}

/* ═══════════════════ LOCATION DETAIL PANEL ═══════════════════ */
function LocPanel({fac,T,onClose}){
if(!fac)return null;
var col=TC[fac.t]||T.ac;var stCol=fac.st==="OK"?T.a2:T.dg;
/* Real data for this facility */
var facPOs=POS.filter(p=>p.dest===fac.n.split(" ")[0]||p.sup===fac.n);
var facShips=SHIPS.filter(s=>s.oN===fac.n||s.dN===fac.n);
var facInv=INV.filter(i=>i.fac===fac.n);
var facRuns=RUNS.filter(r=>r.plant===fac.n);
var facOEE=facRuns.length?+(facRuns.reduce((a,r)=>a+r.oee,0)/facRuns.length).toFixed(1):0;
var facWeld=facRuns.length?+(facRuns.reduce((a,r)=>a+r.weld,0)/facRuns.length).toFixed(1):0;
/* Pie: Inventory status at this facility */
var invPie=["Healthy","Low","Critical","Stockout"].map((s,i)=>({name:s,value:facInv.filter(x=>x.status===s).length||0,fill:["#34d399","#fbbf24","#fb7185","#ff1744"][i]})).filter(x=>x.value>0);
/* Bar: Run output if factory */
var runBar=facRuns.slice(0,8).map((r,i)=>({name:r.prod.substring(0,8),actual:r.actual,planned:r.planned}));
/* Sparklines */
var sp1=MO.map((_,i)=>Math.round(fac.eff-4+Math.random()*8));
var sp2=MO.map((_,i)=>Math.round((fac.rev||200)/12*(0.75+Math.random()*0.5)));
return(
<div style={{position:"fixed",top:68,right:350,zIndex:25,pointerEvents:"auto",animation:"slideIn .3s ease",width:440,maxWidth:"35vw",maxHeight:"calc(100vh - 80px)",overflow:"auto"}}>
<div style={{background:T.gl,backdropFilter:"blur(28px) saturate(1.4)",border:"1px solid "+col+"20",borderRadius:12,overflow:"hidden",boxShadow:"0 16px 48px rgba(0,0,0,.4)"}}>
<div style={{padding:"12px 16px 10px",position:"relative",background:"linear-gradient(135deg,"+col+"0c,transparent 60%)",borderBottom:"1px solid "+col+"12"}}>
<button onClick={onClose} style={{position:"absolute",right:10,top:10,border:"1px solid "+T.cardBorder,background:T.btnBg,color:T.mt,width:24,height:24,borderRadius:6,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700}}>{"\u2715"}</button>
<div style={{display:"flex",alignItems:"center",gap:10}}>
<div style={{width:32,height:32,borderRadius:7,background:col+"10",border:"1.5px solid "+col+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{TI[fac.t]||"\u2699"}</div>
<div><div style={{fontFamily:T.hd,fontSize:15,fontWeight:700,letterSpacing:2,color:T.tx}}>{fac.n}</div>
<div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}><div style={{width:6,height:6,borderRadius:"50%",background:stCol,boxShadow:"0 0 6px "+stCol}}/><span style={{fontFamily:T.mn,fontSize:8,letterSpacing:1.2,color:T.mt}}>{TN[fac.t]||fac.t} {"\u00b7"} {fac.c} {"\u00b7"} {fac.r}</span></div></div></div></div>
<div style={{padding:"6px 16px",fontSize:10,lineHeight:1.6,color:T.mt,fontFamily:T.by,borderBottom:"1px solid "+T.cardBorder}}>{fac.d}</div>
{/* KPI Grid */}
<div style={{padding:"8px 16px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,gap:6}}>
{[{l:"REVENUE",v:f$(fac.rev),c:T.a2},{l:"EFFICIENCY",v:fac.eff+"%",c:fac.eff>96?T.a2:fac.eff>92?T.wr:T.dg},{l:"STAFF",v:fN(fac.staff),c:T.pr},{l:"ISSUES",v:fac.issues,c:fac.issues>4?T.dg:fac.issues>1?T.wr:T.a2},{l:"UPTIME",v:fac.up,c:T.ac},{l:"CAPACITY",v:fac.cap||"\u2014",c:T.mt}].map((s,i)=>(
<div key={i} style={{textAlign:"center",padding:"6px 3px",background:T.ac+"06",borderRadius:6,border:"1px solid "+T.cardBorder}}>
<div style={{fontFamily:T.mn,fontSize:13,fontWeight:700,color:s.c,lineHeight:1}}>{s.v}</div>
<div style={{fontSize:7,letterSpacing:1.2,color:T.dm,fontFamily:T.mn,marginTop:2}}>{s.l}</div></div>))}
</div>
{/* WIDGET 1: Ring Gauges */}
<div style={{padding:"4px 16px 8px",display:"flex",justifyContent:"space-around",alignItems:"center",borderTop:"1px solid "+T.cardBorder}}>
<RingGauge val={Math.round(fac.eff)} color={fac.eff>96?T.a2:fac.eff>92?T.wr:T.dg} label="EFF%" size={52} T={T}/>
<HalfGauge val={Math.round(100-fac.issues*4)} label="HEALTH" color={fac.issues>4?T.dg:T.a2} T={T}/>
<RingGauge val={Math.round(parseFloat(fac.up))} color={T.ac} label="UPTIME" size={52} T={T}/>
{facOEE>0?<RingGauge val={Math.round(facOEE)} color={facOEE>90?T.a2:T.wr} label="OEE" size={52} T={T}/>:
<div style={{textAlign:"center"}}><div style={{width:16,height:16,borderRadius:"50%",background:stCol,margin:"0 auto",boxShadow:"0 0 10px "+stCol}}/><div style={{fontSize:7,color:T.dm,fontFamily:T.mn,marginTop:4}}>{fac.st==="OK"?"NOMINAL":"DEGRADED"}</div></div>}
</div>
{/* WIDGET 2: Inventory Pie (if any) */}
{invPie.length>0?<div style={{padding:"4px 16px 6px",borderTop:"1px solid "+T.cardBorder}}>
<div style={{fontSize:7,color:T.dm,fontFamily:T.mn,letterSpacing:1.5,marginBottom:2}}>INVENTORY STATUS ({facInv.length} items)</div>
<div style={{display:"flex",alignItems:"center",gap:8}}>
<div style={{width:80,height:80}}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={invPie} cx="50%" cy="50%" innerRadius={20} outerRadius={35} dataKey="value" strokeWidth={0}>{invPie.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Pie></PieChart></ResponsiveContainer></div>
<div style={{flex:1}}>{invPie.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:7,fontFamily:T.mn,marginBottom:2}}><span style={{width:6,height:6,borderRadius:2,background:d.fill,flexShrink:0}}/><span style={{color:T.tx}}>{d.name}</span><span style={{color:T.dm,marginLeft:"auto"}}>{d.value}</span></div>)}</div>
</div></div>:null}
{/* WIDGET 3: Production bar (if factory) */}
{runBar.length>0?<div style={{padding:"4px 16px 6px",borderTop:"1px solid "+T.cardBorder}}>
<div style={{fontSize:7,color:T.dm,fontFamily:T.mn,letterSpacing:1.5,marginBottom:2}}>PRODUCTION RUNS ({facRuns.length})</div>
<div style={{width:"100%",height:75}}><ResponsiveContainer width="100%" height="100%"><BarChart data={runBar} margin={{left:-5,right:2,top:2,bottom:0}}><CartesianGrid strokeDasharray="2 6" stroke={T.gr}/><XAxis dataKey="name" stroke={T.dm} fontSize={6} tickLine={false}/><YAxis stroke={T.dm} fontSize={6} tickLine={false}/><Tooltip content={<CT/>}/><Bar dataKey="planned" fill={T.ac+"30"} barSize={6} name="Planned"/><Bar dataKey="actual" fill={T.a2} barSize={6} name="Actual" radius={[2,2,0,0]}/></BarChart></ResponsiveContainer></div></div>:null}
{/* WIDGET 4: Sparklines */}
<div style={{padding:"4px 16px 8px",borderTop:"1px solid "+T.cardBorder}}>
<div style={{fontSize:7,color:T.dm,fontFamily:T.mn,letterSpacing:1.5,marginBottom:4}}>12-MONTH TRENDS</div>
<div style={{display:"flex",gap:10}}>
<div style={{flex:1}}><div style={{fontSize:7,color:T.dm,fontFamily:T.mn,marginBottom:2}}>EFFICIENCY</div><Spark data={sp1} color={T.a2} w={120} h={22}/></div>
<div style={{flex:1}}><div style={{fontSize:7,color:T.dm,fontFamily:T.mn,marginBottom:2}}>REVENUE</div><Spark data={sp2} color={T.ac} w={120} h={22}/></div></div></div>
{/* SC Activity */}
<div style={{padding:"4px 16px 10px",borderTop:"1px solid "+T.cardBorder}}>
<div style={{display:"flex",gap:6}}>
{[{l:"POs",v:facPOs.length,c:T.ac},{l:"Ships",v:facShips.length,c:T.pr},{l:"Inventory",v:facInv.length,c:T.a2},{l:"Runs",v:facRuns.length,c:T.wr}].map((k,i)=><div key={i} style={{flex:1,textAlign:"center",padding:"4px 2px",background:k.c+"08",borderRadius:5,border:"1px solid "+T.cardBorder}}><div style={{fontFamily:T.mn,fontSize:12,fontWeight:700,color:k.c}}>{k.v}</div><div style={{fontSize:6.5,color:T.dm}}>{k.l}</div></div>)}</div></div>
</div></div>);}

/* ═══════════════════ AGENTIC AI PANEL ═══════════════════ */
function AgentPanel({T,onNav,onClose,vis}){
var[q,setQ]=useState("");var[res,setRes]=useState(null);var[loading,setLoading]=useState(false);
var proc=useCallback(function(){if(!q.trim())return;setLoading(true);var ql=q.toLowerCase();var r={text:""};
if(ql.includes("delay")){var dl=SHIPS.filter(s=>s.status==="Delayed"||s.status==="Exception");r.text="\u26A0 "+dl.length+" delayed/exception shipments found.\n"+dl.slice(0,5).map(s=>"\u2022 "+s.carrier+" ("+s.oN+"\u2192"+s.dN+") "+s.mode+", "+fN(s.wt)+"kg").join("\n")+"\nRecommendation: Escalate to carrier ops and activate backup routes.";}
else if(ql.includes("critical")&&(ql.includes("stock")||ql.includes("inv")||ql.includes("material"))){var cr=INV.filter(i=>i.status==="Critical"||i.status==="Stockout");r.text="\u26A0 "+cr.length+" critical/stockout items across "+new Set(cr.map(x=>x.fac)).size+" facilities.\nTop items:\n"+cr.slice(0,5).map(i=>"\u2022 "+i.mat+" at "+i.fac+" (On-hand: "+fN(i.oh)+")").join("\n")+"\nAction: Trigger emergency procurement for critical materials.";}
else if(ql.includes("supplier")&&ql.includes("risk")){var rk=SUPS.filter(s=>s.risk>25).sort((a,b)=>b.risk-a.risk);r.text=rk.length+" elevated-risk suppliers (score>25):\n"+rk.map(s=>"\u2022 "+s.n+" - Risk:"+s.risk+", Fill:"+s.fill+"%, OTD:"+s.otd+"%").join("\n")+"\nAction: Initiate supplier development program and identify alternates.";}
else if(ql.includes("alert")){r.text="Active Alerts ("+ALERTS.length+"):\n"+ALERTS.map(a=>"\u2022 ["+a.sev+"] "+a.msg+" ("+a.time+")").join("\n");}
else if(ql.includes("oee")||ql.includes("production")){r.text="Plant OEE: "+SM.avgOEE+"% avg across "+SM.totalRuns+" runs.\nWeld Pass: "+SM.avgWeld+"% | NDT Pass: "+SM.avgNDT+"%\nTotal Output: "+fN(RUNS.reduce((a,r2)=>a+r2.actual,0))+" units\nScrap: "+fN(RUNS.reduce((a,r2)=>a+r2.scrap,0))+" units\nTop plant: "+SM.top[0].n+" ($"+fN(SM.top[0].rev*1000)+")";}
else if(ql.includes("otd")||ql.includes("on time")){r.text="On-Time Delivery: "+SM.otd+"% ("+SHIPS.filter(s=>s.onTime).length+"/"+SM.totalShips+")\nDelayed: "+SM.delayed+" shipments\nTarget: 95% | Gap: "+(95-SM.otd>0?(95-SM.otd).toFixed(1)+"% below":"Met!")+"\nWorst carriers: "+CARRIERS.filter(c=>{var sh=SHIPS.filter(s=>s.carrier===c);return sh.filter(s=>!s.onTime).length/sh.length>0.15}).join(", ");}
else{var mf=null;var terms=FAC.map(f=>({term:f.n.split(" ")[0].toLowerCase(),fac:f}));for(var tm of terms){if(ql.includes(tm.term)){mf=tm.fac;break;}}
if(mf){r.text="Navigating to "+mf.n+" ("+mf.c+")\nStatus: "+mf.st+" | Eff: "+mf.eff+"% | Staff: "+fN(mf.staff)+"\n"+mf.d;setTimeout(()=>onNav(mf),300);}
else{r.text="L&T Supply Chain Overview:\n\u2022 "+FAC.length+" facilities | "+SUPS.length+" suppliers\n\u2022 Revenue: "+f$(SM.rev)+" | PO Value: "+f$(SM.totalPO)+"\n\u2022 OTD: "+SM.otd+"% | OEE: "+SM.avgOEE+"%\n\u2022 "+SM.delayed+" delayed | "+SM.critStock+" stock alerts | "+SM.highRisk+" high-risk suppliers\n\nTry: 'delayed shipments', 'critical stock', 'supplier risk', 'alerts', 'OEE', or any facility name.";}}
setTimeout(()=>{setRes(r);setLoading(false)},400);setQ("");},[q,onNav]);
if(!vis)return null;
return(<div style={{position:"fixed",bottom:30,left:"50%",transform:"translateX(-50%)",zIndex:30,width:620,maxWidth:"90vw",pointerEvents:"auto",animation:"hu .4s ease"}}>
<div style={{background:T.gl,backdropFilter:"blur(28px) saturate(1.4)",border:"1px solid "+T.ac+"22",borderRadius:14,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.45)"}}>
<div style={{padding:"8px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid "+T.cardBorder,background:T.ac+"08"}}>
<div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:14}}>{"\uD83E\uDD16"}</span><span style={{fontFamily:T.hd,fontSize:10,letterSpacing:2,color:T.ac,fontWeight:700}}>NEXTERA AI COPILOT</span></div>
<button onClick={onClose} style={{background:T.btnBg,border:"1px solid "+T.btnBorder,color:T.btnTx,width:22,height:22,borderRadius:5,cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{"\u2715"}</button></div>
{res?<div style={{padding:"10px 14px",maxHeight:180,overflow:"auto"}}><pre style={{fontSize:9,color:T.tx,fontFamily:T.mn,lineHeight:1.6,whiteSpace:"pre-wrap",margin:0}}>{res.text}</pre></div>:
<div style={{padding:"10px 14px",fontSize:9,color:T.dm,fontFamily:T.mn}}>Ask about delayed shipments, critical stock, supplier risk, alerts, OTD, OEE, or navigate to any facility...</div>}
<div style={{padding:"8px 14px 10px",display:"flex",gap:8,borderTop:"1px solid "+T.cardBorder}}>
<input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")proc()}} placeholder="Type your query..."
style={{flex:1,background:T.ac+"08",border:"1px solid "+T.btnBorder,borderRadius:7,padding:"7px 12px",color:T.tx,fontSize:10,fontFamily:T.mn,outline:"none"}}/>
<button onClick={proc} disabled={loading} style={{background:"linear-gradient(135deg,"+T.ac+"35,"+T.a2+"25)",border:"1px solid "+T.ac+"40",borderRadius:7,padding:"6px 18px",color:T.ac,fontSize:9,fontWeight:700,fontFamily:T.hd,letterSpacing:2,cursor:"pointer"}}>{loading?"...":"EXECUTE"}</button></div>
<div style={{padding:"0 14px 8px",display:"flex",gap:4,flexWrap:"wrap"}}>
{["Delayed shipments","Critical stock","Supplier risk","Alerts","OEE status","Navigate Hazira","Navigate Jubail"].map((cmd,i)=><button key={i} onClick={()=>setQ(cmd)} style={{background:T.btnBg,border:"1px solid "+T.btnBorder,borderRadius:5,padding:"3px 8px",color:T.btnTx,fontSize:7,fontFamily:T.mn,cursor:"pointer",fontWeight:600}}>{cmd}</button>)}</div>
</div></div>);}

/* ═══════════════════ VIEWS ═══════════════════ */
const VIEWS=[{id:"overview",l:"COMMAND",i:"\u2B22"},{id:"procurement",l:"PROCUREMENT",i:"\u25C6"},{id:"logistics",l:"LOGISTICS",i:"\u2299"},{id:"manufacturing",l:"MFG",i:"\u2B21"},{id:"suppliers",l:"SUPPLIERS",i:"\u25C7"},{id:"warehouse",l:"WAREHOUSE",i:"\u25A3"}];

export default function App(){
var[theme,setTheme]=useState("cyber");var[time,setTime]=useState(new Date());var[sel,setSel]=useState(null);var[view,setView]=useState("overview");var[agentOpen,setAgentOpen]=useState(false);var[filter,setFilter]=useState("all");
var mapRef=useRef(null);var mcRef=useRef(null);var T=TH[theme];
useEffect(function(){var i=setInterval(()=>setTime(new Date()),1000);return()=>clearInterval(i)},[]);

/* Dynamic Styles */
useEffect(function(){var id="nf9";var s=document.getElementById(id);if(!s){s=document.createElement("style");s.id=id;document.head.appendChild(s)}
s.textContent=`
:root{--ac:${T.ac};--a2:${T.a2};--wr:${T.wr};--dg:${T.dg};--pr:${T.pr};--tx:${T.tx};--mt:${T.mt};--dm:${T.dm};--gl:${T.gl};--bd:${T.bd};--gr:${T.gr};--hd:${T.hd};--by:${T.by};--mn:${T.mn}}
*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{width:100%;height:100%;overflow:hidden;background:#000}
#nf-map{position:absolute;top:0;left:0;width:100%;height:100%}
#nf-map canvas{width:100%!important;height:100%!important}
.maplibregl-canvas-container{width:100%!important;height:100%!important}
.maplibregl-canvas{width:100%!important;height:100%!important}
@keyframes hu{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}
@keyframes pu{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes ls{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes mp{0%{transform:scale(1);opacity:.5}50%{transform:scale(1.6);opacity:0}100%{transform:scale(1);opacity:.5}}
@keyframes mkP{0%{width:8px;height:8px;opacity:.5;margin-left:-4px;margin-top:0}100%{width:40px;height:40px;opacity:0;margin-left:-20px;margin-top:-12px}}
.maplibregl-ctrl-attrib,.maplibregl-ctrl-logo,.maplibregl-ctrl-group{display:none!important}
.maplibregl-canvas{cursor:default!important}.maplibregl-grab,.maplibregl-grabbing,.maplibregl-canvas-container.maplibregl-interactive{cursor:default!important}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.ac}18;border-radius:3px}
`;},[theme,T]);

var flyTo=useCallback(function(f){var map=mapRef.current;if(!map)return;setSel(f);try{map.flyTo({center:[f.lon,f.lat],zoom:7.5,speed:1.8,curve:1.2,pitch:45,bearing:0,essential:true,padding:{top:70,bottom:40,left:200,right:800}})}catch(e){}},[]);
var resetView=useCallback(function(){setSel(null);var map=mapRef.current;if(!map)return;try{map.fitBounds([[-170,-58],[175,72]],{padding:{top:10,left:10,right:10,bottom:10},duration:1200,pitch:45,bearing:-5})}catch(e){}},[]);

/* Map Init — destination dark-matter vector style, SVG pin markers */
useEffect(function(){var cancelled=false;var map;
(async function(){
  await ld();
  if(cancelled||!window.maplibregl||!mcRef.current)return;
  map=new window.maplibregl.Map({
    container:mcRef.current,style:TH.cyber.ms,
    bounds:[[-180,-70],[180,80]],
    fitBoundsOptions:{padding:0},
    minZoom:1,maxZoom:18,pitch:40,bearing:-5,maxPitch:75,
    canvasContextAttributes:{antialias:true},fadeDuration:200,
    trackResize:true,
  });
  map.doubleClickZoom.disable();
  mapRef.current=map;
  map.on("load",function(){
    if(cancelled)return;
    FAC.forEach(function(p){
      var el=document.createElement("div");el.style.cssText="width:0;height:0;cursor:pointer;";
      var col=TC[p.t]||"#00e8ff";
      var pin=document.createElement("div");
      pin.style.cssText="position:relative;transform:translate(-50%,-100%);filter:drop-shadow(0 0 6px "+col+");color:"+col+";";
      pin.innerHTML='<div style="position:absolute;left:50%;top:-12px;transform:translateX(-50%);font-family:Orbitron,monospace;font-size:5.5px;font-weight:600;letter-spacing:1.5px;white-space:nowrap;text-shadow:0 1px 6px rgba(0,0,0,1),0 0 16px rgba(0,0,0,.7);color:'+col+';opacity:.75">'+p.n+'</div><div style="position:absolute;left:50%;top:2px;transform:translateX(-50%);width:14px;height:14px;border-radius:50%;border:1px solid '+col+';opacity:0;animation:mkP 3s ease-out infinite"></div><svg style="position:absolute;left:50%;top:0;transform:translateX(-50%)" width="10" height="32" viewBox="0 0 20 52"><defs><linearGradient id="s'+p.n.replace(/\W/g,'')+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+col+'" stop-opacity=".8"/><stop offset="100%" stop-color="'+col+'" stop-opacity=".02"/></linearGradient></defs><rect x="9" y="12" width="2" height="38" rx="1" fill="url(#s'+p.n.replace(/\W/g,'')+')" opacity=".35"/><circle cx="10" cy="8" r="4.5" fill="'+col+'" opacity=".1"/><circle cx="10" cy="8" r="2.5" fill="'+col+'" opacity=".3"/><circle cx="10" cy="8" r="1.5" fill="'+col+'"/><circle cx="10" cy="8" r=".6" fill="#fff" opacity=".7"/></svg>';
      el.appendChild(pin);
      el.addEventListener("click",function(){setSel(p);try{map.flyTo({center:[p.lon,p.lat],zoom:7.5,speed:1.8,pitch:45,padding:{top:70,bottom:40,left:200,right:800}})}catch(e){}});
      try{new window.maplibregl.Marker({element:el,anchor:"bottom"}).setLngLat([p.lon,p.lat]).addTo(map)}catch(e){}
    });
    SUPS.forEach(function(sup){
      var el=document.createElement("div");el.style.cssText="width:0;height:0;cursor:pointer;";
      var col="#f472b6";
      var pin=document.createElement("div");
      pin.style.cssText="position:relative;transform:translate(-50%,-100%);filter:drop-shadow(0 0 4px "+col+");";
      pin.innerHTML='<svg style="position:absolute;left:50%;top:0;transform:translateX(-50%)" width="7" height="22" viewBox="0 0 20 52"><circle cx="10" cy="8" r="3" fill="'+col+'" opacity=".4"/><circle cx="10" cy="8" r="1.5" fill="'+col+'"/><rect x="9" y="12" width="2" height="28" rx="1" fill="'+col+'" opacity=".15"/></svg>';
      el.appendChild(pin);
      el.addEventListener("click",function(){setSel({n:sup.n,c:sup.c,r:"",lat:sup.lat,lon:sup.lon,t:"supplier",rev:sup.val/1000,staff:0,eff:sup.fill,issues:sup.risk>50?3:1,st:sup.risk>50?"DEG":"OK",cap:sup.cat,up:sup.otd+"%",d:sup.tier+" "+sup.cat+". Risk:"+sup.risk+", Lead:"+sup.lead+"d"})});
      try{new window.maplibregl.Marker({element:el,anchor:"bottom"}).setLngLat([sup.lon,sup.lat]).addTo(map)}catch(e){}
    });
  });
  var ro=new ResizeObserver(function(){map.resize()});
  ro.observe(mcRef.current);
})();
return function(){cancelled=true;try{if(map)map.remove()}catch(e){}mapRef.current=null;};},[]);

useEffect(function(){if(mapRef.current&&mapRef.current.setStyle)try{mapRef.current.setStyle(T.ms)}catch(e){}},[theme]);
useEffect(function(){if(mcRef.current)mcRef.current.style.filter=T.mf},[theme,T]);
var filtFAC=filter==="all"?FAC:FAC.filter(f=>f.t===filter);

/* ═══════════════════ RIGHT PANEL VIEWS ═══════════════════ */
function rightPanel(){
var W="100%",H="100%";
switch(view){
case "procurement":return<>
<G title="PO OVERVIEW" icon={"\u25C6"} glow={T.ac} delay={60} T={T} badge={SM.totalPOs+""}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,marginBottom:5}}><div style={{textAlign:"center",padding:4,background:T.ac+"08",borderRadius:5}}><div style={{fontFamily:T.mn,fontSize:12,fontWeight:700,color:T.ac}}>{f$(SM.totalPO)}</div><div style={{fontSize:7,color:T.dm}}>TOTAL VALUE</div></div><div style={{textAlign:"center",padding:4,background:T.dg+"08",borderRadius:5}}><div style={{fontFamily:T.mn,fontSize:12,fontWeight:700,color:T.dg}}>{POS.filter(p=>p.status==="Delayed").length}</div><div style={{fontSize:7,color:T.dm}}>DELAYED</div></div></div><div style={{overflow:"auto",maxHeight:70}}>{POS.filter(p=>p.status==="Delayed"||p.pri==="Critical").slice(0,8).map((po,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:7,fontFamily:T.mn,padding:"2px 0",borderBottom:"1px solid "+T.cardBorder}}><span style={{color:T.tx,maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{po.sup}</span><StatusDot status={po.status} T={T}/></div>)}</div></G>
<G title="PO STATUS PIE" icon={"\uD83D\uDCCA"} glow={T.a2} delay={120} T={T} style={{height:185}}><div style={{width:W,height:H}}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={PO_PIE} cx="50%" cy="50%" innerRadius={28} outerRadius={55} dataKey="value" strokeWidth={0} label={({name,value})=>name.substring(0,4)+":"+value}>{PO_PIE.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Pie><Tooltip content={<CT/>}/></PieChart></ResponsiveContainer></div></G>
<G title="LEAD TIME TREND" icon={"\u23F1"} glow={T.wr} delay={180} T={T} style={{height:155}}><div style={{width:W,height:H}}><ResponsiveContainer width="100%" height="100%"><AreaChart data={MO.map((m,i)=>({name:m,avg:Math.round(14+Math.sin(i*0.5)*4),p90:Math.round(28+Math.cos(i*0.3)*8)}))} margin={{left:-5,right:2,top:2,bottom:0}}><defs><linearGradient id="ltg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.wr} stopOpacity={.2}/><stop offset="95%" stopColor={T.wr} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="2 6" stroke={T.gr}/><XAxis dataKey="name" stroke={T.dm} fontSize={6} tickLine={false}/><YAxis stroke={T.dm} fontSize={6} tickLine={false}/><Tooltip content={<CT/>}/><Area type="monotone" dataKey="p90" stroke={T.dg} fill={T.dg+"10"} strokeWidth={1} name="P90 Days"/><Area type="monotone" dataKey="avg" stroke={T.wr} fill="url(#ltg)" strokeWidth={1.2} name="Avg Days"/></AreaChart></ResponsiveContainer></div></G>
<G title="PO PRIORITY" icon={"\u26A0"} glow={T.dg} delay={240} T={T} style={{height:155}}><div style={{width:W,height:H}}><ResponsiveContainer width="100%" height="100%"><FunnelChart><Funnel dataKey="value" data={PRI_DATA} isAnimationActive><LabelList position="right" dataKey="name" fontSize={7} fill={T.mt}/>{PRI_DATA.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Funnel><Tooltip content={<CT/>}/></FunnelChart></ResponsiveContainer></div></G></>;

case "logistics":return<>
<G title="ACTIVE ROUTES" icon={"\uD83D\uDEA2"} glow={T.ac} delay={60} T={T} badge={ROUTES.length+""}><div style={{overflow:"auto",maxHeight:160}}>{ROUTES.map((r,i)=><div key={i} style={{padding:"3px 0",borderBottom:"1px solid "+T.cardBorder,fontSize:7,fontFamily:T.mn}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{color:T.tx}}>{r.f.substring(0,12)}{"\u2192"}{r.t.substring(0,12)}</span><StatusDot status={r.st} T={T}/></div><div style={{fontSize:7,color:T.dm,marginTop:1}}>{r.cargo} {r.w} | ETA: {r.eta}</div></div>)}</div></G>
<G title="CARRIER PERFORMANCE" icon={"\uD83D\uDCE6"} glow={T.a2} delay={120} T={T} style={{height:170}}><div style={{width:W,height:H}}><ResponsiveContainer width="100%" height="100%"><BarChart data={CARRIER_BAR.slice(0,8)} margin={{left:-5,right:2,top:2,bottom:0}}><CartesianGrid strokeDasharray="2 6" stroke={T.gr}/><XAxis dataKey="name" stroke={T.dm} fontSize={5.5} tickLine={false}/><YAxis stroke={T.dm} fontSize={6} tickLine={false}/><Tooltip content={<CT/>}/><Bar dataKey="count" fill={T.ac+"60"} barSize={7} name="Total"/><Bar dataKey="onTime" fill={T.a2} barSize={7} name="On-Time" radius={[2,2,0,0]}/></BarChart></ResponsiveContainer></div></G>
<G title="TRANSPORT MODE" icon={"\uD83D\uDE9B"} glow={T.pr} delay={180} T={T} style={{height:170}}><div style={{width:W,height:H}}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={MODE_PIE} cx="50%" cy="50%" outerRadius={52} dataKey="value" strokeWidth={0} label={({name,value})=>name.substring(0,6)+":"+value}>{MODE_PIE.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Pie><Tooltip content={<CT/>}/></PieChart></ResponsiveContainer></div></G></>;

case "manufacturing":return<>
<G title="PRODUCTION KPIs" icon={"\u2B21"} glow={T.a2} delay={60} T={T}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>{[{l:"AVG OEE",v:SM.avgOEE+"%",c:T.a2},{l:"OUTPUT",v:fN(RUNS.reduce((a,r)=>a+r.actual,0)),c:T.ac},{l:"SCRAP",v:fN(RUNS.reduce((a,r)=>a+r.scrap,0)),c:T.dg},{l:"WELD %",v:SM.avgWeld+"%",c:T.wr}].map((k,i)=><div key={i} style={{textAlign:"center",padding:4,background:k.c+"08",borderRadius:5}}><div style={{fontFamily:T.mn,fontSize:11,fontWeight:700,color:k.c}}>{k.v}</div><div style={{fontSize:7,color:T.dm}}>{k.l}</div></div>)}</div></G>
<G title="PLANT OEE RADIAL" icon={"\uD83C\uDFED"} glow={T.ac} delay={120} T={T} style={{height:198}}><div style={{width:W,height:H}}><ResponsiveContainer width="100%" height="100%"><RadialBarChart innerRadius="15%" outerRadius="90%" data={OEE_RADIAL} startAngle={180} endAngle={0}><RadialBar dataKey="oee" cornerRadius={3} label={{position:"insideStart",fontSize:7,fill:T.tx}}>{OEE_RADIAL.map((d,i)=><Cell key={i} fill={d.fill}/>)}</RadialBar><Tooltip content={<CT/>}/></RadialBarChart></ResponsiveContainer></div></G>
<G title="OUTPUT & SCRAP" icon={"\uD83D\uDCC8"} glow={T.a2} delay={180} T={T} style={{height:170}}><div style={{width:W,height:H}}><ResponsiveContainer width="100%" height="100%"><ComposedChart data={PROD_MO} margin={{left:-5,right:2,top:2,bottom:0}}><CartesianGrid strokeDasharray="2 6" stroke={T.gr}/><XAxis dataKey="name" stroke={T.dm} fontSize={6} tickLine={false}/><YAxis stroke={T.dm} fontSize={6} tickLine={false}/><Tooltip content={<CT/>}/><Area type="monotone" dataKey="out" stroke={T.a2} fill={T.a2+"10"} strokeWidth={1.2} name="Output"/><Bar dataKey="scrap" fill={T.dg+"80"} barSize={5} name="Scrap" radius={[2,2,0,0]}/></ComposedChart></ResponsiveContainer></div></G>
<G title="WELD & NDT PASS" icon={"\uD83D\uDD27"} glow={T.wr} delay={240} T={T} style={{height:155}}><div style={{width:W,height:H}}><ResponsiveContainer width="100%" height="100%"><LineChart data={PROD_MO} margin={{left:-5,right:2,top:2,bottom:0}}><CartesianGrid strokeDasharray="2 6" stroke={T.gr}/><XAxis dataKey="name" stroke={T.dm} fontSize={6} tickLine={false}/><YAxis stroke={T.dm} fontSize={6} tickLine={false} domain={[80,100]}/><Tooltip content={<CT/>}/><Line type="monotone" dataKey="weld" stroke={T.ac} strokeWidth={1.5} dot={{r:2}} name="Weld%"/><Line type="monotone" dataKey="ndt" stroke={T.a2} strokeWidth={1.5} dot={{r:2}} name="NDT%"/></LineChart></ResponsiveContainer></div></G></>;

case "suppliers":return<>
<G title="SUPPLIER RISK" icon={"\u25C7"} glow={T.dg} delay={60} T={T} badge={SUPS.length+""}><div style={{overflow:"auto",maxHeight:150}}>{SUPS.sort((a,b)=>b.risk-a.risk).map((s,i)=><div key={i} onClick={()=>flyTo({n:s.n,c:s.c,r:"",lat:s.lat,lon:s.lon,t:"supplier",rev:s.val/1000,staff:0,eff:s.fill,issues:s.risk>50?3:1,st:s.risk>50?"DEG":"OK",cap:s.cat,up:s.otd+"%",d:s.tier+" "+s.cat})} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"2.5px 0",borderBottom:"1px solid "+T.cardBorder,fontSize:7,fontFamily:T.mn,cursor:"pointer"}}><span style={{color:T.tx,maxWidth:95,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.n}</span><RiskBar score={s.risk} T={T} w={42}/></div>)}</div></G>
<G title="RISK vs FILL SCATTER" icon={"\uD83C\uDFAF"} glow={T.wr} delay={120} T={T} style={{height:185}}><div style={{width:W,height:H}}><ResponsiveContainer width="100%" height="100%"><ScatterChart margin={{left:-5,right:2,top:2,bottom:0}}><CartesianGrid strokeDasharray="2 6" stroke={T.gr}/><XAxis dataKey="risk" name="Risk" stroke={T.dm} fontSize={6} tickLine={false}/><YAxis dataKey="fill" name="Fill%" stroke={T.dm} fontSize={6} tickLine={false} domain={[88,100]}/><Tooltip content={<CT/>}/><Scatter data={SUP_SCATTER} fillOpacity={0.7}>{SUP_SCATTER.map((s,i)=><Cell key={i} fill={s.risk>30?T.dg:s.risk>20?T.wr:T.a2}/>)}</Scatter></ScatterChart></ResponsiveContainer></div></G></>;

case "warehouse":return<>
<G title="INVENTORY STATUS" icon={"\u25A3"} glow={T.a2} delay={60} T={T}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>{[{l:"TOTAL ITEMS",v:SM.totalInv,c:T.a2},{l:"STOCK ALERTS",v:SM.critStock,c:T.dg},{l:"STOCKOUTS",v:INV.filter(i=>i.status==="Stockout").length,c:T.dg},{l:"OVERSTOCK",v:INV.filter(i=>i.status==="Overstock").length,c:T.pr}].map((k,i)=><div key={i} style={{textAlign:"center",padding:4,background:k.c+"08",borderRadius:5}}><div style={{fontFamily:T.mn,fontSize:11,fontWeight:700,color:k.c}}>{k.v}</div><div style={{fontSize:7,color:T.dm}}>{k.l}</div></div>)}</div></G>
<G title="INVENTORY FUNNEL" icon={"\uD83D\uDCE6"} glow={T.wr} delay={120} T={T} style={{height:170}}><div style={{width:W,height:H}}><ResponsiveContainer width="100%" height="100%"><FunnelChart><Funnel dataKey="value" data={INV_FUNNEL} isAnimationActive><LabelList position="right" dataKey="name" fontSize={7} fill={T.mt}/>{INV_FUNNEL.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Funnel><Tooltip content={<CT/>}/></FunnelChart></ResponsiveContainer></div></G>
<G title="VALUE BY MATERIAL" icon={"\uD83D\uDCC8"} glow={T.ac} delay={180} T={T} style={{height:170}}><div style={{width:W,height:H}}><ResponsiveContainer width="100%" height="100%"><BarChart data={INV_BY_MAT} layout="vertical" margin={{left:30,right:8,top:2,bottom:0}}><CartesianGrid strokeDasharray="2 6" stroke={T.gr}/><XAxis type="number" stroke={T.dm} fontSize={6} tickLine={false}/><YAxis type="category" dataKey="name" stroke={T.dm} fontSize={5.5} tickLine={false} width={50}/><Tooltip content={<CT/>}/><Bar dataKey="value" barSize={6} radius={[0,3,3,0]} name="Value ($K)">{INV_BY_MAT.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Bar></BarChart></ResponsiveContainer></div></G></>;

/* ═══════════════════ DEFAULT: OVERVIEW — EVERY WIDGET TYPE ═══════════════════ */
default:return<>
{/* 1. ALERTS */}
<G title={"LIVE ALERTS"} icon={"\uD83D\uDEA8"} glow={T.dg} delay={40} T={T} badge={ALERTS.length+""}><div style={{overflow:"auto",maxHeight:220}}>{ALERTS.map((a,i)=>{var sevColor=a.sev==="CRITICAL"?T.dg:a.sev==="HIGH"?T.wr:a.sev==="MEDIUM"?T.ac:T.a2;return <div key={i} style={{padding:"6px 8px",marginBottom:3,borderRadius:7,background:sevColor+"08",borderLeft:"3px solid "+sevColor,fontSize:9,fontFamily:T.mn}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}><span style={{fontSize:8,padding:"1px 6px",borderRadius:3,fontWeight:700,background:sevColor+"18",color:sevColor,letterSpacing:.8}}>{a.sev}</span><span style={{fontSize:7,color:T.dm}}>{a.time}</span></div><div style={{color:T.tx,lineHeight:1.4}}>{a.msg}</div><div style={{fontSize:7,color:T.dm,marginTop:2,display:"flex",alignItems:"center",gap:4}}><span style={{width:4,height:4,borderRadius:"50%",background:sevColor,flexShrink:0}}/>{a.cat}</div></div>})}</div></G>

{/* 2. PO Status PIE */}
<G title="PO STATUS" icon={"\u25C6"} glow={T.ac} delay={80} T={T} badge={SM.totalPOs+""} style={{height:185}}><div style={{width:W,height:H}}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={PO_PIE} cx="50%" cy="50%" innerRadius={26} outerRadius={52} dataKey="value" strokeWidth={0} label={({name,value})=>name.substring(0,5)+":"+value}>{PO_PIE.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Pie><Tooltip content={<CT/>}/></PieChart></ResponsiveContainer></div></G>


{/* 4. OEE RADIAL BAR */}
<G title="PLANT OEE" icon={"\uD83C\uDFED"} glow={T.a2} delay={160} T={T} style={{height:198}}><div style={{width:W,height:H}}><ResponsiveContainer width="100%" height="100%"><RadialBarChart innerRadius="15%" outerRadius="90%" data={OEE_RADIAL} startAngle={180} endAngle={0}><RadialBar dataKey="oee" cornerRadius={3} label={{position:"insideStart",fontSize:7,fill:T.tx}}>{OEE_RADIAL.map((d,i)=><Cell key={i} fill={d.fill}/>)}</RadialBar><Tooltip content={<CT/>}/></RadialBarChart></ResponsiveContainer></div></G>

{/* 5. Cost COMPOSED (Area+Bar) */}
<G title="COST BREAKDOWN" icon={"\uD83D\uDCB0"} glow={T.wr} delay={200} T={T} style={{height:185}}><div style={{width:W,height:H}}><ResponsiveContainer width="100%" height="100%"><ComposedChart data={COST_MO} margin={{left:-5,right:2,top:2,bottom:0}}><CartesianGrid strokeDasharray="2 6" stroke={T.gr}/><XAxis dataKey="name" stroke={T.dm} fontSize={6} tickLine={false}/><YAxis stroke={T.dm} fontSize={6} tickLine={false}/><Tooltip content={<CT/>}/><Area type="monotone" dataKey="inv" stroke={T.ac} fill={T.ac+"10"} strokeWidth={1} name="Inventory $K"/><Bar dataKey="freight" fill={T.dg+"60"} barSize={5} name="Freight $K"/><Bar dataKey="poVal" fill={T.a2+"60"} barSize={5} name="PO Value $K" radius={[2,2,0,0]}/></ComposedChart></ResponsiveContainer></div></G>


{/* 7. SUPPLIER SCATTER */}
<G title="SUPPLIER RISK MAP" icon={"\u25C7"} glow={T.dg} delay={280} T={T} badge={SM.highRisk+" HIGH"} style={{height:170}}><div style={{width:W,height:H}}><ResponsiveContainer width="100%" height="100%"><ScatterChart margin={{left:-5,right:2,top:2,bottom:0}}><CartesianGrid strokeDasharray="2 6" stroke={T.gr}/><XAxis dataKey="risk" name="Risk" stroke={T.dm} fontSize={6} tickLine={false}/><YAxis dataKey="fill" name="Fill%" stroke={T.dm} fontSize={6} tickLine={false} domain={[88,100]}/><Tooltip content={<CT/>}/><Scatter data={SUP_SCATTER} fillOpacity={0.7}>{SUP_SCATTER.map((s,i)=><Cell key={i} fill={s.risk>30?T.dg:s.risk>20?T.wr:T.a2}/>)}</Scatter></ScatterChart></ResponsiveContainer></div></G>



{/* 10. TOP FACILITIES BAR */}
<G title="TOP FACILITIES" icon={"\uD83C\uDFC6"} glow={T.a2} delay={400} T={T} style={{height:170}}><div style={{width:W,height:H}}><ResponsiveContainer width="100%" height="100%"><BarChart data={SM.top.slice(0,8).map(f=>({name:f.n.substring(0,8),rev:Math.round(f.rev/1000),eff:f.eff}))} margin={{left:-5,right:2,top:2,bottom:0}}><CartesianGrid strokeDasharray="2 6" stroke={T.gr}/><XAxis dataKey="name" stroke={T.dm} fontSize={5.5} tickLine={false}/><YAxis stroke={T.dm} fontSize={6} tickLine={false}/><Tooltip content={<CT/>}/><Bar dataKey="rev" fill={T.a2} barSize={7} name="Rev $M" radius={[2,2,0,0]}/></BarChart></ResponsiveContainer></div></G>

{/* 11. Material Supply */}
<G title="MATERIAL SUPPLY" icon={"\u26A0"} glow={T.dg} delay={440} T={T}>{MAT_S.map((s,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:8,fontFamily:T.mn,padding:"2px 0"}}><span style={{color:T.tx}}>{s.n}</span><span style={{color:s.s==="Critical"?T.dg:s.s==="Tight"?T.wr:s.s==="Surplus"?T.pr:T.a2,fontWeight:700,fontSize:7}}>{s.s} {s.t>0?"+":""}{s.t}%</span></div>)}</G>
</>;}}

return(<div style={{width:"100%",height:"100%",fontFamily:T.by,color:T.tx,position:"relative",background:"#000"}}>
<div id="nf-map" ref={mcRef} style={{position:"absolute",top:0,left:0,right:0,bottom:0,width:"100%",height:"100%",zIndex:0,filter:T.mf}}/>
<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1,background:"radial-gradient(ellipse 150% 120% at 50% 50%,transparent 60%,rgba(0,0,0,.08) 85%,rgba(0,0,0,.18) 100%)"}}/>
{T.sc&&<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1,background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,232,255,.002) 2px,rgba(0,232,255,.002) 4px)",opacity:.4}}/>}
{T.brackets&&<svg style={{position:"fixed",inset:0,zIndex:2,pointerEvents:"none",width:"100%",height:"100%"}} preserveAspectRatio="none" viewBox="0 0 1920 1080"><g stroke={T.ac} strokeWidth=".5" opacity=".1" fill="none"><path d="M14 14L14 50M14 14L50 14"/><path d="M1906 14L1906 50M1906 14L1870 14"/><path d="M14 1066L14 1030M14 1066L50 1066"/><path d="M1906 1066L1906 1030M1906 1066L1870 1066"/></g></svg>}

<header style={{position:"fixed",top:0,left:0,right:0,zIndex:20,padding:"4px 16px",height:44,display:"flex",justifyContent:"space-between",alignItems:"center",background:"linear-gradient(180deg,rgba(0,0,0,.78) 0%,rgba(0,0,0,.55) 80%,rgba(0,0,0,.25) 100%)",backdropFilter:"blur(12px)",pointerEvents:"none"}}>
<div style={{display:"flex",alignItems:"center",gap:12,pointerEvents:"auto"}}>
<div style={{width:32,height:32,borderRadius:7,border:"1.5px solid "+T.ac+"30",background:"linear-gradient(135deg,"+T.ac+"15,"+T.a2+"10)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 14px "+T.ac+"18"}}><svg viewBox="0 0 24 24" fill="none" width={19} height={19}><path d="M12 2L2 7l10 5 10-5-10-5z" stroke={T.ac} strokeWidth="1.3" fill={T.ac+"15"}/><path d="M2 17l10 5 10-5" stroke={T.a2} strokeWidth="1.3"/><path d="M2 12l10 5 10-5" stroke={T.ac} strokeWidth="1.3" opacity=".5"/></svg></div>
<div><div style={{fontFamily:T.hd,fontWeight:900,letterSpacing:4,fontSize:17,color:T.ac,textShadow:"0 0 18px "+T.ac+"50, 0 0 40px "+T.ac+"20"}}>NEXTERA AI</div>
<div style={{fontWeight:500,letterSpacing:2,fontSize:7.5,color:T.mt,marginTop:1}}>L&T Engineering Services {"\u2022"} Global Command Center</div></div></div>
<div style={{display:"flex",alignItems:"center",gap:6,pointerEvents:"auto"}}>
<div style={{display:"flex",gap:2,flexWrap:"nowrap"}}>{VIEWS.map(v=><button key={v.id} onClick={()=>{setView(v.id);setSel(null)}} style={{background:view===v.id?T.btnBg:"rgba(0,0,0,.2)",border:view===v.id?"1.5px solid "+T.btnBorder:"1.5px solid "+("rgba(255,255,255,.08)"),borderRadius:5,padding:"4px 9px",color:view===v.id?T.btnTx:T.mt,fontSize:9,fontWeight:view===v.id?700:500,cursor:"pointer",fontFamily:T.mn,whiteSpace:"nowrap",letterSpacing:.5}}><span style={{marginRight:3}}>{v.i}</span>{v.l}</button>)}</div>
<button onClick={()=>setAgentOpen(!agentOpen)} style={{background:agentOpen?"linear-gradient(135deg,"+T.ac+"35,"+T.a2+"25)":T.btnBg,border:"1.5px solid "+T.btnBorder,borderRadius:6,padding:"4px 12px",color:T.btnTx,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:T.hd,letterSpacing:2,boxShadow:agentOpen?"0 0 12px "+T.ac+"20":"none"}}>{"✨"} AI COPILOT</button>
<select value={theme} onChange={e=>{setTheme(e.target.value);setSel(null)}} style={{height:28,borderRadius:5,border:"1.5px solid "+T.btnBorder,background:"rgba(0,0,0,.35)",backdropFilter:"blur(8px)",color:T.btnTx,padding:"0 10px",fontFamily:T.mn,fontSize:9,outline:"none",cursor:"pointer",fontWeight:600}}>{Object.entries(TH).map(e=><option key={e[0]} value={e[0]}>{e[1].ic} {e[1].nm}</option>)}</select>
<div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:5,height:5,borderRadius:"50%",background:T.a2,boxShadow:"0 0 5px "+T.a2,animation:"pu 2s ease infinite"}}/><span style={{fontFamily:T.mn,fontSize:8,color:T.mt,fontWeight:600}}>{time.toLocaleTimeString()}</span></div>
</div></header>

<div style={{position:"fixed",top:44,left:0,right:0,zIndex:19,pointerEvents:"none",background:"rgba(0,0,0,.40)",backdropFilter:"blur(8px)",height:22,display:"flex",alignItems:"center",borderBottom:"1px solid "+T.cardBorder,borderTop:"1px solid "+T.cardBorder}}><TickerBar T={T}/></div>

<div style={{position:"fixed",top:68,left:8,zIndex:10,display:"flex",flexDirection:"column",gap:4,width:185,pointerEvents:"auto"}}>
{[{l:"REVENUE",v:f$(SM.rev),i:"\uD83D\uDCB0",c:T.a2},{l:"PO VALUE",v:f$(SM.totalPO),i:"\u25C6",c:T.ac},{l:"ON-TIME",v:SM.otd+"%",i:"\uD83D\uDEA2",c:SM.otd>=92?T.a2:T.wr},{l:"PLANT OEE",v:SM.avgOEE+"%",i:"\u2B21",c:T.pr},{l:"FILL RATE",v:SM.avgFill+"%",i:"\uD83D\uDCE6",c:T.ac},{l:"ALERTS",v:SM.critStock+"+"+SM.delayed,i:"\u26A0",c:T.dg}].map((k,i)=><G key={i} delay={i*50} glow={k.c} T={T} style={{padding:"4px 8px"}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12}}>{k.i}</span><div><div style={{fontFamily:T.mn,fontSize:15,fontWeight:800,color:k.c,lineHeight:1}}>{k.v}</div><div style={{fontSize:7,letterSpacing:1.8,color:T.dm,fontFamily:T.hd,textTransform:"uppercase"}}>{k.l}</div></div></div></G>)}
<G title="HALF GAUGES" icon={"\uD83D\uDCCA"} glow={T.ac} delay={350} T={T}><div style={{display:"flex",justifyContent:"space-around"}}><HalfGauge val={SM.otd} label="OTD%" color={SM.otd>92?T.a2:T.wr} T={T}/><HalfGauge val={SM.avgOEE} label="OEE%" color={SM.avgOEE>88?T.a2:T.wr} T={T}/></div></G>
<G title="FILTER" icon={"\uD83D\uDD0D"} glow={T.ac} delay={380} T={T}><div style={{display:"flex",flexWrap:"wrap",gap:3}}>{[{id:"all",l:"ALL"},{id:"factory",l:"FAC"},{id:"warehouse",l:"WH"},{id:"port",l:"PORT"},{id:"lab",l:"R&D"},{id:"hq",l:"HQ"}].map(f=><button key={f.id} onClick={()=>setFilter(f.id)} style={{background:filter===f.id?T.btnBg:"rgba(0,0,0,.15)",border:"1.5px solid "+(filter===f.id?T.btnBorder:"rgba(255,255,255,.08)"),borderRadius:4,padding:"2px 6px",color:filter===f.id?T.btnTx:T.mt,fontSize:7,cursor:"pointer",fontFamily:T.mn,fontWeight:filter===f.id?700:500}}>{f.l}</button>)}</div></G>
<G title="LOCATIONS" icon={"\uD83D\uDCCD"} glow={T.ac} delay={420} badge={""+filtFAC.length} T={T} style={{maxHeight:"calc(100vh - 520px)"}}><div style={{overflow:"auto",maxHeight:"100%"}}>{filtFAC.map((f,i)=>{var isA=sel&&sel.n===f.n;return(<div key={i} onClick={()=>flyTo(f)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3px 5px",borderBottom:"1px solid "+T.cardBorder,cursor:"pointer",borderRadius:4,fontSize:8,fontFamily:T.mn,background:isA?T.ac+"14":"transparent",borderLeft:isA?"2px solid "+T.ac:"2px solid transparent"}} onMouseEnter={e=>{if(!isA)e.currentTarget.style.background=T.ac+"0a"}} onMouseLeave={e=>{if(!isA)e.currentTarget.style.background="transparent"}}><div style={{display:"flex",alignItems:"center",gap:5,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",maxWidth:120}}><span style={{fontSize:10,flexShrink:0}}>{TI[f.t]||"\u2699"}</span><span style={{color:T.tx,fontSize:7.5}}>{f.n}</span></div><span style={{fontSize:7,padding:"2px 5px",borderRadius:3,fontWeight:700,background:f.st==="OK"?T.a2+"14":T.dg+"14",color:f.st==="OK"?T.a2:T.dg}}>{f.st}</span></div>)})}<div onClick={resetView} style={{textAlign:"center",padding:"5px 0",fontSize:8,color:T.btnTx,cursor:"pointer",marginTop:3,fontWeight:700,letterSpacing:1.5,background:T.btnBg,borderRadius:4,border:"1px solid "+T.btnBorder}}>{"\u21BB"} RESET VIEW</div></div></G></div>

<div style={{position:"fixed",top:68,right:8,zIndex:10,display:"flex",flexDirection:"column",gap:5,width:340,pointerEvents:"auto",maxHeight:"calc(100vh - 62px)",overflow:"auto",paddingBottom:8}}>{rightPanel()}</div>

{!sel?<div style={{position:"fixed",bottom:28,left:195,right:350,zIndex:10,display:"flex",gap:4,pointerEvents:"auto"}}>
<div style={{flex:1,height:132}}><G title="CARRIER OTD" icon={"\uD83D\uDCE6"} glow={T.a2} delay={350} T={T} style={{height:"100%"}}><div style={{width:"100%",height:"100%"}}><ResponsiveContainer width="100%" height="100%"><BarChart data={CARRIER_BAR.slice(0,6)} margin={{left:-5,right:2,top:2,bottom:0}}><CartesianGrid strokeDasharray="2 6" stroke={T.gr}/><XAxis dataKey="name" stroke={T.dm} fontSize={6} tickLine={false}/><YAxis stroke={T.dm} fontSize={6} tickLine={false}/><Tooltip content={<CT/>}/><Bar dataKey="count" fill={T.ac+"50"} barSize={7} name="Total"/><Bar dataKey="onTime" fill={T.a2} barSize={7} name="On-Time" radius={[2,2,0,0]}/></BarChart></ResponsiveContainer></div></G></div>
<div style={{flex:1,height:132}}><G title="DEFECT RATE" icon={"\u2298"} glow={T.dg} delay={420} T={T} style={{height:"100%"}}><div style={{width:"100%",height:"100%"}}><ResponsiveContainer width="100%" height="100%"><BarChart data={PROD_MO} margin={{left:-5,right:2,top:2,bottom:0}}><CartesianGrid strokeDasharray="2 6" stroke={T.gr}/><XAxis dataKey="name" stroke={T.dm} fontSize={6} tickLine={false}/><YAxis stroke={T.dm} fontSize={6} tickLine={false}/><Tooltip content={<CT/>}/><Bar dataKey="scrap" radius={[2,2,0,0]} name="Scrap" barSize={8}>{PROD_MO.map((_,i)=><Cell key={i} fill={PROD_MO[i].scrap>100?T.dg:PROD_MO[i].scrap>60?T.wr:T.a2}/>)}</Bar></BarChart></ResponsiveContainer></div></G></div>
</div>:null}

<div style={{position:"fixed",bottom:4,left:"50%",transform:"translateX(-50%)",zIndex:15,display:"flex",gap:4,pointerEvents:"none"}}>{[{l:"IN TRANSIT",v:shC["In Transit"]||0,c:T.ac},{l:"DELAYED",v:(shC.Delayed||0)+(shC.Exception||0),c:T.dg},{l:"AT PORT",v:shC["At Port"]||0,c:T.pr},{l:"CUSTOMS",v:shC.Customs||0,c:T.wr},{l:"DELIVERED",v:shC.Delivered||0,c:T.a2}].map((k,i)=><div key={i} style={{pointerEvents:"auto",background:"rgba(0,0,0,.25)",backdropFilter:"blur(14px)",border:`1px solid ${T.bd}`,borderRadius:6,padding:"3px 10px",textAlign:"center",minWidth:65,animation:"hu .5s ease "+(500+i*60)+"ms both"}}><div style={{fontFamily:T.hd,fontSize:13,fontWeight:700,color:k.c}}>{k.v}</div><div style={{fontFamily:T.mn,fontSize:7,letterSpacing:1.2,color:T.dm,textTransform:"uppercase"}}>{k.l}</div></div>)}</div>

<LocPanel fac={sel} T={T} onClose={resetView}/>
<AgentPanel T={T} vis={agentOpen} onNav={flyTo} onClose={()=>setAgentOpen(false)}/>

<div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:12,pointerEvents:"none",padding:"0 12px 2px",display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:T.mn,fontSize:7,letterSpacing:1,color:T.dm}}>{FAC.length} NODES | {SUPS.length} SUPPLIERS | {SM.totalShips} SHIPMENTS | {SM.totalPOs} POs | {SM.totalInv} INV</span><span style={{fontFamily:T.mn,fontSize:7,letterSpacing:1,color:T.dm}}>{time.toLocaleString()}</span></div>
</div>);}
export default App1;
