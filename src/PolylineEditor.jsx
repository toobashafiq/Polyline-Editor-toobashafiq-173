import React, { useState, useRef, useEffect } from "react";

function PolylineEditor() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [polylines, setPolylines] = useState([]);
  const [currentPolyline, setCurrentPolyline] = useState(null);
  const [mode, setMode] = useState("idle");
  const [selectedVertex, setSelectedVertex] = useState(null);
  const [nearestSegment, setNearestSegment] = useState(null);

  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [renderKey, setRenderKey] = useState(0);
  const [activeButton, setActiveButton] = useState(null);

  
  const saveState = (newState) => {
    setHistory((prev) => [...prev, polylines]);
    setRedoStack([]);
    setPolylines(newState);
  };

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setRedoStack((prev) => [polylines, ...prev]);
    setPolylines(last);
    setHistory((prev) => prev.slice(0, -1));
    setMode("Undo");
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory((prev) => [...prev, polylines]);
    setPolylines(next);
    setRedoStack((prev) => prev.slice(1));
    setMode("Redo");
  };

  const flashButton = (btn) => {
    setActiveButton(btn);
    setTimeout(() => setActiveButton(null), 250);
  };

  // ------------------- Canvas Draw -------------------
  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    polylines.forEach((poly) => {
      if (poly.length > 1) {
        ctx.beginPath();
        ctx.moveTo(poly[0].x, poly[0].y);
        for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].x, poly[i].y);
        ctx.strokeStyle = "#4b5563";
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      poly.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle =
          selectedVertex && selectedVertex.index === i && selectedVertex.poly === poly
            ? "#ef4444"
            : "#111827";
        ctx.fill();
      });
    });

  
    if (mode === "insert" && nearestSegment) {
      const { poly, index } = nearestSegment;
      ctx.beginPath();
      ctx.moveTo(poly[index].x, poly[index].y);
      ctx.lineTo(poly[index + 1].x, poly[index + 1].y);
      ctx.strokeStyle = "#2563eb"; // blue highlight
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  };

  useEffect(() => draw(), [polylines, selectedVertex, renderKey, nearestSegment, mode]);

  const getXY = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const pointToSegmentDistance = (px, py, a, b) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (dx === 0 && dy === 0) return Math.hypot(px - a.x, py - a.y);
    const t = ((px - a.x) * dx + (py - a.y) * dy) / (dx * dx + dy * dy);
    if (t < 0) return Math.hypot(px - a.x, py - a.y);
    if (t > 1) return Math.hypot(px - b.x, py - b.y);
    return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy));
  };

  const insertVertex = (x, y) => {
    let nearest = null;
    let minDist = Infinity;

    polylines.forEach((poly) => {
      for (let i = 0; i < poly.length - 1; i++) {
        const dist = pointToSegmentDistance(x, y, poly[i], poly[i + 1]);
        if (dist < minDist && dist < 15) {
          minDist = dist;
          nearest = { poly, index: i };
        }
      }
    });

    if (nearest) {
      nearest.poly.splice(nearest.index + 1, 0, { x, y });
      saveState([...polylines]);
    }
  };

 
  const handleClick = (e) => {
    if (mode === "idle" || mode === "Refresh") return;
    const { x, y } = getXY(e);

    if (mode === "add" && currentPolyline) {
      const newPolyline = [...currentPolyline, { x, y }];
      setCurrentPolyline(newPolyline);
      const updated = [...polylines];
      updated[updated.length - 1] = newPolyline;
      saveState(updated);
    }

    if (mode === "delete") {
      const nearest = findNearestVertex(x, y);
      if (nearest) {
        const updated = polylines.map((poly) =>
          poly === nearest.poly ? poly.filter((_, i) => i !== nearest.index) : poly
        );
        saveState(updated);
      }
    }

    if (mode === "insert") {
      insertVertex(x, y);
      flashButton("insert");
    }
  };

  const handleMouseDown = (e) => {
    if (mode === "idle" || mode === "Refresh") return;
    if (mode === "move") {
      const { x, y } = getXY(e);
      const nearest = findNearestVertex(x, y);
      if (nearest) setSelectedVertex(nearest);
    }
  };

  const handleMouseMove = (e) => {
    if (mode === "idle" || mode === "Refresh") return;
    const { x, y } = getXY(e);

    if (mode === "move" && selectedVertex) {
      selectedVertex.poly[selectedVertex.index] = { x, y };
      setPolylines([...polylines]);
    }

    if (mode === "insert") {
      let nearest = null;
      let minDist = Infinity;
      polylines.forEach((poly) => {
        for (let i = 0; i < poly.length - 1; i++) {
          const dist = pointToSegmentDistance(x, y, poly[i], poly[i + 1]);
          if (dist < minDist && dist < 15) {
            minDist = dist;
            nearest = { poly, index: i };
          }
        }
      });
      setNearestSegment(nearest);
    }
  };

  const handleMouseUp = () => {
    if (mode === "idle" || mode === "Refresh") return;
    if (mode === "move") {
      setHistory((prev) => [...prev, polylines]);
      setRedoStack([]);
    }
    setSelectedVertex(null);
  };

  const findNearestVertex = (x, y) => {
    let nearest = null;
    let minDist = Infinity;
    polylines.forEach((poly) =>
      poly.forEach((point, i) => {
        const dist = Math.hypot(point.x - x, point.y - y);
        if (dist < minDist && dist < 15) {
          minDist = dist;
          nearest = { poly, index: i };
        }
      })
    );
    return nearest;
  };

  const startAdd = () => {
    const newPolyline = [];
    setPolylines((prev) => [...prev, newPolyline]);
    setCurrentPolyline(newPolyline);
    setMode("add");
  };

  const refresh = () => {
    setMode("Refresh");
    setRenderKey((prev) => prev + 1);
    setTimeout(() => setMode("idle"), 400);
  };

  const clearAll = () => {
    const confirmed = window.confirm("Are you sure you want to clear all polylines?");
    if (!confirmed) return;
    setPolylines([]);
    setCurrentPolyline(null);
    setMode("Clear");
    setHistory([]);
    setRedoStack([]);
    flashButton("clear");
  };

  const saveData = () => {
    const blob = new Blob([JSON.stringify(polylines)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "polylines.json";
    link.click();
  };

  const loadData = (e) => {
    const reader = new FileReader();
    reader.onload = () => setPolylines(JSON.parse(reader.result));
    reader.readAsText(e.target.files[0]);
  };

  // ------------------- Keyboard Shortcuts -------------------
  useEffect(() => {
    const keyHandler = (e) => {
      if (e.key === "b") startAdd();
      if (e.key === "m") setMode("move");
      if (e.key === "d") setMode("delete");
      if (e.key === "r") refresh();
      if (e.key === "q") clearAll();
      if (e.key === "i") setMode("insert");
      if (e.key === "u") { undo(); flashButton("undo"); }
      if (e.key === "y") { redo(); flashButton("redo"); }
      if (e.key === "s") { saveData(); flashButton("save"); }
      if (e.key === "l") { fileInputRef.current.click(); flashButton("load"); }
      if (e.ctrlKey && e.key === "z") { undo(); flashButton("undo"); }
      if (e.ctrlKey && e.shiftKey && e.key === "Z") { redo(); flashButton("redo"); }
      if (e.ctrlKey && e.key === "y") { redo(); flashButton("redo"); }

      
      if (e.key === "Enter" && mode === "add") {
        setCurrentPolyline(null);
        setMode("idle");
      }
      if (e.key === "Escape" && mode === "add") {
        setPolylines(polylines.slice(0, -1));
        setCurrentPolyline(null);
        setMode("idle");
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [polylines, mode]);

  const buttonStyle = (active) => ({
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "500",
    background: active ? "#2563eb" : "#e5e7eb",
    color: active ? "#fff" : "#111827",
    transition: "all 0.2s ease",
  });

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #eef2ff, #f8fafc)", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px", fontFamily: "Arial" }}>
      <h2 style={{ marginBottom: "15px", color: "#111827" }}>Polyline Editor</h2>

      <div style={{ display: "flex", gap: "20px", width: "100%", maxWidth: "1000px" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", gap: "10px", overflowX: "auto", flexWrap: "nowrap", marginBottom: "10px" }}>
            <button style={buttonStyle(mode === "idle")} onClick={() => setMode("idle")}>💤 Idle</button>
            <button style={buttonStyle(mode === "add")} onClick={startAdd}>➕ Add</button>
            <button style={buttonStyle(mode === "move")} onClick={() => setMode("move")}>✋ Move</button>
            <button style={buttonStyle(mode === "delete")} onClick={() => setMode("delete")}>🗑 Delete</button>
            <button style={buttonStyle(mode === "insert")} onClick={() => setMode("insert")}>✏️ Insert</button>
            <button style={buttonStyle(activeButton === "undo")} onClick={() => { undo(); flashButton("undo"); }}>↩ Undo</button>
            <button style={buttonStyle(activeButton === "redo")} onClick={() => { redo(); flashButton("redo"); }}>↪ Redo</button>
            <button style={buttonStyle(activeButton === "save")} onClick={() => { saveData(); flashButton("save"); }}>💾 Save</button>
            <button style={buttonStyle(activeButton === "load")} onClick={() => { fileInputRef.current.click(); flashButton("load"); }}>📂 Load</button>
            <button style={buttonStyle(activeButton === "clear")} onClick={clearAll}>❌ Clear</button>
            <button style={buttonStyle(mode === "Refresh")} onClick={refresh}>🔄 Refresh</button>
          </div>

          <div>
            <span style={{ padding: "6px 12px", borderRadius: "999px", background: "#e5e7eb", color: "#111827", fontWeight: "500" }}>
              Mode: {mode || "None"}
            </span>
          </div>

          <div style={{ background: "#fff", padding: "12px", borderRadius: "12px", boxShadow: "0 6px 18px rgba(0,0,0,0.12)" }}>
            <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={loadData} />
            <canvas
              ref={canvasRef}
              width={700}
              height={450}
              style={{ borderRadius: "8px", border: "1px solid #d1d5db", cursor: mode === "move" ? "grab" : mode === "delete" || mode === "insert" ? "crosshair" : "default" }}
              onClick={handleClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />
          </div>
        </div>

        {/* ------------------- Instructions Panel ------------------- */}
        <div style={{ width: "250px", padding: "12px 16px", borderRadius: "12px", background: "#f3f4f6", color: "#111827", fontWeight: "500", textAlign: "left", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", height: "fit-content", alignSelf: "flex-start" }}>
          <h3 style={{ marginBottom: "8px", fontSize: "16px", color: "#2563eb" }}>Instructions</h3>
          <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: "1.6" }}>
            <li>💤 Idle Mode: Click Idle</li>
            <li>➕ Add Points: Click Add / press <b>b</b></li>
            <li>✋ Move Vertices: Click Move / press <b>m</b></li>
            <li>🗑 Delete Points: Click Delete / press <b>d</b></li>
            <li>✏️ Insert Points: Click Insert / press <b>i</b> (Nearest segment highlighted in blue)</li>
            <li>🔄 Refresh Canvas: Click Refresh / press <b>r</b></li>
            <li>❌ Clear All: Click Clear / press <b>q</b></li>
            <li>↩ Undo: Click Undo / press <b>u</b></li>
            <li>↪ Redo: Click Redo / Ctrl+Y / press <b>y</b></li>
            <li>💾 Save: Click Save / press <b>s</b></li>
            <li>📂 Load: Click Load / press <b>l</b></li>
            <li>✅ Insert points are added to undo/redo history</li>
            <li>✅ Press <b>Enter</b> to finish Add mode</li>
            <li>✅ Press <b>Escape</b> to cancel Add mode</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PolylineEditor;