import { useEffect, useState } from 'react'
import './App.css'

import {
  getDashboardStats,
  getInventoryIntelligence,
  getSalesTrend,
} from './api'


function buildSalesPath(data) {
  if (!data || data.length === 0) {
    return {
      line: '',
      area: '',
    }
  }

  const width = 700
  const height = 220
  const padding = 10

  const values = data.map((item) => item.units_sold)

  const maxValue = Math.max(...values, 1)
  const minValue = Math.min(...values)

  const range = Math.max(maxValue - minValue, 1)

  const points = data.map((item, index) => {
    const x =
      data.length === 1
        ? width / 2
        : (index / (data.length - 1)) * width

    const y =
      height -
      padding -
      ((item.units_sold - minValue) / range) *
        (height - padding * 2)

    return { x, y }
  })

  let line = `M ${points[0].x} ${points[0].y}`

  for (let i = 1; i < points.length; i++) {
    const previous = points[i - 1]
    const current = points[i]

    const controlX =
      (previous.x + current.x) / 2

    line += `
      C ${controlX} ${previous.y},
        ${controlX} ${current.y},
        ${current.x} ${current.y}
    `
  }

  const area =
    `${line} L ${width} ${height} L 0 ${height} Z`

  return {
    line,
    area,
  }
}



function App() {


    const [dashboard, setDashboard] = useState(null)
    const [intelligence, setIntelligence] = useState(null)
    const [salesTrend, setSalesTrend] = useState([])
    const [salesDays, setSalesDays] = useState(30)

    const salesPaths = buildSalesPath(salesTrend)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const dashboardData = await getDashboardStats()

        console.log('DASHBOARD DATA:', dashboardData)

        setDashboard(dashboardData)
      } catch (error) {
        console.error('DASHBOARD API FAILED:', error)
      }

      try {
        const intelligenceData = await getInventoryIntelligence()

        console.log('INTELLIGENCE DATA:', intelligenceData)

        setIntelligence(intelligenceData)
      } catch (error) {
        console.error('INTELLIGENCE API FAILED:', error)
      }
    //    const salesData = await getSalesTrend(salesDays)

    //     console.log('SALES TREND DATA:', salesData)

    //     setSalesTrend(salesData)
    }

    loadDashboard() }, [salesDays])


  useEffect(() => {
  async function loadSalesTrend() {
    try {
      const salesData = await getSalesTrend(salesDays)

      console.log('SALES TREND DATA:', salesData)

      setSalesTrend(salesData)
    } catch (error) {
      console.error('SALES TREND API FAILED:', error)
    }
  }

  loadSalesTrend()
}, [salesDays])
  //   useEffect(() => {
  //   async function testBackend() {
  //     try {
  //       const dashboard =
  //         await getDashboardStats()

  //       const intelligence =
  //         await getInventoryIntelligence()

  //       console.log(
  //         'DASHBOARD DATA:',
  //         dashboard
  //       )

  //       console.log(
  //         'INTELLIGENCE DATA:',
  //         intelligence
  //       )
  //     } catch (error) {
  //       console.error(
  //         'BACKEND CONNECTION FAILED:',
  //         error
  //       )
  //     }
  //   }

  //   testBackend()
  // }, [])




  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">SI</div>
          <div>
            <h2>Smart Inventory</h2>
            <span>Intelligence System</span>
          </div>
        </div>

        <nav>
          <button className="nav-item active">
            <span>⌂</span>
            Dashboard
          </button>

          <button className="nav-item">
            <span>▣</span>
            Products
          </button>

          <button className="nav-item">
            <span>◈</span>
            Inventory
          </button>

          <button className="nav-item">
            <span>↗</span>
            Sales
          </button>

          <button className="nav-item">
            <span>◉</span>
            Suppliers
          </button>

          <button className="nav-item">
            <span>⚙</span>
            Settings
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot"></span>
            <div>
              <strong>System Online</strong>
              <small>AI services operational</small>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">

        {/* Header */}
        <header className="topbar">
          <div>
            <p className="eyebrow">INVENTORY OVERVIEW</p>
            <h1>Good morning 👋</h1>
            <p className="subtitle">
              Here's what your inventory intelligence is telling you.
            </p>
          </div>

          <div className="header-actions">
            <button className="icon-button">⌕</button>
            <button className="notification">
              ♢
              <span></span>
            </button>
            <div className="profile">
              <div className="avatar">P</div>
              <div>
                <strong>Administrator</strong>
                <small>Inventory Manager</small>
              </div>
            </div>
          </div>
        </header>

        {/* KPI Cards */}
        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-top">
              <span>Total Products</span>
              <div className="stat-icon blue">▣</div>
            </div>
            <h2>{dashboard ? dashboard.total_products : '...'}</h2>
            <p className="positive">↑ 8.2% <span>vs last month</span></p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Inventory Value</span>
              <div className="stat-icon purple">₹</div>
            </div>
            <h2>{dashboard
                 ? `₹${dashboard.inventory_value.toLocaleString('en-IN')}`
                 : '...'}</h2>
            <p className="positive">↑ 4.6% <span>vs last month</span></p>
          </div>

          <div className="stat-card warning-card">
            <div className="stat-top">
              <span>High Risk Products</span>
              <div className="stat-icon red">!</div>
            </div>
            <h2>{intelligence
  ? intelligence.high_risk_products
  : '...'}</h2>
            <p className="negative">↑ 1 <span>needs attention</span></p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Recommended Reorder</span>
              <div className="stat-icon orange">↻</div>
            </div>
            <h2>{intelligence
  ? intelligence.total_recommended_reorder
  : '...'}</h2>
            <p className="neutral">units across inventory</p>
          </div>

        </section>

        {/* Main Grid */}
        <section className="dashboard-grid">

          {/* Sales Chart */}
          <div className="panel sales-panel">
            <div className="panel-header">
              <div>
                <h3>Sales Performance</h3>
                <p>Units sold over the last 30 days</p>
              </div>

              <select
                value={salesDays}
                onChange={(e) => setSalesDays(Number(e.target.value))}
