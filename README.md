# トレーニング記録アプリ (Training Tracker)

A React-based training record application with Firebase backend, featuring calendar-based workout logging, muscle group categorization, and statistics.

## 🚀 Features

- **Google OAuth Authentication** - Secure login with Google accounts
- **Calendar Interface** - Click dates to view and manage workouts
- **Inline Workout Management** - Add, edit, and delete workouts directly in the list
- **Detailed Muscle Groups** - Chest, shoulders, arms, back, legs with AI-suggested exercises
- **Statistics Dashboard** - View workout statistics and progress
- **Responsive Design** - Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Auth (Google OAuth)
- **Hosting**: Firebase Hosting
- **Deployment**: GitHub Actions

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase CLI
- Google Cloud account

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd My-Training
   ```

2. **Install dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Set up Firebase**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```

4. **Configure environment variables**
   Create `.env` file in the client directory:
   ```env
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

5. **Install all dependencies**
   ```bash
   npm run install-all
   ```

6. **Start development environment**
   
   **Option 1: Using batch file (Windows)**
   ```bash
   .\dev.bat
   ```
   
   **Option 2: Using PowerShell**
   ```powershell
   .\dev.ps1
   ```
   
   **Option 3: Manual start**
   ```bash
   # Terminal 1: Start Firebase Functions emulator
   cd functions
   npm run serve
   
   # Terminal 2: Start React client
   cd client
   npm start
   ```

## 🚀 Deployment

### Automatic Deployment (Recommended)

The app is configured for automatic deployment using GitHub Actions:

1. **Push to GitHub** - Any push to `main` or `master` branch triggers automatic deployment
2. **GitHub Actions** - Builds the app and deploys to Firebase Hosting
3. **Live URL** - Available at: https://my-training-8d8a9.web.app

### Manual Deployment

1. **Build the app**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy --only hosting
   ```

### Setting up GitHub Actions

1. **Create Firebase Service Account**
   - Go to Firebase Console > Project Settings > Service Accounts
   - Generate new private key
   - Download the JSON file

2. **Add GitHub Secrets**
   - Go to your GitHub repository > Settings > Secrets and variables > Actions
   - Add `FIREBASE_SERVICE_ACCOUNT` with the content of the downloaded JSON file

3. **Push to trigger deployment**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

## 📁 Project Structure

```
My Training/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   ├── types.ts        # TypeScript types
│   │   └── firebase.ts     # Firebase configuration
│   ├── public/             # Static files
│   └── package.json
├── functions/              # Firebase Functions (backend)
│   ├── index.js           # Express server
│   └── package.json
├── .github/workflows/      # GitHub Actions
├── firebase.json           # Firebase configuration
├── firestore.rules         # Firestore security rules
├── firestore.indexes.json  # Firestore indexes
├── dev.bat                 # Development script (Windows)
├── dev.ps1                 # Development script (PowerShell)
└── README.md
```

## 🔧 Configuration

### Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project
   - Enable Authentication (Google provider)
   - Enable Firestore Database
   - Enable Hosting

2. **Configure Firestore Rules**
   - Deploy security rules: `firebase deploy --only firestore:rules`
   - Deploy indexes: `firebase deploy --only firestore:indexes`

3. **Initialize Data**
   - The app automatically creates initial muscle groups and exercises on first run

### Environment Variables

Required environment variables for the client:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## 🎯 Usage

1. **Sign In** - Use Google account to authenticate
2. **View Calendar** - Click any date to see workouts for that day
3. **Add Workouts** - Click "記録を追加" to add new workout records
4. **Edit Workouts** - Click "編集" to modify existing workouts
5. **View Statistics** - Click "統計" to see workout analytics

## 🔒 Security

- **Authentication Required** - All workout data requires user authentication
- **User Isolation** - Users can only access their own workout data
- **Firestore Rules** - Secure database access with proper permissions

## 📊 Features

### Muscle Groups
- 胸 (Chest)
- 肩 (Shoulders)  
- 腕 (Arms)
- 背中 (Back)
- 脚 (Legs)
- 腹筋 (Abs)
- その他 (Others)

### Exercise Types
- Compound exercises
- Isolation exercises
- Cardio
- Flexibility training

### Statistics
- Workout count by muscle group
- Total volume (weight × reps)
- Average weight per exercise
- Progress tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce

## 🔄 Updates

The app automatically updates when you push to the main branch. GitHub Actions will:
1. Build the React app
2. Run tests (if configured)
3. Deploy to Firebase Hosting
4. Update the live URL

---

**Live App**: https://my-training-8d8a9.web.app
**Firebase Console**: https://console.firebase.google.com/project/my-training-8d8a9 