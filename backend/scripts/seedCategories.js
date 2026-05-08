const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ServiceCategory = require('../models/ServiceCategory');

// Load env vars
dotenv.config({ path: '../config/config.env' });

// Connect to database
mongoose.connect(process.env.MONGO_URI);

const categories = [
  {
    name: 'Plumbing',
    description: 'Professional plumbing services including repairs, installations, and maintenance',
    icon: '🔧',
    keywords: ['plumber', 'pipes', 'water', 'leak', 'drain']
  },
  {
    name: 'Electrical',
    description: 'Licensed electricians for wiring, repairs, and electrical installations',
    icon: '⚡',
    keywords: ['electrician', 'wiring', 'power', 'lights', 'electrical']
  },
  {
    name: 'Tutoring',
    description: 'Educational tutoring services for all subjects and grade levels',
    icon: '📚',
    keywords: ['tutor', 'education', 'teaching', 'lessons', 'homework']
  },
  {
    name: 'Gardening',
    description: 'Lawn care, landscaping, and garden maintenance services',
    icon: '🌱',
    keywords: ['gardener', 'lawn', 'landscaping', 'plants', 'mowing']
  },
  {
    name: 'Cleaning',
    description: 'House cleaning, deep cleaning, and maintenance services',
    icon: '🧹',
    keywords: ['cleaner', 'housekeeping', 'maid', 'cleaning', 'sanitize']
  },
  {
    name: 'Carpentry',
    description: 'Custom woodwork, furniture repair, and carpentry services',
    icon: '🪚',
    keywords: ['carpenter', 'wood', 'furniture', 'repair', 'construction']
  },
  {
    name: 'Painting',
    description: 'Interior and exterior painting services',
    icon: '🎨',
    keywords: ['painter', 'paint', 'walls', 'interior', 'exterior']
  },
  {
    name: 'Moving',
    description: 'Professional moving and relocation services',
    icon: '📦',
    keywords: ['mover', 'relocation', 'transport', 'packing', 'moving']
  }
];

const seedCategories = async () => {
  try {
    // Clear existing categories
    await ServiceCategory.deleteMany();
    console.log('Categories cleared');

    // Insert new categories
    await ServiceCategory.insertMany(categories);
    console.log('Categories seeded successfully');

    process.exit();
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();