const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "1234";
const DATA_FILE = path.join(__dirname, "data", "bookings.json");

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

function readBookings() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8") || "[]");
  } catch {
    return [];
  }
}
function writeBookings(list) {
  const tmp = DATA_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2), "utf8");
  fs.renameSync(tmp, DATA_FILE);
}
function adminAuth(req, res, next) {
  const token = req.get("x-admin-token");
  if (token !== ADMIN_PASSWORD) return res.status(401).json({ error: "Non autorisé." });
  next();
}
function normalizeDates(dates) {
  return Array.isArray(dates) ? [...new Set(dates.filter(Boolean).map(String))] : [];
}
function validBooking(body) {
  const players = Number(body.players);
  const dates = normalizeDates(body.dates);
  return body.name && body.phone && body.slot && dates.length &&
         Number.isInteger(players) && players >= 6 && players <= 12;
}

// Availability
app.get("/api/availability", (req, res) => {
  const requested = String(req.query.dates || "").split(",").filter(Boolean);
  const bookings = readBookings();
  const booked = [];
  for (const b of bookings) {
    for (const date of normalizeDates(b.dates)) {
      if (!requested.length || requested.includes(date)) {
        booked.push({ date, slot: b.slot });
      }
    }
  }
  res.json({ booked });
});

// Create reservation
app.post("/api/bookings", (req, res) => {
  const body = req.body || {};
  if (!validBooking(body)) {
    return res.status(400).json({ error: "Données de réservation invalides." });
  }

  const dates = normalizeDates(body.dates);
  const bookings = readBookings();
  const conflict = bookings.some(b =>
    b.slot === body.slot &&
    normalizeDates(b.dates).some(d => dates.includes(d))
  );
  if (conflict) return res.status(409).json({ error: "Ce créneau est déjà réservé." });

  const players = Number(body.players);
  const total = players * 100 * dates.length;
  const booking = {
    id: Date.now(),
    type: body.type === "monthly" ? "monthly" : "single",
    dates,
    month: body.month || null,
    weekday: body.weekday == null ? null : Number(body.weekday),
    slot: String(body.slot),
    players,
    name: String(body.name).trim(),
    phone: String(body.phone).trim(),
    total,
    status: "confirmed",
    createdAt: new Date().toISOString()
  };

  bookings.unshift(booking);
  writeBookings(bookings);
  res.status(201).json({ booking });
});

// Admin login
app.post("/api/admin/login", (req, res) => {
  if (String(req.body?.password || "") !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Mot de passe incorrect." });
  }
  res.json({ ok: true, token: ADMIN_PASSWORD });
});

// Admin list
app.get("/api/admin/bookings", adminAuth, (req, res) => {
  res.json({ bookings: readBookings() });
});

// REAL server-side cancellation
app.delete("/api/admin/bookings/:id", adminAuth, (req, res) => {
  const id = String(req.params.id);
  const bookings = readBookings();
  const index = bookings.findIndex(b => String(b.id) === id);
  if (index === -1) return res.status(404).json({ error: "Réservation introuvable." });

  const [deleted] = bookings.splice(index, 1);
  writeBookings(bookings);
  res.json({ ok: true, deletedId: id, booking: deleted });
});

app.post("/api/admin/logout", adminAuth, (req, res) => {
  res.json({ ok: true });
});

app.get(["/admin", "/admin/", "/admin.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`JO STADIUM démarré sur http://localhost:${PORT}`);
});
