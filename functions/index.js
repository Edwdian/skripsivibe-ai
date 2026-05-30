const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

exports.resetUserPassword = onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email dan password wajib diisi" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password minimal 6 karakter" });
    }

    try {
      // Cari user berdasarkan email
      const user = await admin.auth().getUserByEmail(email);
      
      // Update password di Firebase Auth
      await admin.auth().updateUser(user.uid, { password: newPassword });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error resetting password:", error);
      if (error.code === "auth/user-not-found") {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }
      return res.status(500).json({ error: "Gagal mengubah password" });
    }
  }
);