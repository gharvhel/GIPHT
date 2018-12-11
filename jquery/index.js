
// User Authentication
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        let email = user.email;
        let userName = email.split("@")[0]
        let photoURL = user.photoURL; // We can save profile photo for a user if we have time

        // Get a reference to the database service
        let db = firebase.database();
        let userListRef = db.ref(`userList/${userName}`)
        userListRef.once('value', snapshot => {
            if (!snapshot.val()) {
                // User does not exist, create user entry
                userListRef.set({
                    "conversations" : ["null"],
                    "lastSpoken": "null"
                });
            }
        }).then(()=> {
            window.location = "./pages/main.html";
        });
    } else {
        // User is signed out.
    }
});

$(document).ready(function () {
    // Validate sign-up form
    function validate_form(username, psw, psw_repeat) {
        let valid = true;
        if (psw != psw_repeat) {
            valid = false;
            alert("Passwords do not match.")
        } else if (username == "null") {
            valid = false;
            alert("Username cannot be null.")
        }
        return valid;
    }



    function handle_sign_up_click() {
        let username = $("#username").val().trim();
        let email = username + "@gipht.com"
        let psw = $("#psw").val().trim();
        let psw_repeat = $("#psw-repeat").val().trim();
        if (validate_form(username, psw, psw_repeat)) {
            // Sign in with email and pass.
            firebase.auth().createUserWithEmailAndPassword(email, psw).catch(function (error) {
                // Handle Errors here.
                let errorCode = error.code;
                console.log(errorCode);
                let errorMessage = error.message;
                if (errorCode == 'auth/weak-password') {
                    alert('The password is too weak.');
                } else if (errorCode == 'auth/invalid-email') { 
                    alert('The username is invalid.')
                } else {
                    alert(errorMessage);
                }
            });
        }
    }

    function handle_sign_in_click() {
        let username = $("#username").val().trim();
        let email = username + "@gipht.com"
        let psw = $("#psw").val().trim();
        firebase.auth().signInWithEmailAndPassword(email, psw).catch(function(error) {
            // Handle Errors here.
            let errorCode = error.code;
            let errorMessage = error.message;
            alert(errorMessage);
          });
    }

    function handle_sign_in_tab_click() {
        $("#sign_up_tab").removeClass('active');
        $("#sign_in_tab").addClass('active');
        $(".info").text("Welcome Back!");
        $("#psw-repeat").hide();
        $("label[for='psw-repeat']" ).hide();
        $(".signupbtn").text("Sign In");
        $(".signupbtn").off("click")
        $(".signupbtn").on("click", handle_sign_in_click);

    }

    function handle_sign_up_tab_click() {
        $("#sign_up_tab").addClass('active');
        $("#sign_in_tab").removeClass('active');
        $(".info").text("Please fill in this form to create an account.")
        $("#psw-repeat").show();
        $("label[for='psw-repeat']" ).show();
        $(".signupbtn").text("Sign Up");
        $(".signupbtn").off("click")
        $(".signupbtn").click(handle_sign_up_click);
    }

    function handle_clear_click() {
        $("#username").val('');
        $("#psw").val('');
        $("#psw-repeat").val('');
    }

    $(".signupbtn").on("click", handle_sign_up_click);
    $("#sign_up_tab").on("click", handle_sign_up_tab_click);
    $("#sign_in_tab").on("click", handle_sign_in_tab_click);
    $(".clearbtn").on("click", handle_clear_click);
});


