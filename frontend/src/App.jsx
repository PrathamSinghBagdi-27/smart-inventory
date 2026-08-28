import { useEffect, useState } from 'react'
import './App.css'

import {
  getDashboardStats,
  getInventoryIntelligence,
  getSalesTrend,
  getProducts,
  getCategories,
  createCategory,
  getSuppliers,
  createSupplier,
  updateProduct,
} from './api'

function buildSalesPath(data) {
  if (!data || data.length === 0) {
    return {
      line: '',
      area: '',
      points: [],
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
    points,
  }
}

function formatChartDate(dateString) {
  const date = new Date(dateString)

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
  })
}

function getChartYAxis(data) {
  if (!data || data.length === 0) {
    return [15, 10, 5, 0]
  }

  const maxValue = Math.max(
    ...data.map((item) => item.units_sold)
  )

  const roundedMax = Math.ceil(maxValue / 5) * 5

  return [
    roundedMax,
    Math.round(roundedMax * 0.66),
    Math.round(roundedMax * 0.33),
    0,
  ]
}

function App() {
  const [dashboard, setDashboard] = useState(null)
  const [intelligence, setIntelligence] = useState(null)
  const [salesTrend, setSalesTrend] = useState([])
  const [salesDays, setSalesDays] = useState(30)
  const [hoveredSale, setHoveredSale] = useState(null)
  const [showAllUrgent, setShowAllUrgent] = useState(false)
  const [products, setProducts] = useState([])
const [categories, setCategories] = useState([])
const [showAddCategory, setShowAddCategory] = useState(false)
const [newCategoryName, setNewCategoryName] = useState('')
const [categoryError, setCategoryError] = useState('')
const [activePage, setActivePage] = useState('dashboard')
const [productSearch, setProductSearch] = useState('')
const [productFilter, setProductFilter] = useState('all')
const isProductsPage = activePage === 'products'
const [showAddProduct, setShowAddProduct] = useState(false)
const [editingProduct, setEditingProduct] =
  useState(null)

const [showEditProduct, setShowEditProduct] =
  useState(false)


    const [productForm, setProductForm] = useState({
      name: '',
      sku: '',
      category_id: '',
      supplier_id: '',
      price: '',
      current_stock: '',
      reorder_level: '',
    })


const filteredProducts = products.filter((product) => {
  const search = productSearch.toLowerCase().trim()

  const matchesSearch =
    product.name.toLowerCase().includes(search) ||
    product.sku.toLowerCase().includes(search)

  const isLowStock =
    product.current_stock <= product.reorder_level

  const matchesFilter =
    productFilter === 'all' ||
    (productFilter === 'low' && isLowStock) ||
    (productFilter === 'healthy' && !isLowStock)

    

  return matchesSearch && matchesFilter
})

  const salesPaths = buildSalesPath(salesTrend)
  const chartYAxis = getChartYAxis(salesTrend)

  const chartLabels = salesTrend.map((item) =>
    formatChartDate(item.date)
  )



  const [suppliers, setSuppliers] = useState([])
const [showAddSupplier, setShowAddSupplier] =
  useState(false)

const [newSupplierName, setNewSupplierName] =
  useState('')

const [newSupplierEmail, setNewSupplierEmail] =
  useState('')

const [newSupplierPhone, setNewSupplierPhone] =
  useState('')

const [supplierError, setSupplierError] =
  useState('')


  useEffect(() => {
  async function loadSuppliers() {
    try {
      const suppliersData =
        await getSuppliers()

      console.log(
        'SUPPLIERS DATA:',
        suppliersData
      )

      setSuppliers(suppliersData)
    } catch (error) {
      console.error(
        'SUPPLIERS API FAILED:',
        error
      )
    }
  }

  loadSuppliers()
}, [])

  useEffect(() => {
  async function loadProducts() {
    try {
      const productsData = await getProducts()

      console.log(
        'PRODUCTS DATA:',
        productsData
      )

      setProducts(productsData)
    } catch (error) {
      console.error(
        'PRODUCTS API FAILED:',
        error
      )
    }
  }

  loadProducts()
}, [])



useEffect(() => {
  async function loadCategories() {
    try {
      const categoriesData = await getCategories()

      console.log(
        'CATEGORIES DATA:',
        categoriesData
      )

      setCategories(categoriesData)
    } catch (error) {
      console.error(
        'CATEGORIES API FAILED:',
        error
      )
    }
  }

  loadCategories()
}, [])


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
        const intelligenceData =
          await getInventoryIntelligence()

        console.log(
          'INTELLIGENCE DATA:',
          intelligenceData
        )

        setIntelligence(intelligenceData)
      } catch (error) {
        console.error(
          'INTELLIGENCE API FAILED:',
          error
        )
      }
    }

    loadDashboard()
  }, [salesDays])

  useEffect(() => {
    async function loadSalesTrend() {
      try {
        const salesData = await getSalesTrend(salesDays)

        console.log(
          'SALES TREND DATA:',
          salesData
        )

        setSalesTrend(salesData)
      } catch (error) {
        console.error(
          'SALES TREND API FAILED:',
          error
        )
      }
    }

    loadSalesTrend()
  }, [salesDays])

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
          <button
  className={`nav-item ${
    activePage === 'dashboard' ? 'active' : ''
  }`}
  onClick={() => setActivePage('dashboard')}
