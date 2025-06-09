// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import { Artist } from "./models/Artist.js";

// // Load environment variables (make sure MONGO_URI is set)
// dotenv.config();

// const artists = [
//   {
//     name: "Arijit Singh",
//     bio: "Popular Indian playback singer known for soulful voice.",
//     image: "https://example.com/images/arijit.jpg",
//     subscriptionPrice: 99,
//     createdBy: "60f7c0d5e1b1c8a1b2c3d4e5", // <-- Replace with real User ObjectId
//     subscribers: [],
//   },
//   {
//     name: "Taylor Swift",
//     bio: "American singer-songwriter, known for narrative songs.",
//     image: "https://example.com/images/taylor.jpg",
//     subscriptionPrice: 149,
//     createdBy: "60f7c0d5e1b1c8a1b2c3d4e6",
//     subscribers: [],
//   },
//   {
//     name: "The Weeknd",
//     bio: "Canadian singer, songwriter, and record producer.",
//     image: "https://example.com/images/weeknd.jpg",
//     subscriptionPrice: 129,
//     createdBy: "60f7c0d5e1b1c8a1b2c3d4e7",
//     subscribers: [],
//   },
//   {
//     name: "Shreya Ghoshal",
//     bio: "Indian playback singer with a melodious voice.",
//     image: "https://example.com/images/shreya.jpg",
//     subscriptionPrice: 89,
//     createdBy: "60f7c0d5e1b1c8a1b2c3d4e8",
//     subscribers: [],
//   },
//   {
//     name: "Ed Sheeran",
//     bio: "English singer-songwriter, known for hit singles.",
//     image: "https://example.com/images/ed.jpg",
//     subscriptionPrice: 139,
//     createdBy: "60f7c0d5e1b1c8a1b2c3d4e9",
//     subscribers: [],
//   },
//   {
//     name: "Adele",
//     bio: "English singer-songwriter, known for powerful vocals.",
//     image: "https://example.com/images/adele.jpg",
//     subscriptionPrice: 159,
//     createdBy: "60f7c0d5e1b1c8a1b2c3d4ea",
//     subscribers: [],
//   },
//   {
//     name: "Badshah",
//     bio: "Indian rapper and singer known for party anthems.",
//     image: "https://example.com/images/badshah.jpg",
//     subscriptionPrice: 79,
//     createdBy: "60f7c0d5e1b1c8a1b2c3d4eb",
//     subscribers: [],
//   },
//   {
//     name: "Billie Eilish",
//     bio: "American singer-songwriter, known for unique style.",
//     image: "https://example.com/images/billie.jpg",
//     subscriptionPrice: 119,
//     createdBy: "60f7c0d5e1b1c8a1b2c3d4ec",
//     subscribers: [],
//   },
//   {
//     name: "Diljit Dosanjh",
//     bio: "Indian singer, actor, and television presenter.",
//     image: "https://example.com/images/diljit.jpg",
//     subscriptionPrice: 109,
//     createdBy: "60f7c0d5e1b1c8a1b2c3d4ed",
//     subscribers: [],
//   },
//   {
//     name: "Dua Lipa",
//     bio: "English and Albanian singer and songwriter.",
//     image: "https://example.com/images/dua.jpg",
//     subscriptionPrice: 129,
//     createdBy: "60f7c0d5e1b1c8a1b2c3d4ee",
//     subscribers: [],
//   },
// ];

// const seed = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     await Artist.deleteMany(); // Optional: clear existing artists
//     await Artist.insertMany(artists);
//     console.log("Artists seeded successfully!");
//     process.exit(0);
//   } catch (err) {
//     console.error("Seeding failed:", err);
//     process.exit(1);
//   }
// };

// seed();

// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import { Album } from "./models/Album.js";

// dotenv.config();

// // Example: Array of album objects for seeding
// const albums = [
//   // Arijit Singh
//   {
//     title: "Soulful Melodies",
//     description: "A collection of Arijit Singh's most soulful tracks.",
//     artist: "Arijit Singh",
//     coverImage: "https://example.com/albums/arijit1.jpg",
//     releaseDate: new Date("2022-01-15"),
//     songs: [],
//     price: 49,
//     isPremium: false,
//   },
//   {
//     title: "Romantic Hits",
//     description: "Romantic songs by Arijit Singh.",
//     artist: "Arijit Singh",
//     coverImage: "https://example.com/albums/arijit2.jpg",
//     releaseDate: new Date("2023-03-10"),
//     songs: [],
//     price: 59,
//     isPremium: true,
//   },

