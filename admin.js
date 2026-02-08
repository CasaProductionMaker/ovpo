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

document.querySelector("#search_input").addEventListener("change", (event) => {
    unloadWaitlist();
    loadWaitlist(event.target.value);
});

function loadWaitlist(filter = "") {
    firebase.database().ref("waitlist").once('value', (data) => {
        const snapshot = data.val();
        if (snapshot == null) {
            let noOneHere = document.createElement("div");
            noOneHere.classList.add("list_member");
            noOneHere.innerHTML = `
            <h3>Empty Waitlist</h3>
            `;
            document.querySelector("#waitlist_scroll").appendChild(noOneHere);
            return;
        }
        let place = 1;
        for (const [key, value] of Object.entries(snapshot)) {
            // filter
            if (!(value.florr_username.toLowerCase().includes(filter.toLowerCase()) || value.discord_username.toLowerCase().includes(filter.toLowerCase()))) {
                place++;
                continue;
            }

            // add element
            let waitlistMember = document.createElement("div");
            waitlistMember.classList.add("list_member");
            waitlistMember.innerHTML = `
                <h3>${place}: ${value.florr_username}</h3>
                <p>(@${value.discord_username})<br>Joined MS: ${value.time_added}</p>
                ${value.returning_member ? "<p>Returning Member.</p>" : ""}
                ${isAdmin ? `<button onclick="transferWaitlistMember('${key}', '${value.florr_username}', '${value.discord_username}')" class="red_button">Added to Guild?</button>` : ""}
                <div class="list_item_options">
                    <button onclick="showEditPopup('${key}', '${value.florr_username}', '${value.discord_username}')" class="small_option_button"><img src="Images/EditIcon.svg" class="button_icon edit_img"></button>
                    <button onclick="showDeleteUserPopup('${key}', '${value.florr_username}')" class="small_option_button"><img src="Images/TrashIconClosed.svg" class="button_icon trash_img"></button>
                </div>
            `;

            waitlistMember.querySelector(".trash_img").addEventListener("mouseenter", function() {
                waitlistMember.querySelector(".trash_img").src = "Images/TrashIconOpen.svg";
            });
            waitlistMember.querySelector(".trash_img").addEventListener("mouseleave", function() {
                waitlistMember.querySelector(".trash_img").src = "Images/TrashIconClosed.svg";
            });

            document.querySelector("#waitlist_scroll").appendChild(waitlistMember);
            place++;
        }
    });
}

function unloadWaitlist() {
    document.querySelector("#waitlist_scroll").innerHTML = '';
}

function removeFromWaitlist(key) {
    firebase.database().ref("/waitlist/" + key).remove();
    unloadWaitlist();
    loadWaitlist(document.querySelector("#search_input").value);
    document.querySelector(".popup_window").remove();
}

function transferWaitlistMember(key, florr_username, discord_username) {
    firebase.database().ref("/members/").push({
		discord_username: discord_username, 
		florr_username: florr_username, 
		strike_amount: 0, 
		time_added: Date.now()
	});
    firebase.database().ref("/waitlist/" + key).remove();
    unloadWaitlist();
    loadWaitlist(document.querySelector("#search_input").value);
}

function showEditPopup(userID, florr_username, discord_username) {
    const popupWindow = document.createElement("div");
    popupWindow.classList.add("popup_window");
    popupWindow.innerHTML = `
        <h1>Edit Waitlist Member</h1>
        <div id="waitlist_form_holder" class="flex_column">
            <div class="form_section">
                <label for="discord_username_input">Discord username (Not display name): </label>
                <input type="text" name="discord_username_input" id="discord_username_input" value="${discord_username}">
            </div>

            <div class="form_section">
                <label for="florr_username_input">Florr username: </label>
                <input type="text" name="florr_username_input" id="florr_username_input" value="${florr_username}">
            </div>

            <button onclick="editWaitlistPerson('${userID}')">Apply</button>
        </div>
        <button onclick="closePopup()" class="close_popup"><img src="Images/ClosePopup.svg" class="button_icon"></button>
    `;

    document.body.appendChild(popupWindow);

    requestAnimationFrame(() => {
        popupWindow.style.width = "75%";
        popupWindow.style.left = "12.5%";
    });
}

function showDeleteUserPopup(userID, florr_username) {
    const popupWindow = document.createElement("div");
    popupWindow.classList.add("popup_window");
    popupWindow.innerHTML = `
        <h1>Remove user?</h1>
        <p class="align_center">Are you sure you want to permanently remove ${florr_username} from the waitlist? This action is permanent.</p>
        <button onclick="removeFromWaitlist('${userID}')" class="form_button">Remove</button>
        <button onclick="closePopup()" class="close_popup"><img src="Images/ClosePopup.svg" class="button_icon"></button>
    `;

    document.body.appendChild(popupWindow);

    requestAnimationFrame(() => {
        popupWindow.style.width = "75%";
        popupWindow.style.left = "12.5%";
    });
}

async function editWaitlistPerson(userID) {
    let discord_username = document.querySelector("#discord_username_input").value;
    let florr_username = document.querySelector("#florr_username_input").value;

    if (!discord_username || !florr_username) return;
    
    await firebase.database().ref("/waitlist/" + userID).update({
        discord_username: discord_username, 
        florr_username: florr_username
    });

    document.querySelector(".popup_window").remove();
    unloadWaitlist();
    loadWaitlist(document.querySelector("#search_input").value);
}

function closePopup() {
    document.querySelector(".popup_window").remove();
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

        loadWaitlist();
    } else {
        //You're logged out.
    }
})
firebase.auth().signInAnonymously().catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;

    console.log(errorCode, errorMessage);
});