// const apiKey = "nQcTK789kLqr28S1LFREzk6ElEQ9Seh7"
const apiKey = "SHHxioh6Lz22riU7N2jNZScib8W5b1Xj"
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
            $(".current-user").text(capitalizeFirstLetter(userName) + "'s");
            $(".log-out-bnt").on("click", handleSignOutClick);
            $("#searchUsersInput").keyup(filterUsers)
            loadConversations();
            loadTrending();

            function capitalizeFirstLetter(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }

            function handleStartConversationBtnClick() {
                // set last spoken to user clicked on
                let userClicked = this.id.split('-')[1];
                let db = firebase.database();
                let lastSpokenRef = db.ref(`userList/${userName}/lastSpoken`);
                lastSpokenRef.once('value', () => {
                    lastSpokenRef.set(userClicked);
                }).then(() => {
                    //add clicked user to list of ongoing conversations
                    // get list of users you speak with
                    let userConversationsRef = db.ref(`userList/${userName}/conversations`)
                    userConversationsRef.once('value', snapshot => {
                        if (snapshot.val()) {
                            userConversationsRef.child(`${snapshot.val().length}`).set(userClicked)
                        }
                    })

                    let userConversationsRef2 = db.ref(`userList/${userClicked}/conversations`)
                    userConversationsRef2.once('value', snapshot => {
                        if (snapshot.val()) {
                            userConversationsRef2.child(`${snapshot.val().length}`).set(userName)
                        }
                    })


                }).then(() => {
                    // Start empty conversation with default hello gif
                    let conversationRefStr = "";
                    let compare = userName.localeCompare(userClicked);
                    if (compare == 0) {
                        // strings are the same
                        console.log("ERROR: Current user and user last spoken to are the same")
                    } else if (compare == -1) {
                        conversationRefStr = `${userName}+${userClicked}`;
                    } else {
                        conversationRefStr = `${userClicked}+${userName}`;
                    }

                    let conversationRef = db.ref(`messages/${conversationRefStr}/conversations`);
                    conversationRef.set([{ "sender": userName, "url": "https://media1.giphy.com/media/dzaUX7CAG0Ihi/200.gif" }]);
                    let titleRef = db.ref(`messages/${conversationRefStr}/lastTitle`);
                    titleRef.set("Hello");
                }).then(() => {
                    loadConversations();
                    handleCloseClick();
                })


            }

            function filterUsers() {
                // Declare variables
                let input, filter, ul, li, a, i, txtValue;
                input = document.getElementById('searchUsersInput');
                filter = input.value.toUpperCase();
                ul = document.getElementById("userList");
                li = ul.getElementsByTagName('li');

                let count = 0
                // Loop through all list items, and hide those who don't match the search query
                for (i = 0; i < li.length; i++) {
                    a = li[i].getElementsByTagName("div")[0];
                    txtValue = a.textContent || a.innerText;
                    if (txtValue.toUpperCase().indexOf(filter) > -1) {
                        li[i].style.display = "";
                    } else {
                        li[i].style.display = "none";
                        count += 1
                    }
                }
                if (count >= li.length) {
                    $("#modalBodyNoUsers").show();
                } else {
                    $("#modalBodyNoUsers").hide();
                }
            }

            function updateScroll() {
                let element = "#messagesSection";
                $(element).animate({ scrollTop: $(element)[0].scrollHeight * 10 }, 100);
            }

            function handleConversationItemClick() {
                let userClicked = this.innerHTML.trim().toLowerCase();
                let db = firebase.database();
                let lastSpokenRef = db.ref(`userList/${userName}/lastSpoken`);
                lastSpokenRef.once('value', () => {
                    lastSpokenRef.set(userClicked);
                }).then(() => {
                    loadConversations();
                })
            }

            function handleSearchBtnClick() {
                let searchStr = $("#searchInput").val()
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
                            $("#searchResults").append(`
                                <div id=searchResultsImg-${i} class="gifThumbnailContainer" >
                                    <img title="${results[i].title}" class="gif" src="${imgUrl}">
                                    <div id=searchResultsBtn-${i} class="sendBtn">
                                        <button type="button" class="btn btn-primary">
                                            Send
                                        </button>
                                    </div>
                                    <div id=searchResultsFavBtn-${i} class="favBtn">
                                        <button type="button" class="btn btn-secondary favButton">
                                        <span style="font-size:30px;">💗</span>
                                        </button>
                                    </div>
                                </div>`);
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

            function hideSearchTab() {
                $("#searchResultsContainer").hide()
            }

            function showSearchTab() {
                $("#searchResultsContainer").show()
            }

            function showReplyTab() {
                $("#replyResultsContainer").show()
            }

            function hideReplyTab() {
                $("#replyResultsContainer").hide()
            }

            function hideTrendingTab() {
                $("#trendingResultsContainer").hide()
            }

            function showTrendingTab() {
                $("#trendingResultsContainer").show()
            }

            function handleTrendingTabClick() {
                toggleSelected(this);
                hideSearchTab();
                hideReplyTab();
                showTrendingTab();
            }

            function handleSearchTabClick() {
                toggleSelected(this);
                showSearchTab();
                hideTrendingTab();
                hideReplyTab();
            }

            function handleFavoritesTabClick() {
                toggleSelected(this);
                hideSearchTab();
                hideTrendingTab();
                hideReplyTab();
            }

            function handleReplyTabClick() {
                toggleSelected(this);
                hideSearchTab();
                hideTrendingTab();
                showReplyTab();
            }

            function handleSignOutClick() {
                firebase.auth().signOut().then(function () {
                }, function (error) {
                    console.error('Sign Out Error', error);
                });
            }

            function handleSendBtnClick() {
                // Get a reference to the database service
                let db = firebase.database();
                let lastSpokenRef = db.ref(`userList/${userName}/lastSpoken`);
                let lastSpoken = "";

                // Get the last user you spoke with
                lastSpokenRef.once('value', snapshot => {
                    if (snapshot.val()) {
                        lastSpoken = snapshot.val();
                        $("#currentConversationOther").text(capitalizeFirstLetter(lastSpoken))
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
                    let conversationRef = db.ref(`messages/${conversationRefStr}/conversations`);
                    let imgUrl = $(this.parentNode).children('img').attr('src')
                    let title = $(this.parentNode).children('img').attr('title')
                    conversationRef.once('value', snapshot => {
                        msgList = snapshot.val()
                        let length = (msgList === null) ? 0 : msgList.length;
                        conversationRef.child(`${length}`).set({
                          "sender": userName,
                          "url": imgUrl,
                        });
                    }).then(() => {
                        console.log("Updating title")
                        db.ref(`messages/${conversationRefStr}/lastTitle`).set(title);
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
                        if (lastSpoken != "null") {
                            $("#currentConversationOther").text(capitalizeFirstLetter(lastSpoken));
                        }
                    }
                }).then(() => {
                    // get list of users you speak with
                    let userConversationsRef = db.ref(`userList/${userName}/conversations`)
                    $("#conversationList").html("");

                    // LOADS and sets listener
                    // userConversationsRef.on('child_added', snapshot => {
                    userConversationsRef.once('value', snapshot => {
                        if (snapshot.val()) {
                            let conversationList = snapshot.val()
                            if (conversationList.length == 1) {
                                if (lastSpoken != "null") {
                                    loadConversations();
                                } else {
                                    $("#conversationList").html(`
                                <div class="alert alert-primary" role="alert">
                                    No ongoing conversations Yet!
                                </div>`);
                                }

                            } else {

                                userConversationsRef.on('child_added', snapshot => {

                                    conversationListItem = snapshot.val();
                                    // // remove null from list by shifting 1 up
                                    // conversationList.shift();
                                    // reset conversation list div content first
                                    let user = conversationListItem;

                                    // Append user as active user
                                    if (user != "null") {
                                        if (user === lastSpoken) {
                                            $("#conversationList").append(`
                                            <button class="conversationItem list-group-item d-flex justify-content-between align-items-center active">
                                                ${capitalizeFirstLetter(user)}
                                            </button>`
                                            );
                                        } else {
                                            // Append user as non active user
                                            $("#conversationList").append(`
                                            <button class="conversationItem list-group-item d-flex justify-content-between align-items-center">
                                                ${capitalizeFirstLetter(user)}
                                            </button>`
                                            );
                                        }
                                    }
                                    

                                    $(".conversationItem").on("click", handleConversationItemClick);

                                })
                            }

                        }
                    })
                }).then(() => {
                    if (lastSpoken != "null") {
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

                        let conversationRef = db.ref(`messages/${conversationRefStr}/conversations`);
                        // reset message div content first
                        $(".messages-div").html(`
                            
                        `);
                        // LOADS and sets listener
                        conversationRef.on('child_added', snapshot => {
                            console.log("Updating suggested reply")
                            loadSuggestedReply(conversationRefStr);
                            if (snapshot.val()) {
                                messageList = snapshot.val();
                                msg = snapshot.val();
                                if (msg.sender == userName) {
                                    $(".messages-div").append(`
                                    <div class="speech-bubble-container">
                                        <div class="speech-bubble-right">
                                            <img src="${msg.url}" class="message">
                                        </div>
                                    </div>
                                    `);
                                } else {
                                    $(".messages-div").append(`
                                    <div class="speech-bubble-container">
                                        <div class="speech-bubble-left">
                                            <img src="${msg.url}" class="message">
                                        </div>
                                    </div>
                                    `);
                                }
                            }
                            updateScroll();

                        });
                    }
                });


            }

            function loadSuggestedReply(conversationRefStr){
                let db = firebase.database();
                let searchStr = "";
                let titleRef = db.ref(`messages/${conversationRefStr}/lastTitle`);
                // Get the last user you spoke with
                titleRef.once('value', snapshot => {
                    if (snapshot.val()) {
                        searchStr = snapshot.val();
                    }
                    else{
                        searchStr = "null";
                    }
                }).then(() => {
                    if(searchStr !== "null"){
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
                                $("#replyResults").html('');
                                for (let i = 0; i < results.length; i += 1) {
                                    imgUrl = results[i].images.fixed_height.url;
                                    $("#replyResults").append(`
                                        <div id=replyResultsImg-${i} class="gifThumbnailContainer" >
                                            <img title="${results[i].title}" class="gif" src="${imgUrl}">
                                            <div id="replyResultsBtn-${i}" class="sendBtn">
                                                <button type="button" class="btn btn-primary">
                                                    Send
                                                </button>
                                            </div>
                                            <div id=replyResultsFavBtn-${i} class="favBtn">
                                                <button type="button" class="btn btn-secondary favButton">
                                                <span style="font-size:30px;">💗</span>
                                                </button>
                                            </div>
                                        </div>`);
                                    $(`#replyResultsBtn-${i}`).on("click", handleSendBtnClick);
                                }
                            }
                        });
                    } 
                    else {
                        $("replyResults").html(`<div class="alert alert-info" role="alert">No suggested replies!</div>`)
                    }
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
                            $("#trendingResults").append(`
                                <div id=searchResultsImg-${i} class="gifThumbnailContainer" >
                                    <img title="${results[i].title}" class="gif" src="${imgUrl}">
                                    <div id=trendingResultsSendBtn-${i} class="sendBtn">
                                        <button type="button" class="btn btn-primary">
                                            Send
                                        </button>
                                    </div>
                                    <div id=trendingResultsFavBtn-${i} class="favBtn">
                                        <button type="button" class="btn btn-secondary favButton">
                                        <span style="font-size:30px;">💗</span>
                                        
                                        </button>
                                    </div>
                                </div>`);
                            $(`#trendingResultsSendBtn-${i}`).on("click", handleSendBtnClick);
                        }
                    }
                });
            }

            function handleNewConversationClick() {
                // Get a reference to the database service
                let db = firebase.database();
                let conversationList = []
                // get list of users you speak with
                let userConversationsRef = db.ref(`userList/${userName}/conversations`)
                userConversationsRef.once('value', snapshot => {
                    if (snapshot.val()) {
                        conversationList = snapshot.val()
                    }
                }).then(() => {
                    let userListRef = db.ref(`userList`)
                    userListRef.once('value', snapshot => {
                        if (snapshot.val()) {
                            userList = Object.keys(snapshot.val())
                            // reset user list first
                            $("#userList").html("")
                            userList.forEach((user) => {

                                // add to list of available users if user is not current user 
                                // or isn't already having a conversation with selected user
                                if (user != userName && !conversationList.includes(user)) {
                                    $("#userList").append(`
                                <li>
                                    <div>${capitalizeFirstLetter(user)}
                                        <button id="startConversationBtn-${user}" type="button" class="btn btn-primary">Start Conversation</button>
                                    </div>
                                </li>
                                `)
                                    $(`#startConversationBtn-${user}`).click(handleStartConversationBtnClick)
                                }
                            })
                        }
                    })
                    $("#newConversationWindow").css("display", "block");
                })


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