//   // Taylor Swift
//   {
//     title: "Evermore",
//     description: "Taylor Swift's alternative and indie album.",
//     artist: "Taylor Swift",
//     coverImage: "https://example.com/albums/taylor1.jpg",
//     releaseDate: new Date("2021-12-11"),
//     songs: [],
//     price: 99,
//     isPremium: true,
//   },
//   {
//     title: "Red (Deluxe)",
//     description: "Deluxe edition of Taylor Swift's Red album.",
//     artist: "Taylor Swift",
//     coverImage: "https://example.com/albums/taylor2.jpg",
//     releaseDate: new Date("2020-11-01"),
//     songs: [],
//     price: 89,
//     isPremium: false,
//   },
//   {
//     title: "Folklore",
//     description: "A surprise indie folk album by Taylor Swift.",
//     artist: "Taylor Swift",
//     coverImage: "https://example.com/albums/taylor3.jpg",
//     releaseDate: new Date("2020-07-24"),
//     songs: [],
//     price: 79,
//     isPremium: false,
//   },

//   // The Weeknd
//   {
//     title: "After Hours",
//     description: "The Weeknd's chart-topping album.",
//     artist: "The Weeknd",
//     coverImage: "https://example.com/albums/weeknd1.jpg",
//     releaseDate: new Date("2020-03-20"),
//     songs: [],
//     price: 109,
//     isPremium: true,
//   },
//   {
//     title: "Starboy",
//     description: "Grammy-winning album by The Weeknd.",
//     artist: "The Weeknd",
//     coverImage: "https://example.com/albums/weeknd2.jpg",
//     releaseDate: new Date("2016-11-25"),
//     songs: [],
//     price: 99,
//     isPremium: false,
//   },

//   // Shreya Ghoshal
//   {
//     title: "Melodic Journey",
//     description: "A journey through Shreya's best songs.",
//     artist: "Shreya Ghoshal",
//     coverImage: "https://example.com/albums/shreya1.jpg",
//     releaseDate: new Date("2021-05-18"),
//     songs: [],
//     price: 39,
//     isPremium: false,
//   },
//   {
//     title: "Bollywood Classics",
//     description: "Classic Bollywood hits by Shreya Ghoshal.",
//     artist: "Shreya Ghoshal",
//     coverImage: "https://example.com/albums/shreya2.jpg",
//     releaseDate: new Date("2022-09-09"),
//     songs: [],
//     price: 59,
//     isPremium: true,
//   },

//   // Ed Sheeran
//   {
//     title: "Divide",
//     description: "Ed Sheeran's best-selling album.",
//     artist: "Ed Sheeran",
//     coverImage: "https://example.com/albums/ed1.jpg",
//     releaseDate: new Date("2017-03-03"),
//     songs: [],
//     price: 119,
//     isPremium: true,
//   },
//   {
//     title: "Equals",
//     description: "Latest album by Ed Sheeran.",
//     artist: "Ed Sheeran",
//     coverImage: "https://example.com/albums/ed2.jpg",
//     releaseDate: new Date("2021-10-29"),
//     songs: [],
//     price: 109,
//     isPremium: false,
//   },

//   // Adele
//   {
//     title: "30",
//     description: "Adele's comeback album.",
//     artist: "Adele",
//     coverImage: "https://example.com/albums/adele1.jpg",
//     releaseDate: new Date("2021-11-19"),
//     songs: [],
//     price: 129,
//     isPremium: true,
//   },
//   {
//     title: "21",
//     description: "Award-winning album by Adele.",
//     artist: "Adele",
//     coverImage: "https://example.com/albums/adele2.jpg",
//     releaseDate: new Date("2011-01-24"),
//     songs: [],
//     price: 99,
//     isPremium: false,
//   },
//   {
//     title: "25",
//     description: "Adele's record-breaking album.",
//     artist: "Adele",
//     coverImage: "https://example.com/albums/adele3.jpg",
//     releaseDate: new Date("2015-11-20"),
//     songs: [],
//     price: 119,
//     isPremium: true,
//   },

//   // Badshah
//   {
//     title: "ONE (Original Never Ends)",
//     description: "Badshah's debut studio album.",
//     artist: "Badshah",
//     coverImage: "https://example.com/albums/badshah1.jpg",
//     releaseDate: new Date("2018-08-17"),
//     songs: [],
//     price: 49,
//     isPremium: false,
//   },
//   {
//     title: "The Power of Dreams",
//     description: "Collaboration album by Badshah.",
//     artist: "Badshah",
//     coverImage: "https://example.com/albums/badshah2.jpg",
//     releaseDate: new Date("2020-07-07"),
//     songs: [],
//     price: 59,
//     isPremium: true,
//   },

//   // Billie Eilish
//   {
//     title: "Happier Than Ever",
//     description: "Billie Eilish's second studio album.",
//     artist: "Billie Eilish",
//     coverImage: "https://example.com/albums/billie1.jpg",
//     releaseDate: new Date("2021-07-30"),
//     songs: [],
//     price: 99,
//     isPremium: true,
//   },
//   {
//     title: "When We All Fall Asleep, Where Do We Go?",
//     description: "Debut album by Billie Eilish.",
//     artist: "Billie Eilish",
//     coverImage: "https://example.com/albums/billie2.jpg",
//     releaseDate: new Date("2019-03-29"),
//     songs: [],
//     price: 89,
//     isPremium: false,
//   },

