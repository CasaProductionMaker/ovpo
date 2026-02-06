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

async function addMember() {
    let discord_username = document.querySelector("#discord_username_input").value;
    let florr_username = document.querySelector("#florr_username_input").value;

    if (!discord_username || !florr_username) return;

    let snapshot = await firebase.database().ref("members").once('value');
    let data = snapshot.val();
    for (const [key, value] of Object.entries(data || {})) {
		if (value.discord_username === discord_username) {
			alert("This member is already added to the guild.");
			window.location.href = "members.html";
			return;
		}
    }

	await firebase.database().ref("/members/").push({
		discord_username: discord_username, 
		florr_username: florr_username, 
		strike_amount: 0, 
		time_added: Date.now()
	});

    document.querySelector("#discord_username_input").value = "";
    document.querySelector("#florr_username_input").value = "";

    window.location.href = "members.html";
}