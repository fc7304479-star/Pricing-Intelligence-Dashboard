import { useEffect, useState } from "react";
import "./App.css";

const API = "https://pricing-intelligence-engine.fastapicloud.dev";

function App() {
  const [stats, setStats] = useState({
    total_products: 0,
    average_price: 0,
    highest_price: 0,
    lowest_price: 0,
  });

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [statsRes, productsRes] = await Promise.all([
        fetch(`${API}/stats`),
        fetch(`${API}/products`),
      ]);

      if (!statsRes.ok) {
        throw new Error(`Stats API failed: ${statsRes.status}`);
      }

      if (!productsRes.ok) {
        throw new Error(`Products API failed: ${productsRes.status}`);
      }

      const statsData = await statsRes.json();
      const productsData = await productsRes.json();

      // DEBUG
      console.log("=================================");
      console.log("PRODUCTS FROM API:", productsData);
      console.log("FIRST PRODUCT FROM API:", productsData?.[0]);
      console.log(
        "FIRST PRODUCT NAME:",
        productsData?.[0]?.product_name
      );
      console.log(
        "FIRST PRODUCT URL:",
        productsData?.[0]?.product_url
      );
      console.log("PRODUCT COUNT:", productsData?.length);
      console.log("=================================");

      setStats(statsData);

      setProducts(
        Array.isArray(productsData)
          ? productsData
          : []
      );
    } catch (err) {
      console.error("Dashboard API Error:", err);

      setError(
        `Unable to connect to Pricing Intelligence API: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredProducts = products.filter((item) =>
    (item.product_name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // =========================================================
  // PRICE FORMAT
  // =========================================================

  function formatPrice(value) {
    return `$${Number(value || 0).toFixed(2)}`;
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="dashboard">

      {/* HEADER */}
      <header className="dashboard-header">
        <div>
          <h1>Pricing Intelligence Dashboard</h1>

          <p>
            Monitor products, prices and market data
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={loadData}
        >
          Refresh
        </button>
      </header>

      {/* LOADING */}
      {loading && (
        <div className="status">
          Loading pricing data...
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {/* DATA */}
      {!loading && !error && (
        <>

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="cards">

            <div className="card">
              <h3>Total Products</h3>
              <h2>
                {stats.total_products}
              </h2>
            </div>

            <div className="card">
              <h3>Average Price</h3>
              <h2>
                {formatPrice(
                  stats.average_price
                )}
              </h2>
            </div>

            <div className="card">
              <h3>Highest Price</h3>
              <h2>
                {formatPrice(
                  stats.highest_price
                )}
              </h2>
            </div>

            <div className="card">
              <h3>Lowest Price</h3>
              <h2>
                {formatPrice(
                  stats.lowest_price
                )}
              </h2>
            </div>

          </div>

          {/* =================================================
              SEARCH TOOLBAR
          ================================================= */}

          <div className="toolbar">

            <input
              className="search"
              placeholder="Search Product..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <span className="result-count">
              {filteredProducts.length} products
            </span>

          </div>

          {/* =================================================
              DEBUG PRODUCT
          ================================================= */}

          <pre
            style={{
              background: "#111827",
              color: "#00ff88",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "20px",
              overflowX: "auto",
              fontSize: "13px",
            }}
          >
            {products.length > 0
              ? JSON.stringify(products[0], null, 2)
              : "No product data"}
          </pre>

          {/* =================================================
              PRODUCTS TABLE
          ================================================= */}

          <div className="table-container">

            <table>

              <thead>
                <tr>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Source</th>
                  <th>Currency</th>
                  <th>URL</th>
                </tr>
              </thead>

              <tbody>

                {filteredProducts.length === 0 ? (

                  <tr>
                    <td
                      colSpan="5"
                      className="empty"
                    >
                      No Products Found
                    </td>
                  </tr>

                ) : (

                  filteredProducts.map(
                    (item, index) => (

                      <tr
                        key={
                          `${item.goods_id}-${item.stored_at || index}`
                        }
                      >

                        {/* PRODUCT NAME */}
                        <td>
                          {item.product_name || "-"}
                        </td>

                        {/* PRICE */}
                        <td>
                          {item.currency || "USD"}{" "}
                          {Number(
                            item.price || 0
                          ).toFixed(2)}
                        </td>

                        {/* SOURCE */}
                        <td>
                          {item.source || "-"}
                        </td>

                        {/* CURRENCY */}
                        <td>
                          {item.currency || "USD"}
                        </td>

                        {/* PRODUCT URL */}
                        <td>

                          {item.product_url ? (

                            <a
                              href={item.product_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open
                            </a>

                          ) : (

                            "-"

                          )}

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </>

      )}

    </div>
  );
}

export default App;