>
  <span>⌂</span>
  Dashboard
</button>

          <button
  className={`nav-item ${
    activePage === 'products' ? 'active' : ''
  }`}
  onClick={() => setActivePage('products')}
>
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
        {activePage === 'products' && (
  <div className="products-page">

    <div className="products-page-header">

      <div>
        <p className="eyebrow">
          INVENTORY CATALOG
        </p>

        <h1>Products</h1>

        <p className="subtitle">
          Manage and monitor your inventory products.
        </p>
      </div>

      <button
  className="action-button"
  onClick={() => setShowAddProduct(true)}
>
  + Add Product
</button>

    </div>

    <div className="products-toolbar">

      <input
  type="text"
  placeholder="Search products..."
  className="product-search"
  value={productSearch}
  onChange={(event) =>
    setProductSearch(event.target.value)
  }
/>

      <select
  className="product-filter"
  value={productFilter}
  onChange={(event) =>
    setProductFilter(event.target.value)
  }
>
        <option value="all">All Products</option>
        <option value="low">Low Stock</option>
        <option value="healthy">Healthy Stock</option>
      </select>

    </div>

    <div className="panel products-table-panel">

      <div className="products-table">

        <div className="products-table-header">
          <span>Product</span>
          <span>SKU</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Reorder Level</span>
          <span>Status</span>
        </div>

        {filteredProducts.map((product) => {

          const isLowStock =
            product.current_stock <= product.reorder_level

          return (
            <div
              className="products-table-row"
              key={product.id}
            >

              <div className="product-name-cell">

                <div className="product-image blue-bg">
                  📦
                </div>

                <div>
                  <strong>
                    {product.name}
                  </strong>

                  <span>
                    Product #{product.id}
                  </span>
                </div>

              </div>

              <span>
                {product.sku}
              </span>

              <span>
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>

              <strong>
                {product.current_stock}
              </strong>

              <span>
                {product.reorder_level}
              </span>

              <div
                className={`risk-pill ${
                  isLowStock
                    ? 'high-pill'
                    : 'medium-pill'
                }`}
              >
                {isLowStock
                  ? 'LOW STOCK'
                  : 'HEALTHY'}
              </div>

              <button
  type="button"
  className="edit-product-button"
  onClick={() => {
    setEditingProduct(product)

    setProductForm({
      name: product.name,
      sku: product.sku,
      category_id: String(
        product.category_id
      ),
      supplier_id:
        product.supplier_id !== null
          ? String(product.supplier_id)
          : '',
      price: String(product.price),
      current_stock: String(
        product.current_stock
      ),
      reorder_level: String(
        product.reorder_level
      ),
    })

    setShowEditProduct(true)
  }}
>
  ✏️
</button>

            </div>
          )
        })}

      </div>

    </div>

  </div>
)}

        {activePage === 'dashboard' && (
          <>

        {/* Header */}
        <header className="topbar">
          <div>
            <p className="eyebrow">
              INVENTORY OVERVIEW
            </p>

            <h1>Good morning 👋</h1>

            <p className="subtitle">
              Here's what your inventory intelligence is telling you.
            </p>
          </div>

          <div className="header-actions">
            <button className="icon-button">
              ⌕
            </button>

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
              <div className="stat-icon blue">
                ▣
              </div>
            </div>

            <h2>
              {dashboard
                ? dashboard.total_products
                : '...'}
            </h2>

            <p className="positive">
              ↑ 8.2%
              <span>vs last month</span>
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Inventory Value</span>

              <div className="stat-icon purple">
                ₹
              </div>
            </div>

            <h2>
              {dashboard
                ? `₹${dashboard.inventory_value.toLocaleString('en-IN')}`
                : '...'}
            </h2>

            <p className="positive">
              ↑ 4.6%
              <span>vs last month</span>
            </p>
          </div>

          <div className="stat-card warning-card">
            <div className="stat-top">
              <span>High Risk Products</span>

              <div className="stat-icon red">
                !
              </div>
            </div>

            <h2>
              {intelligence
                ? intelligence.high_risk_products
                : '...'}
            </h2>

            <p className="negative">
              ↑ 1
              <span>needs attention</span>
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Recommended Reorder</span>

              <div className="stat-icon orange">
                ↻
              </div>
            </div>

            <h2>
              {intelligence
                ? intelligence.total_recommended_reorder
                : '...'}
            </h2>

            <p className="neutral">
              units across inventory
            </p>
          </div>

        </section>

        {/* Main Grid */}
        <section className="dashboard-grid">

          {/* Sales Chart */}
          <div className="panel sales-panel">

            <div className="panel-header">
              <div>
                <h3>Sales Performance</h3>
                <p>
                  Units sold over the last 30 days
                </p>
              </div>

              <select
                value={salesDays}
                onChange={(e) =>
                  setSalesDays(
                    Number(e.target.value)
                  )
                }
              >
                <option value={30}>
                  Last 30 days
                </option>

                <option value={14}>
                  Last 14 days
                </option>

                <option value={7}>
                  Last 7 days
                </option>
              </select>
            </div>

            <div className="chart">

              <div className="chart-y">
                {chartYAxis.map((value) => (
                  <span key={value}>
                    {value}
                  </span>
                ))}
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
                      <stop
                        offset="0%"
                        stopColor="#6366f1"
                        stopOpacity="0.28"
                      />

                      <stop
                        offset="100%"
                        stopColor="#6366f1"
                        stopOpacity="0"
                      />
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

                  {salesPaths.points.map(
                    (point, index) => {
                      const sale =
                        salesTrend[index]

                      return (
                        <circle
                          key={index}
                          cx={point.x}
                          cy={point.y}
                          r="6"
                          fill="transparent"
                          onMouseEnter={() =>
                            setHoveredSale({
                              ...sale,
                              x: point.x,
                              y: point.y,
                            })
                          }
                          onMouseLeave={() =>
                            setHoveredSale(null)
                          }
                        />
                      )
                    }
                  )}

                </svg>

                {hoveredSale && (
                  <div
                    className="sales-tooltip"
                    style={{
                      left: `${(hoveredSale.x / 700) * 100}%`,
                      top: `${(hoveredSale.y / 220) * 100}%`,
                    }}
                  >
                    <strong>
                      {formatChartDate(
                        hoveredSale.date
                      )}
                    </strong>

                    <span>
                      Units sold:{' '}
                      {hoveredSale.units_sold}
                    </span>

                    <span>
                      Sales:{' '}
                      {hoveredSale.sales_count}
                    </span>
                  </div>
                )}

                <div className="chart-labels">
                  {chartLabels
                    .filter((_, index) => {
                      const step = Math.max(
                        1,
                        Math.floor(
                          chartLabels.length / 7
                        )
                      )

                      return index % step === 0
                    })
                    .map((label, index) => (
                      <span key={index}>
                        {label}
                      </span>
                    ))}
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

              <span className="ai-badge">
                AI
              </span>
            </div>

            <div className="risk-circle">
              <div>
                <strong>
                  {intelligence &&
                  intelligence.total_products_analyzed > 0
                    ? Math.round(
                        (intelligence.low_risk_products /
                          intelligence.total_products_analyzed) *
                          100
                      )
                    : '...'}
                  %
                </strong>

                <span>Healthy</span>
              </div>
            </div>

            <div className="risk-legend">

              <div>
                <span className="legend-dot high"></span>
                <span>High Risk</span>

                <strong>
                  {intelligence
                    ? intelligence.high_risk_products
                    : '...'}
                </strong>
              </div>

              <div>
                <span className="legend-dot medium"></span>
                <span>Medium Risk</span>

                <strong>
                  {intelligence
                    ? intelligence.medium_risk_products
                    : '...'}
                </strong>
              </div>

              <div>
                <span className="legend-dot low"></span>
                <span>Healthy</span>

                <strong>
                  {intelligence
                    ? intelligence.low_risk_products
                    : '...'}
                </strong>
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
                <p>
                  Products requiring immediate attention
                </p>
              </div>

              <button
  className="view-all"
  onClick={() => setShowAllUrgent(true)}
>
  View all →
</button>
            </div>

            <div className="product-list">

              {intelligence?.urgent_products?.length > 0 ? (

                intelligence.urgent_products.map(
                  (product) => (

                    <div
                      className="product-row"
                      key={product.product_id}
                    >

                      <div className="product-info">

                        <div className="product-image red-bg">
                          📦
                        </div>

                        <div>
                          <strong>
                            {product.product_name}
                          </strong>

                          <span>
                            Product #{product.product_id}
                          </span>
                        </div>

                      </div>

                      <div className="stock-info">
                        <span>Stock</span>

                        <strong>
                          {product.current_stock} units
                        </strong>
                      </div>

                      <div className="days danger">
                        <strong>
                          {product.days_of_stock} days
                        </strong>

                        <span>
                          remaining
                        </span>
                      </div>

                      <div className="risk-pill high-pill">
                        {product.stockout_risk}
                      </div>

                    </div>

                  )
                )

              ) : (

                <div className="empty-state">
                  No urgent reorders 🎉
                </div>

              )}

            </div>

          </div>

          {/* AI Recommendation */}
<div className="panel recommendation-panel">

  <div className="recommendation-header">

    <div className="brain-icon">
      ✦
    </div>

    <div>
      <h3>AI Recommendation</h3>
      <span>Based on current demand</span>
    </div>

  </div>

  <div className="recommendation-body">

    {intelligence?.urgent_products?.length > 0 ? (

      <>
        <p>
          Your inventory model predicts increased demand for
          <strong>
            {' '}
            {intelligence.urgent_products[0].product_name}
          </strong>
          {' '}over the coming days.
        </p>

        <div className="recommendation-number">

          <span>
            Recommended reorder
          </span>

          <strong>
            {intelligence.urgent_products[0].recommended_reorder}
            <small> units</small>
          </strong>

        </div>

        <button className="action-button">
          Review Reorder →
        </button>
      </>

    ) : (

      <div className="empty-state">
        Inventory levels look healthy 🎉
      </div>

    )}

  </div>

</div>

        </section>

        <footer>
          <span>
            Smart Inventory Intelligence System
          </span>

          <span>
            AI Engine • Operational
          </span>
        </footer>
{showAllUrgent && (
  <div
    className="reorder-overlay"
    onClick={() => setShowAllUrgent(false)}
  >
    <div
      className="reorder-modal"
      onClick={(event) => event.stopPropagation()}
    >

      <div className="reorder-modal-header">
        <div>
          <h2>🚨 Urgent Reorders</h2>
          <p>
            Products requiring immediate inventory attention
          </p>
        </div>

        <button
          className="close-button"
          onClick={() => setShowAllUrgent(false)}
        >
          ×
        </button>
      </div>

      <div className="reorder-modal-summary">

        <div>
          <span>Urgent Products</span>
          <strong>
            {intelligence?.urgent_products?.length ?? 0}
          </strong>
        </div>

        <div>
          <span>Total Reorder</span>
          <strong>
            {intelligence?.total_recommended_reorder ?? 0}
          </strong>
        </div>

      </div>

      <div className="reorder-modal-list">

        {intelligence?.urgent_products?.length > 0 ? (

          intelligence.urgent_products.map((product) => (

            <div
              className="reorder-modal-row"
              key={product.product_id}
            >

              <div>
                <strong>
                  {product.product_name}
                </strong>

                <span>
                  Product #{product.product_id}
                </span>
              </div>

              <div>
                <span>Current Stock</span>
                <strong>
                  {product.current_stock}
                </strong>
              </div>

              <div>
                <span>Daily Demand</span>
                <strong>
                  {product.predicted_daily_demand}
                </strong>
              </div>

              <div>
                <span>Days Remaining</span>
                <strong>
                  {product.days_of_stock}
                </strong>
              </div>

              <div>
                <span>Recommended Reorder</span>
                <strong>
                  {product.recommended_reorder}
                </strong>
              </div>

              <div className="risk-pill high-pill">
                {product.stockout_risk}
              </div>

            </div>

          ))

        ) : (

          <div className="empty-state">
            No urgent products 🎉
          </div>

        )}

      </div>

    </div>
  </div>
)}
          </>
        )}

        {showAddProduct && (
  <div
    className="reorder-overlay"
    onClick={() => setShowAddProduct(false)}
  >
    <div
      className="reorder-modal add-product-modal"
      onClick={(event) => event.stopPropagation()}
    >

      <div className="reorder-modal-header">

        <div>
          <h2>＋ Add New Product</h2>

          <p>
            Add a product to your inventory database.
          </p>
        </div>

        <button
          className="close-button"
          onClick={() => setShowAddProduct(false)}
        >
          ×
        </button>

      </div>

      <form
        className="add-product-form"
        onSubmit={async (event) => {
          event.preventDefault()

          try {

console.log(
  'PRODUCT PAYLOAD:',
  {
    name: productForm.name,
    sku: productForm.sku,
    category_id: Number(productForm.category_id),
    supplier_id:
  productForm.supplier_id
    ? Number(productForm.supplier_id)
    : null,
    price: Number(productForm.price),
    current_stock: Number(productForm.current_stock),
    reorder_level: Number(productForm.reorder_level),
  }
)




            const newProduct = await createProduct({
              name: productForm.name,
              sku: productForm.sku,
              category_id: Number(
                productForm.category_id
              ),
              supplier_id: Number(
                productForm.supplier_id
              ),
              price: Number(productForm.price),
              current_stock: Number(
                productForm.current_stock
              ),
              reorder_level: Number(
                productForm.reorder_level
              ),
            })

            setProducts((currentProducts) => [
              ...currentProducts,
              newProduct,
            ])

            setProductForm({
              name: '',
              sku: '',
              category_id: '',
              supplier_id: '',
              price: '',
              current_stock: '',
              reorder_level: '',
            })

            setShowAddProduct(false)

            console.log(
              'PRODUCT CREATED:',
              newProduct
            )

          } catch (error) {
            console.error(
              'CREATE PRODUCT FAILED:',
              error
            )

            alert(error.message)
          }
        }}
      >

        <label>
          Product Name

          <input
            type="text"
            required
            value={productForm.name}
            onChange={(event) =>
              setProductForm({
                ...productForm,
                name: event.target.value,
              })
            }
            placeholder="e.g. Green Tea"
          />
        </label>

        <label>
          SKU

          <input
            type="text"
            required
            value={productForm.sku}
            onChange={(event) =>
              setProductForm({
                ...productForm,
                sku: event.target.value,
              })
            }
            placeholder="e.g. BEV-004"
          />
        </label>

        <div className="form-row">

          <div className="category-field">

  <div className="category-label-row">
    <label>Category</label>

    <button
      type="button"
      className="new-category-button"
      onClick={() => {
        setCategoryError('')
        setNewCategoryName('')
        setShowAddCategory(true)
      }}
    >
      + New Category
    </button>
  </div>

  <select
    required
    value={productForm.category_id}
    onChange={(event) =>
      setProductForm({
        ...productForm,
        category_id: event.target.value,
      })
    }
  >
    <option value="">
      Select a category
    </option>

    {categories.map((category) => (
      <option
        key={category.id}
        value={category.id}
      >
        {category.name}
      </option>
    ))}
  </select>

</div>

          <div className="supplier-field">

  <div className="supplier-label-row">
    <label>Supplier</label>

    <button
      type="button"
      className="new-supplier-button"
      onClick={() => {
        setSupplierError('')
        setNewSupplierName('')
        setNewSupplierEmail('')
        setNewSupplierPhone('')
        setShowAddSupplier(true)
      }}
    >
      + New Supplier
    </button>
  </div>

  <select
    value={productForm.supplier_id}
    onChange={(event) =>
      setProductForm({
        ...productForm,
        supplier_id: event.target.value,
      })
    }
  >
    <option value="">
      No supplier
    </option>

    {suppliers.map((supplier) => (
      <option
        key={supplier.id}
        value={supplier.id}
      >
        {supplier.name}
      </option>
    ))}
  </select>

</div>

        </div>

        <div className="form-row">

          <label>
            Price

            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={productForm.price}
              onChange={(event) =>
                setProductForm({
                  ...productForm,
                  price: event.target.value,
                })
              }
              placeholder="0.00"
            />
          </label>

          <label>
            Current Stock

            <input
              type="number"
              required
              min="0"
              value={productForm.current_stock}
              onChange={(event) =>
                setProductForm({
                  ...productForm,
                  current_stock: event.target.value,
                })
              }
            />
          </label>

        </div>

        <label>
          Reorder Level

          <input
            type="number"
            required
            min="0"
            value={productForm.reorder_level}
            onChange={(event) =>
              setProductForm({
                ...productForm,
                reorder_level: event.target.value,
              })
            }
          />
        </label>

        <button
          type="submit"
          className="action-button"
        >
          Add Product
        </button>

      </form>

    </div>
  </div>
)}


