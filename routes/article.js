const articleController = require("../controllers/article");
const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./images/articles/");
    },
    filename: function (req, file, cb) {
        cb(null, `articulo_${Date.now()}_${file.originalname}`);
    }
});

const uploads = multer({ storage: storage });

//Rutas
router.post("/create", articleController.create);
router.get("/articles/:howMany?", articleController.find);
router.get("/article/:id", articleController.findOne);
router.delete("/article/:id", articleController.eliminate);
router.put("/article/:id", articleController.update);
router.post("/uploadImage/:id", [uploads.single("file")], articleController.uploadImage);
router.get("/image/:file", articleController.getImage);
router.get("/search/:text", articleController.search);


module.exports = router;