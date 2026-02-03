const firebaseConfig = {
  apiKey: "AIzaSyARBi6bpk0Z0FCdBIE3ywBe2iPUbiGZZ9E",
  authDomain: "general-storage-a402e.firebaseapp.com",
  databaseURL: "https://general-storage-a402e-default-rtdb.firebaseio.com",
  projectId: "general-storage-a402e",
  storageBucket: "general-storage-a402e.firebasestorage.app",
  messagingSenderId: "659108630557",
  appId: "1:659108630557:web:6aaa6c4d8275ce44d676f4"
};

const app = firebase.initializeApp(firebaseConfig);
let isAdmin = false;

firebase.database().ref("waitlist").once('value', (data) => {
    const snapshot = data.val();
    if (snapshot == null) {
        let noOneHere = document.createElement("div");
        noOneHere.classList.add("waitlist_member");
        noOneHere.innerHTML = `
        <h3>Empty Waitlist</h3>
        `;
        document.querySelector("#waitlist_scroll").appendChild(noOneHere);
        return;
    }
    let place = 1;
    for (const [key, value] of Object.entries(snapshot)) {
        let waitlistMember = document.createElement("div");
        waitlistMember.classList.add("waitlist_member");
        waitlistMember.innerHTML = `
        <h3>${place}: ${value.florr_username}</h3>
        <p>(@${value.discord_username})<br>Joined MS: ${value.time_added}</p>
        ${value.returning_member ? "<p>Returning Member.</p>" : ""}
        ${isAdmin ? `<button onclick="removeFromWaitlist('${key}')" class="red_button">Added to Guild?</button>` : ""}`;
        document.querySelector("#waitlist_scroll").appendChild(waitlistMember);
        place++;
    }
});

function removeFromWaitlist(key) {
    firebase.database().ref("/waitlist/" + key).remove();
    window.location.reload(true);
}

firebase.auth().onAuthStateChanged(async (user) => {
    console.log(user)
    if (user) {
        try {
            const idTokenResult = await user.getIdTokenResult(true);

            if (idTokenResult.claims.admin) {
                isAdmin = true;
                let addButton = document.createElement("a");
                addButton.classList.add("link_button");
                addButton.setAttribute("href", "waitlist_form.html");
                addButton.textContent = "Add to Waitlist";

                document.querySelector("#big_holder").appendChild(addButton);
            }
        } catch (error) {
            console.error("Error checking admin claims:", error);
        }
    } else {
        //You're logged out.
    }
})
firebase.auth().signInAnonymously().catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;

    console.log(errorCode, errorMessage);
});