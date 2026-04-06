# Brain Twin Team Mode Implementation TODO

## Approved Plan Steps (Breakdown)

### Phase 1: Data Model & Security (Firestore)
- [x] 1. Update firestore.rules: Add teams/{teamId}, users/{userId}/profile extensions.
- [ ] 2. Test rules locally (firebase emulators:start --only firestore). 

**Note:** Run `firebase deploy --only firestore:rules` to apply live. Emulators for local test. 

### Phase 2: Backend Logic (Store/Firebase)
- [x] 3. Extend src/store/useStore.ts: Team types, state, actions (create/join/leave/load).
- [x] 4. Update src/firebase.ts: team helpers (getByCode).
- [ ] 5. Add listeners for real-time teams/profile.

**Note:** Store ready. firebase.ts simplified (store direct CRUD, code=teamId). No hook (use store async).

### Phase 3: UI Components & Routing
- [x] 6. Update src/App.tsx: New routes (/teams, /teams/:id).
- [x] 7. Create src/pages/Teams.tsx: List/join/create.
- [x] 8. Create src/pages/TeamDashboard.tsx: Members/leaderboard.

**Note:** Lazy imports. Teams page full CRUD. Dashboard stub. Test: `npm run dev`, visit /teams, try create/join (needs rules deployed).

### Phase 4: Integration
- [ ] 9. Update src/pages/Profile.tsx: Team mgmt (create/join/switch).
- [ ] 10. Update src/components/layout/Sidebar.tsx: Teams nav.

### Phase 5: Polish & Test
- [ ] 11. Add types/utils.
- [ ] 12. Test flow: Create → join code → dashboard → leave.
- [ ] 13. Deploy rules: firebase deploy --only firestore:rules.
- [ ] 14. npm run lint + test UI.

**Progress: Starting Phase 1**

Last Updated: Ready for edits.

