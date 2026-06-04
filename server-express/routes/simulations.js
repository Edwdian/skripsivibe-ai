const express = require("express");
const router = express.Router();

const { db } = require("../firebaseAdmin");


// SIMPAN SIMULASI
router.post("/", async (req, res) => {
  try {
    const data = req.body;

    const docRef = await db
      .collection("simulations")
      .add({
        ...data,
        createdAt: new Date(),
      });

    res.json({
      success: true,
      id: docRef.id,
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

router.get("/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;

    const snapshot = await db
      .collection("simulations")
      .where("uid", "==", uid)
      .orderBy("createdAt", "desc")
      .get();

    const simulations = [];

    snapshot.forEach((doc) => {
      simulations.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json(simulations);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;