{showAddCategory && (
  <div
    className="reorder-overlay"
    onClick={() => setShowAddCategory(false)}
  >
    <div
      className="reorder-modal category-modal"
      onClick={(event) => event.stopPropagation()}
    >

      <div className="reorder-modal-header">

        <div>
          <h2>＋ New Category</h2>

          <p>
            Create a category for your inventory.
          </p>
        </div>

        <button
          type="button"
          className="close-button"
          onClick={() => setShowAddCategory(false)}
        >
          ×
        </button>

      </div>

      <form
        className="add-product-form"
        onSubmit={async (event) => {
          event.preventDefault()

          const name = newCategoryName.trim()

          if (!name) {
            setCategoryError(
              'Category name is required.'
            )
            return
          }

          try {
            const createdCategory =
              await createCategory(name)

            setCategories((currentCategories) => [
              ...currentCategories,
              createdCategory,
            ])

            setProductForm((currentForm) => ({
              ...currentForm,
              category_id: String(
                createdCategory.id
              ),
            }))

            setNewCategoryName('')
            setCategoryError('')
            setShowAddCategory(false)

            console.log(
              'CATEGORY CREATED:',
              createdCategory
            )

          } catch (error) {
            console.error(
              'CREATE CATEGORY FAILED:',
              error
            )

            setCategoryError(
              error.message
            )
          }
        }}
      >

        <label>
          Category Name

          <input
            type="text"
            required
            maxLength="100"
            value={newCategoryName}
            onChange={(event) =>
              setNewCategoryName(
                event.target.value
              )
            }
            placeholder="e.g. Cosmetics"
            autoFocus
          />
        </label>

        {categoryError && (
          <p className="form-error">
            {categoryError}
          </p>
        )}

        <button
          type="submit"
          className="action-button"
        >
          Create Category
        </button>

      </form>

    </div>
  </div>
)}


