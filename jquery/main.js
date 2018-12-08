const apiKey = "Your API Key" 

// User Authentication
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        let email = user.email;
        let userName = email.split("@")[0]
        let photoURL = user.photoURL; // We can save profile photo for a user if we have time

        $(document).ready(function () {
            function handle_sign_out_click() {
                firebase.auth().signOut().then(function () {
                    console.log('Signed Out');
                }, function (error) {
                    console.error('Sign Out Error', error);
                });
            }

            function loadTrending() {
                $.ajax({
                    url: "http://api.giphy.com/v1/gifs/trending?&api_key=" + apiKey,
                    type: "GET",
                    beforeSend: function () {
                       console.log("Loading")
                    },
                    complete: function (data) {
                        
                            
                    },
                    success: function (data) {
                        console.log(data)
                        let results = data.data

                        for (let i = 0; i < results.length; i += 1) {
                            imgUrl = results[i].images.fixed_height.url;
                            $("#gifResultDiv").append(`<img class="gifThumbnail" src="${imgUrl}">`);
                        }
                        // <iframe src="https://giphy.com/embed/3o6YfYvk4uB415sOTm"></iframe>
                        //gifResultDiv
                    }
                });

            }

            loadTrending()
            $(".current-user").text(userName + "'s")
            $(".log-out-bnt").on("click", handle_sign_out_click);
        })

    } else {
        // User is signed out.
        window.location = "../index.html";
    }
});




