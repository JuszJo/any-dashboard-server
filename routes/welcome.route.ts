import express from "express"

const router = express.Router();

router.get('/welcome', (req, res) => {
    res.send("welcome");
})

export default router;