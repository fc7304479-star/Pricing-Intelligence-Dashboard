import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API =
  "https://pricing-intelligence-engine.fastapicloud.dev";

const CANONICAL_PRODUCT_ID = "CLOUD-TEST-001";

function App() {
  const [competitiveProduct, setCompetitiveProduct] =
    useState(null);

  const [priceHistory, setPriceHistory] =
    useState(null);

  const [priceChanges, setPriceChanges] =
    useState(null);

  const [priceTrends, setPriceTrends] =
    useState(null);

  const [signals, setSignals] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================================================
  // LOAD COMPETITIVE DASHBOARD
  // =========================================================

  useEffect(() => {
    loadCompetitiveData();
  }, []);

  async function loadCompetitiveData() {
    try {
      setError("");

      if (!competitiveProduct) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const [
        productResponse,
        historyResponse,
        changesResponse,
        trendsResponse,
        signalsResponse,
      ] = await Promise.all([
        fetch(
          `${API}/competitive-products/${CANONICAL_PRODUCT_ID}`
        ),

        fetch(
          `${API}/competitive-products/${CANONICAL_PRODUCT_ID}/price-history`
        ),

        fetch(
          `${API}/competitive-products/${CANONICAL_PRODUCT_ID}/price-changes`
        ),

        fetch(
          `${API}/competitive-products/${CANONICAL_PRODUCT_ID}/price-trends`
        ),

        fetch(
          `${API}/competitive-products/${CANONICAL_PRODUCT_ID}/signals`
        ),
      ]);

      if (!productResponse.ok) {
        throw new Error(
          `Competitive Product API failed: ${productResponse.status}`
        );
      }

      if (!historyResponse.ok) {
        throw new Error(
          `Price History API failed: ${historyResponse.status}`
        );
      }

      if (!changesResponse.ok) {
        throw new Error(
          `Price Changes API failed: ${changesResponse.status}`
        );
      }

      if (!trendsResponse.ok) {
        throw new Error(
          `Price Trends API failed: ${trendsResponse.status}`
        );
      }

      if (!signalsResponse.ok) {
        throw new Error(
          `Pricing Signals API failed: ${signalsResponse.status}`
        );
      }

      const [
        productData,
        historyData,
        changesData,
        trendsData,
        signalsData,
      ] = await Promise.all([
        productResponse.json(),
        historyResponse.json(),
        changesResponse.json(),
        trendsResponse.json(),
        signalsResponse.json(),
      ]);

      setCompetitiveProduct(productData);
      setPriceHistory(historyData);
      setPriceChanges(changesData);
      setPriceTrends(trendsData);
      setSignals(signalsData);

      console.log(
        "Competitive Pricing Dashboard loaded",
        {
          productData,
          historyData,
          changesData,
          trendsData,
          signalsData,
        }
      );
    } catch (err) {
      console.error(
        "Competitive Dashboard Error:",
        err
      );

      setError(
        `Unable to load competitive pricing data: ${err.message}`
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // =========================================================
  // HELPERS
  // =========================================================

  function formatPrice(value) {
    if (
      value === null ||
      value === undefined ||
      Number.isNaN(Number(value))
    ) {
      return "-";
    }

    return `$${Number(value).toFixed(2)}`;
  }

  function formatPercent(value) {
    if (
      value === null ||
      value === undefined ||
      Number.isNaN(Number(value))
    ) {
      return "-";
    }

    const number = Number(value);

    if (number > 0) {
      return `+${number.toFixed(2)}%`;
    }

    return `${number.toFixed(2)}%`;
  }

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    const parsed = new Date(
      String(value).replace(" ", "T")
    );

    if (Number.isNaN(parsed.getTime())) {
      return String(value);
    }

    return parsed.toLocaleString();
  }

  function sourceLabel(source) {
    const normalized =
      String(source || "").toUpperCase();

    if (normalized === "BESTBUY") {
      return "Best Buy";
    }

    if (normalized === "WALMART") {
      return "Walmart";
    }

    if (normalized === "AMAZON") {
      return "Amazon";
    }

    return source || "-";
  }

  function getSourceClass(source) {
    const normalized =
      String(source || "").toUpperCase();

    if (normalized === "AMAZON") {
      return "source-amazon";
    }

    if (normalized === "WALMART") {
      return "source-walmart";
    }

    if (normalized === "BESTBUY") {
      return "source-bestbuy";
    }

    return "source-default";
  }

  function getSignalClass(severity) {
    const normalized =
      String(severity || "").toLowerCase();

    if (normalized === "high") {
      return "signal-high";
    }

    if (normalized === "medium") {
      return "signal-medium";
    }

    return "signal-low";
  }

  function getTrendClass(trend) {
    const normalized =
      String(trend || "").toLowerCase();

    if (normalized === "increasing") {
      return "trend-up";
    }

    if (normalized === "decreasing") {
      return "trend-down";
    }

    if (normalized === "stable") {
      return "trend-stable";
    }

    return "trend-insufficient";
  }

  function getTrendLabel(trend) {
    if (trend === "increasing") {
      return "Increasing";
    }

    if (trend === "decreasing") {
      return "Decreasing";
    }

    if (trend === "stable") {
      return "Stable";
    }

    return "Insufficient data";
  }

  function getLatestHistoryPrice(history) {
    if (
      !Array.isArray(history) ||
      history.length === 0
    ) {
      return null;
    }

    return history[history.length - 1]?.price;
  }

  // =========================================================
  // DERIVED DATA
  // =========================================================

  const products =
    competitiveProduct?.products || [];

  const referenceSource =
    competitiveProduct?.reference_source || "AMAZON";

  const referenceProduct = products.find(
    (product) =>
      String(product.source).toUpperCase() ===
      referenceSource
  );

  const competitorProducts =
    products.filter(
      (product) =>
        String(product.source).toUpperCase() !==
        referenceSource
    );

  const historyProducts =
    priceHistory?.products || [];

  const trendProducts =
    priceTrends?.products || [];

  const changeProducts =
    priceChanges?.products || [];

  const signalItems =
    signals?.signals || [];

  const matchedProductCount =
    products.length;

  const averageDifference = useMemo(() => {
    if (!products.length) {
      return null;
    }

    const differences = products
      .map(
        (product) =>
          product.price_difference_percent
      )
      .filter(
        (value) =>
          value !== null &&
          value !== undefined
      )
      .map(Number);

    if (!differences.length) {
      return null;
    }

    return (
      differences.reduce(
        (total, value) => total + value,
        0
      ) / differences.length
    );
  }, [products]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-screen">
          <div className="loading-spinner" />

          <h2>
            Loading Competitive Pricing
          </h2>

          <p>
            Collecting product comparison,
            history and pricing signals...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error && !competitiveProduct) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <div>
            <div className="eyebrow">
              PRICING INTELLIGENCE
            </div>

            <h1>
              Competitive Pricing
            </h1>

            <p>
              Consumer electronics market monitoring
            </p>
          </div>

          <button
            className="refresh-btn"
            onClick={loadCompetitiveData}
            disabled={refreshing}
          >
            {refreshing
              ? "Refreshing..."
              : "Retry"}
          </button>
        </header>

        <div className="error-panel">
          <h3>
            Unable to load dashboard
          </h3>

          <p>{error}</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="dashboard">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="dashboard-header">

        <div>

          <div className="eyebrow">
            PRICING INTELLIGENCE
          </div>

          <h1>
            Competitive Pricing
          </h1>

          <p>
            Consumer electronics market monitoring
          </p>

        </div>

        <div className="header-actions">

          <div className="data-mode">
            <span className="status-dot" />
            MVP Data
          </div>

          <button
            className="refresh-btn"
            onClick={loadCompetitiveData}
            disabled={refreshing}
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

      </header>

      {/* =====================================================
          ERROR BANNER
      ===================================================== */}

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* =====================================================
          PRODUCT HERO
      ===================================================== */}

      <section className="product-hero">

        <div>

          <div className="product-label">
            MATCHED PRODUCT
          </div>

          <h2>
            Sony WH-1000XM5 Wireless Headphones
          </h2>

          <div className="product-meta">

            <span>
              Canonical ID:
              <strong>
                {competitiveProduct?.canonical_product_id ||
                  CANONICAL_PRODUCT_ID}
              </strong>
            </span>

            <span>
              Reference:
              <strong>
                {sourceLabel(referenceSource)}
              </strong>
            </span>

            <span>
              Sources:
              <strong>
                {matchedProductCount}
              </strong>
            </span>

          </div>

        </div>

        <div className="last-updated">

          <span>
            Last updated
          </span>

          <strong>
            {formatDate(
              competitiveProduct?.last_updated
            )}
          </strong>

        </div>

      </section>

      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <section className="kpi-grid">

        <div className="kpi-card reference-card">

          <div className="kpi-top">

            <span className="kpi-label">
              Reference Price
            </span>

            <span className="source-badge source-amazon">
              Amazon
            </span>

          </div>

          <div className="kpi-value">
            {formatPrice(
              competitiveProduct?.reference_price
            )}
          </div>

          <div className="kpi-subtitle">
            Baseline source
          </div>

        </div>

        <div className="kpi-card">

          <div className="kpi-top">

            <span className="kpi-label">
              Market Average
            </span>

          </div>

          <div className="kpi-value">
            {formatPrice(
              competitiveProduct?.market_average
            )}
          </div>

          <div className="kpi-subtitle">
            Across matched sources
          </div>

        </div>

        <div className="kpi-card">

          <div className="kpi-top">

            <span className="kpi-label">
              Reference vs Market
            </span>

          </div>

          <div className="kpi-value">
            {formatPercent(
              competitiveProduct?.reference_difference_percent
            )}
          </div>

          <div className="kpi-subtitle">
            Difference from market average
          </div>

        </div>

        <div className="kpi-card">

          <div className="kpi-top">

            <span className="kpi-label">
              Matched Sources
            </span>

          </div>

          <div className="kpi-value">
            {matchedProductCount}
          </div>

          <div className="kpi-subtitle">
            Amazon + competitors
          </div>

        </div>

      </section>

      {/* =====================================================
          PRICING COMPARISON
      ===================================================== */}

      <section className="panel">

        <div className="section-header">

          <div>
            <h2>
              Pricing Comparison
            </h2>

            <p>
              Current prices across matched retailers
            </p>
          </div>

          <span className="section-count">
            {products.length} sources
          </span>

        </div>

        <div className="comparison-grid">

          {products.map(
            (product) => {

              const isReference =
                String(product.source).toUpperCase() ===
                referenceSource;

              return (
                <div
                  className={`retailer-card ${
                    isReference
                      ? "retailer-reference"
                      : ""
                  }`}
                  key={`${product.source}-${product.source_product_id}`}
                >

                  <div className="retailer-header">

                    <span
                      className={`source-badge ${getSourceClass(
                        product.source
                      )}`}
                    >
                      {sourceLabel(
                        product.source
                      )}
                    </span>

                    {isReference && (
                      <span className="reference-badge">
                        REFERENCE
                      </span>
                    )}

                  </div>

                  <div className="retailer-price">
                    {formatPrice(
                      product.price
                    )}
                  </div>

                  <div className="retailer-difference">

                    <span>
                      vs market
                    </span>

                    <strong>
                      {formatPercent(
                        product.price_difference_percent
                      )}
                    </strong>

                  </div>

                  <div className="retailer-footer">

                    <span>
                      {product.availability ===
                      "in_stock"
                        ? "In stock"
                        : product.availability}
                    </span>

                    <span>
                      {formatDate(
                        product.observed_at
                      )}
                    </span>

                  </div>

                </div>
              );
            }
          )}

        </div>

      </section>

      {/* =====================================================
          PRICING SIGNALS
      ===================================================== */}

      <section className="panel">

        <div className="section-header">

          <div>
            <h2>
              Pricing Signals
            </h2>

            <p>
              Rule-based signals generated from competitive data
            </p>
          </div>

          <span className="signal-count">
            {signalItems.length} active
          </span>

        </div>

        {signalItems.length === 0 ? (

          <div className="empty-panel">
            No pricing signals detected.
          </div>

        ) : (

          <div className="signals-list">

            {signalItems.map(
              (signal, index) => (

                <div
                  className={`signal-card ${getSignalClass(
                    signal.severity
                  )}`}
                  key={`${signal.signal_type}-${index}`}
                >

                  <div className="signal-icon">
                    !
                  </div>

                  <div className="signal-content">

                    <div className="signal-heading">

                      <strong>
                        {signal.signal_type
                          ?.replaceAll(
                            "_",
                            " "
                          )}
                      </strong>

                      <span className="severity">
                        {signal.severity}
                      </span>

                    </div>

                    <p>
                      {signal.message}
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

      {/* =====================================================
          PRICE TRENDS
      ===================================================== */}

      <section className="panel">

        <div className="section-header">

          <div>
            <h2>
              Price Trends
            </h2>

            <p>
              Historical movement for each matched retailer
            </p>
          </div>

        </div>

        <div className="trend-grid">

          {trendProducts.map(
            (product) => (

              <div
                className="trend-card"
                key={`${product.source}-${product.source_product_id}`}
              >

                <div className="trend-header">

                  <span
                    className={`source-badge ${getSourceClass(
                      product.source
                    )}`}
                  >
                    {sourceLabel(
                      product.source
                    )}
                  </span>

                  <span
                    className={`trend-badge ${getTrendClass(
                      product.trend
                    )}`}
                  >
                    {getTrendLabel(
                      product.trend
                    )}
                  </span>

                </div>

                <div className="trend-stats">

                  <div>
                    <span>
                      Min
                    </span>

                    <strong>
                      {formatPrice(
                        product.min_price
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Average
                    </span>

                    <strong>
                      {formatPrice(
                        product.average_price
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Max
                    </span>

                    <strong>
                      {formatPrice(
                        product.max_price
                      )}
                    </strong>
                  </div>

                </div>

                <div className="observation-count">
                  {product.observation_count} observation
                  {product.observation_count === 1
                    ? ""
                    : "s"}
                </div>

              </div>

            )
          )}

        </div>

      </section>

      {/* =====================================================
          PRICE HISTORY
      ===================================================== */}

      <section className="panel">

        <div className="section-header">

          <div>
            <h2>
              Price History
            </h2>

            <p>
              Historical observations stored for matched products
            </p>
          </div>

        </div>

        <div className="history-table-wrapper">

          <table className="modern-table">

            <thead>
              <tr>
                <th>Source</th>
                <th>Price</th>
                <th>Original</th>
                <th>Discount</th>
                <th>Observed At</th>
                <th>Match</th>
              </tr>
            </thead>

            <tbody>

              {historyProducts.map(
                (product) => {

                  const history =
                    product.history || [];

                  const latestPrice =
                    getLatestHistoryPrice(
                      history
                    );

                  return (
                    <tr
                      key={`${product.source}-${product.source_product_id}`}
                    >

                      <td>
                        <span
                          className={`source-badge ${getSourceClass(
                            product.source
                          )}`}
                        >
                          {sourceLabel(
                            product.source
                          )}
                        </span>
                      </td>

                      <td className="price-cell">
                        {formatPrice(
                          latestPrice
                        )}
                      </td>

                      <td>
                        {history.length
                          ? formatPrice(
                              history[
                                history.length - 1
                              ].original_price
                            )
                          : "-"}
                      </td>

                      <td>
                        {history.length
                          ? formatPercent(
                              Number(
                                history[
                                  history.length - 1
                                ].discount || 0
                              )
                            )
                          : "-"}
                      </td>

                      <td>
                        {history.length
                          ? formatDate(
                              history[
                                history.length - 1
                              ].observed_at
                            )
                          : "-"}
                      </td>

                      <td>

                        <div className="match-cell">

                          <span>
                            {product.match_method}
                          </span>

                          <strong>
                            {(
                              Number(
                                product.match_confidence ||
                                  0
                              ) * 100
                            ).toFixed(0)}
                            %
                          </strong>

                        </div>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* =====================================================
          PRICE CHANGES
      ===================================================== */}

      <section className="panel">

        <div className="section-header">

          <div>
            <h2>
              Price Changes
            </h2>

            <p>
              Changes detected between stored observations
            </p>
          </div>

          <span className="section-count">
            {changeProducts.filter(
              (product) =>
                product.has_change
            ).length}{" "}
            changes
          </span>

        </div>

        <div className="history-table-wrapper">

          <table className="modern-table">

            <thead>
              <tr>
                <th>Source</th>
                <th>Previous</th>
                <th>Current</th>
                <th>Change</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {changeProducts.map(
                (product) => {

                  const change =
                    product.change;

                  return (
                    <tr
                      key={`${product.source}-${product.source_product_id}`}
                    >

                      <td>
                        <span
                          className={`source-badge ${getSourceClass(
                            product.source
                          )}`}
                        >
                          {sourceLabel(
                            product.source
                          )}
                        </span>
                      </td>

                      <td>
                        {change
                          ? formatPrice(
                              change.previous_price
                            )
                          : "-"}
                      </td>

                      <td className="price-cell">
                        {product.current
                          ? formatPrice(
                              product.current.price
                            )
                          : "-"}
                      </td>

                      <td>
                        {change
                          ? formatPercent(
                              change.change_percent
                            )
                          : "No change"}
                      </td>

                      <td>

                        <span
                          className={`change-status ${
                            product.has_change
                              ? "has-change"
                              : "no-change"
                          }`}
                        >
                          {product.has_change
                            ? "Changed"
                            : "No change"}
                        </span>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="dashboard-footer">

        <div>
          Pricing Intelligence Engine
        </div>

        <div>
          Competitive Pricing MVP
          <span className="footer-separator">
            •
          </span>
          Amazon Reference
          <span className="footer-separator">
            •
          </span>
          Walmart + Best Buy Competitors
        </div>

      </footer>

    </div>
  );
}

export default App;