import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import Product from '../models/Product.js';
import authMiddleware from "../middlewares/auth.middleware.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const router = express.Router();

// Multer setup (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST a new product with Cloudinary image
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, category, price, quantity, description, medicineType, sections } = req.body;

    if (!name || !category || price == null || quantity == null) {
      return res.status(400).json({ message: "All fields are required" });
    }

     let parsedSections = [];

    if (sections) {
      try {
        parsedSections = JSON.parse(sections);
      } catch (err) {
        return res.status(400).json({ message: "Invalid sections format" });
      }
    }

    let imageUrl = null;

    if (req.file) {
      // Upload buffer to Cloudinary
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });
      };

      const result = await streamUpload(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const product = await Product.create({
      name,
      category,
      price,
      quantity,
      description,
      image: imageUrl,
      medicineType,
      sections: parsedSections,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/count", async (req, res) => {
  try {
    console.log("Received request for product count");
    const count = await Product.countDocuments();
    console.log("Product count:", count); 
    res.json({ count });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});




export default router;

