#!/usr/bin/env bash
# End-to-end smoke test for the KidMin Harmony API against a local wrangler dev instance.
# Usage: bash scripts/smoke.sh [base_url]
set -u
BASE="${1:-http://127.0.0.1:8787}"
PASS=0; FAIL=0
check() { # name expected actual
  if [ "$2" = "$3" ]; then PASS=$((PASS+1)); echo "  ✓ $1";
  else FAIL=$((FAIL+1)); echo "  ✗ $1 — expected [$2] got [$3]"; fi
}
jget() { local path="${1:-}"; node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);const p='$path'.split('.');let v=j;for(const k of p){v=v?.[k]}console.log(v===undefined?'':(typeof v==='object'?JSON.stringify(v):v))}catch(e){console.log('')}})"; }

echo "== Health =="
R=$(curl -s -w '\n%{http_code}' $BASE/api/health); B=${R%$'\n'*}; C=${R##*$'\n'}
check "GET /api/health -> 200" 200 "$C"
check "health db ok" ok "$(echo "$B" | jget db)"

echo "== Bootstrap seed (no users yet) =="
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/auth/seed); B=${R%$'\n'*}; C=${R##*$'\n'}
check "seed fresh DB -> 200" 200 "$C"

echo "== Auth =="
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@church.org","password":"admin123"}'); B=${R%$'\n'*}; C=${R##*$'\n'}
check "login admin -> 200" 200 "$C"
ADMIN=$(echo "$B" | jget token)
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/auth/login -H 'Content-Type: application/json' -d '{"email":"parent@church.org","password":"parent123"}'); B=${R%$'\n'*}; C=${R##*$'\n'}
check "login parent -> 200" 200 "$C"
PARENT=$(echo "$B" | jget token)
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@church.org","password":"wrong"}'); C=${R##*$'\n'}
check "login wrong password -> 401" 401 "$C"
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/auth/login -H 'Content-Type: application/json' -d '{"email":"ghost@nowhere.org","password":"whatever"}'); C=${R##*$'\n'}
check "login unknown user -> 401" 401 "$C"
R=$(curl -s -w '\n%{http_code}' $BASE/api/auth/me); C=${R##*$'\n'}
check "me without token -> 401" 401 "$C"
R=$(curl -s -w '\n%{http_code}' $BASE/api/auth/me -H "Authorization: Bearer $ADMIN"); B=${R%$'\n'*}; C=${R##*$'\n'}
check "me with admin token -> 200" 200 "$C"
check "me role admin" admin "$(echo "$B" | jget user.role)"
# registration rules
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/auth/register -H 'Content-Type: application/json' -d '{"name":"P Two","email":"p2@test.org","password":"secret123"}'); C=${R##*$'\n'}
check "register parent -> 201" 201 "$C"
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/auth/register -H 'Content-Type: application/json' -d '{"name":"P Two","email":"p2@test.org","password":"secret123"}'); C=${R##*$'\n'}
check "register duplicate email -> 409" 409 "$C"
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/auth/register -H 'Content-Type: application/json' -d '{"name":"Evil","email":"evil@test.org","password":"secret123","role":"admin"}'); C=${R##*$'\n'}
check "register as admin -> 403" 403 "$C"
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/auth/register -H 'Content-Type: application/json' -d '{"name":"Evil","email":"evil@test.org","password":"secret123","role":"teacher"}'); C=${R##*$'\n'}
check "register as teacher -> 403" 403 "$C"
# re-seed now requires admin
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/auth/seed); C=${R##*$'\n'}
check "seed with users, no token -> 403" 403 "$C"
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/auth/seed -H "Authorization: Bearer $PARENT"); C=${R##*$'\n'}
check "seed with users, parent token -> 403" 403 "$C"

echo "== Children =="
R=$(curl -s -w '\n%{http_code}' $BASE/api/children -H "Authorization: Bearer $ADMIN"); B=${R%$'\n'*}; C=${R##*$'\n'}
check "children (admin) -> 200" 200 "$C"
check "admin sees 6 seeded children" 6 "$(echo "$B" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.children.length)})")"
R=$(curl -s -w '\n%{http_code}' $BASE/api/children -H "Authorization: Bearer $PARENT"); B=${R%$'\n'*}; C=${R##*$'\n'}
check "children (parent) -> 200" 200 "$C"
check "parent sees only own 2 children" 2 "$(echo "$B" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.children.length)})")"
CHILD_ID=$(echo "$B" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.children[0].id)})")
OTHER_ID=$(echo "$B" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);const others=j.children.filter(c=>c.parentEmail!=='parent@church.org');console.log(others.length?others[0].id:'')})")
if [ -n "$OTHER_ID" ]; then
  R=$(curl -s -w '\n%{http_code}' $BASE/api/children/$OTHER_ID -H "Authorization: Bearer $PARENT"); C=${R##*$'\n'}
  check "parent reads other's child -> 403" 403 "$C"
fi
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/children -H "Authorization: Bearer $PARENT" -H 'Content-Type: application/json' -d '{"firstName":"X","lastName":"Y"}'); C=${R##*$'\n'}
check "parent creates child -> 403" 403 "$C"
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/children -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d '{"firstName":"Test","lastName":"Kid","dob":"2025-01-01","ageGroup":"elementary"}'); B=${R%$'\n'*}; C=${R##*$'\n'}
check "admin creates child -> 201" 201 "$C"
NEW_CHILD=$(echo "$B" | jget child.id)
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/children -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d '{"firstName":"Bad","lastName":"Dob","dob":"2031-02-30"}'); C=${R##*$'\n'}
check "child with future/impossible dob -> 400" 400 "$C"
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/children -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d '{"firstName":"Bad","lastName":"Group","ageGroup":"preschool"}'); C=${R##*$'\n'}
check "child with invalid ageGroup -> 400" 400 "$C"
R=$(curl -s -w '\n%{http_code}' -X PUT $BASE/api/children/does-not-exist -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d '{"firstName":"A","lastName":"B"}'); C=${R##*$'\n'}
check "update missing child -> 404" 404 "$C"
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/children/$NEW_CHILD/notes -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d '{"text":"Test note"}'); C=${R##*$'\n'}
check "add note -> 201" 201 "$C"
R=$(curl -s -w '\n%{http_code}' -X DELETE $BASE/api/children/$NEW_CHILD/notes/nonexistent -H "Authorization: Bearer $ADMIN"); C=${R##*$'\n'}
check "delete missing note -> 404" 404 "$C"

echo "== Attendance =="
R=$(curl -s -w '\n%{http_code}' $BASE/api/attendance -H "Authorization: Bearer $ADMIN"); B=${R%$'\n'*}; C=${R##*$'\n'}
check "attendance list -> 200" 200 "$C"
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/attendance/checkin -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d "{\"childId\":\"$NEW_CHILD\"}"); C=${R##*$'\n'}
check "checkin -> 201" 201 "$C"
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/attendance/checkin -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d "{\"childId\":\"$NEW_CHILD\"}"); B=${R%$'\n'*}; C=${R##*$'\n'}
check "duplicate checkin -> idempotent" true "$(echo "$B" | jget alreadyCheckedIn)"
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/attendance/checkin -H "Authorization: Bearer $PARENT" -H 'Content-Type: application/json' -d "{\"childId\":\"$NEW_CHILD\"}"); C=${R##*$'\n'}
check "parent checkin -> 403" 403 "$C"

echo "== Events =="
R=$(curl -s -w '\n%{http_code}' $BASE/api/events -H "Authorization: Bearer $ADMIN"); B=${R%$'\n'*}; C=${R##*$'\n'}
check "events list -> 200" 200 "$C"
check "event counts populated (Bible Camp=2)" 2 "$(echo "$B" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);const e=j.events.find(e=>e.title==='Bible Camp');console.log(e?e.registeredAttendees:'?')})")"
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/events -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d '{"title":"Tiny Event","startDate":"2026-10-01","capacity":1}'); B=${R%$'\n'*}; C=${R##*$'\n'}
check "create event -> 201" 201 "$C"
TINY_EVENT=$(echo "$B" | jget event.id)
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/events/$TINY_EVENT/attendees -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d "{\"childId\":\"$NEW_CHILD\"}"); C=${R##*$'\n'}
check "register child to event -> 201" 201 "$C"
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/events/$TINY_EVENT/attendees -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d "{\"childId\":\"$CHILD_ID\"}"); C=${R##*$'\n'}
check "register beyond capacity -> 409" 409 "$C"
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/events/nonexistent/attendees -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d "{\"childId\":\"$NEW_CHILD\"}"); C=${R##*$'\n'}
check "register to missing event -> 404" 404 "$C"
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/events -H "Authorization: Bearer $PARENT" -H 'Content-Type: application/json' -d '{"title":"Nope"}'); C=${R##*$'\n'}
check "parent creates event -> 403" 403 "$C"
R=$(curl -s -w '\n%{http_code}' -X PUT $BASE/api/events/$TINY_EVENT -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d '{"title":"Tiny Event v2","startDate":"2026-10-01","endDate":"2026-09-01"}'); C=${R##*$'\n'}
check "event end before start -> 400" 400 "$C"

echo "== Lessons =="
R=$(curl -s -w '\n%{http_code}' $BASE/api/lessons -H "Authorization: Bearer $PARENT"); C=${R##*$'\n'}
check "lessons (parent) -> 200" 200 "$C"
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/lessons -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d '{"title":"Smoke Lesson","ageGroup":"pre-school","category":"Test","objectives":["Aim 1"],"materials":["Paper"],"activities":[{"name":"Craft","duration":10,"materials":["Glue","Scissors"]}]}'); B=${R%$'\n'*}; C=${R##*$'\n'}
check "create lesson -> 201" 201 "$C"
LESSON=$(echo "$B" | jget lesson.id)
R=$(curl -s -w '\n%{http_code}' $BASE/api/lessons/$LESSON -H "Authorization: Bearer $ADMIN"); B=${R%$'\n'*}; C=${R##*$'\n'}
check "lesson detail -> 200" 200 "$C"
check "lesson objectives stored" '["Aim 1"]' "$(echo "$B" | jget objectives)"
R=$(curl -s -w '\n%{http_code}' -X PUT $BASE/api/lessons/$LESSON -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d '{"title":"Smoke Lesson v2","objectives":["Aim 2"]}'); B=${R%$'\n'*}; C=${R##*$'\n'}
check "update lesson (relation replace) -> 200" 200 "$C"
check "objectives replaced" '["Aim 2"]' "$(echo "$B" | jget objectives)"
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/lessons -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d '{"title": broken'); C=${R##*$'\n'}
check "malformed JSON -> 400" 400 "$C"

echo "== Partners (admin only) =="
R=$(curl -s -w '\n%{http_code}' $BASE/api/partners -H "Authorization: Bearer $PARENT"); C=${R##*$'\n'}
check "partners (parent) -> 403" 403 "$C"
R=$(curl -s -w '\n%{http_code}' $BASE/api/partners -H "Authorization: Bearer $ADMIN"); B=${R%$'\n'*}; C=${R##*$'\n'}
check "partners (admin) -> 200" 200 "$C"
check "3 seeded partners" 3 "$(echo "$B" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.partners.length)})")"

echo "== Upload security =="
printf '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><rect/></svg>' > /tmp/evil.svg
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/upload -H "Authorization: Bearer $PARENT" -F 'file=@/tmp/evil.svg;type=image/svg+xml'); C=${R##*$'\n'}
check "upload SVG -> 415" 415 "$C"
printf '\x89PNG\r\n\x1a\n0000000' > /tmp/pic.png
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/upload -H "Authorization: Bearer $PARENT" -F 'file=@/tmp/pic.png;type=image/jpeg'); B=${R%$'\n'*}; C=${R##*$'\n'}
check "upload PNG (mislabeled type) -> 200" 200 "$C"
MEDIA_URL=$(echo "$B" | jget url)
R=$(curl -s -o /dev/null -w '%{http_code} %{content_type}' $BASE$MEDIA_URL)
check "media served as image/png" "200 image/png" "$R"
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/upload -F 'file=@/tmp/evil.svg;type=image/svg+xml'); C=${R##*$'\n'}
check "upload without token -> 401" 401 "$C"
head -c 6000000 /dev/urandom > /tmp/big.png
R=$(curl -s -w '\n%{http_code}' -X POST $BASE/api/upload -H "Authorization: Bearer $ADMIN" -F 'file=@/tmp/big.png;type=image/png'); C=${R##*$'\n'}
check "upload >5MB -> 413" 413 "$C"
rm -f /tmp/big.png

echo "== Security headers & CORS =="
H=$(curl -s -D - -o /dev/null $BASE/api/health)
echo "$H" | grep -qi 'x-content-type-options: nosniff' && check "nosniff header" 0 0 || check "nosniff header" 0 1
echo "$H" | grep -qi 'x-frame-options: DENY' && check "X-Frame-Options DENY" 0 0 || check "X-Frame-Options DENY" 0 1
H2=$(curl -s -D - -o /dev/null -H 'Origin: https://evil.example' $BASE/api/health)
echo "$H2" | grep -qi 'access-control-allow-origin' && check "CORS denied for unknown origin" 0 1 || check "CORS denied for unknown origin" 0 0
H3=$(curl -s -D - -o /dev/null -X OPTIONS -H 'Origin: https://evil.example' -H 'Access-Control-Request-Method: GET' $BASE/api/health)
echo "$H3" | grep -qi 'access-control-allow-origin' && check "CORS preflight denied for unknown origin" 0 1 || check "CORS preflight denied for unknown origin" 0 0

echo "== Misc =="
R=$(curl -s -w '\n%{http_code}' $BASE/api/nope -H "Authorization: Bearer $ADMIN"); C=${R##*$'\n'}
check "unknown endpoint -> 404" 404 "$C"
R=$(curl -s -w '\n%{http_code}' $BASE/api/reports/summary -H "Authorization: Bearer $PARENT"); C=${R##*$'\n'}
check "reports (parent) -> 403" 403 "$C"
R=$(curl -s -w '\n%{http_code}' $BASE/api/reports/analytics -H "Authorization: Bearer $ADMIN"); C=${R##*$'\n'}
check "reports analytics (admin) -> 200" 200 "$C"

echo "== Rate limiting (login) =="
CODES=""
for i in $(seq 1 21); do
  C=$(curl -s -o /dev/null -w '%{http_code}' -X POST $BASE/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@church.org","password":"badpass"}')
  CODES="$CODES $C"
done
LAST=$(echo "$CODES" | awk '{print $NF}')
check "21st rapid login -> 429" 429 "$LAST"

echo
echo "RESULTS: $PASS passed, $FAIL failed"
[ $FAIL -eq 0 ]
