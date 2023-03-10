const express = require("express");
const multer = require("multer");

const productRepo = require("../../repositories/product.js");
const productsNewTemplate = require("../../views/admin/products/new.js");
const productsIndexTemplate = require("../../views/admin/products/index.js");
const productsEditTemplate = require("../../views/admin/products/edit.js");
const { requireTitle, requirePrice } = require("./validator");
const { handleErrors, requireAuth } = require("./middlewares.js");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/admin/products", requireAuth, async (req, res) => {
  const products = await productRepo.getAll();
  res.send(productsIndexTemplate({ products }));
});
router.get("/admin/products/new", requireAuth, (req, res) => {
  res.send(productsNewTemplate({}));
});
router.post(
  "/admin/products/new",
  requireAuth,
  upload.single("image"),
  [requireTitle, requirePrice],
  handleErrors(productsNewTemplate),
  async (req, res) => {
    const image = req.file.buffer.toString("base64");
    const { title, price } = req.body;
    await productRepo.create({ title, price, image });

    res.redirect("/admin/products");
  }
);
router.get("/admin/products/:id/edit", requireAuth, async (req, res) => {
  const product = await productRepo.getOneBy({ id: req.params.id });
  if (!product) {
    return res.redirect("/admin/products");
  }
  res.send(productsEditTemplate({ product }));
  //   console.log(product);
});
router.post(
  "/admin/products/:id/edit",
  requireAuth,
  upload.single("image"),
  [requireTitle, requirePrice],
  handleErrors(productsEditTemplate, async (req) => {
    const product = await productRepo.getOne(req.params.id);
    return { product };
  }),
  async (req, res) => {
    const changes = req.body;
    if (req.file) {
      changes.image = req.file.buffer.toString("base64");
    }
    try {
      await productRepo.update(req.params.id, changes);
    } catch (err) {
      res.send("Could not find the product");
    }
    res.redirect("/admin/products");
  }
);
router.post("/admin/products/:id/delete", requireAuth, async (req, res) => {
  await productRepo.delete(req.params.id);
  res.redirect("/admin/products");
});

module.exports = router;
