import Review from "../models/review.js";
import Product from "../models/Product.js";

// Add Review
export const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, comment, rating } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = await Review.create({
      product: productId,
      name,
      comment,
      rating,
    });

    const reviews = await Review.find({ product: productId });

    product.numReviews = reviews.length;
    product.rating =
      reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;

    await product.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Reviews
export const getReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId }).sort({
      createdAt: -1,
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
