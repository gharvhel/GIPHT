// User Authentication
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;
        window.location = "pages/main.html";
    } else {
        // User is signed out.
    }
});

$(document).ready(function () {
    // Validate sign-up form
    function validate_form(email, psw, psw_repeat) {
        let valid = false
        if (psw === psw_repeat) {
            valid = true;
        } else {
            alert("Passwords do not match.")
        }
        return valid;
    }



    function handle_sign_up_click() {
        let username = $("#username").val().trim();
        let email = username + "@gipht.com"
        let psw = $("#psw").val().trim();
        let psw_repeat = $("#psw-repeat").val().trim();
        if (validate_form(email, psw, psw_repeat)) {
            // Sign in with email and pass.
            firebase.auth().createUserWithEmailAndPassword(email, psw).catch(function (error) {
                // Handle Errors here.
                let errorCode = error.code;
                console.log(errorCode);
                let errorMessage = error.message;
                if (errorCode == 'auth/weak-password') {
                    alert('The password is too weak.');
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
        $("info").text("Please fill in this form to create an account.")
        $("#psw-repeat").show();
        $("label[for='psw-repeat']" ).show();
        $(".signupbtn").text("Sign Up");
        $(".signupbtn").off("click")
        $(".signupbtn").click(handle_sign_up_click);
    }

    $(".signupbtn").on("click", handle_sign_up_click);
    $("#sign_up_tab").on("click", handle_sign_up_tab_click);
    $("#sign_in_tab").on("click", handle_sign_in_tab_click);
});


