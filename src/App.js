import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [pageTitle, setPageTitle] = useState("");
  const [submittedTitle, setSubmittedTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const canvasRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pageTitle.trim()) {
      setSubmittedTitle(pageTitle.trim());
    }
  }; 

  useEffect(() => {
    if (!submittedTitle) return;

    setLoading(true);
    setError(null);
    setData(null);

    const fetchJson = (url) =>
      fetch(url).then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      });

    const titleEncoded = encodeURIComponent(submittedTitle);

    // Calculate date range for last 30 days in YYYYMMDD format
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    const toDate = endDate.toISOString().slice(0, 10).replace(/-/g, "");
    const fromDate = startDate.toISOString().slice(0, 10).replace(/-/g, "");

    const urls = {
      pageInfo: `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=${titleEncoded}&prop=info|pageimages|links|langlinks&inprop=url|protection&piprop=thumbnail&pithumbsize=250&pllimit=max&lllimit=max&llprop=title`,
      revisions: `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=revisions&titles=${titleEncoded}&rvlimit=max&rvprop=timestamp|user|ids&rvdir=newer`,
      backlinks: `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=backlinks&bltitle=${titleEncoded}&bllimit=max`,
      summary: `https://en.wikipedia.org/api/rest_v1/page/summary/${titleEncoded}`,
      pageviews: `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/${titleEncoded}/daily/${fromDate}/${toDate}`,
    };

    Promise.all([
      fetchJson(urls.pageInfo),
      fetchJson(urls.revisions),
      fetchJson(urls.backlinks),
      fetchJson(urls.summary),
      fetchJson(urls.pageviews),
    ])
      .then(
        ([
          pageInfoData,
          revisionsData,
          backlinksData,
          summaryData,
          pageviewsData,
        ]) => {
          const page = Object.values(pageInfoData.query.pages)[0];
          if (!page || page.missing) {
            throw new Error("Page not found");
          }

          const revisions = page.revisions || revisionsData.query.pages[page.pageid].revisions || [];
          const backlinks = backlinksData.query.backlinks || [];

          const viewsArray = pageviewsData.items || [];
          const totalViews = viewsArray.reduce((acc, day) => acc + day.views, 0);
          const avgViews = viewsArray.length
            ? Math.round(totalViews / viewsArray.length)
            : 0;

          const uniqueEditors = new Set(revisions.map((rev) => rev.user)).size;
          const lastEditor = revisions.length ? revisions[revisions.length - 1].user : "N/A";
          const creationDate = revisions.length ? revisions[0].timestamp : "N/A";
          const lastEdit = page.touched || "N/A";
          const protectionStatus =
            page.protection && page.protection.length > 0
              ? page.protection.map((p) => p.type).join(", ")
              : "None";
          const langCount = page.langlinks ? page.langlinks.length : 0;
          const links = page.links ? page.links.map((link) => link.title) : [];

          setData({
            pageTitle: page.title,
            pageId: page.pageid,
            pageLength: page.length,
            lastEdit,
            currentRevisionId: revisions.length
              ? revisions[revisions.length - 1].revid
              : "N/A",
            creationDate,
            protectionStatus,
            summary: summaryData.extract,
            thumbnail: summaryData.thumbnail?.source || null,
            links,
            backlinks: backlinks.map((bl) => bl.title),
            totalViews,
            avgViews,
            viewsArray,
            uniqueEditors,
            lastEditor,
            langCount,
          });
        }
      )
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [submittedTitle]);

  // Draw page views chart
  useEffect(() => {
    if (!data || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const margin = 40;
    const chartWidth = width - margin * 2;
    const chartHeight = height - margin * 2;

    const views = data.viewsArray.map((d) => d.views);
    const maxViews = Math.max(...views, 10);
    const days = views.length;

    // Draw axes
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, margin + chartHeight);
    ctx.lineTo(margin + chartWidth, margin + chartHeight);
    ctx.stroke();

    // Draw line chart
    ctx.strokeStyle = "#007acc";
    ctx.lineWidth = 2;
    ctx.beginPath();

    views.forEach((v, i) => {
      const x = margin + (i / (days - 1)) * chartWidth;
      const y = margin + chartHeight - (v / maxViews) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw points
    ctx.fillStyle = "#007acc";
    views.forEach((v, i) => {
      const x = margin + (i / (days - 1)) * chartWidth;
      const y = margin + chartHeight - (v / maxViews) * chartHeight;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Y axis labels (0 and max)
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.fillText("0", margin - 20, margin + chartHeight);
    ctx.fillText(maxViews.toString(), margin - 30, margin + 10);

    // Draw X axis labels (start and end dates)
    const firstDate = data.viewsArray[0]?.timestamp?.slice(0, 10) || "";
    const lastDate = data.viewsArray[data.viewsArray.length - 1]?.timestamp?.slice(0, 10) || "";
    ctx.fillText(firstDate, margin, margin + chartHeight + 20);
    ctx.fillText(lastDate, margin + chartWidth - 50, margin + chartHeight + 20);
  }, [data]);

  return (
    <div className="app-container">
      <h1>Know_Wiki</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Wikipedia page title"
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
  
      {loading && <p className="loading">Loading data...</p>}
      {error && <p className="error">Error: {error}</p>}
  
      {data && !loading && !error && (
        <>
          <h2>{data.pageTitle} (Page ID: {data.pageId})</h2>
          <p>Length: {data.pageLength} bytes</p>
          <p>Last Edit: {new Date(data.lastEdit).toLocaleString()}</p>
          <p>Current Revision ID: {data.currentRevisionId}</p>
          <p>Page Creation Date: {new Date(data.creationDate).toLocaleString()}</p>
          <p>Protection Status: {data.protectionStatus}</p>
  
          <div className="content">
            <section className="section fullwidth">
              <h3>Summary</h3>
              {data.thumbnail && (
                <img
                  src={data.thumbnail}
                  alt="Main thumbnail"
                  className="thumbnail"
                />
              )}
              <p>{data.summary}</p>
            </section>
  
            <section className="section">
              <h3>Links</h3>
              <div className="list-scroll">
                {data.links.length === 0 ? (
                  <p>No links found.</p>
                ) : (
                  <ul>
                    {data.links.map((link, i) => (
                      <li key={i}>{link}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
  
            <section className="section">
              <h3>Backlinks</h3>
              <div className="list-scroll">
                {data.backlinks.length === 0 ? (
                  <p>No backlinks found.</p>
                ) : (
                  <ul>
                    {data.backlinks.map((link, i) => (
                      <li key={i}>{link}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
  
            <section className="section metrics">
              <h3>Audience & Engagement Metrics</h3>
              <p>Total Page Views (last 30 days): {data.totalViews}</p>
              <p>Average Daily Views: {data.avgViews}</p>
              <p>Total Unique Editors: {data.uniqueEditors}</p>
              <p>Last Editor Username: {data.lastEditor}</p>
              <p>Number of Languages: {data.langCount}</p>
  
              <h4>Daily Views (last 30 days)</h4>
              <canvas ref={canvasRef} width={800} height={200} />
            </section>
          </div>
        </>
      )}
    </div>
  );  
}

export default App;
