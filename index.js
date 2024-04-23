import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;
const API_URL = "https://api.unsplash.com";

const AccessKey = process.env.ACCESSKEY;
const config = {
  headers: { Authorization: `Client-ID ${AccessKey}` },
};

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs", {
    urls: { regular: null }, // Inicijaliziramo urls na null kako bismo izbjegli ReferenceError
    description: 'No description available',
    alt_description: 'No alternative description available',
    user: {
      name: 'Unknown',
      html_link: '#',
      instagram_username: 'Unknown',
    }
  });
});

app.post("/get-photo", async (req, res) => {
  const searchOrientation = req.body.orientation;
  const searchCountry = req.body.country;

  try {
    const result = await axios.get(
      `https://api.unsplash.com/photos/random?orientation=${searchOrientation}&query=${searchCountry}&count=1`,
      config
    );

    console.log('Result from Unsplash API:', result.data);

    if (result.status !== 200) {
      return res.render("index.ejs", { content: `Error: ${result.status} - ${result.statusText}` });
    }

    let urls = null;
    let photoData = {};

    if (result.data && result.data.length > 0) {
      photoData = result.data[0];
      urls = { regular: photoData.urls.regular };
    }

    if (!urls) {
      // Dodano: Ako nema slike, prikaži default vrijednosti
      return res.render("index.ejs", {
        urls: { regular: null },
        description: 'No description available',
        alt_description: 'No alternative description available',
        user: {
          name: 'Unknown',
          html_link: '#',
          instagram_username: 'Unknown',
        }
      });
    }

    res.render("index.ejs", {
      urls: urls,
      description: urls ? photoData.description || 'No description available' : '',
      alt_description: urls ? photoData.alt_description || 'No alternative description available' : '',
      user: {
        name: urls ? photoData.user.name : 'Unknown',
        html_link: urls ? photoData.user.links.html : '#',
        instagram_username: urls ? photoData.user.instagram_username || 'Unknown' : 'Unknown',
      }
    });

  } catch (error) {
    console.error('Error from Unsplash API:', error.response.data);
    res.render("index.ejs", { content: JSON.stringify(error.response.data) });
  }

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});