//   // Diljit Dosanjh
//   {
//     title: "G.O.A.T.",
//     description: "Diljit Dosanjh's hit Punjabi album.",
//     artist: "Diljit Dosanjh",
//     coverImage: "https://example.com/albums/diljit1.jpg",
//     releaseDate: new Date("2020-07-30"),
//     songs: [],
//     price: 69,
//     isPremium: false,
//   },
//   {
//     title: "MoonChild Era",
//     description: "Experimental album by Diljit Dosanjh.",
//     artist: "Diljit Dosanjh",
//     coverImage: "https://example.com/albums/diljit2.jpg",
//     releaseDate: new Date("2021-08-21"),
//     songs: [],
//     price: 79,
//     isPremium: true,
//   },

//   // Dua Lipa
//   {
//     title: "Future Nostalgia",
//     description: "Grammy-winning album by Dua Lipa.",
//     artist: "Dua Lipa",
//     coverImage: "https://example.com/albums/dua1.jpg",
//     releaseDate: new Date("2020-03-27"),
//     songs: [],
//     price: 109,
//     isPremium: true,
//   },
//   {
//     title: "Dua Lipa (Deluxe)",
//     description: "Deluxe edition of Dua Lipa's debut album.",
//     artist: "Dua Lipa",
//     coverImage: "https://example.com/albums/dua2.jpg",
//     releaseDate: new Date("2017-06-02"),
//     songs: [],
//     price: 89,
//     isPremium: false,
//   },
//   {
//     title: "Club Future Nostalgia",
//     description: "Remix album by Dua Lipa.",
//     artist: "Dua Lipa",
//     coverImage: "https://example.com/albums/dua3.jpg",
//     releaseDate: new Date("2020-08-28"),
//     songs: [],
//     price: 79,
//     isPremium: false,
//   },
// ];

// const seed = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     await Album.deleteMany(); // Optional: clear existing albums
//     await Album.insertMany(albums);
//     console.log("Albums seeded successfully!");
//     process.exit(0);
//   } catch (err) {
//     console.error("Seeding failed:", err);
//     process.exit(1);
//   }
// };

// seed();

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Song } from "./models/Song.js";
import { Album } from "./models/Album.js";
import { Artist } from "./models/Artist.js";

dotenv.config();

// Helper data for randomization
const genres = [
  "pop", "rock", "hip hop", "indie", "electronic", "classical", "jazz", "bollywood", "punjabi", "r&b"
];
const randomFromArray = arr => arr[Math.floor(Math.random() * arr.length)];
const randomDuration = () => Math.floor(Math.random() * 120) + 180; // 180-300 sec
const randomPrice = () => [0, 19, 29, 39, 49][Math.floor(Math.random() * 5)];
const randomIsPremium = () => Math.random() < 0.5;
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomAudioUrl = i => `https://example.com/audio/song${i}.mp3`;
const randomCoverUrl = i => `https://example.com/covers/song${i}.jpg`;
const makeSongTitle = (albumTitle, i) => `${albumTitle} Track ${i + 1}`;

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Song.deleteMany();

    // Fetch all albums (each album's artist is an ObjectId)
    const albums = await Album.find({});
    let songCount = 0;
    const songsToInsert = [];

    for (const album of albums) {
      // Find the artist ObjectId for this album
      const artistId = album.artist;

      // 4-5 songs per album
      const numSongs = Math.floor(Math.random() * 2) + 4;
      for (let i = 0; i < numSongs; i++) {
        const genre = [randomFromArray(genres)];
        const song = {
          title: makeSongTitle(album.title, i),
          artist: artistId,
          album: album._id,
          includeInSubscription: Math.random() < 0.8,
          genre,
          duration: randomDuration(),
          coverImage: randomCoverUrl(songCount),
          audioUrl: randomAudioUrl(songCount),
          price: randomPrice(),
          isPremium: randomIsPremium(),
          releaseDate: randomDate(new Date(2015, 0, 1), new Date()),
        };
        songsToInsert.push(song);
        songCount++;
      }
    }

    await Song.insertMany(songsToInsert);
    console.log(`Seeded ${songsToInsert.length} songs!`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seed();

// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import { Album } from "./models/Album.js";
// import { Artist } from "./models/Artist.js";

// dotenv.config();

// const migrate = async () => {
//   await mongoose.connect(process.env.MONGO_URL);

//   const albums = await Album.find({});
//   for (const album of albums) {
//     if (typeof album.artist === "string" && album.artist.length !== 24) {
//       const artistDoc = await Artist.findOne({ name: album.artist });
//       if (artistDoc) {
//         album.artist = artistDoc._id;
//         await album.save();
//         console.log(`Updated album "${album.title}" with artistId ${artistDoc._id}`);
//       } else {
//         console.warn(`Artist not found for album "${album.title}"`);
//       }
//     }
//   }
//   console.log("Migration complete.");
//   process.exit(0);
// };

// migrate();