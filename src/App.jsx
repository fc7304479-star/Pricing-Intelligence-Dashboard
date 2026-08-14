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

      console.log("API:", API);

      const [statsRes, productsRes] = await Promise.all([
        fetch(`${API}/stats`),
        fetch(`${API}/products`),
      ]);

      console.log("Stats status:", statsRes.status);
      console.log("Products status:", productsRes.status);

      if (!statsRes.ok) {
        throw new Error(`Stats API failed: ${statsRes.status}`);
      }

      if (!productsRes.ok) {
        throw new Error(`Products API failed: ${productsRes.status}`);
      }

      const statsData = await statsRes.json();
      const productsData = await productsRes.json();

      console.log("Stats:", statsData);
      console.log("Products:", productsData);

      setStats(statsData);
      setProducts(productsData);
    } catch (err) {
      console.error("Dashboard API Error:", err);

      setError(
        `Unable to connect to Pricing Intelligence API: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter((item) =>
    (item.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Pricing Intelligence Dashboard</h1>
          <p>Monitor products, prices and market data</p>
        </div>

        <button className="refresh-btn" onClick={loadData}>
          Refresh
        </button>
      </header>

      {loading && (
        <div className="status">
          Loading pricing data...
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="cards">
            <div className="card">
              <h3>Total Products</h3>
              <h2>{stats.total_products}</h2>
            </div>

            <div className="card">
              <h3>Average Price</h3>
              <h2>
                ${Number(stats.average_price || 0).toFixed(2)}
              </h2>
            </div>

            <div className="card">
              <h3>Highest Price</h3>
              <h2>
                ${Number(stats.highest_price || 0).toFixed(2)}
              </h2>
            </div>

            <div className="card">
              <h3>Lowest Price</h3>
              <h2>
                ${Number(stats.lowest_price || 0).toFixed(2)}
              </h2>
            </div>
          </div>

          <div className="toolbar">
            <input
              className="search"
              placeholder="Search Product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <span className="result-count">
              {filteredProducts.length} products
            </span>
          </div>

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
                    <td colSpan="5">
                      No Products Found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((item, index) => (
                    <tr key={item.url || index}>
                      <td>{item.title || "-"}</td>

                      <td>
                        {item.currency || "USD"}{" "}
                        {Number(item.price || 0).toFixed(2)}
                      </td>

                      <td>
                        {item.source || "-"}
                      </td>

                      <td>
                        {item.currency || "USD"}
                      </td>

                      <td>
                        {item.url ? (
                          <a
                            href={item.url}
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
                  ))
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