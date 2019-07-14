const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json());

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost/department-app",
  {
    useNewUrlParser: true
  }
);

const Department = mongoose.model("Department", {
  title: {
    type: String
  }
});
const Category = mongoose.model("Category", {
  title: {
    type: String
  },
  description: String,
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  }
});
const Product = mongoose.model("Product", {
  title: {
    type: String
  },
  description: String,
  price: Number,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  }
});
// Création de mon titre
app.post("/department/create", async (req, res) => {
  try {
    const newDepartment = new Department({
      title: req.body.title
    });
    await newDepartment.save();
    res.json({ message: "Created" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
//Read
app.get("/department", async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Modifier un element
app.post("/department/update", async (req, res) => {
  try {
    if (req.query.id && req.body.title) {
      const department = await Department.findOne({ _id: req.query.id });
      department.title = req.body.title;
      await department.save();
      res.json({ message: "Updated" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
app.post("/department/delete", async (req, res) => {
  try {
    const id = req.query.id;

    const department = await Department.findById(id);

    // Vérifier que l'objet a bien été trouvé
    // if (department !== null && department !== undefined && department !== false && department !== 0 && department !== "" ) {
    if (department) {
      // Supprimer l'objet
      await department.remove();

      return res.json({
        message: "Department deleted"
      });
    } else {
      return res.status(404).json({ message: "Department not found" });
    }
  } catch (error) {
    return res.status(400).json({ message: "An error occurred" });
  }
});

app.post("/category/create", async (req, res) => {
  try {
    const newCategory = new Category({
      title: req.body.title,
      description: req.body.description,
      department: req.body.department
    });
    await newCategory.save();
    res.json({ message: "Created" });
  } catch (error) {
    res.status(400);
    json({ error: error.message });
  }
});
app.get("/category", async (req, res) => {
  try {
    const categorys = await Category.find().populate("department");
    res.json(categorys);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
app.post("/category/update", async (req, res) => {
  try {
    if (req.query.id) {
      const category = await Category.findOne({ _id: req.query.id });
      category.title = req.body.title;
      category.description = req.body.description;
      category.department = req.body.department;
      await category.save();
      res.json({ message: "Updated" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
app.post("/category/delete", async (req, res) => {
  try {
    const id = req.query.id;

    const category = await Category.findById(id);

    // Vérifier que l'objet a bien été trouvé
    // if (department !== null && department !== undefined && department !== false && department !== 0 && department !== "" ) {
    if (category) {
      // Supprimer l'objet
      await category.remove();

      return res.json({
        message: "category deleted"
      });
    } else {
      return res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    return res.status(400).json({ message: "An error occurred" });
  }
});

app.post("/product/create", async (req, res) => {
  try {
    const newProduct = new Product({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category
    });
    await newProduct.save();
    res.json({ message: "Created" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
app.get("/product", async (req, res) => {
  try {
    let params = {};
    if (req.query.category) {
      params.category = req.query.category;
    }
    if (req.query.title) {
      params.title = new RegExp(req.query.title, "i");
    }
    if (Number(req.query.priceMin)) {
      params.priceMin = { $gte: req.query.priceMin };
    }
    if (Number(req.query.priceMax)) {
      params.priceMax = { $lte: req.query.priceMax };
    }
    if (req.query.sort === "price-asc") {
      const product = await Product.find(params).populate("category");
      product.sort({ price: 1 });
      return res.json(product);
    } else if (req.query.sort === "price-desc") {
      const product = await Product.find(params).populate("category");
      product.sort({ price: -1 });
      return res.json(product);
    }
    //const product = await Product.find(params).populate("category");

    return res.json(product);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});
app.post("/product/update", async (req, res) => {
  try {
    if (req.query.id) {
      const product = await Product.findOne({ _id: req.query.id });

      (product.title = req.body.title),
        (product.description = req.body.description),
        (product.price = req.body.price),
        (product.category = req.body.category);
      await product.save();
      res.json({ message: "Updated" });
    } else {
      res.status(400).json({ message: "Missing parameter" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
app.post("/product/delete", async (req, res) => {
  try {
    const id = req.query.id;

    const product = await Product.findById(id);

    // Vérifier que l'objet a bien été trouvé
    // if (department !== null && department !== undefined && department !== false && department !== 0 && department !== "" ) {
    if (product) {
      // Supprimer l'objet
      await product.remove();

      return res.json({
        message: "Product deleted"
      });
    } else {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    return res.status(400).json({ message: "An error occurred" });
  }
});
app.listen(process.env.PORT || 3002, () => {
  console.log("Server started");
});
