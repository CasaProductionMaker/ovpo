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
    unloadMembers();
    loadMembers(event.target.value);
});

function loadMembers(filter = "") {
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
        let totalAmount = 0;
        let mostStrikes = 0;
        let mostStrikesUser = "";
        for (const [key, value] of Object.entries(snapshot)) {
            // filter
            if (!(value.florr_username.toLowerCase().includes(filter.toLowerCase()) || value.discord_username.toLowerCase().includes(filter.toLowerCase()))) {
                totalAmount++;
                continue;
            }

            // Create in DOM
            let member = document.createElement("div");
            member.classList.add("list_member");
            member.innerHTML = `
            <h3>${value.florr_username}</h3>
            <p>(@${value.discord_username})</p>
            <p>${value.strike_amount} strikes.</p>
            ${isAdmin ? `<button onclick="removeFromMembers('${key}')" class="red_button">Left Guild?</button>` : ""}
            ${isAdmin ? `<button onclick="showStrikePopup('${key}', '${value.florr_username}')" class="red_button">Add Strike</button><button onclick="removeStrike('${key}')" class="red_button">Remove Strike</button>` : ""}`;
            document.querySelector("#members_scroll").appendChild(member);
            totalAmount++;

            // Fun stats!
            if (value.strike_amount > mostStrikes) {
                mostStrikes = value.strike_amount;
                mostStrikesUser = value.florr_username;
            }
        }

        document.querySelector("#member_count").innerText = "Total Registered Members: " + totalAmount;
        document.querySelector("#max_strikes").innerText = `Most amount of strikes: ${mostStrikesUser} (${mostStrikes} strikes)`;
    });
}

function unloadMembers() {
    document.querySelector("#members_scroll").innerHTML = '';
}

function removeFromMembers(key) {
    firebase.database().ref("/members/" + key).remove();
    unloadMembers();
    loadMembers(document.querySelector("#search_input").value);
}

async function removeStrike(key) {
    let currentAmount = 0;
    await firebase.database().ref("members/" + key).once('value', (data) => {
        currentAmount = data.val().strike_amount;
    })
    await firebase.database().ref("/members/" + key).update({
        strike_amount: currentAmount - 1
    });

    unloadMembers();
    loadMembers(document.querySelector("#search_input").value);
}

async function addStrikeTo(userID) {
    let strike_giver = document.querySelector("#your_discord_username_input").value;
    let strike_receiver = "";
    let strike_reason = document.querySelector("#strike_reason").value;

    let currentAmount = 0;
    await firebase.database().ref("members/" + userID).once('value', (data) => {
        currentAmount = data.val().strike_amount;
        strike_receiver = data.val().florr_username;
    })
    await firebase.database().ref("/members/" + userID).update({
        strike_amount: currentAmount + 1
    });

    await firebase.database().ref("/stafflog").push({
        type: "strike", 
        done_by: "@" + strike_giver, 
        done_to: strike_receiver, 
        reason: strike_reason, 
        date_given: Date.now()
    });

    unloadMembers();
    loadMembers(document.querySelector("#search_input").value);
    document.querySelector(".popup_window").remove();
}

function showStrikePopup(userID, florr_username) {
    if (document.querySelector(".popup_window")) return;
    const popupWindow = document.createElement("div");
    popupWindow.classList.add("popup_window");
    popupWindow.innerHTML = `
        <h1>Add Strike to ${florr_username}?</h1>
        <div id="waitlist_form_holder" class="flex_column">
            <div class="form_section">
                <label for="your_discord_username_input">Your Discord username (Not display name): </label>
                <input type="text" name="your_discord_username_input" id="your_discord_username_input">
            </div>

            <textarea id="strike_reason" name="strike_reason" rows="4" cols="50" placeholder="Reason..."></textarea>

            <button onclick="addStrikeTo('${userID}')">Add Strike</button>
        </div>
        <button onclick="closePopup()" class="close_popup"><img src="Images/ClosePopup.svg" class="button_icon"></button>
    `;

    document.body.appendChild(popupWindow);

    requestAnimationFrame(() => {
        popupWindow.style.width = "75%";
        popupWindow.style.left = "calc(12.5% - 31px)";
    });
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
                addButton.setAttribute("href", "member_form.html");
                addButton.textContent = "Add Member";

                document.querySelector("#big_holder").appendChild(addButton);
            }
        } catch (error) {
            console.error("Error checking admin claims:", error);
        }

        loadMembers();
    } else {
        //You're logged out.
    }
})
firebase.auth().signInAnonymously().catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;

    console.log(errorCode, errorMessage);
});