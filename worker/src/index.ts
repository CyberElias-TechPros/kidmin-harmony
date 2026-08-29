import { Hono } from "hono";
import {
  authenticate,
  hashPassword,
  verifyPassword,
  signToken,
  requireRole,
  type AuthUser,
  type Role,
} from "./auth";
import { json, error, notFound, id, corsHeaders, todayISO, type Env } from "./helpers";

const app = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// CORS + preflight
// ---------------------------------------------------------------------------
app.use("*", async (c, next) => {
  if (c.req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(c.env.ALLOWED_ORIGINS) });
  }
  await next();
  const headers = corsHeaders(c.env.ALLOWED_ORIGINS);
  const res = c.res;
  const newHeaders = new Headers(res.headers);
  Object.entries(headers).forEach(([k, v]) => newHeaders.set(k, v));
  c.res = new Response(res.body, { status: res.status, headers: newHeaders });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function currentUser(c: {
  env: Env;
  req: { raw: Request };
}): Promise<AuthUser | null> {
  return authenticate(c.req.raw, c.env.JWT_SECRET);
}

async function requireRoles(c: any, roles: Role[]): Promise<AuthUser> {
  const user = await currentUser(c);
  if (!user) throw new Error("UNAUTHORIZED");
  if (!requireRole(user, roles)) throw new Error("FORBIDDEN");
  return user;
}

function handleError(e: unknown): Response {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg === "UNAUTHORIZED") return error("Authentication required", 401);
  if (msg === "FORBIDDEN") return error("You do not have permission to perform this action", 403);
  if (msg === "EXISTS") return error("A record with this value already exists", 409);
  console.error(e);
  return error("Something went wrong", 500);
}

const ROLES = ["admin", "teacher", "parent", "volunteer", "cellLeader", "partner"];

async function readBody<T = any>(c: any): Promise<T> {
  try {
    return (await c.req.json()) as T;
  } catch {
    return {} as T;
  }
}

function str(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") return v;
  return String(v);
}

function int(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function bool(v: unknown): number {
  return v === true || v === "true" || v === 1 || v === "1" ? 1 : 0;
}

function mapUser(row: any): AuthUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatar: row.avatar ?? undefined,
  };
}

function mapChild(r: any) {
  return {
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    fullName: `${r.first_name} ${r.last_name}`,
    dob: r.dob,
    age: r.dob ? ageFromDob(r.dob) : null,
    gender: r.gender,
    ageGroup: r.age_group,
    allergies: r.allergies,
    medicalNotes: r.medical_notes,
    churchMember: !!r.church_member,
    parentFirstName: r.parent_first_name,
    parentLastName: r.parent_last_name,
    parentName: [r.parent_first_name, r.parent_last_name].filter(Boolean).join(" "),
    parentEmail: r.parent_email,
    parentPhone: r.parent_phone,
    address: r.address,
    city: r.city,
    state: r.state,
    zipCode: r.zip_code,
    emergencyContactName: r.emergency_contact_name,
    emergencyContactRelation: r.emergency_contact_relation,
    emergencyContactPhone: r.emergency_contact_phone,
    photoUrl: r.photo_url,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function ageFromDob(dob: string): number {
  const d = new Date(dob);
  if (isNaN(d.getTime())) return 0;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function mapEvent(r: any) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    startDate: r.start_date,
    endDate: r.end_date,
    startTime: r.start_time,
    endTime: r.end_time,
    location: r.location,
    address: r.address,
    capacity: r.capacity,
    ageGroup: r.age_group,
    requiresRegistration: !!r.requires_registration,
    imageUrl: r.image_url,
    status: r.status,
    createdBy: r.created_by,
    createdAt: r.created_at,
  };
}

function mapLesson(r: any) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    ageGroup: r.age_group,
    category: r.category,
    date: r.lesson_date,
    duration: r.duration,
    createdBy: r.created_by,
    createdAt: r.created_at,
  };
}

