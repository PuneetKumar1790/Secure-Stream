// After successful login or signup response
localStorage.setItem("token",resizeBy.token);// Save token
localStorage.setItem("user",JSON.stringify(res.user));// Optional user info
window.location.href="./watch.html";// redirect to video page