>
                <option value={30}>Last 30 days</option>
                <option value={14}>Last 14 days</option>
                <option value={7}>Last 7 days</option>
              </select>
            </div>

            <div className="chart">
              <div className="chart-y">
                <span>15</span>
                <span>10</span>
                <span>5</span>
                <span>0</span>
              </div>

              <div className="chart-area">
                <div className="grid-line"></div>
                <div className="grid-line"></div>
                <div className="grid-line"></div>
                <div className="grid-line"></div>

                <svg
                  viewBox="0 0 700 220"
                  preserveAspectRatio="none"
                  className="sales-svg"
                >
                  <defs>
                    <linearGradient
                      id="salesGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <path
                    d={salesPaths.area}
                    fill="url(#salesGradient)"
                  />

                  <path
                    d={salesPaths.line}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3"
                  />
                </svg>

                <div className="chart-labels">
                  <span>Jul 24</span>
                  <span>Jul 29</span>
                  <span>Aug 03</span>
                  <span>Aug 08</span>
                  <span>Aug 13</span>
                  <span>Aug 18</span>
                  <span>Aug 22</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Summary */}
          <div className="panel risk-panel">
            <div className="panel-header">
              <div>
                <h3>Inventory Risk</h3>
                <p>Current stock health</p>
              </div>
              <span className="ai-badge">AI</span>
            </div>

            <div className="risk-circle">
              <div>
                <strong>78%</strong>
                <span>Healthy</span>
              </div>
            </div>

            <div className="risk-legend">
              <div>
                <span className="legend-dot high"></span>
                <span>High Risk</span>
                <strong>2</strong>
              </div>

              <div>
                <span className="legend-dot medium"></span>
                <span>Medium Risk</span>
                <strong>3</strong>
              </div>

              <div>
                <span className="legend-dot low"></span>
                <span>Healthy</span>
                <strong>7</strong>
              </div>
            </div>
          </div>

        </section>

        {/* Bottom Section */}
        <section className="bottom-grid">

          {/* Urgent Products */}
          <div className="panel table-panel">
            <div className="panel-header">
              <div>
                <h3>🚨 Urgent Reorders</h3>
                <p>Products requiring immediate attention</p>
              </div>

              <button className="view-all">View all →</button>
            </div>

            <div className="product-list">

              <div className="product-row">
                <div className="product-info">
                  <div className="product-image red-bg">🍫</div>
                  <div>
                    <strong>Chocolate Bar</strong>
                    <span>Product #4</span>
                  </div>
                </div>

                <div className="stock-info">
                  <span>Stock</span>
                  <strong>18 units</strong>
                </div>

                <div className="days danger">
                  <strong>1.6 days</strong>
                  <span>remaining</span>
                </div>

                <div className="risk-pill high-pill">HIGH</div>
              </div>

              <div className="product-row">
                <div className="product-info">
                  <div className="product-image orange-bg">🥤</div>
                  <div>
                    <strong>Cola 500ml</strong>
                    <span>Product #1</span>
                  </div>
                </div>

                <div className="stock-info">
                  <span>Stock</span>
                  <strong>85 units</strong>
                </div>

                <div className="days warning">
                  <strong>9.4 days</strong>
                  <span>remaining</span>
                </div>

                <div className="risk-pill medium-pill">MEDIUM</div>
              </div>

              <div className="product-row">
                <div className="product-info">
                  <div className="product-image blue-bg">🖱️</div>
                  <div>
                    <strong>Wireless Mouse</strong>
                    <span>Product #3</span>
                  </div>
                </div>

                <div className="stock-info">
                  <span>Stock</span>
                  <strong>42 units</strong>
                </div>

                <div className="days warning">
                  <strong>11.2 days</strong>
                  <span>remaining</span>
                </div>

                <div className="risk-pill medium-pill">MEDIUM</div>
              </div>

            </div>
          </div>

          {/* AI Recommendation */}
          <div className="panel recommendation-panel">
            <div className="recommendation-header">
              <div className="brain-icon">✦</div>
              <div>
                <h3>AI Recommendation</h3>
                <span>Based on current demand</span>
              </div>
            </div>

            <div className="recommendation-body">
              <p>
                Your inventory model predicts increased demand for
                <strong> Chocolate Bar</strong> over the coming days.
              </p>

              <div className="recommendation-number">
                <span>Recommended reorder</span>
                <strong>139 <small>units</small></strong>
              </div>

              <button className="action-button">
                Review Reorder →
              </button>
            </div>
          </div>

        </section>

        <footer>
          <span>Smart Inventory Intelligence System</span>
          <span>AI Engine • Operational</span>
        </footer>

      </main>
    </div>
  )
}

export default App