{showAddSupplier && (
  <div
    className="reorder-overlay"
    onClick={() => setShowAddSupplier(false)}
  >
    <div
      className="reorder-modal category-modal"
      onClick={(event) =>
        event.stopPropagation()
      }
    >

      <div className="reorder-modal-header">

        <div>
          <h2>＋ New Supplier</h2>

          <p>
            Add a supplier to your inventory system.
          </p>
        </div>

        <button
          type="button"
          className="close-button"
          onClick={() =>
            setShowAddSupplier(false)
          }
        >
          ×
        </button>

      </div>

      <form
        className="add-product-form"
        onSubmit={async (event) => {
          event.preventDefault()

          const name =
            newSupplierName.trim()

          if (!name) {
            setSupplierError(
              'Supplier name is required.'
            )
            return
          }

          try {
            const createdSupplier =
              await createSupplier(
                name,
                newSupplierEmail.trim() || null,
                newSupplierPhone.trim() || null
              )

            setSuppliers(
              (currentSuppliers) => [
                ...currentSuppliers,
                createdSupplier,
              ]
            )

            setProductForm(
              (currentForm) => ({
                ...currentForm,
                supplier_id:
                  String(
                    createdSupplier.id
                  ),
              })
            )

            setNewSupplierName('')
            setNewSupplierEmail('')
            setNewSupplierPhone('')
            setSupplierError('')
            setShowAddSupplier(false)

            console.log(
              'SUPPLIER CREATED:',
              createdSupplier
            )

          } catch (error) {
            console.error(
              'CREATE SUPPLIER FAILED:',
              error
            )

            setSupplierError(
              error.message
            )
          }
        }}
      >

        <label>
          Supplier Name

          <input
            type="text"
            required
            maxLength="255"
            value={newSupplierName}
            onChange={(event) =>
              setNewSupplierName(
                event.target.value
              )
            }
            placeholder="e.g. ABC Distributors"
            autoFocus
          />
        </label>

        <label>
          Contact Email

          <input
            type="email"
            value={newSupplierEmail}
            onChange={(event) =>
              setNewSupplierEmail(
                event.target.value
              )
            }
            placeholder="supplier@example.com"
          />
        </label>

        <label>
          Phone

          <input
            type="tel"
            value={newSupplierPhone}
            onChange={(event) =>
              setNewSupplierPhone(
                event.target.value
              )
            }
            placeholder="+91 98765 43210"
          />
        </label>

        {supplierError && (
          <p className="form-error">
            {supplierError}
          </p>
        )}

        <button
          type="submit"
          className="action-button"
        >
          Create Supplier
        </button>

      </form>

    </div>
  </div>
)}