function mapPartner(r: any) {
  return {
    id: r.id,
    name: r.name,
    contactPerson: r.contact_person,
    email: r.email,
    phone: r.phone,
    partnershipType: r.partnership_type,
    contributionAmount: r.contribution_amount,
    lastContribution: r.last_contribution,
    nextMeeting: r.next_meeting,
    notes: r.notes,
    status: r.status,
    createdAt: r.created_at,
  };
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
app.get("/api/health", (c) => json({ ok: true, service: "kidmin-harmony-api", time: new Date().toISOString() }));

// ---------------------------------------------------------------------------
// Seed (only when SEED_DEMO is explicitly enabled)
// ---------------------------------------------------------------------------
app.post("/api/auth/seed", async (c) => {
  if (c.env.SEED_DEMO !== "true") return error("Seeding is disabled", 403);
  try {
    const demoUsers = [
      { email: "admin@church.org", password: "admin123", name: "Admin User", role: "admin" },
      { email: "teacher@church.org", password: "teacher123", name: "Teacher Smith", role: "teacher" },
      { email: "parent@church.org", password: "parent123", name: "Parent Jones", role: "parent" },
    ];
    for (const u of demoUsers) {
      const existing = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(u.email).first();
      if (!existing) {
        const userId = id();
        const passwordHash = await hashPassword(u.password);
        await c.env.DB.prepare(
          "INSERT INTO users (id, name, email, password_hash, role, avatar) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(userId, u.name, u.email, passwordHash, u.role, `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff`).run();
      }
    }

    // Populate sample ministry data only if the children table is empty, so
    // re-running the seed never duplicates content.
    const childCount = (await c.env.DB.prepare("SELECT COUNT(*) AS n FROM children").first<any>())?.n ?? 0;
    if (childCount === 0) {
      const admin = await c.env.DB.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").first<any>();

      const sampleChildren = [
        { fn: "Emma", ln: "Johnson", dob: "2016-05-12", age: "elementary", pf: "Sarah", pl: "Johnson", pe: "parent@church.org", ph: "555-123-4567" },
        { fn: "Noah", ln: "Smith", dob: "2018-03-01", age: "pre-school", pf: "Michael", pl: "Smith", pe: "parent@church.org", ph: "555-999-0000" },
        { fn: "Olivia", ln: "Davis", dob: "2015-09-10", age: "elementary", pf: "Emily", pl: "Davis", pe: "olivia.parent@example.com", ph: "555-222-3333" },
        { fn: "William", ln: "Miller", dob: "2017-11-23", age: "pre-teen", pf: "David", pl: "Miller", pe: "william.parent@example.com", ph: "555-444-5555" },
        { fn: "Sophia", ln: "Brown", dob: "2014-02-14", age: "pre-teen", pf: "Jennifer", pl: "Brown", pe: "sophia.parent@example.com", ph: "555-666-7777" },
        { fn: "Ava", ln: "Anderson", dob: "2021-07-05", age: "pre-school", pf: "Robert", pl: "Anderson", pe: "ava.parent@example.com", ph: "555-888-9999" },
      ];
      const childIds: string[] = [];
      for (const ch of sampleChildren) {
        const cid = id();
        childIds.push(cid);
        await c.env.DB.prepare(
          `INSERT INTO children (id, first_name, last_name, dob, gender, age_group, allergies, church_member, parent_first_name, parent_last_name, parent_email, parent_phone, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(cid, ch.fn, ch.ln, ch.dob, "female", ch.age, "None", 1, ch.pf, ch.pl, ch.pe, ch.ph, admin?.id ?? null).run();
      }

      // Create an attendance session for "today" and check in two children.
      const today = todayISO();
      const sessionId = id();
      await c.env.DB.prepare(
        "INSERT INTO attendance_sessions (id, date, service_type, created_by) VALUES (?, ?, ?, ?)"
      ).bind(sessionId, today, "Sunday Morning", admin?.id ?? null).run();
      const todayKey = today.replace(/-/g, "");
      await c.env.DB.prepare(
        "INSERT INTO attendance_records (id, session_id, child_id, checked_in_at, checked_by, status) VALUES (?, ?, ?, ?, ?, 'present')"
      ).bind(id(), sessionId, childIds[0], `${today}T09:15:00.000Z`, "Teacher Smith").run();
      await c.env.DB.prepare(
        "INSERT INTO attendance_records (id, session_id, child_id, checked_in_at, checked_by, status) VALUES (?, ?, ?, ?, ?, 'present')"
      ).bind(id(), sessionId, childIds[1], `${today}T09:22:00.000Z`, "Teacher Smith").run();
      await c.env.DB.prepare(
        "INSERT INTO attendance_records (id, session_id, child_id, checked_in_at, checked_by, status) VALUES (?, ?, ?, ?, ?, 'present')"
      ).bind(id(), sessionId, childIds[2], `${today}T09:35:00.000Z`, "Admin User").run();

      // Upcoming + past events.
      const events = [
        { title: "Bible Camp", description: "Annual bible camp for all age groups with fun activities and Bible lessons.", startDate: "2026-09-15", endDate: "2026-09-17", cap: 60, loc: "Church Main Hall", status: "upcoming" },
        { title: "Christmas Concert", description: "Annual children's Christmas concert and presentation.", startDate: "2026-12-18", endDate: "2026-12-18", cap: 120, loc: "Church Auditorium", status: "upcoming" },
        { title: "Easter Egg Hunt", description: "Easter celebration with egg hunt, games, and storytelling.", startDate: "2026-04-05", endDate: "2026-04-05", cap: 80, loc: "Church Garden", status: "past" },
        { title: "Summer Bible School", description: "Special summer bible school program for children ages 5-12.", startDate: "2026-05-15", endDate: "2026-05-17", cap: 65, loc: "Church Main Hall", status: "past" },
      ];
      const eventIds: string[] = [];
      for (const e of events) {
        const eid = id();
        eventIds.push(eid);
        await c.env.DB.prepare(
          `INSERT INTO events (id, title, description, start_date, end_date, start_time, end_time, location, capacity, age_group, requires_registration, status, created_by)
           VALUES (?, ?, ?, ?, ?, '09:00', '14:00', ?, ?, 'all', 1, ?, ?)`
        ).bind(eid, e.title, e.description, e.startDate, e.endDate, e.loc, e.cap, e.status, admin?.id ?? null).run();
      }
      // Register a couple children to the first upcoming event.
      await c.env.DB.prepare("INSERT INTO event_attendees (id, event_id, child_id, status) VALUES (?, ?, ?, 'confirmed')")
        .bind(id(), eventIds[0], childIds[0]).run();
      await c.env.DB.prepare("INSERT INTO event_attendees (id, event_id, child_id, status) VALUES (?, ?, ?, 'pending')")
        .bind(id(), eventIds[0], childIds[1]).run();

      // Lessons.
      const lessons = [
        { title: "God Creates the World", desc: "Learning about the creation story from Genesis", age: "elementary", cat: "Bible Stories", date: "2026-08-02", dur: 45 },
        { title: "Noah's Ark", desc: "Learning about Noah and God's promise", age: "pre-school", cat: "Bible Stories", date: "2026-08-09", dur: 40 },
        { title: "The Good Samaritan", desc: "Jesus teaches about loving our neighbors", age: "elementary", cat: "Parables", date: "2026-08-16", dur: 50 },
        { title: "Daniel in the Lion's Den", desc: "God protects Daniel for his faithfulness", age: "pre-school", cat: "Bible Stories", date: "2026-08-23", dur: 40 },
        { title: "The Lord's Prayer", desc: "Learning how Jesus taught us to pray", age: "pre-teen", cat: "Prayer", date: "2026-08-30", dur: 45 },
        { title: "The Fruit of the Spirit", desc: "Learning about godly character traits", age: "elementary", cat: "Christian Living", date: "2026-09-06", dur: 50 },
      ];
      for (const l of lessons) {
        const lid = id();
        await c.env.DB.prepare(
          `INSERT INTO lessons (id, title, description, age_group, category, lesson_date, duration, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(lid, l.title, l.desc, l.age, l.cat, l.date, l.dur, admin?.id ?? null).run();
        await c.env.DB.prepare("INSERT INTO lesson_objectives (id, lesson_id, text) VALUES (?, ?, ?)")
          .bind(id(), lid, `Understand ${l.title}`).run();
        await c.env.DB.prepare("INSERT INTO lesson_materials (id, lesson_id, name) VALUES (?, ?, ?)")
          .bind(id(), lid, "Bibles").run();
        await c.env.DB.prepare("INSERT INTO lesson_activities (id, lesson_id, name, description, duration, materials) VALUES (?, ?, ?, ?, ?, ?)")
          .bind(id(), lid, "Discussion", "Group discussion about the lesson", 15, "Bibles").run();
      }

      // Partners.
      const partners = [
        { name: "Grace Community Foundation", cp: "John Smith", email: "john@gracefoundation.org", type: "Financial", notes: "Annual sponsor for Bible Camp.", status: "active" },
        { name: "Kingdom Kids Publishing", cp: "Sarah Johnson", email: "sarah@kingdomkids.com", type: "Resource", notes: "Provides curriculum materials.", status: "active" },
        { name: "Faithful Volunteers Network", cp: "Michael Chang", email: "michael@faithfulvolunteers.org", type: "Service", notes: "Provides volunteer staff.", status: "active" },
      ];
      for (const p of partners) {
        await c.env.DB.prepare(
          `INSERT INTO partners (id, name, contact_person, email, phone, partnership_type, notes, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(id(), p.name, p.cp, p.email, "555-000-0000", p.type, p.notes, p.status).run();
      }

      // Sample volunteers on the first upcoming event.
      await c.env.DB.prepare("INSERT INTO event_volunteers (id, event_id, name, role, assigned) VALUES (?, ?, ?, ?, ?)")
        .bind(id(), eventIds[0], "James Wilson", "Group Leader", "Group A").run();
    }

    return json({ ok: true, seeded: true });
  } catch (e) {
    return handleError(e);
  }
});

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
app.post("/api/auth/register", async (c) => {
  try {
    const body = await readBody(c);
    const name = str(body.name)?.trim();
    const email = str(body.email)?.trim().toLowerCase();
    const password = str(body.password);
    let role = (str(body.role) || "parent") as Role;

    if (!name || !email || !password) return error("Name, email and password are required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return error("Invalid email address");
    if (password.length < 6) return error("Password must be at least 6 characters");
    if (!ROLES.includes(role)) role = "parent";
    // Security: public self-registration is restricted to parents. Any staff
    // role (teacher, volunteer, cellLeader, partner) holds access to children's
    // sensitive data, so those accounts must be provisioned by an administrator.
    if (role === "admin") return error("Admin accounts cannot be created through registration", 403);
    if (role !== "parent")
      return error("Staff accounts must be created by an administrator. Please register as a parent or contact your ministry administrator.", 403);

    const existing = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) return error("An account with this email already exists", 409);

    const userId = id();
    const passwordHash = await hashPassword(password);
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;

    await c.env.DB.prepare(
      "INSERT INTO users (id, name, email, password_hash, role, avatar) VALUES (?, ?, ?, ?, ?, ?)"
    )
      .bind(userId, name, email, passwordHash, role, avatar)
      .run();

    const user: AuthUser = { id: userId, name, email, role, avatar };
    const token = await signToken(
      { sub: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      c.env.JWT_SECRET
    );
    return json({ token, user }, 201);
  } catch (e) {
    return handleError(e);
  }
});

app.post("/api/auth/login", async (c) => {
  try {
    const body = await readBody(c);
    const email = str(body.email)?.trim().toLowerCase();
    const password = str(body.password);
    if (!email || !password) return error("Email and password are required");

    const row = await c.env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first<any>();
    if (!row) return error("Invalid email or password", 401);

    const ok = await verifyPassword(password, row.password_hash);
    if (!ok) return error("Invalid email or password", 401);

    const user = mapUser(row);
    const token = await signToken(
      { sub: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      c.env.JWT_SECRET
    );
    return json({ token, user });
  } catch (e) {
    return handleError(e);
  }
});

app.get("/api/auth/me", async (c) => {
  const user = await currentUser(c);
  if (!user) return error("Authentication required", 401);
  const row = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(user.id).first<any>();
  if (!row) return error("User not found", 404);
  return json({ user: mapUser(row) });
});

app.put("/api/auth/me", async (c) => {
  try {
    const user = await currentUser(c);
    if (!user) return error("Authentication required", 401);
    const b = await readBody(c);
    const name = str(b.name)?.trim();
    const avatar = str(b.avatar);
    if (name) {
      await c.env.DB.prepare("UPDATE users SET name = ?, avatar = COALESCE(?, avatar), updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?")
        .bind(name, avatar, user.id)
        .run();
    } else if (avatar) {
      await c.env.DB.prepare("UPDATE users SET avatar = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?")
        .bind(avatar, user.id)
        .run();
    }
    const row = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(user.id).first<any>();
    return json({ user: mapUser(row) });
  } catch (e) {
    return handleError(e);
  }
});

app.post("/api/auth/logout", async (c) => {
  // Stateless JWT: nothing to revoke server-side.
  return json({ ok: true });
});

// ---------------------------------------------------------------------------
// Children
// ---------------------------------------------------------------------------
app.get("/api/children", async (c) => {
  try {
    const user = await requireRoles(c, ["admin", "teacher", "parent", "volunteer", "cellLeader", "partner"]);
    let result: D1Result<any>;
    if (user.role === "parent") {
      result = await c.env.DB.prepare("SELECT * FROM children WHERE parent_email = ? ORDER BY created_at DESC")
        .bind(user.email)
        .all<any>();
    } else {
      result = await c.env.DB.prepare("SELECT * FROM children ORDER BY created_at DESC").all<any>();
    }
    return json({ children: result.results.map(mapChild) });
  } catch (e) {
    return handleError(e);
  }
});

app.get("/api/children/:id", async (c) => {
  try {
    const user = await requireRoles(c, ["admin", "teacher", "parent", "volunteer", "cellLeader", "partner"]);
    const childId = c.req.param("id");
    const row = await c.env.DB.prepare("SELECT * FROM children WHERE id = ?").bind(childId).first<any>();
    if (!row) return notFound("Child not found");
    if (user.role === "parent" && row.parent_email !== user.email) return error("Forbidden", 403);

    const notes = await c.env.DB.prepare("SELECT * FROM child_notes WHERE child_id = ? ORDER BY created_at DESC")
      .bind(childId)
      .all<any>();
    const attendance = await c.env.DB.prepare(
      "SELECT ar.*, s.date, s.service_type FROM attendance_records ar JOIN attendance_sessions s ON s.id = ar.session_id WHERE ar.child_id = ? ORDER BY s.date DESC"
    )
      .bind(childId)
      .all<any>();

    const child = mapChild(row);
    return json({
      child,
      notes: notes.results.map((n) => ({ id: n.id, author: n.author, text: n.text, date: n.created_at })),
      attendance: attendance.results.map((a) => ({
        id: a.id,
        date: a.date,
        serviceType: a.service_type,
        status: a.status,
        checkedBy: a.checked_by,
        checkedInAt: a.checked_in_at,
      })),
    });
  } catch (e) {
    return handleError(e);
  }
});

app.post("/api/children", async (c) => {
  try {
    const user = await requireRoles(c, ["admin", "teacher"]);
    const b = await readBody(c);
    const firstName = str(b.firstName)?.trim();
    const lastName = str(b.lastName)?.trim();
    if (!firstName || !lastName) return error("First name and last name are required");

    const childId = id();
    await c.env.DB.prepare(
      `INSERT INTO children (
        id, first_name, last_name, dob, gender, age_group, allergies, medical_notes, church_member,
        parent_first_name, parent_last_name, parent_email, parent_phone,
        address, city, state, zip_code,
        emergency_contact_name, emergency_contact_relation, emergency_contact_phone,
        photo_url, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        childId,
        firstName,
        lastName,
        str(b.dob),
        str(b.gender),
        str(b.ageGroup),
        str(b.allergies),
        str(b.medicalNotes),
        bool(b.churchMember),
        str(b.parentFirstName),
        str(b.parentLastName),
        str(b.parentEmail),
        str(b.parentPhone),
        str(b.address),
        str(b.city),
        str(b.state),
        str(b.zipCode),
        str(b.emergencyContactName),
        str(b.emergencyContactRelation),
        str(b.emergencyContactPhone),
        str(b.photoUrl),
        user.id
      )
      .run();

    const row = await c.env.DB.prepare("SELECT * FROM children WHERE id = ?").bind(childId).first<any>();
    return json({ child: mapChild(row) }, 201);
  } catch (e) {
    return handleError(e);
  }
});

app.put("/api/children/:id", async (c) => {
  try {
    const user = await requireRoles(c, ["admin", "teacher"]);
    const childId = c.req.param("id");
    const b = await readBody(c);
    await c.env.DB.prepare(
      `UPDATE children SET
        first_name = ?, last_name = ?, dob = ?, gender = ?, age_group = ?, allergies = ?, medical_notes = ?,
        church_member = ?, parent_first_name = ?, parent_last_name = ?, parent_email = ?, parent_phone = ?,
        address = ?, city = ?, state = ?, zip_code = ?,
        emergency_contact_name = ?, emergency_contact_relation = ?, emergency_contact_phone = ?,
        photo_url = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
      WHERE id = ?`
    )
      .bind(
        str(b.firstName),
        str(b.lastName),
        str(b.dob),
        str(b.gender),
        str(b.ageGroup),
        str(b.allergies),
        str(b.medicalNotes),
        bool(b.churchMember),
        str(b.parentFirstName),
        str(b.parentLastName),
        str(b.parentEmail),
        str(b.parentPhone),
        str(b.address),
        str(b.city),
        str(b.state),
        str(b.zipCode),
        str(b.emergencyContactName),
        str(b.emergencyContactRelation),
        str(b.emergencyContactPhone),
        str(b.photoUrl),
        childId
      )
      .run();

    const row = await c.env.DB.prepare("SELECT * FROM children WHERE id = ?").bind(childId).first<any>();
    if (!row) return notFound("Child not found");
    return json({ child: mapChild(row) });
  } catch (e) {
    return handleError(e);
  }
});

app.delete("/api/children/:id", async (c) => {
  try {
    await requireRoles(c, ["admin"]);
    const childId = c.req.param("id");
    const row = await c.env.DB.prepare("SELECT id FROM children WHERE id = ?").bind(childId).first();
    if (!row) return notFound("Child not found");
    await c.env.DB.prepare("DELETE FROM children WHERE id = ?").bind(childId).run();
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
});

app.post("/api/children/:id/notes", async (c) => {
  try {
    const user = await requireRoles(c, ["admin", "teacher"]);
    const childId = c.req.param("id");
    const b = await readBody(c);
    const text = str(b.text)?.trim();
    if (!text) return error("Note text is required");
    const noteId = id();
    await c.env.DB.prepare(
      "INSERT INTO child_notes (id, child_id, author, text) VALUES (?, ?, ?, ?)"
    )
      .bind(noteId, childId, str(b.author) || user.name, text)
      .run();
    const note = await c.env.DB.prepare("SELECT * FROM child_notes WHERE id = ?").bind(noteId).first<any>();
    return json({ note: { id: note.id, author: note.author, text: note.text, date: note.created_at } }, 201);
  } catch (e) {
    return handleError(e);
  }
});

app.delete("/api/children/:id/notes/:noteId", async (c) => {
  try {
    await requireRoles(c, ["admin", "teacher"]);
    await c.env.DB.prepare("DELETE FROM child_notes WHERE id = ?").bind(c.req.param("noteId")).run();
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
});

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------
app.get("/api/attendance", async (c) => {
  try {
    const user = await requireRoles(c, ["admin", "teacher", "volunteer", "cellLeader", "partner"]);
    const sessions = await c.env.DB.prepare(
      "SELECT s.*, COUNT(ar.id) AS present_count FROM attendance_sessions s LEFT JOIN attendance_records ar ON ar.session_id = s.id GROUP BY s.id ORDER BY s.date DESC"
    ).all<any>();

    const total = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM children").first<any>();
    const presentToday = await c.env.DB.prepare(
      "SELECT COUNT(DISTINCT ar.child_id) AS n FROM attendance_records ar JOIN attendance_sessions s ON s.id = ar.session_id WHERE s.date = ?"
    ).bind(todayISO()).first<any>();

    return json({
      sessions: sessions.results.map((s) => ({
        id: s.id,
        date: s.date,
        serviceType: s.service_type,
        present: s.present_count,
        total: total?.n ?? 0,
        absent: Math.max(0, (total?.n ?? 0) - s.present_count),
      })),
      todayPresent: presentToday?.n ?? 0,
      totalChildren: total?.n ?? 0,
    });
  } catch (e) {
    return handleError(e);
  }
});

app.post("/api/attendance/sessions", async (c) => {
  try {
    const user = await requireRoles(c, ["admin", "teacher"]);
    const b = await readBody(c);
    const sessionId = id();
    const date = str(b.date) || todayISO();
    const serviceType = str(b.serviceType) || "Sunday Morning";
    await c.env.DB.prepare(
      "INSERT INTO attendance_sessions (id, date, service_type, created_by) VALUES (?, ?, ?, ?)"
    )
      .bind(sessionId, date, serviceType, user.id)
      .run();
    const row = await c.env.DB.prepare("SELECT * FROM attendance_sessions WHERE id = ?").bind(sessionId).first<any>();
    return json({ session: { id: row.id, date: row.date, serviceType: row.service_type } }, 201);
  } catch (e) {
    return handleError(e);
  }
});

app.post("/api/attendance/checkin", async (c) => {
  try {
    const user = await requireRoles(c, ["admin", "teacher", "volunteer", "cellLeader"]);
    const b = await readBody(c);
    const childId = str(b.childId);
    if (!childId) return error("childId is required");

    const child = await c.env.DB.prepare("SELECT id FROM children WHERE id = ?").bind(childId).first();
    if (!child) return notFound("Child not found");

    const date = str(b.date) || todayISO();
    const serviceType = str(b.serviceType) || "Sunday Morning";
    let sessionId = str(b.sessionId);
    if (!sessionId) {
      const existing = await c.env.DB.prepare(
        "SELECT id FROM attendance_sessions WHERE date = ? AND service_type = ?"
      ).bind(date, serviceType).first<any>();
      if (existing) {
        sessionId = existing.id;
      } else {
        sessionId = id();
        await c.env.DB.prepare(
          "INSERT INTO attendance_sessions (id, date, service_type, created_by) VALUES (?, ?, ?, ?)"
        ).bind(sessionId, date, serviceType, user.id).run();
      }
    }

    const existingRecord = await c.env.DB.prepare(
      "SELECT id FROM attendance_records WHERE session_id = ? AND child_id = ?"
    ).bind(sessionId, childId).first();
    if (existingRecord) return json({ alreadyCheckedIn: true });

    const recordId = id();
    await c.env.DB.prepare(
      "INSERT INTO attendance_records (id, session_id, child_id, checked_by, status) VALUES (?, ?, ?, ?, 'present')"
    ).bind(recordId, sessionId, childId, user.name).run();

    return json({ ok: true, recordId, childId, checkedInAt: new Date().toISOString() }, 201);
  } catch (e) {
    return handleError(e);
  }
});

app.get("/api/attendance/:id", async (c) => {
  try {
    await requireRoles(c, ["admin", "teacher", "volunteer", "cellLeader", "partner"]);
    const sessionId = c.req.param("id");
    const session = await c.env.DB.prepare("SELECT * FROM attendance_sessions WHERE id = ?").bind(sessionId).first<any>();
    if (!session) return notFound("Session not found");
    const records = await c.env.DB.prepare(
      `SELECT ar.*, c.first_name, c.last_name FROM attendance_records ar
       JOIN children c ON c.id = ar.child_id WHERE ar.session_id = ? ORDER BY ar.checked_in_at`
    ).bind(sessionId).all<any>();
    return json({
      session: { id: session.id, date: session.date, serviceType: session.service_type },
      checkIns: records.results.map((r) => ({
        id: r.id,
        childId: r.child_id,
        childName: `${r.first_name} ${r.last_name}`,
        time: r.checked_in_at,
        checkedBy: r.checked_by,
        status: r.status,
      })),
    });
  } catch (e) {
    return handleError(e);
  }
});

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
app.get("/api/events", async (c) => {
  try {
    await requireRoles(c, ["admin", "teacher", "parent", "volunteer", "cellLeader", "partner"]);
    const rows = await c.env.DB.prepare("SELECT * FROM events ORDER BY start_date").all<any>();
    const today = todayISO();
    const all = rows.results.map((r) => {
      const e = mapEvent(r);
      const status = e.startDate < today ? "past" : "upcoming";
      const attendees = c.env.DB.prepare("SELECT COUNT(*) AS n FROM event_attendees WHERE event_id = ?").bind(r.id).first<any>();
      return { ...e, status, registeredAttendees: 0 };
    });
    const withCounts = await Promise.all(
      all.map(async (e) => {
        const count = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM event_attendees WHERE event_id = ?").bind(e.id).first<any>();
        return { ...e, registeredAttendees: count?.n ?? 0 };
      })
    );
    return json({
      events: withCounts,
      upcoming: withCounts.filter((e) => e.status === "upcoming"),
      past: withCounts
        .filter((e) => e.status === "past")
        .sort((a, b) => (a.startDate < b.startDate ? 1 : -1)),
    });
  } catch (e) {
    return handleError(e);
  }
});

app.get("/api/events/:id", async (c) => {
  try {
    await requireRoles(c, ["admin", "teacher", "parent", "volunteer", "cellLeader", "partner"]);
    const eventId = c.req.param("id");
    const row = await c.env.DB.prepare("SELECT * FROM events WHERE id = ?").bind(eventId).first<any>();
    if (!row) return notFound("Event not found");

    const attendees = await c.env.DB.prepare(
      `SELECT ea.*, c.first_name, c.last_name, c.age_group, c.parent_email
       FROM event_attendees ea JOIN children c ON c.id = ea.child_id WHERE ea.event_id = ?`
    ).bind(eventId).all<any>();
    const volunteers = await c.env.DB.prepare("SELECT * FROM event_volunteers WHERE event_id = ?")
      .bind(eventId).all<any>();

    return json({
      event: mapEvent(row),
      attendees: attendees.results.map((a) => ({
        id: a.id,
        childId: a.child_id,
        name: `${a.first_name} ${a.last_name}`,
        age: a.age_group,
        parent: a.parent_email,
        status: a.status,
      })),
      volunteers: volunteers.results.map((v) => ({
        id: v.id,
        name: v.name,
        role: v.role,
        assigned: v.assigned,
      })),
    });
  } catch (e) {
    return handleError(e);
  }
});

app.post("/api/events", async (c) => {
  try {
    const user = await requireRoles(c, ["admin", "teacher"]);
    const b = await readBody(c);
    const title = str(b.title)?.trim();
    if (!title) return error("Event title is required");
    const eventId = id();
    const startDate = str(b.startDate) || todayISO();
    const endDate = str(b.endDate) || startDate;
    await c.env.DB.prepare(
      `INSERT INTO events (id, title, description, start_date, end_date, start_time, end_time, location, address, capacity, age_group, requires_registration, image_url, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        eventId,
        title,
        str(b.description),
        startDate,
        endDate,
        str(b.startTime),
        str(b.endTime),
        str(b.location),
        str(b.address),
        int(b.capacity),
        str(b.ageGroup) || "all",
        bool(b.requiresRegistration === undefined ? true : b.requiresRegistration),
        str(b.imageUrl),
        startDate < todayISO() ? "past" : "upcoming",
        user.id
      )
      .run();
    const row = await c.env.DB.prepare("SELECT * FROM events WHERE id = ?").bind(eventId).first<any>();
    return json({ event: mapEvent(row) }, 201);
  } catch (e) {
    return handleError(e);
  }
});

app.put("/api/events/:id", async (c) => {
  try {
    await requireRoles(c, ["admin", "teacher"]);
    const eventId = c.req.param("id");
    const b = await readBody(c);
    await c.env.DB.prepare(
      `UPDATE events SET title=?, description=?, start_date=?, end_date=?, start_time=?, end_time=?, location=?, address=?, capacity=?, age_group=?, requires_registration=?, image_url=?, status=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?`
    )
      .bind(
        str(b.title),
        str(b.description),
        str(b.startDate),
        str(b.endDate),
        str(b.startTime),
        str(b.endTime),
        str(b.location),
        str(b.address),
        int(b.capacity),
        str(b.ageGroup) || "all",
        bool(b.requiresRegistration === undefined ? true : b.requiresRegistration),
        str(b.imageUrl),
        (str(b.startDate) || todayISO()) < todayISO() ? "past" : "upcoming",
        eventId
      )
      .run();
    const row = await c.env.DB.prepare("SELECT * FROM events WHERE id = ?").bind(eventId).first<any>();
    if (!row) return notFound("Event not found");
    return json({ event: mapEvent(row) });
  } catch (e) {
    return handleError(e);
  }
});

app.delete("/api/events/:id", async (c) => {
  try {
    await requireRoles(c, ["admin", "teacher"]);
    const eventId = c.req.param("id");
    const row = await c.env.DB.prepare("SELECT id FROM events WHERE id = ?").bind(eventId).first();
    if (!row) return notFound("Event not found");
    await c.env.DB.prepare("DELETE FROM events WHERE id = ?").bind(eventId).run();
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
});

app.post("/api/events/:id/attendees", async (c) => {
  try {
    const user = await requireRoles(c, ["admin", "teacher", "parent"]);
    const eventId = c.req.param("id");
    const b = await readBody(c);
    const childId = str(b.childId);
    if (!childId) return error("childId is required");
    const child = await c.env.DB.prepare("SELECT * FROM children WHERE id = ?").bind(childId).first<any>();
    if (!child) return notFound("Child not found");
    if (user.role === "parent" && child.parent_email !== user.email) return error("Forbidden", 403);

    const existing = await c.env.DB.prepare("SELECT id FROM event_attendees WHERE event_id = ? AND child_id = ?")
      .bind(eventId, childId).first();
    if (existing) return json({ alreadyRegistered: true });

    const attendeeId = id();
    await c.env.DB.prepare(
      "INSERT INTO event_attendees (id, event_id, child_id, status) VALUES (?, ?, ?, ?)"
    ).bind(attendeeId, eventId, childId, str(b.status) || "confirmed").run();
    return json({ ok: true, attendeeId }, 201);
  } catch (e) {
    return handleError(e);
  }
});

app.delete("/api/events/:id/attendees/:childId", async (c) => {
  try {
    await requireRoles(c, ["admin", "teacher"]);
    await c.env.DB.prepare("DELETE FROM event_attendees WHERE event_id = ? AND child_id = ?")
      .bind(c.req.param("id"), c.req.param("childId")).run();
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
});

app.post("/api/events/:id/volunteers", async (c) => {
  try {
    await requireRoles(c, ["admin", "teacher"]);
    const eventId = c.req.param("id");
    const b = await readBody(c);
    const name = str(b.name)?.trim();
    if (!name) return error("Volunteer name is required");
    const volunteerId = id();
    await c.env.DB.prepare(
      "INSERT INTO event_volunteers (id, event_id, name, role, assigned) VALUES (?, ?, ?, ?, ?)"
    ).bind(volunteerId, eventId, name, str(b.role), str(b.assigned)).run();
    return json({ ok: true, volunteerId }, 201);
  } catch (e) {
    return handleError(e);
  }
});

app.delete("/api/events/:id/volunteers/:volunteerId", async (c) => {
  try {
    await requireRoles(c, ["admin", "teacher"]);
    await c.env.DB.prepare("DELETE FROM event_volunteers WHERE id = ?")
      .bind(c.req.param("volunteerId")).run();
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
});

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------
app.get("/api/lessons", async (c) => {
  try {
    await requireRoles(c, ["admin", "teacher", "parent", "volunteer", "cellLeader", "partner"]);
    const rows = await c.env.DB.prepare("SELECT * FROM lessons ORDER BY lesson_date DESC").all<any>();
    return json({ lessons: rows.results.map(mapLesson) });
  } catch (e) {
    return handleError(e);
  }
});

app.get("/api/lessons/:id", async (c) => {
  try {
    await requireRoles(c, ["admin", "teacher", "parent", "volunteer", "cellLeader", "partner"]);
    const lessonId = c.req.param("id");
    const row = await c.env.DB.prepare("SELECT * FROM lessons WHERE id = ?").bind(lessonId).first<any>();
    if (!row) return notFound("Lesson not found");

    const objectives = await c.env.DB.prepare("SELECT * FROM lesson_objectives WHERE lesson_id = ?").bind(lessonId).all<any>();
    const materials = await c.env.DB.prepare("SELECT * FROM lesson_materials WHERE lesson_id = ?").bind(lessonId).all<any>();
    const activities = await c.env.DB.prepare("SELECT * FROM lesson_activities WHERE lesson_id = ?").bind(lessonId).all<any>();

    return json({
      lesson: mapLesson(row),
      objectives: objectives.results.map((o) => o.text),
      materials: materials.results.map((m) => m.name),
      activities: activities.results.map((a) => ({
        name: a.name,
        description: a.description,
        duration: a.duration,
        materials: a.materials ? a.materials.split("|").filter(Boolean) : [],
      })),
    });
  } catch (e) {
    return handleError(e);
  }
});

app.post("/api/lessons", async (c) => {
  try {
    const user = await requireRoles(c, ["admin", "teacher"]);
    const b = await readBody(c);
    const title = str(b.title)?.trim();
    if (!title) return error("Lesson title is required");
    const lessonId = id();
    await c.env.DB.prepare(
      `INSERT INTO lessons (id, title, description, age_group, category, lesson_date, duration, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(lessonId, title, str(b.description), str(b.ageGroup), str(b.category), str(b.date), int(b.duration), user.id)
      .run();

    for (const obj of Array.isArray(b.objectives) ? b.objectives : []) {
      const text = str(obj)?.trim();
      if (text) await c.env.DB.prepare("INSERT INTO lesson_objectives (id, lesson_id, text) VALUES (?, ?, ?)")
        .bind(id(), lessonId, text).run();
    }
    for (const mat of Array.isArray(b.materials) ? b.materials : []) {
      const name = str(mat)?.trim();
      if (name) await c.env.DB.prepare("INSERT INTO lesson_materials (id, lesson_id, name) VALUES (?, ?, ?)")
        .bind(id(), lessonId, name).run();
    }
    for (const activity of Array.isArray(b.activities) ? b.activities : []) {
      const name = str(activity.name)?.trim();
      if (!name) continue;
      const mats = Array.isArray(activity.materials) ? activity.materials.join("|") : "";
      await c.env.DB.prepare(
        "INSERT INTO lesson_activities (id, lesson_id, name, description, duration, materials) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(id(), lessonId, name, str(activity.description), int(activity.duration), mats).run();
    }

    const row = await c.env.DB.prepare("SELECT * FROM lessons WHERE id = ?").bind(lessonId).first<any>();
    return json({ lesson: mapLesson(row) }, 201);
  } catch (e) {
    return handleError(e);
  }
});

app.put("/api/lessons/:id", async (c) => {
  try {
    await requireRoles(c, ["admin", "teacher"]);
    const lessonId = c.req.param("id");
    const b = await readBody(c);
    await c.env.DB.prepare(
      `UPDATE lessons SET title=?, description=?, age_group=?, category=?, lesson_date=?, duration=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?`
    )
      .bind(str(b.title), str(b.description), str(b.ageGroup), str(b.category), str(b.date), int(b.duration), lessonId)
      .run();

    // Replace relations
    await c.env.DB.prepare("DELETE FROM lesson_objectives WHERE lesson_id = ?").bind(lessonId).run();
    await c.env.DB.prepare("DELETE FROM lesson_materials WHERE lesson_id = ?").bind(lessonId).run();
    await c.env.DB.prepare("DELETE FROM lesson_activities WHERE lesson_id = ?").bind(lessonId).run();

    for (const obj of Array.isArray(b.objectives) ? b.objectives : []) {
      const text = str(obj)?.trim();
      if (text) await c.env.DB.prepare("INSERT INTO lesson_objectives (id, lesson_id, text) VALUES (?, ?, ?)")
        .bind(id(), lessonId, text).run();
    }
    for (const mat of Array.isArray(b.materials) ? b.materials : []) {
      const name = str(mat)?.trim();
      if (name) await c.env.DB.prepare("INSERT INTO lesson_materials (id, lesson_id, name) VALUES (?, ?, ?)")
        .bind(id(), lessonId, name).run();
    }
    for (const activity of Array.isArray(b.activities) ? b.activities : []) {
      const name = str(activity.name)?.trim();
      if (!name) continue;
      const mats = Array.isArray(activity.materials) ? activity.materials.join("|") : "";
      await c.env.DB.prepare(
        "INSERT INTO lesson_activities (id, lesson_id, name, description, duration, materials) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(id(), lessonId, name, str(activity.description), int(activity.duration), mats).run();
    }

    const row = await c.env.DB.prepare("SELECT * FROM lessons WHERE id = ?").bind(lessonId).first<any>();
    return json({ lesson: mapLesson(row) });
  } catch (e) {
    return handleError(e);
  }
});

app.delete("/api/lessons/:id", async (c) => {
  try {
    await requireRoles(c, ["admin", "teacher"]);
    const lessonId = c.req.param("id");
    const row = await c.env.DB.prepare("SELECT id FROM lessons WHERE id = ?").bind(lessonId).first();
    if (!row) return notFound("Lesson not found");
    await c.env.DB.prepare("DELETE FROM lessons WHERE id = ?").bind(lessonId).run();
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
});

// ---------------------------------------------------------------------------
// Partners
// ---------------------------------------------------------------------------
app.get("/api/partners", async (c) => {
  try {
    await requireRoles(c, ["admin"]);
    const rows = await c.env.DB.prepare("SELECT * FROM partners ORDER BY created_at DESC").all<any>();
    return json({ partners: rows.results.map(mapPartner) });
  } catch (e) {
    return handleError(e);
  }
});

app.post("/api/partners", async (c) => {
  try {
    await requireRoles(c, ["admin"]);
    const b = await readBody(c);
    const name = str(b.name)?.trim();
    if (!name) return error("Partner name is required");
    const partnerId = id();
    await c.env.DB.prepare(
      `INSERT INTO partners (id, name, contact_person, email, phone, partnership_type, contribution_amount, last_contribution, next_meeting, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        partnerId,
        name,
        str(b.contactPerson),
        str(b.email),
        str(b.phone),
        str(b.partnershipType),
        str(b.contributionAmount),
        str(b.lastContribution),
        str(b.nextMeeting),
        str(b.notes),
        str(b.status) || "active"
      )
      .run();
    const row = await c.env.DB.prepare("SELECT * FROM partners WHERE id = ?").bind(partnerId).first<any>();
    return json({ partner: mapPartner(row) }, 201);
  } catch (e) {
    return handleError(e);
  }
});

app.put("/api/partners/:id", async (c) => {
  try {
    await requireRoles(c, ["admin"]);
    const partnerId = c.req.param("id");
    const b = await readBody(c);
    await c.env.DB.prepare(
      `UPDATE partners SET name=?, contact_person=?, email=?, phone=?, partnership_type=?, contribution_amount=?, last_contribution=?, next_meeting=?, notes=?, status=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?`
    )
      .bind(
        str(b.name),
        str(b.contactPerson),
        str(b.email),
        str(b.phone),
        str(b.partnershipType),
        str(b.contributionAmount),
        str(b.lastContribution),
        str(b.nextMeeting),
        str(b.notes),
        str(b.status) || "active",
        partnerId
      )
      .run();
    const row = await c.env.DB.prepare("SELECT * FROM partners WHERE id = ?").bind(partnerId).first<any>();
    if (!row) return notFound("Partner not found");
    return json({ partner: mapPartner(row) });
  } catch (e) {
    return handleError(e);
  }
});

app.delete("/api/partners/:id", async (c) => {
  try {
    await requireRoles(c, ["admin"]);
    const partnerId = c.req.param("id");
    const row = await c.env.DB.prepare("SELECT id FROM partners WHERE id = ?").bind(partnerId).first();
    if (!row) return notFound("Partner not found");
    await c.env.DB.prepare("DELETE FROM partners WHERE id = ?").bind(partnerId).run();
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
});

// ---------------------------------------------------------------------------
// Reports / summary
// ---------------------------------------------------------------------------
app.get("/api/reports/summary", async (c) => {
  try {
    const user = await requireRoles(c, ["admin", "teacher"]);
    const totalChildren = (await c.env.DB.prepare("SELECT COUNT(*) AS n FROM children").first<any>())?.n ?? 0;
    const totalTeachers = (await c.env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE role IN ('teacher','admin')").first<any>())?.n ?? 0;
    const totalLessons = (await c.env.DB.prepare("SELECT COUNT(*) AS n FROM lessons").first<any>())?.n ?? 0;
    const totalEvents = (await c.env.DB.prepare("SELECT COUNT(*) AS n FROM events").first<any>())?.n ?? 0;
    const upcomingEvents = (await c.env.DB.prepare("SELECT COUNT(*) AS n FROM events WHERE start_date >= ?").bind(todayISO()).first<any>())?.n ?? 0;
    const totalPartners = (await c.env.DB.prepare("SELECT COUNT(*) AS n FROM partners").first<any>())?.n ?? 0;
    const today = todayISO();
    const presentToday = (await c.env.DB.prepare(
      "SELECT COUNT(DISTINCT ar.child_id) AS n FROM attendance_records ar JOIN attendance_sessions s ON s.id = ar.session_id WHERE s.date = ?"
    ).bind(today).first<any>())?.n ?? 0;

    const nextEvent = await c.env.DB.prepare(
      "SELECT * FROM events WHERE start_date >= ? ORDER BY start_date ASC LIMIT 1"
    ).bind(today).first<any>();

    return json({
      totalChildren,
      teachersCount: totalTeachers,
      totalLessons,
      totalEvents,
      upcomingEvents,
      totalPartners,
      attendance: {
        today: presentToday,
        absentees: Math.max(0, totalChildren - presentToday),
        percentage: totalChildren > 0 ? Math.round((presentToday / totalChildren) * 100) : 0,
      },
      nextEvent: nextEvent ? { id: nextEvent.id, title: nextEvent.title, date: nextEvent.start_date } : null,
    });
  } catch (e) {
    return handleError(e);
  }
});

// ---------------------------------------------------------------------------
// Reports / analytics
// ---------------------------------------------------------------------------
// Build the last `n` months as { key: 'YYYY-MM', label: 'Jan' } ending at the
// current month.
function lastMonths(n: number): { key: string; label: string; full: string }[] {
  const out: { key: string; label: string; full: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear().toString().padStart(4, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    out.push({
      key,
      label: d.toLocaleString("en-US", { month: "short" }),
      full: d.toLocaleString("en-US", { month: "short", year: "numeric" }),
    });
  }
  return out;
}

app.get("/api/reports/analytics", async (c) => {
  try {
    await requireRoles(c, ["admin", "teacher"]);

    // --- Attendance trend (per month) ---
    const monthKeys = lastMonths(12);
    const attendanceByMonth = await c.env.DB.prepare(
      "SELECT substr(s.date, 1, 7) AS ym, COUNT(DISTINCT ar.child_id) AS present FROM attendance_records ar JOIN attendance_sessions s ON s.id = ar.session_id GROUP BY ym"
    ).all<any>();
    const attMap: Record<string, number> = {};
    for (const r of attendanceByMonth.results) attMap[r.ym] = r.present;

    // --- Cumulative registered children per month ---
    const childrenByMonth = await c.env.DB.prepare(
      "SELECT substr(created_at, 1, 7) AS ym, COUNT(*) AS n FROM children GROUP BY ym ORDER BY ym"
    ).all<any>();
    const cumMap: Record<string, number> = {};
    let running = 0;
    for (const r of childrenByMonth.results) {
      running += r.n;
      cumMap[r.ym] = running;
    }
    // Total children today is the final running total.
    const totalChildren = running;

    const attendanceTrend = monthKeys.map((m) => {
      const attendance = attMap[m.key] ?? 0;
      const registered = cumMap[m.key] ?? totalChildren;
      return {
        month: m.label,
        key: m.key,
        full: m.full,
        attendance,
        registered,
        rate: registered > 0 ? Math.round((attendance / registered) * 100) : 0,
      };
    });

    // --- Age distribution ---
    const ageGroups = await c.env.DB.prepare(
      "SELECT COALESCE(NULLIF(age_group, ''), 'Unassigned') AS name, COUNT(*) AS value FROM children GROUP BY name ORDER BY value DESC"
    ).all<any>();
    const agePalette = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#0ea5e9"];
    const ageDistribution = ageGroups.results.map((g, i) => ({
      name: g.name,
      value: g.value,
      color: agePalette[i % agePalette.length],
    }));

    // --- Curriculum progress (per category) ---
    const lessonCats = await c.env.DB.prepare(
      `SELECT COALESCE(NULLIF(category, ''), 'Uncategorized') AS name, COUNT(*) AS total,
              SUM(CASE WHEN lesson_date IS NOT NULL AND lesson_date < date('now') THEN 1 ELSE 0 END) AS complete
       FROM lessons GROUP BY name ORDER BY total DESC`
    ).all<any>();

    // --- Check-in time distribution (bucketed by hour) ---
    const checkinHours = await c.env.DB.prepare(
      "SELECT substr(checked_in_at, 12, 2) AS hour, COUNT(*) AS count FROM attendance_records GROUP BY hour"
    ).all<any>();
    const hourMap: Record<string, number> = {};
    for (const r of checkinHours.results) hourMap[r.hour] = r.count;
    const hourKeys = Object.keys(hourMap).sort();
    const checkInTimes = hourKeys.map((h) => {
      const hh = parseInt(h, 10);
      const period = hh >= 12 ? "PM" : "AM";
      const display = ((hh + 11) % 12) + 1;
      return { time: `${display}:00 ${period}`, hour: h, count: hourMap[h] };
    });
    if (hourKeys.length === 0) {
      checkInTimes.push({ time: "No check-ins yet", hour: "00", count: 0 });
    }

    // --- Teacher & volunteer participation (per month) ---
    const teachersByMonth = await c.env.DB.prepare(
      "SELECT substr(created_at, 1, 7) AS ym, COUNT(*) AS n FROM users WHERE role IN ('teacher','admin') GROUP BY ym"
    ).all<any>();
    const teacherMap: Record<string, number> = {};
    for (const r of teachersByMonth.results) teacherMap[r.ym] = r.n;
    const volunteersByMonth = await c.env.DB.prepare(
      "SELECT substr(created_at, 1, 7) AS ym, COUNT(*) AS n FROM event_volunteers GROUP BY ym"
    ).all<any>();
    const volunteerMap: Record<string, number> = {};
    for (const r of volunteersByMonth.results) volunteerMap[r.ym] = r.n;

    const teacherParticipation = monthKeys.map((m) => ({
      key: m.key,
      full: m.full,
      month: m.label,
      teachers: teacherMap[m.key] ?? 0,
      volunteers: volunteerMap[m.key] ?? 0,
    }));

    return json({
      months: monthKeys.map((m) => m.key),
      attendanceTrend,
      ageDistribution,
      curriculumProgress: lessonCats.results.map((r) => ({
        name: r.name,
        total: r.total,
        complete: r.complete ?? 0,
      })),
      checkInTimes,
      teacherParticipation,
      totalChildren,
    });
  } catch (e) {
    return handleError(e);
  }
});

// ---------------------------------------------------------------------------
// File upload (R2)
// ---------------------------------------------------------------------------
app.post("/api/upload", async (c) => {
  try {
    await requireRoles(c, ["admin", "teacher", "parent", "volunteer", "cellLeader", "partner"]);
    const form = await c.req.formData();
    const file = form.get("file") as File | null;
    if (!file) return error("No file uploaded");
    const key = `uploads/${Date.now()}-${id()}`;
    await c.env.MEDIA.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
    });
    return json({ url: `/media/${key}`, key });
  } catch (e) {
    return handleError(e);
  }
});

app.get("/media/:key*", async (c) => {
  const key = c.req.path.replace(/^\/media\//, "");
  const obj = await c.env.MEDIA.get(key);
  if (!obj) return notFound("Object not found");
  return new Response(obj.body as ReadableStream, {
    headers: { "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream", "Cache-Control": "public, max-age=31536000" },
  });
});

// ---------------------------------------------------------------------------
// Fallback
// ---------------------------------------------------------------------------
app.notFound(() => notFound("Endpoint not found"));

export default app;
