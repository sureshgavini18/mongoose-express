
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection failed:", err));

// Movie schema
const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  director: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  year: {
    type: Number,
    required: true,
  },
});

// Movie model
const Movie = mongoose.model("Movie", movieSchema);

// CREATE movie
app.post("/api/v1/movies", async (req, res) => {
  try {
    const newMovie = await Movie.create(req.body);

    res.status(201).json({
      message: "Movie created successfully",
      data: newMovie,
    });
  } catch (err) {
    res.status(400).json({
      message: "Movie creation failed",
      error: err.message,
    });
  }
});

// READ all movies, with optional category filter
app.get("/api/v1/movies", async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};

    const result = await Movie.find(query);

    res.status(200).json({
      message: "Movies fetched successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      message: "Movie fetching failed",
      error: err.message,
    });
  }
});

// READ movie by ID
app.get("/api/v1/movies/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const result = await Movie.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.status(200).json({
      message: "Movie details fetched successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      message: "Movie fetching failed",
      error: err.message,
    });
  }
});

// UPDATE movie by ID
app.put("/api/v1/movies/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.status(200).json({
      message: "Movie details updated successfully",
      data: updatedMovie,
    });
  } catch (err) {
    res.status(400).json({
      message: "Movie update failed",
      error: err.message,
    });
  }
});

// DELETE movie by ID
app.delete("/api/v1/movies/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);

    if (!deletedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.status(200).json({
      message: "Movie deleted successfully",
      data: deletedMovie,
    });
  } catch (err) {
    res.status(500).json({
      message: "Movie deletion failed",
      error: err.message,
    });
  }
});

// Start server only after MongoDB connects
mongoose.connection.once("open", () => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
