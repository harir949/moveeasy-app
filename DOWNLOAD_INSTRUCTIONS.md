# How to Download Your MoveEasy Project

Since the built-in download is having issues, here are several alternative methods:

## Method 1: Git Repository (Recommended)

1. **Initialize Git in your Replit:**
   ```bash
   git init
   git add .
   git commit -m "MoveEasy booking application - complete project"
   ```

2. **Connect to GitHub:**
   - Create a new repository on GitHub
   - Follow GitHub's instructions to push your existing repository
   
3. **Clone locally:**
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   ```

## Method 2: Manual File Copy

Since automated downloads aren't working, you can recreate the project structure locally:

### 1. Create the project structure:
```bash
mkdir moveeasy-booking
cd moveeasy-booking
mkdir -p client/src/{components,pages,lib,hooks}
mkdir -p server
mkdir shared
```

### 2. Copy key files manually:

**Root files:**
- `package.json` - Copy from Replit
- `tsconfig.json` - Copy from Replit  
- `vite.config.ts` - Copy from Replit
- `tailwind.config.ts` - Copy from Replit
- `postcss.config.js` - Copy from Replit

**Client files:**
- All files from `client/src/` directory
- `client/index.html`

**Server files:**
- All files from `server/` directory

**Shared files:**
- `shared/schema.ts`

### 3. Install dependencies:
```bash
npm install
```

## Method 3: Copy Individual Files

You can copy each file's content from the Replit file explorer:

1. Open each file in Replit
2. Select all content (Ctrl+A)
3. Copy (Ctrl+C)
4. Create the file locally and paste

## Important Notes

- The `node_modules` folder will be recreated when you run `npm install`
- The `uploads` folder is for runtime file uploads - create it empty locally
- Make sure to copy the exact folder structure shown in the file explorer

## After Download

1. Run `npm install` to install dependencies
2. Create a `.env` file (see `.env.example`)
3. Run `npm run dev` to start the application
4. Visit `http://localhost:5000`

The application includes:
- Complete booking form with Greek address autocomplete
- Interactive maps with OpenStreetMap
- Admin dashboard for managing bookings
- Photo upload functionality
- Responsive design

All features work locally without requiring external APIs or database setup (uses in-memory storage by default).