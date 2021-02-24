// First, sign up for an account at https://themoviedb.org
// Once verified and signed-in, go to Settings and create a new
// API key; in the form, indicate that you'll be using this API
// key for educational or personal use, and you should receive
// your new key right away.

// For this exercise, we'll be using the "now playing" API endpoint
// https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US

// Note: image data returned by the API will only give you the filename;
// prepend with `https://image.tmdb.org/t/p/w500/` to get the 
// complete image URL
let db = firebase.firestore()

firebase.auth().onAuthStateChanged(async function(user) {
  let apiKey = `3a4ff538bc09ba712ab44a829b82faea`
  let response = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US`)
  let json = await response.json()
  let movies = json.results
  let currentUser = firebase.auth().currentUser
  // console.log(currentUser)
  console.log(movies)
  if (user) {
    // Signed in
    console.log(`${user.displayName} is signed in`)
    // Ensure the signed-in user is in the users collection
    db.collection('users').doc(currentUser.uid).set({
      name: user.displayName,
      email: user.email
    })

    // Sign-out button
    document.querySelector('.sign-in-or-sign-out').innerHTML = `
      <p>Signed in as ${user.displayName}</p>
      <button class="text-pink-500 underline sign-out">Sign Out</button>
    `
    document.querySelector('.sign-out').addEventListener('click', function(event) {
      console.log('sign out clicked')
      firebase.auth().signOut()
      document.location.href = 'movies.html'
    })

    // Show current users movies
    console.log(`Current user: ${user.displayName}`)
    let querySnapshot = await db.collection('watched').get()
    let watched = querySnapshot.docs
    console.log(watched)
    for (let i = 0; i < movies.length; i++) {
      let movieId = movies[i].id
      let posterPath = movies[i].poster_path
      document.querySelector(`.movies`).insertAdjacentHTML(`beforeend`, `
      <div class="w-1/5 p-4 movie-${movieId}-${currentUser.uid}">
        <img src="https://image.tmdb.org/t/p/w500/${posterPath}" class="w-full">
        <a href="#" class="watched-button block text-center text-white bg-green-500 mt-4 px-4 py-2 rounded">I've watched this!</a>
      </div>
      `)
      let docRef = await db.collection('watched').doc(`${movieId}-${currentUser.uid}`).get()
      if (docRef.data()) {
        document.querySelector(`.movie-${movieId}-${currentUser.uid} .w-full`).classList.add('opacity-20')
      }
    }

    // Watched movie logic
    for (let j = 0; j < movies.length; j++) {
      let movieId = movies[j].id
      let movieTitle = movies[j].title
      document.querySelector(`.movie-${movieId}-${currentUser.uid} .watched-button`).addEventListener('click', async function(event) {
        event.preventDefault()
        if (document.querySelector(`.movie-${movieId}-${currentUser.uid} .w-full`).classList.contains('opacity-20'))
           {document.querySelector(`.movie-${movieId}-${currentUser.uid} .w-full`).classList.remove('opacity-20')
            console.log(`I didn't watch: ${movieTitle}`)
            await db.collection('watched').doc(`${movieId}-${currentUser.uid}`).delete()
        } else {
        document.querySelector(`.movie-${movieId}-${currentUser.uid} .w-full`).classList.add('opacity-20')
        console.log(`I watched: ${movieTitle}`)
        await db.collection('watched').doc(`${movieId}-${currentUser.uid}`).set({})
        }   
      })
    }

  } else {
    // Signed out
    // Initializes FirebaseUI Auth
    let ui = new firebaseui.auth.AuthUI(firebase.auth())
    // FirebaseUI configuration
    let authUIConfig = {
      signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ],
      signInSuccessUrl: 'movies.html'
    }
    // Starts FirebaseUI Auth
    ui.start('.sign-in-or-sign-out', authUIConfig)
    }
  })

  // Goal:   Refactor the movies application from last week, so that it supports
//         user login and each user can have their own watchlist.

// Start:  Your starting point is one possible solution for last week's homework.

// Step 1: Add your Firebase configuration to movies.html, along with the
//         (provided) script tags for all necessary Firebase services – i.e. Firebase
//         Auth, Firebase Cloud Firestore, and Firebase UI for Auth; also
//         add the CSS file for FirebaseUI for Auth.
// Step 2: Change the main event listener from DOMContentLoaded to 
//         firebase.auth().onAuthStateChanged and include conditional logic 
//         shows a login UI when signed, and the list of movies when signed
//         in. Use the provided .sign-in-or-sign-out element to show the
//         login UI. If a user is signed-in, display a message like "Signed 
//         in as <name>" along with a link to "Sign out". Ensure that a document
//         is set in the "users" collection for each user that signs in to 
//         your application.
// Step 3: Setting the TMDB movie ID as the document ID on your "watched" collection
//         will no longer work. The document ID should now be a combination of the
//         TMDB movie ID and the user ID indicating which user has watched. 
//         This "composite" ID could simply be `${movieId}-${userId}`. This should 
//         be set when the "I've watched" button on each movie is clicked. Likewise, 
//         when the list of movies loads and is shown on the page, only the movies 
//         watched by the currently logged-in user should be opaque.