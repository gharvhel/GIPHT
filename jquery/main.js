
const apiKey = "You KEY"
// User Authentication
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        let email = user.email;
        let userName = email.split("@")[0]
        let photoURL = user.photoURL; // We can save profile photo for a user if we have time

        $(document).ready(function () {
            function handleSignOutClick() {
                firebase.auth().signOut().then(function () {
                    console.log('Signed Out');
                }, function (error) {
                    console.error('Sign Out Error', error);
                });
            }

            function handleSendBtnClick() {
                console.log(this.id);
                // Get a reference to the database service
                let db = firebase.database();
                let lastSpokenRef = db.ref(`userList/${userName}/lastSpoken`);
                let lastSpoken = "";

                // Get the last user you spoke with
                lastSpokenRef.once('value', snapshot => {
                    if (snapshot.val()) {
                        lastSpoken = snapshot.val();
                        $("#currentConversationOther").text(lastSpoken)
                    }
                }).then(() => {
                    // Send message to DB
                    let conversationRefStr = "";
                    let compare = userName.localeCompare(lastSpoken);
                    if (compare == 0) {
                        // strings are the same
                        console.log("ERROR: Current user and user last spoken to are the same")
                    } else if (compare == -1) {
                        conversationRefStr = `${userName}+${lastSpoken}`;
                    } else {
                        conversationRefStr = `${lastSpoken}+${userName}`;
                    }
                    let conversationRef = db.ref(`messages/${conversationRefStr}`);
                    let imgUrl = this.previousSibling.src;
                    conversationRef.once('value', snapshot => {
                        console.log(snapshot.val());
                        msgList = snapshot.val()
                        conversationRef.child(`${msgList.length}`).set({
                            "sender": userName,
                            "url": imgUrl
                        })
                    });
                });
            }


            function loadConversations() {
                // Get a reference to the database service
                let db = firebase.database();
                let lastSpokenRef = db.ref(`userList/${userName}/lastSpoken`);
                let lastSpoken = "";

                // Get the last user you spoke with
                lastSpokenRef.once('value', snapshot => {
                    if (snapshot.val()) {
                        lastSpoken = snapshot.val();
                        $("#currentConversationOther").text(lastSpoken)
                    }
                }).then(() => {
                    // get list of users you speak with
                    let userConversationsRef = db.ref(`userList/${userName}/conversations`)
                    userConversationsRef.once('value', snapshot => {
                        if (snapshot.val()) {
                            let coversationList = snapshot.val()
                            coversationList.forEach((user) => {
                                // Append user as active user
                                if (user === lastSpoken) {
                                    $("#conversationList").append(`
                                    <button class="list-group-item d-flex justify-content-between align-items-center active">
                                        ${user}
                                    </button>`
                                    );
                                } else {
                                    // Append user as non active user
                                    $("#conversationList").append(`
                                    <button class="list-group-item d-flex justify-content-between align-items-center">
                                        ${user}
                                    </button>`
                                    );
                                }

                            })
                        }
                    })
                }).then(() => {
                    // Load Messages
                    let conversationRefStr = "";
                    let compare = userName.localeCompare(lastSpoken);
                    if (compare == 0) {
                        // strings are the same
                        console.log("ERROR: Current user and user last spoken to are the same")
                    } else if (compare == -1) {
                        conversationRefStr = `${userName}+${lastSpoken}`;
                    } else {
                        conversationRefStr = `${lastSpoken}+${userName}`;
                    }

                    let conversationRef = db.ref(`messages/${conversationRefStr}`);
                    conversationRef.once('value', snapshot => {
                        if (snapshot.val()) {
                            messageList = snapshot.val();
                            messageList.forEach((msg) => {
                                if (msg.sender == userName) {
                                    $(".messages-div").append(`
                                    <div class="speech-bubble-right">
                                        <img src="${msg.url}" class="message">
                                    </div>
                                    `);
                                } else {
                                    $(".messages-div").append(`
                                    <div class="speech-bubble-left">
                                        <img src="${msg.url}" class="message">
                                    </div>
                                    `);
                                }
                            })
                        }
                    });
                });


            }

            function loadTrending() {
                $.ajax({
                    url: `https://api.giphy.com/v1/gifs/trending?&api_key=${apiKey}&limit=5`,
                    type: "GET",
                    beforeSend: function () {
                        console.log("Loading Trending")
                    },
                    complete: function (data) {

                    },
                    success: function (data) {
                        let results = data.data
                        for (let i = 0; i < results.length; i += 1) {
                            imgUrl = results[i].images.fixed_height.url;
                            $("#gifResultDiv").append(`<div id=img-${i} class="gifThumbnailContainer" ><img class="gif" src="${imgUrl}"><div id=btn-${i} class="sendBtn"><button type="button" class="btn btn-primary">Send</button></div></div>`);
                            $(`#btn-${i}`).on("click", handleSendBtnClick);
                        }
                    }
                });
            }

            function handleNewConversationClick() {
                $("#newConversationWindow").css("display", "block");
            }

            function handleCloseClick() {
                $("#newConversationWindow").css("display", "none");
            }

            function listAllUsers(nextPageToken) {
                // List batch of users, 1000 at a time.
                admin.auth().listUsers(1000, nextPageToken)
                    .then(function (listUsersResult) {
                        listUsersResult.users.forEach(function (userRecord) {
                            console.log("user", userRecord.toJSON());
                        });
                        if (listUsersResult.pageToken) {
                            // List next batch of users.
                            listAllUsers(listUsersResult.pageToken)
                        }
                    })
                    .catch(function (error) {
                        console.log("Error listing users:", error);
                    });
            }

            function handleCreateConversationBtnClick() {
                // Start listing users from the beginning, 1000 at a time.
                listAllUsers();
            }



            $("#createConversationBtn").on("click", handleCreateConversationBtnClick)
            $(".closeBtn").on("click", handleCloseClick);
            $("#newConversationBtn").on("click", handleNewConversationClick);
            $(".current-user").text(userName + "'s");
            $(".log-out-bnt").on("click", handleSignOutClick);
            loadConversations();
            loadTrending();
        })

    } else {
        // User is signed out.
        window.location = "../index.html";
    }
});




