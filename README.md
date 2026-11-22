# NAMU — Fixed Project (User Tracks + Home-Only Download)

## Τι διορθώθηκε
1. **Download The App μόνο στην Αρχική (`home`):** Εμφανίζεται αποκλειστικά όταν `activeTab === "home"` (στην αρχική ροή). Όταν μπαίνεις μέσα σε τραγούδι (`track_detail`) ή σε άλλο tab (`Upload`, `Library`, `Videos`, `Live`, `Messages`), κρύβεται εντελώς.
2. **Αναπαραγωγή τραγουδιών χρηστών (`AudioPlayerBar` & `trackStore`):**
   - Κάθε κομμάτι έχει έγκυρο `audioUrl` (από ανέβασμα αρχείου ήχου μέσω `FileReader` data URL, από URL χρήστη ή από τα αρχικά demo κομμάτια χρηστών).
   - Ο `<audio>` player φορτώνει `track.audioUrl`, χειρίζεται σωστά το `play()` promise και εμφανίζει καθαρό μήνυμα σφάλματος μόνο αν όντως αποτύχει το αρχείο/stream.
   - Μέσω **+ Upload** μπορείς να ανεβάσεις δικό σου τραγούδι και να παίξει άμεσα.
