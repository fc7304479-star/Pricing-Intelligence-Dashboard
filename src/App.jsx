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
  const [priceChanges, setPriceChanges] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [priceChangesError, setPriceChangesError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      setPriceChangesError("");

      const [statsRes, productsRes, priceChangesRes] =
        await Promise.all([
          fetch(`${API}/stats`),
          fetch(`${API}/products`),
          fetch(`${API}/price-changes`),
        ]);

      if (!statsRes.ok) {
        throw new Error(`Stats API failed: ${statsRes.status}`);
      }

      if (!productsRes.ok) {
        throw new Error(`Products API failed: ${productsRes.status}`);
      }

      const statsData = await statsRes.json();
      const productsData = await productsRes.json();

      setStats(statsData);

      setProducts(
        Array.isArray(productsData)
          ? productsData
          : []
      );

      // PRICE CHANGES
      if (priceChangesRes.ok) {
        const priceChangesData =
          await priceChangesRes.json();

        setPriceChanges(
          Array.isArray(priceChangesData)
            ? priceChangesData
            : []
        );
      } else {
        setPriceChanges([]);
        setPriceChangesError(
          `Price Changes API failed: ${priceChangesRes.status}`
        );
      }

      console.log("=================================");
      console.log("PRODUCT COUNT:", productsData?.length);
      console.log("PRICE CHANGES:", priceChangesDataSafe(priceChangesRes));
      console.log("=================================");

    } catch (err) {
      console.error("Dashboard API Error:", err);

      setError(
        `Unable to connect to Pricing Intelligence API: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  }

  function priceChangesDataSafe(response) {
    return response?.status || "unknown";
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

  function formatChange(value) {
    const number = Number(value || 0);

    if (number > 0) {
      return `+$${number.toFixed(2)}`;
    }

    if (number < 0) {
      return `-$${Math.abs(number).toFixed(2)}`;
    }

    return "$0.00";
  }

  function formatPercent(value) {
    const number = Number(value || 0);

    if (number > 0) {
      return `+${number.toFixed(2)}%`;
    }

    if (number < 0) {
      return `${number.toFixed(2)}%`;
    }

    return "0.00%";
  }

  function getDirectionStyle(direction) {
    if (direction === "increase") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (direction === "decrease") {
      return {
        background: "#fee2e2",
        color: "#991b1b",
      };
    }

    return {
      background: "#f3f4f6",
      color: "#374151",
    };
  }

  function getDirectionIcon(direction) {
    if (direction === "increase") {
      return "↑";
    }

    if (direction === "decrease") {
      return "↓";
    }

    return "→";
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
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
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
                {formatPrice(stats.average_price)}
              </h2>
            </div>

            <div className="card">
              <h3>Highest Price</h3>
              <h2>
                {formatPrice(stats.highest_price)}
              </h2>
            </div>

            <div className="card">
              <h3>Lowest Price</h3>
              <h2>
                {formatPrice(stats.lowest_price)}
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

                        <td>
                          {item.product_name || "-"}
                        </td>

                        <td>
                          {item.currency || "USD"}{" "}
                          {Number(
                            item.price || 0
                          ).toFixed(2)}
                        </td>

                        <td>
                          {item.source || "-"}
                        </td>

                        <td>
                          {item.currency || "USD"}
                        </td>

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

          {/* =================================================
              PRICE CHANGES
          ================================================= */}

          <section
            style={{
              marginTop: "40px",
              marginBottom: "40px",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "24px",
                  }}
                >
                  Price Changes
                </h2>

                <p
                  style={{
                    marginTop: "6px",
                    color: "#6b7280",
                  }}
                >
                  Track changes between product observations
                </p>
              </div>

              <span
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                {priceChanges.length} changes
              </span>
            </div>

            {priceChangesError && (
              <div className="error">
                {priceChangesError}
              </div>
            )}

            {!priceChangesError &&
              priceChanges.length === 0 && (
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "25px",
                    textAlign: "center",
                    color: "#6b7280",
                    boxShadow:
                      "0 4px 15px rgba(0,0,0,0.06)",
                  }}
                >
                  No price changes found.
                </div>
              )}

            {priceChanges.length > 0 && (
              <div
                className="table-container"
                style={{
                  overflowX: "auto",
                }}
              >

                <table>

                  <thead>
                    <tr>
                      <th>Product ID</th>
                      <th>Previous Price</th>
                      <th>Current Price</th>
                      <th>Change</th>
                      <th>Change %</th>
                      <th>Direction</th>
                    </tr>
                  </thead>

                  <tbody>

                    {priceChanges.map((item, index) => {

                      const directionStyle =
                        getDirectionStyle(
                          item.direction
                        );

                      return (
                        <tr
                          key={
                            `${item.product_id}-${index}`
                          }
                        >

                          <td>
                            {item.product_id || "-"}
                          </td>

                          <td>
                            {formatPrice(
                              item.previous_price
                            )}
                          </td>

                          <td>
                            {formatPrice(
                              item.current_price
                            )}
                          </td>

                          <td
                            style={{
                              fontWeight: "600",
                            }}
                          >
                            {formatChange(
                              item.change_amount
                            )}
                          </td>

                          <td
                            style={{
                              fontWeight: "600",
                            }}
                          >
                            {formatPercent(
                              item.change_percent
                            )}
                          </td>

                          <td>

                            <span
                              style={{
                                ...directionStyle,
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                gap: "5px",
                                padding:
                                  "5px 10px",
                                borderRadius:
                                  "999px",
                                fontSize:
                                  "13px",
                                fontWeight:
                                  "600",
                                textTransform:
                                  "capitalize",
                              }}
                            >
                              {getDirectionIcon(
                                item.direction
                              )}

                              {item.direction ||
                                "unknown"}
                            </span>

                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>
            )}

          </section>

        </>
      )}

    </div>
  );
}

export default App;