{showEditProduct && editingProduct && (
  <div
    className="reorder-overlay"
    onClick={() => {
      setShowEditProduct(false)
      setEditingProduct(null)
    }}
  >
    <div
      className="reorder-modal add-product-modal"
      onClick={(event) =>
        event.stopPropagation()
      }
    >

      <div className="reorder-modal-header">

        <div>
          <h2>✏️ Edit Product</h2>

          <p>
            Update product information.
          </p>
        </div>

        <button
          type="button"
          className="close-button"
          onClick={() => {
            setShowEditProduct(false)
            setEditingProduct(null)
          }}
        >
          ×
        </button>

      </div>

      <form
        className="add-product-form"
        onSubmit={async (event) => {
          event.preventDefault()

          try {

            const updatedProduct =
              await updateProduct(
                editingProduct.id,
                {
                  name: productForm.name,
                  sku: productForm.sku,
                  category_id: Number(
                    productForm.category_id
                  ),
                  supplier_id:
                    productForm.supplier_id
                      ? Number(
                          productForm.supplier_id
                        )
                      : null,
                  price: Number(
                    productForm.price
                  ),
                  // current_stock: Number(
                  //   productForm.current_stock
                  // ),
                  reorder_level: Number(
                    productForm.reorder_level
                  ),
                }
              )

            setProducts(
              (currentProducts) =>
                currentProducts.map(
                  (product) =>
                    product.id ===
                    updatedProduct.id
                      ? updatedProduct
                      : product
                )
            )

            setShowEditProduct(false)
            setEditingProduct(null)

            console.log(
              'PRODUCT UPDATED:',
              updatedProduct
            )

          } catch (error) {

            console.error(
              'UPDATE PRODUCT FAILED:',
              error
            )

            alert(error.message)
          }
        }}
      >

        <label>
          Product Name

          <input
            type="text"
            required
            value={productForm.name}
            onChange={(event) =>
              setProductForm({
                ...productForm,
                name: event.target.value,
              })
            }
          />
        </label>

        <label>
          SKU

          <input
            type="text"
            required
            value={productForm.sku}
            onChange={(event) =>
              setProductForm({
                ...productForm,
                sku: event.target.value,
              })
            }
          />
        </label>

        <div className="form-row">

          <div className="category-field">

            <label>
              Category
            </label>

            <select
              required
              value={productForm.category_id}
              onChange={(event) =>
                setProductForm({
                  ...productForm,
                  category_id:
                    event.target.value,
                })
              }
            >
              <option value="">
                Select a category
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>

          </div>

          <div className="supplier-field">

            <label>
              Supplier
            </label>

            <select
              value={
                productForm.supplier_id
              }
              onChange={(event) =>
                setProductForm({
                  ...productForm,
                  supplier_id:
                    event.target.value,
                })
              }
            >
              <option value="">
                No supplier
              </option>

              {suppliers.map(
                (supplier) => (
                  <option
                    key={supplier.id}
                    value={supplier.id}
                  >
                    {supplier.name}
                  </option>
                )
              )}

            </select>

          </div>

        </div>

        <div className="form-row">

          <label>
            Price

            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={productForm.price}
              onChange={(event) =>
                setProductForm({
                  ...productForm,
                  price: event.target.value,
                })
              }
            />
          </label>

          {/* <label>
            Current Stock

            <input
              type="number"
              required
              min="0"
              value={
                productForm.current_stock
              }
              onChange={(event) =>
                setProductForm({
                  ...productForm,
                  current_stock:
                    event.target.value,
                })
              }
            />
          </label> */}

        </div>

        <label>
          Reorder Level

          <input
            type="number"
            required
            min="0"
            value={
              productForm.reorder_level
            }
            onChange={(event) =>
              setProductForm({
                ...productForm,
                reorder_level:
                  event.target.value,
              })
            }
          />
        </label>

        <button
          type="submit"
          className="action-button"
        >
          Save Changes
        </button>

      </form>

    </div>
  </div>
)}



</main>

    </div>
  )
}

export default App