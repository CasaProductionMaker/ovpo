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

firebase.database().ref("members").once('value', (data) => {
    const snapshot = data.val();
    if (snapshot == null) {
        let noOneHere = document.createElement("div");
        noOneHere.classList.add("list_member");
        noOneHere.innerHTML = `
        <h3>No members?! I guess OvPo died..</h3>
        `;
        document.querySelector("#members_scroll").appendChild(noOneHere);
        return;
    }
    for (const [key, value] of Object.entries(snapshot)) {
        let member = document.createElement("div");
        member.classList.add("list_member");
        member.innerHTML = `
        <h3>${value.florr_username}</h3>
        <p>(@${value.discord_username})</p>
        ${isAdmin ? `<button onclick="removeFromMembers('${key}')" class="red_button">Left Guild?</button>` : ""}`;
        document.querySelector("#members_scroll").appendChild(member);
    }
});

function removeFromMembers(key) {
    firebase.database().ref("/members/" + key).remove();
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
                addButton.setAttribute("href", "member_form.html");
                addButton.textContent = "Add Member";

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