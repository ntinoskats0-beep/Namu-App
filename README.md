# NAMU — Supabase Setup & Starter Files

Περιεχόμενα αρχείου ZIP:
1. `supabase_message_setup.sql`: Ορισμός πίνακα `public.message` (`id`, `created_at`, `sender`, `receiver`, `content`) και πολιτικών RLS (`SELECT` για `public`, `INSERT` για `authenticated`).
2. `index.html`: Βασικός κώδικας εγγραφής (`Sign up`), σύνδεσης (`Sign in`), αποστολής και ανάγνωσης μηνυμάτων συνδεδεμένος με τον πίνακα `public.message` και Realtime.

Πριν ανοίξεις το `index.html`:
- Βάλε τα δικά σου `SUPABASE_URL` και `SUPABASE_ANON_KEY` μέσα στο `<script>`.
- Αν στείλεις τον δικό σου υπάρχοντα κώδικα από το `index.html`, μπορώ να τον ενσωματώσω απευθείας στις δικές σου φόρμες/κουμπιά.
