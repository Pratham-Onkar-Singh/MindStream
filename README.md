# 🧠 MindStream

> Your Second Brain - A modern, feature-rich content management system for organizing your digital knowledge.

MindStream is a full-stack web application that helps you capture, organize, and retrieve your digital content - from links and articles to files and notes. Built with modern technologies, it provides a seamless experience for building your personal knowledge base.

## ✨ Features

### 📚 Content Management
- **Multiple Content Types**: Support for links (YouTube, Twitter, articles) and file uploads
- **Rich Metadata**: Add titles, descriptions, and tags to your content (Tags feature coming soon...)
- **File Upload**: Upload and manage files with Cloudinary integration
- **Smart Search**: Full-text search across all your content with filters
- **Content Types**: Organize by links, files, or view all content together

### 🗂️ Collection System
- **Nested Collections**: Create hierarchical folder structures for better organization
- **Drag & Drop**: Easy content organization with intuitive interface
- **Collection Management**: Create, edit, and delete collections
- **Smart Filtering**: Filter content by collection and type
- **Breadcrumb Navigation**: Easy navigation through nested collections
- **Collapsible Trees**: Expand/collapse collection hierarchies

### 🔒 Security & Authentication
- **Secure Authentication**: JWT-based authentication system
- **Password Hashing**: Bcrypt encryption for password security
- **Email Validation**: Client-side email format validation
- **Password Requirements**: Minimum 6 character password enforcement
- **Masked Password Input**: Progressive character masking for better UX

### 🤝 Sharing & Collaboration
- **Brain Sharing**: Generate shareable links to your entire collection
- **Public/Private Mode**: Toggle brain visibility
- **Secure Links**: Hash-based sharing system

### 🎨 User Experience
- **Modern UI**: Clean, dark-themed interface built with Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Updates**: Automatic collection and content count updates
- **Custom Icons**: Emoji support for collections
- **Color Coding**: Visual organization with custom colors
- **Empty States**: Helpful messages and CTAs when no content exists

### 👤 User Profile
- **Profile Management**: Update name, username, and email
- **Brain Visibility**: Control public/private access to your brain
- **User Statistics**: View your content and collection counts

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS 4** - Utility-first styling
- **React Router 7** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **TypeScript** - Type-safe backend
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Cloudinary** - File storage and CDN
- **Multer** - File upload handling

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas account)
- **Cloudinary Account** (for file uploads)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Pratham-Onkar-Singh/MindStream.git
cd MindStream
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Configure your `.env` file with the following variables:

```env
# Database
MONGO_URL=mongodb://localhost:27017/mindstream
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/mindstream

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

```bash
# Start the development server
npm run dev

# Or build and start production
npm run build
npm start
```

The backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd Frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Configure your `.env` file:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000
```

```bash
# Start the development server
npm run dev

# Or build for production
npm run build
npm run preview
```

The frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
MindStream/
├── Backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   │   ├── cloudinary.ts
│   │   │   ├── database.ts
│   │   │   └── environment.ts
│   │   ├── controllers/     # Request handlers
│   │   │   ├── authController.ts
│   │   │   ├── collectionController.ts
│   │   │   ├── contentController.ts
│   │   │   ├── searchController.ts
│   │   │   ├── shareController.ts
│   │   │   ├── uploadController.ts
│   │   │   └── userController.ts
│   │   ├── middlewares/     # Custom middleware
│   │   │   └── auth.ts
│   │   ├── models/          # Database models
│   │   │   ├── Collection.ts
│   │   │   ├── Content.ts
│   │   │   ├── File.ts
│   │   │   ├── Link.ts
│   │   │   ├── Tag.ts
│   │   │   └── User.ts
│   │   ├── routes/          # API routes
│   │   │   ├── authRoutes.ts
│   │   │   ├── collectionRoutes.ts
│   │   │   ├── contentRoutes.ts
│   │   │   ├── searchRoutes.ts
│   │   │   ├── shareRoutes.ts
│   │   │   ├── uploadRoutes.ts
│   │   │   └── userRoutes.ts
│   │   ├── utils/           # Utility functions
│   │   │   └── hashGenerator.ts
│   │   └── server.ts        # Entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── Frontend/
│   ├── src/
│   │   ├── assets/          # Static assets
│   │   ├── components/      # React components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── CollectionSidebar.tsx
│   │   │   ├── ContentCard.tsx
│   │   │   ├── CreateCollectionModal.tsx
│   │   │   ├── CreateContentModal.tsx
│   │   │   ├── DeleteCollectionModal.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── PasswordInput.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ...
│   │   ├── features/        # Feature modules
│   │   │   └── collections/
│   │   ├── hooks/           # Custom hooks
│   │   │   └── useContent.tsx
│   │   ├── icons/           # Icon components
│   │   ├── pages/           # Page components
│   │   │   ├── Brain.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── SignIn.tsx
│   │   │   └── Signup.tsx
│   │   ├── types/           # TypeScript types
│   │   │   └── collection.ts
│   │   ├── utils/           # Utility functions
│   │   │   ├── collectionRefresh.ts
│   │   │   └── collectionTree.ts
│   │   ├── api.ts           # API client
│   │   ├── config.ts        # Configuration
│   │   ├── App.tsx          # Root component
│   │   └── main.tsx         # Entry point
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/signup` - Create new account
- `POST /api/v1/signin` - Login to account

### Content Management
- `GET /api/v1/content` - Get all user content
- `POST /api/v1/content` - Create new content
- `PUT /api/v1/content` - Update content
- `DELETE /api/v1/content` - Delete content

### Collections
- `GET /api/v1/collections` - Get all collections
- `POST /api/v1/collections` - Create new collection
- `PUT /api/v1/collections/:id` - Update collection
- `DELETE /api/v1/collections/:id` - Delete collection
- `GET /api/v1/collections/:id/contents` - Get collection contents

### Search
- `GET /api/v1/search?query=...` - Search content

### File Upload
- `POST /api/v1/upload` - Upload file to Cloudinary

### Sharing
- `GET /api/v1/brain/share` - Get share link
- `GET /api/v1/brain/:shareLink` - View shared brain

### User Profile
- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/profile` - Update user profile
- `PUT /api/v1/user/brain-visibility` - Toggle brain visibility

## 🗄️ Database Schema

### User
- `name` - User's full name
- `email` - Email address (unique)
- `username` - Username (unique)
- `password` - Hashed password
- `isBrainPublic` - Brain visibility setting

### Content
- `title` - Content title
- `description` - Optional description
- `type` - Content type (link/file)
- `link` - URL for link content
- `collection` - Reference to collection
- `userId` - Reference to user
- `tags` - Array of tags

### Collection
- `name` - Collection name
- `description` - Optional description
- `icon` - Emoji icon
- `color` - Hex color code
- `parentCollection` - Reference to parent collection
- `userId` - Reference to user
- `isDefault` - Default collection flag

### Link
- `hash` - Unique hash for sharing
- `userId` - Reference to user

## 🎯 Key Features Explained

### Nested Collections
Collections can be nested infinitely, creating a powerful hierarchical organization system. The tree structure is built client-side for optimal performance.

### Smart Search
Full-text search across titles and descriptions with:
- Type filtering (links/files/all)
- Collection scope
- Sort options (relevance/date)

### Progressive Password Masking
Custom password input that shows each character briefly before masking - providing visual feedback while maintaining security.

### Collection Deletion Options
When deleting a collection, choose between:
- **Delete only**: Propagates children upward, uncategorizes content
- **Delete all**: Removes collection, all descendants, and their content

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Environment variable protection
- CORS configuration
- Input validation
- XSS protection
- SQL injection prevention (NoSQL)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Pratham Onkar Singh**
- GitHub: [@Pratham-Onkar-Singh](https://github.com/Pratham-Onkar-Singh)

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the concept of "Building a Second Brain"
- Designed for developers and knowledge workers

## 📞 Support

For support, email or open an issue in the GitHub repository.

---

**⭐ Star this repository if you find it helpful!**
