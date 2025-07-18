import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 3000;

// ESM-friendly way to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Storage settings for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "public/assets"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// In-memory blog posts
const posts = [
  {
    id: Date.now() + Math.floor(Math.random() * 10000),
    title: "The Digital Revolution: Where We Stand Today",
    date: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    author: "By Editorial Team",
    imagePath: "/assets/digital_revolution.jpg", 
    blogContent:
      "In an era where information travels faster than ever before, we find ourselves at the intersection of dust and data – the tangible and the digital. The old ways of communication, once preserved in print and paper, now dance with algorithms and artificial intelligence. This transformation isn't just about technology; it's about how we preserve human stories in an increasingly digital world. The gazette of yesterday meets the blog of tomorrow, creating a unique space where tradition and innovation converge in fascinating ways.",
  },
  {
    id: Date.now() + Math.floor(Math.random() * 10000),
    title: "The Art of Digital Storytelling",
    date: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    author:"Jane ",
    imagePath: "/assets/art_of_story.jpg", 
    blogContent:
      "Every click, every scroll, every interaction leaves a trace in the digital dust. Yet within this vast landscape of data, human stories emerge with remarkable clarity. The art of digital storytelling isn't just about mastering the tools – it's about understanding how to weave narratives that resonate across screens and generations. From the first printing press to the latest content management systems, the essence remains unchanged: the power to connect, inform, and inspire through the written word.",
  },
  {
    id: Date.now() + Math.floor(Math.random() * 10000),
    title: "Building Bridges Between Past and Future",
    date: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    author:" Saloni ",
    imagePath: "/assets/bridge.jpg", 
    blogContent:
      "The libraries of old held the wisdom of ages in their dusty halls, while today's databases contain the collective knowledge of humanity. But are we losing something in translation? This exploration delves into how we can honor the past while embracing the future, creating digital spaces that feel as warm and welcoming as the reading rooms of yesterday. The answer lies not in choosing between dust and data, but in celebrating both as essential parts of our human story.",
  },
  {
    id: Date.now() + Math.floor(Math.random() * 10000),
    title: "Retro Pixels, Modern Screens: The Comeback of 8-Bit Aesthetics",
    date: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    author:"Taylor ",
    imagePath: "/assets/pixel.jpg", 
    blogContent:
      "There was a time when screens couldn’t show more than 16 colors, and every game looked like a mosaic of chunky squares. Yet today, in an age of hyper-realistic graphics, 8-bit and pixel art are everywhere—from indie games to NFTs and even fashion. Why do we crave the past when the future is at our fingertips? Because pixel art isn't just a limitation—it’s a language. One where every blocky character tells a story, and every color is chosen with intention. It's raw, minimal, and honest. Tech has advanced, but nostalgia has power. In our digital age, vintage visuals remind us of a time when imagination filled the gaps. Maybe that's the charm—vintage tech gives us room to dream.",
  },
];

// Routes
app.get("/", (req, res) => {
  res.render("home.ejs", { allPosts: posts });
});

app.get("/compose", (req, res) => {
  res.render("compose.ejs");
});

app.get("/edit", (req, res) => {
  res.render("edit.ejs");
});

app.get("/edit/:id", (req, res) => {
  const requestedId = Number(req.params.id);
  const foundPost = posts.find((post) => post.id === requestedId);
  res.render("edit.ejs", { post: foundPost });
});

app.get("/post", (req, res) => {
  res.render("post.ejs");
});

app.get("/post/:id", (req, res) => {
  const requestedId = Number(req.params.id);
  const foundPost = posts.find((post) => post.id === requestedId);

  if (foundPost) {
    res.render("post.ejs", { post: foundPost });
  } else {
    res.status(404).send("Post not found");
  }
});

app.get("/manage", (req, res) => {
  res.render("manage.ejs", { allPosts: posts });
});

// POST: Create a new blog post with image
app.post("/compose", upload.single("image"), (req, res) => {
  const newPost = {
    id: Date.now() + Math.floor(Math.random() * 10000),
    title: req.body.title,
    blogContent: req.body.content,
    date: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    author: req.body.author,
    imagePath: req.file ? "/assets/" + req.file.filename : null,
  };

  posts.push(newPost);
  res.redirect("/");
});

// POST: Edit blog post
app.post("/edit/:id", upload.single("image"), (req, res) => {
  const requestedId = Number(req.params.id);
  const foundPost = posts.find((post) => post.id === requestedId);

  if (foundPost) {
    foundPost.title = req.body.title;
     foundPost.author = req.body.author;
    foundPost.blogContent = req.body.content;

    // Check if new image is uploaded
    if (req.file) {
      // Delete old image from disk if it exists
      if (foundPost.imagePath) {
        const oldImagePath = path.join(__dirname, "public", foundPost.imagePath);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error("Failed to delete old image:", err);
        });
      }
      foundPost.imagePath = "/assets/" + req.file.filename;
    }

    res.redirect("/manage");
  } else {
    res.status(404).send("Post not found");
  }
});


// ✅ POST: Delete blog post and image
app.post("/delete/:id", (req, res) => {
  const requestedId = Number(req.params.id);
  const foundPostIndex = posts.findIndex((post) => post.id === requestedId);

  if (foundPostIndex > -1) {
    const postToDelete = posts[foundPostIndex];

    // Delete the image file if it exists
    if (postToDelete.imagePath) {
      const imagePath = path.join(__dirname, "public", postToDelete.imagePath);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Error deleting image:", err);
        }
      });
    }

    // Delete post from memory
    posts.splice(foundPostIndex, 1);
    res.redirect("/manage");
  } else {
    res.status(404).send("Post not found");
  }
});

// Start the server

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

