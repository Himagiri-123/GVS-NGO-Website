const mongoose = require('mongoose');
require('dotenv').config();
const Initiative = require('./models/Initiative');

const database = [
  {
    slug: "education",
    title: "Education (VVK)",
    icon: "fas fa-book-reader",
    description: "We are running Vidyarthi Vikasa Kendrams (Night Study Centers) to provide quality education and instill moral values in rural children.",
    layout: "split",
    leftSide: {
      mandal: "Bhamini Mandal",
      headers: ["Village", "Center Name", "Total Students", "Instructor"],
      rows: [
        { col1: "Bhamini", col2: "VVK Bhamini", col3: "45", col4: "B. Raju, M. Sita" },
        { col1: "Battili", col2: "VVK Battili", col3: "30", col4: "K. Suresh" }
      ],
      photos: [{ url: "/images/IMG_20200320_162806.jpg", village: "Bhamini VVK" }]
    },
    rightSide: {
      mandal: "Kothuru Mandal",
      headers: ["Village", "Center Name", "Total Students", "Instructor"],
      rows: [
        { col1: "Kothuru", col2: "VVK Kothuru", col3: "40", col4: "M. Ramesh, S. Latha" },
        { col1: "Nulakajodu", col2: "VVK Nulakajodu", col3: "50", col4: "P. Naidu" }
      ],
      photos: [{ url: "/images/NULAKAJODU (12).jpg", village: "Nulakajodu VVK" }]
    }
  },
  {
    slug: "health",
    title: "Healthcare & Sanitation",
    icon: "fas fa-heartbeat",
    description: "Providing clean drinking water, nutrition, and basic health & sanitation facilities to rural communities.",
    layout: "generic",
    sections: [
      {
        title: "R.O Water Plant",
        table: { headers: ["Village", "Plant Capacity", "Beneficiaries (Daily)", "Status"], rows: [{ col1: "Ghanasara", col2: "1000 LPH", col3: "150+ Families", col4: "Active" }] },
        photos: [{ url: "/images/Water Plant (1).jpg", village: "Ghanasara Water Plant" }]
      },
      {
        title: "Nutrition Food Distribution",
        table: { headers: ["Village", "Item Distributed", "Beneficiaries", "Date"], rows: [{ col1: "Multiple", col2: "Chikkis & Fruits", col3: "100+ Children", col4: "Weekly" }] },
        photos: [{ url: "/images/IMG_20200320_162806.jpg", village: "MCKS Foundation Food Drive" }]
      },
      { title: "Covid Kits", table: { headers: ["Village", "Kits Distributed", "Beneficiaries", "Date"], rows: [] }, photos: [] },
      { title: "Toilets Construction", table: { headers: ["Village", "Units Built", "Beneficiaries", "Status"], rows: [] }, photos: [] }
    ]
  },
  {
    slug: "skill-development",
    title: "Skill Development (Kalam Dreams)",
    icon: "fas fa-laptop",
    description: "Free computer training centers to equip youth with modern digital skills.",
    layout: "paginated", 
    tableHeaders: ["Batch No.", "Starting Date", "Ending Date", "Days", "Students", "Villages"],
    tableRows: [
      { col1: "38", col2: "08-02-2026", col3: "Present", col4: "-", col5: "10", col6: "Soli Kiviri, Dimmidijola" },
      { col1: "37", col2: "21-09-2025", col3: "05-02-2026", col4: "45", col5: "15", col6: "Nulakajodu, Ghanasara" },
      { col1: "36", col2: "31-08-2025", col3: "20-09-2025", col4: "20", col5: "16", col6: "Kosali" }
    ],
    photos: [
      { url: "/images/image_8cc6fb.jpg", village: "Kalam Dreams Board" },
      { url: "/images/1639050352122.jpg", village: "Ghanasara Center" },
      { url: "/images/IMG20211121113240.jpg", village: "Students Batch" }
    ]
  },
  {
    slug: "spirituality",
    title: "Spirituality & Culture",
    icon: "fas fa-om",
    description: "Encouraging moral values, peace, and cultural heritage through mass prayers and community poojas.",
    layout: "generic",
    sections: [
      { title: "Karthika Powrnami", table: { headers: ["Village", "Participants", "Highlights", "Date"], rows: [] }, photos: [] },
      { title: "Sankranthi", table: { headers: ["Village", "Event Details", "Participants", "Date"], rows: [] }, photos: [] }
    ]
  },
  {
    slug: "environment",
    title: "Environment & Eco-Living",
    icon: "fas fa-leaf",
    description: "Promoting tree plantation and sustainable eco-friendly practices in rural areas.",
    layout: "generic",
    sections: [
      {
        title: "Tree Plantation Drives",
        table: { headers: ["Village", "Plants", "Date", "Status"], rows: [{ col1: "Ghanasara", col2: "500 Saplings", col3: "July 2025", col4: "Completed" }] },
        photos: [{ url: "/images/IMG-20191205-WA0065.jpg", village: "Plantation Drive" }]
      }
    ]
  },
  {
    slug: "agriculture",
    title: "Agriculture Development",
    icon: "fas fa-tractor",
    description: "Supporting local farmers with modern techniques and organic farming training.",
    layout: "generic",
    sections: [
      { title: "Cow Based Natural Farming", table: { headers: ["Village", "Topic", "Farmers Attended", "Date"], rows: [] }, photos: [] }
    ]
  },
  {
    slug: "others",
    title: "Other Welfare Activities",
    icon: "fas fa-hands-helping",
    description: "Various other community welfare programs taken up by GVS.",
    layout: "generic",
    sections: [
      { title: "All Meetings", table: { headers: ["Location", "Meeting Agenda", "Attendees", "Date"], rows: [] }, photos: [] },
      { title: "Books Distribution", table: { headers: ["Village", "Books Distributed", "Students", "Date"], rows: [] }, photos: [] }
    ]
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database Connected for Seeding!");

    await Initiative.deleteMany(); 
    await Initiative.insertMany(database);

    console.log("🎉 All data (including any previously missing data) saved successfully to the database!");
    process.exit();
  } catch (error) {
    console.log("❌ An error occurred: ", error);
    process.exit(1);
  }
};

seedData();