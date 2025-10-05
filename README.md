 YouTube Clone – Smart Video Streaming App
 Overview

The YouTube Clone is a feature-rich video streaming web app built using React.js and the YouTube Data API v3.
This project replicates key functionalities of YouTube, such as searching videos, viewing trending content, adding favorites, comments, dark mode, mini player, and more.

This project demonstrates strong skills in frontend development, API integration, state management, and real-world UI/UX design.

 Features
 Core Functionalities

 Search Videos – Search for any video using the official YouTube Data API.

 Trending Section – Displays top trending videos in India dynamically.

 Mini Player (Picture-in-Picture) – Watch videos in a floating mini player while browsing other videos.

 Dark Mode / Light Mode – Toggle theme instantly for better user experience.

 Watch History – Automatically stores the list of videos the user watched.

 Favorites – Save favorite videos in LocalStorage permanently.

 Comments Section – Add comments locally on each video (saved in LocalStorage).

 Like / Dislike System – Local voting system for each video.

 Queue System – Automatically plays the next video when the current one ends.

 Share Button – Copy video link and share directly.

 Technologies Used
Category	Tools / Libraries
Frontend	React.js, Bootstrap 5
API	YouTube Data API v3
State Management	React Hooks (useState, useEffect, useRef)
Storage	LocalStorage (for favorites, history, comments)
Styling	Custom CSS + Bootstrap Theme
Icons	Bootstrap Icons


 How to Run
1 Clone the Repository
git clone https://github.com/Mujeem8410/Youtube-Clone
cd youtube-clone

2 Install Dependencies
npm install

3 Start the App
npm run dev

4 Open in Browser

Go to  http://localhost:5173

 API Setup

Go to Google Cloud Console

Enable YouTube Data API v3

Create a new API Key

Replace the key in App.jsx

const API_KEY = "YOUR_API_KEY_HERE";

 Data Persistence
Data Type	Storage Method	Description
Favorites	LocalStorage	Permanently saves user’s liked videos
Comments	LocalStorage	Saves comments for each video
Watch History	LocalStorage	Automatically logs watched videos
Theme	LocalStorage	Remembers last used mode (dark/light)
 Learning Outcomes

By building this project, the developer learned:

React component architecture

Real-time API data fetching using Axios

Managing complex UI states with hooks

Handling embedded YouTube player using iframe API

Building user-friendly interfaces similar to modern platforms

Storing data persistently using LocalStorage

 Future Enhancements

 User Authentication (Login/Signup)

 Database Integration (MongoDB for persistent user data)

 Real-time Comments using Backend APIs

 Advanced Recommendation System based on search history

 Developer

Developed by: Mujeem Saif (B.Tech Final Year Student)
 Passionate about Frontend & Full Stack Development
 GitHub : https://github.com/Mujeem8410
 LinkedIn : https://www.linkedin.com/in/mr-mujeem-saif-964288224/

 Conclusion

This YouTube Clone Project demonstrates a real-world understanding of React, APIs, and modern UI/UX.
It is designed as a complete frontend product suitable for academic submission, placements, and portfolio showcase.