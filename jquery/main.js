
const apiKey = "Your Key"
// User Authentication
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        let email = user.email;
        let userName = email.split("@")[0]
        let photoURL = user.photoURL; // We can save profile photo for a user if we have time

        $(document).ready(function () {
            $("#trendringTab").on("click", handleTrendingTabClick);
            $("#searchTab").on("click", handleSearchTabClick);
            $("#favoritesTab").on("click", handleFavoritesTabClick);
            $("#replyTab").on("click", handleReplyTabClick);
            $("#createConversationBtn").on("click", handleCreateConversationBtnClick)
            $(".closeBtn").on("click", handleCloseClick);
            $("#newConversationBtn").on("click", handleNewConversationClick);
            $("#searchBtn").on("click", handleSearchBtnClick);
            $(".current-user").text(userName + "'s");
            $(".log-out-bnt").on("click", handleSignOutClick);
            loadConversations();
            loadTrending();


            function updateScroll() {
                let element = "#messagesSection";
                $(element).animate({ scrollTop: $(element)[0].scrollHeight + 500 }, 1000);
            }

            function handleSearchBtnClick() {
                let searchStr = $("#searchInput").val()
                console.log(searchStr)
                $.ajax({
                    url: `https://api.giphy.com/v1/gifs/search?q=${searchStr}&api_key=${apiKey}&limit=5`,
                    type: "GET",
                    beforeSend: function () {
                        console.log("Loading Trending")
                    },
                    complete: function (data) {

                    },
                    success: function (data) {
                        let results = data.data
                        $("#searchResults").html('');
                        for (let i = 0; i < results.length; i += 1) {
                            imgUrl = results[i].images.fixed_height.url;
                            $("#searchResults").append(`<div id=searchResultsImg-${i} class="gifThumbnailContainer" ><img class="gif" src="${imgUrl}"><div id=searchResultsBtn-${i} class="sendBtn"><button type="button" class="btn btn-primary">Send</button></div></div>`);
                            $(`#searchResultsBtn-${i}`).on("click", handleSendBtnClick);
                        }
                    }
                });
            }

            function toggleSelected(elem) {
                let tabs = $("#optionsBar").children();
                for (let i = 0; i < tabs.length; i += 1) {
                    div = tabs[i]
                    if (div.id != elem.id) {
                        $(div).removeClass("selected");
                    }
                }
                $(elem).addClass("selected")
            }
            function handleTrendingTabClick() {
                toggleSelected(this);
                $("#searchSection").hide()
                $("#searchResults").hide()
                $("#trendingResults").show()
            }

            function handleSearchTabClick() {
                toggleSelected(this);
                $(this).addClass("selected")
                $("#searchSection").show()
                $("#searchResults").show()
                $("#trendingResults").hide()
            }

            function handleFavoritesTabClick() {
                toggleSelected(this);
                $("#searchSection").hide()
            }

            function handleReplyTabClick() {
                toggleSelected(this);
                $("#searchSection").hide()
            }

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
                        // console.log(snapshot.val());
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

                    // LOADS and sets listener
                    conversationRef.on('child_added', snapshot => {
                        console.log(snapshot.val())

                        if (snapshot.val()) {
                            messageList = snapshot.val();
                            msg = snapshot.val();
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
                        }
                        updateScroll();
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
                            $("#trendingResults").append(`<div id=trendingResultsImg-${i} class="gifThumbnailContainer" ><img class="gif" src="${imgUrl}"><div id=trendingResultsBtn-${i} class="sendBtn"><button type="button" class="btn btn-primary">Send</button></div></div>`);
                            $(`#trendingResultsBtn-${i}`).on("click", handleSendBtnClick);
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




        })

    } else {
        // User is signed out.
        window.location = "../index.html";
    }
});




